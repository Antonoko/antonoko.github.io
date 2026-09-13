#!/usr/bin/env python3
"""Download remote images in CALICOMP chat HTML and rewrite local references.

Usage:
  python localize_chat_images.py
  python localize_chat_images.py --scan
  python localize_chat_images.py --dry-run
  python localize_chat_images.py --retry
  python localize_chat_images.py --delay 2 --max-retries 5
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, urlunparse


ROOT = Path(__file__).resolve().parent
CONTENT_DIR = ROOT / "content"
IMG_DIR = CONTENT_DIR / "img"
STATE_PATH = IMG_DIR / "_download_state.json"
SKIP_DIR_NAMES = {"desktop"}

IMG_SRC_RE = re.compile(
    r"""<img\b[^>]*?\bsrc\s*=\s*["']?(https?://[^"'\s>]+)""",
    re.IGNORECASE,
)
HREF_IMG_RE = re.compile(
    r"""<a\b[^>]*?\bhref\s*=\s*["']?(https?://[^"'\s>]+\.(?:jpg|jpeg|png|gif|webp|bmp)(?:\?[^"'\s>]*)?)""",
    re.IGNORECASE,
)

SINA_HOST_RE = re.compile(
    r"^(?:wx|ww|tvax|tva)(\d+)\.sinaimg\.cn$",
    re.IGNORECASE,
)
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
]

SINA_SIZE_RANK = ["large", "mw2048", "mw1024", "mw690", "bmiddle", "orj360", "thumb150"]
SINA_HOST_PREFIXES = ["wx", "ww", "tvax"]
SSL_CTX = ssl.create_default_context()


def log(msg: str) -> None:
    print(msg, flush=True)


def iter_html_files() -> list[Path]:
    files = []
    for path in sorted(CONTENT_DIR.rglob("*.html")):
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        files.append(path)
    return files


def decode_html(data: bytes) -> tuple[str, str]:
    for enc in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            return data.decode(enc), enc
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace"), "utf-8"


def is_image_url(url: str) -> bool:
    parsed = urlparse(url)
    host = (parsed.netloc or "").lower()
    path = parsed.path.lower()
    if "sinaimg.cn" in host:
        return True
    if any(path.endswith(ext) for ext in IMAGE_EXT):
        return True
    return False


def extract_urls(text: str) -> list[str]:
    found: list[str] = []
    seen = set()
    for regex in (IMG_SRC_RE, HREF_IMG_RE):
        for url in regex.findall(text):
            url = url.strip().rstrip("\\")
            if not is_image_url(url) or url in seen:
                continue
            seen.add(url)
            found.append(url)
    return found


def filename_for(url: str) -> str:
    name = Path(urlparse(url).path).name
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    if not name:
        name = "unnamed"
    if not Path(name).suffix:
        name += ".jpg"
    return name


def sina_parts(url: str) -> tuple[str, str, str] | None:
    parsed = urlparse(url)
    m = SINA_HOST_RE.match(parsed.netloc)
    if not m:
        if parsed.netloc.lower().endswith("sinaimg.cn"):
            parts = parsed.path.strip("/").split("/")
            size = parts[0] if parts else "large"
            return parsed.netloc, size, filename_for(url)
        return None
    parts = parsed.path.strip("/").split("/")
    size = parts[0] if parts else "large"
    return parsed.netloc, size, filename_for(url)


def flip_scheme(url: str) -> str:
    parsed = urlparse(url)
    scheme = "https" if parsed.scheme == "http" else "http"
    return urlunparse(parsed._replace(scheme=scheme))


def candidate_urls(url: str, attempt: int) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()

    def add(u: str) -> None:
        if u and u not in seen:
            seen.add(u)
            ordered.append(u)

    parsed = urlparse(url)
    add(url)
    if attempt >= 2:
        add(flip_scheme(url))

    parts = sina_parts(url)
    if not parts:
        return ordered

    host, size, name = parts
    m = SINA_HOST_RE.match(host)
    prefix_m = re.match(r"[a-z]+", host, re.I)
    prefix = prefix_m.group(0) if prefix_m else "wx"

    if attempt >= 2 and m:
        for i in range(1, 5):
            add(urlunparse(parsed._replace(netloc=f"{prefix}{i}.sinaimg.cn")))
            add(urlunparse(parsed._replace(scheme="https", netloc=f"{prefix}{i}.sinaimg.cn")))

    if attempt >= 3:
        prefer = ["large"] + [s for s in SINA_SIZE_RANK if s not in {size, "large"}]
        for sz in prefer[:3]:
            for i in range(1, 5):
                add(f"https://wx{i}.sinaimg.cn/{sz}/{name}")

    if attempt >= 4:
        for prefix2 in SINA_HOST_PREFIXES:
            for i in range(1, 5):
                add(f"https://{prefix2}{i}.sinaimg.cn/large/{name}")
    return ordered


def looks_like_image(data: bytes) -> bool:
    if len(data) < 80:
        return False
    if data[:3] == b"\xff\xd8\xff":
        return True
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return True
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    if data[:2] == b"BM":
        return True
    return False


def is_placeholder(data: bytes) -> bool:
    lowered = data[:256].lower()
    if b"<html" in lowered or b"<!doctype" in lowered:
        return True
    return False


def build_headers(url: str) -> dict[str, str]:
    host = urlparse(url).netloc.lower()
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "image/avif,image/webp,image/apng,image/jpeg,image/png,image/gif,image/*,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Connection": "close",
    }
    if "sinaimg.cn" in host:
        headers["Referer"] = "https://weibo.com/"
    else:
        headers["Referer"] = f"{urlparse(url).scheme}://{urlparse(url).netloc}/"
    return headers


def fetch_bytes(url: str, timeout: float) -> bytes:
    req = urllib.request.Request(url, headers=build_headers(url), method="GET")
    with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
        status = getattr(resp, "status", 200)
        if status >= 400:
            raise urllib.error.HTTPError(url, status, f"HTTP {status}", resp.headers, None)
        ctype = (resp.headers.get("Content-Type") or "").lower()
        data = resp.read()
        if "text/html" in ctype and not looks_like_image(data):
            raise ValueError(f"got html instead of image ({ctype})")
        return data


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {
        "updated_at": None,
        "success": {},
        "failed": {},
        "skipped_existing": {},
    }


def save_state(state: dict) -> None:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def local_path_for(url: str) -> Path:
    return IMG_DIR / filename_for(url)


def relpath_for(html_file: Path, img_path: Path) -> str:
    return Path(os.path.relpath(img_path, html_file.parent)).as_posix()


def jitter_sleep(base: float, extra: float = 0.0) -> None:
    delay = max(0.2, base + extra + random.uniform(-0.35 * base, 0.55 * base))
    time.sleep(delay)


def download_one(url: str, dest: Path, timeout: float, delay: float, max_retries: int) -> tuple[bool, str, str]:
    if dest.exists() and dest.stat().st_size >= 80:
        existing = dest.read_bytes()
        if looks_like_image(existing) and not is_placeholder(existing):
            return True, "exists", url

    last_error = "unknown"
    tried: set[str] = set()
    extra_backoff = 0.0
    for attempt in range(1, max_retries + 1):
        for cand in candidate_urls(url, attempt):
            if cand in tried:
                continue
            tried.add(cand)
            try:
                jitter_sleep(delay, extra_backoff)
                data = fetch_bytes(cand, timeout)
                if not looks_like_image(data) or is_placeholder(data):
                    last_error = f"invalid image from {cand} ({len(data)} bytes)"
                    continue
                dest.parent.mkdir(parents=True, exist_ok=True)
                tmp = dest.with_suffix(dest.suffix + ".part")
                tmp.write_bytes(data)
                tmp.replace(dest)
                return True, f"ok attempt={attempt} bytes={len(data)}", cand
            except Exception as exc:
                last_error = f"{type(exc).__name__}: {exc} @ {cand}"
                if isinstance(exc, urllib.error.HTTPError) and exc.code in {429, 403, 503}:
                    extra_backoff = min(20.0, extra_backoff + delay * 2)
                    break
        extra_backoff = min(20.0, extra_backoff + delay)
    return False, last_error, url


def collect_jobs() -> tuple[list[Path], dict[str, list[Path]], dict[str, list[str]]]:
    html_files = iter_html_files()
    url_files: dict[str, list[Path]] = defaultdict(list)
    file_urls: dict[str, list[str]] = {}
    for html in html_files:
        raw = html.read_bytes()
        text, _enc = decode_html(raw)
        urls = extract_urls(text)
        file_urls[str(html)] = urls
        for url in urls:
            url_files[url].append(html)
    return html_files, url_files, file_urls


def rewrite_files(url_to_local: dict[str, Path], file_urls: dict[str, list[str]]) -> int:
    changed_files = 0
    for html_str, urls in file_urls.items():
        html = Path(html_str)
        raw = html.read_bytes()
        text, enc = decode_html(raw)
        original = text
        for url in urls:
            local = url_to_local.get(url)
            if local is None:
                continue
            rel = relpath_for(html, local)
            text = text.replace(url, rel)
        if text == original:
            continue
        html.write_bytes(text.encode(enc))
        changed_files += 1
    return changed_files


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Localize remote images in chat HTML.")
    p.add_argument("--scan", action="store_true", help="list remote image urls and exit")
    p.add_argument("--dry-run", action="store_true", help="download plan only, do not write")
    p.add_argument("--retry", action="store_true", help="only retry previously failed urls")
    p.add_argument("--delay", type=float, default=1.8, help="base delay seconds between requests")
    p.add_argument("--timeout", type=float, default=25.0, help="per-request timeout")
    p.add_argument("--max-retries", type=int, default=4, help="retry rounds per url")
    p.add_argument("--no-rewrite", action="store_true", help="download only, do not rewrite html")
    p.add_argument("--limit", type=int, default=0, help="only process first N urls")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    html_files, url_files, file_urls = collect_jobs()
    urls = sorted(url_files)
    log(f"html files scanned: {len(html_files)}")
    log(f"unique remote images: {len(urls)}")
    if args.scan:
        for url in urls:
            log(f"{url}  ({len(url_files[url])} files)")
        return 0

    state = load_state()
    targets = urls
    if args.retry:
        targets = [u for u in urls if u in state.get("failed", {})]
        log(f"retry queue: {len(targets)}")
    if args.limit and args.limit > 0:
        targets = targets[: args.limit]
        log(f"limit: {len(targets)}")

    if args.dry_run:
        for i, url in enumerate(targets, 1):
            log(f"[{i}/{len(targets)}] {url} -> {local_path_for(url).relative_to(ROOT).as_posix()}")
        return 0

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    url_to_local: dict[str, Path] = {}
    success = 0
    failed = 0
    existed = 0

    try:
        for i, url in enumerate(targets, 1):
            dest = local_path_for(url)
            log(f"[{i}/{len(targets)}] {url}")
            ok, detail, used = download_one(url, dest, args.timeout, args.delay, args.max_retries)
            if ok:
                url_to_local[url] = dest
                if detail == "exists":
                    existed += 1
                    state.setdefault("skipped_existing", {})[url] = dest.name
                else:
                    success += 1
                    state.setdefault("success", {})[url] = {
                        "file": dest.name,
                        "via": used,
                        "detail": detail,
                    }
                state.get("failed", {}).pop(url, None)
                log(f"  OK {detail}")
            else:
                failed += 1
                state.setdefault("failed", {})[url] = detail
                log(f"  FAIL {detail}")
            if i % 5 == 0:
                save_state(state)
    except KeyboardInterrupt:
        log("interrupted, state saved")
        save_state(state)
        return 130

    for url, info in state.get("success", {}).items():
        path = IMG_DIR / info["file"]
        if path.exists():
            url_to_local[url] = path
    for url, name in state.get("skipped_existing", {}).items():
        path = IMG_DIR / name
        if path.exists():
            url_to_local[url] = path

    save_state(state)
    changed = 0
    if not args.no_rewrite:
        changed = rewrite_files(url_to_local, file_urls)

    log("")
    log(f"downloaded: {success}")
    log(f"already local: {existed}")
    log(f"failed: {failed}")
    log(f"html files updated: {changed}")
    log(f"state: {STATE_PATH}")
    if failed:
        log("failed urls:")
        for url, err in state.get("failed", {}).items():
            if url in targets:
                log(f"  {url}")
                log(f"    {err}")
        log("re-run with: python localize_chat_images.py --retry")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
