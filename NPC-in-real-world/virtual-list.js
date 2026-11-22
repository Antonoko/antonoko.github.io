const list = document.getElementById("cards");
const data = JSON.parse(document.getElementById("card-data").textContent);
const isAutoScrolling = enableMiddleScroll();

// Index variable row heights and find the visible row in O(log n).
class Heights {
  constructor(values) {
    this.values = values;
    this.tree = new Float64Array(values.length + 1);
    for (let i = 1; i < this.tree.length; i++) {
      this.tree[i] += values[i - 1];
      const parent = i + (i & -i);
      if (parent < this.tree.length) this.tree[parent] += this.tree[i];
    }
    this.step = 2 ** Math.floor(Math.log2(values.length));
  }

  offset(count) {
    let total = 0;
    for (let i = count; i > 0; i -= i & -i) total += this.tree[i];
    return total;
  }

  measure(row, height) {
    const delta = height - this.values[row];
    if (Math.abs(delta) < 0.1) return;
    this.values[row] = height;
    for (let i = row + 1; i < this.tree.length; i += i & -i) this.tree[i] += delta;
  }

  at(y) {
    let index = 0;
    for (let step = this.step; step > 0; step >>>= 1) {
      const next = index + step;
      if (next < this.tree.length && this.tree[next] <= y) {
        index = next;
        y -= this.tree[next];
      }
    }
    return Math.min(index, this.values.length - 1);
  }
}

function makeCard(index) {
  const [html, , factor] = data[index];
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.index = index;
  card.style.setProperty("--size-factor", factor);
  card.innerHTML = html;
  return card;
}

// Assign each note to the shortest estimated column. Actual heights are
// measured independently per column, so a long note cannot push its neighbors down.
function buildColumns(entries, { count, boardWidth, gap, fontSize, lineHeight, padX, padY }) {
  const columnWidth = (boardWidth - gap * (count - 1)) / count;
  const columns = Array.from({length: count}, () => ({ indices: [], estimates: [], total: 0 }));
  const positions = entries.map(([, lines, scale], index) => {
    let lane = 0;
    for (let i = 1; i < count; i++) {
      if (columns[i].total < columns[lane].total) lane = i;
    }
    const column = columns[lane];
    const charactersPerLine = Math.max(1, (columnWidth - padX) / (fontSize * scale));
    const lineCount = Math.max(1, lines.reduce((total, line) => total + Math.ceil(line / charactersPerLine), 0));
    const height = padY + lineCount * lineHeight * scale + gap;
    const position = { lane, slot: column.indices.length };
    column.indices.push(index);
    column.estimates.push(height);
    column.total += height;
    return position;
  });

  for (const column of columns) {
    if (column.indices.length) column.heights = new Heights(Float64Array.from(column.estimates));
  }
  return { columns, positions, columnWidth };
}

function virtualize(list, entries) {
  if (!entries.length) return;
  const mounted = new Map([...list.children].map(card => [Number(card.dataset.index), card]));
  const pending = new Map();
  const observer = new ResizeObserver(changes => {
    for (const entry of changes) {
      const index = Number(entry.target.dataset.index);
      if (mounted.get(index) === entry.target) pending.set(index, entry.borderBoxSize[0].blockSize);
    }
    schedule();
  });

  let layout, layoutKey, frame = 0, savedScroll = 0;
  let printing = false;

  function topOf(index) {
    const { lane, slot } = layout.positions[index];
    return layout.columns[lane].heights.offset(slot);
  }

  function anchorAt(y) {
    let nearest = 0;
    let distance = Infinity;
    for (const { indices, heights } of layout.columns) {
      if (!heights || y >= heights.offset(indices.length)) continue;
      const slot = heights.at(y);
      const difference = Math.abs(y - heights.offset(slot));
      if (difference < distance) {
        nearest = indices[slot];
        distance = difference;
      }
    }
    return nearest;
  }

  function schedule() {
    if (!frame && !printing) frame = requestAnimationFrame(render);
  }

  function render() {
    frame = 0;
    const scrollY = window.scrollY;
    const top = list.getBoundingClientRect().top + scrollY;
    const viewport = window.innerHeight;
    const pageEnd = document.documentElement.scrollHeight - viewport;
    const atEnd = Boolean(layout) && pageEnd > 0 && scrollY >= pageEnd - 2;
    const anchor = layout ? anchorAt(scrollY - top) : 0;
    const previousTop = layout ? topOf(anchor) : 0;

    const style = getComputedStyle(list);
    const gap = parseFloat(style.rowGap);
    const boardWidth = list.clientWidth;
    const count = Number(style.getPropertyValue("--note-columns"));
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight);
    const key = [boardWidth, gap, count, fontSize, lineHeight].join();
    const resized = key !== layoutKey;

    if (resized) {
      const sample = list.querySelector(".card");
      const cardStyle = sample && getComputedStyle(sample);
      const padX = cardStyle ? parseFloat(cardStyle.paddingLeft) * 2 + 2 : 48;
      const padY = cardStyle ? parseFloat(cardStyle.paddingTop) * 2 + 2 : 42;
      layout = buildColumns(entries, { count, boardWidth, gap, fontSize, lineHeight, padX, padY });
      layoutKey = key;
      pending.clear();
    }

    for (const [index, height] of pending) {
      const { lane, slot } = layout.positions[index];
      layout.columns[lane].heights.measure(slot, height + gap);
    }
    pending.clear();
    const maxHeight = Math.max(...layout.columns.map(({ indices, heights }) => heights?.offset(indices.length) ?? 0));
    list.style.height = maxHeight - gap + "px";

    const desired = atEnd ? document.documentElement.scrollHeight - viewport : scrollY + topOf(anchor) - previousTop;
    if (!isAutoScrolling() && Math.abs(scrollY - desired) >= 1) window.scrollTo(0, desired);

    const offset = window.scrollY - top;
    const wanted = new Set();
    for (const { indices, heights } of layout.columns) {
      if (!heights || offset - viewport > heights.offset(indices.length)) continue;
      const first = heights.at(offset - viewport);
      const last = heights.at(offset + viewport * 2);
      for (let slot = first; slot <= last; slot++) wanted.add(indices[slot]);
    }

    const focused = document.activeElement?.closest(".card");
    if (focused?.parentElement === list) wanted.add(Number(focused.dataset.index));
    for (const [index, card] of mounted) {
      if (!wanted.has(index)) {
        observer.unobserve(card);
        mounted.delete(index);
        card.remove();
      }
    }

    // Keep DOM and keyboard order consistent with the source.
    let next = null;
    for (const index of [...wanted].sort((a, b) => b - a)) {
      let card = mounted.get(index);
      if (!card) {
        card = makeCard(index);
        list.insertBefore(card, next);
        mounted.set(index, card);
        observer.observe(card);
      }
      const { lane } = layout.positions[index];
      card.style.width = layout.columnWidth + "px";
      card.style.left = lane * (layout.columnWidth + gap) + "px";
      card.style.top = topOf(index) + "px";
      next = card;
    }

    if (resized) {
      // Re-read all mounted heights on a width change, even if a card's height
      // happens to stay the same and ResizeObserver has nothing new to report.
      for (const [index, card] of mounted) pending.set(index, card.getBoundingClientRect().height);
      schedule();
    }
  }

  list.classList.add("virtual");
  for (const card of mounted.values()) observer.observe(card);
  const size = new ResizeObserver(schedule);
  size.observe(list);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("focusout", schedule);

  window.addEventListener("beforeprint", () => {
    if (printing) return;
    printing = true;
    savedScroll = window.scrollY;
    cancelAnimationFrame(frame);
    frame = 0;
    observer.disconnect();
    mounted.clear();
    pending.clear();
    list.classList.remove("virtual");
    list.style.height = "";
    const all = document.createDocumentFragment();
    for (let i = 0; i < entries.length; i++) all.append(makeCard(i));
    list.replaceChildren(all);
  });
  window.addEventListener("afterprint", () => {
    if (!printing) return;
    printing = false;
    list.classList.add("virtual");
    list.replaceChildren();
    list.style.height = Math.max(...layout.columns.map(({ indices, heights }) => heights?.offset(indices.length) ?? 0)) + "px";
    window.scrollTo(0, savedScroll);
    render();
  });

  render();
}

function enableMiddleScroll() {
  let origin, pointer, previous, frame = 0, remainder = 0;
  let held = false;
  let dragged = false;

  function stop() {
    if (origin === undefined) return;
    origin = undefined;
    cancelAnimationFrame(frame);
    document.documentElement.classList.remove("auto-scrolling");
  }

  function scroll(now) {
    if (origin === undefined) return;
    const delta = pointer - origin;
    const distance = Math.max(0, Math.abs(delta) - 12);
    const speed = Math.sign(delta) * Math.min(2.8, distance * 0.008);
    remainder += speed * Math.min(32, now - previous);
    previous = now;
    const pixels = Math.trunc(remainder);
    if (pixels) window.scrollBy({ top: pixels, behavior: "instant" });
    remainder -= pixels;
    frame = requestAnimationFrame(scroll);
  }

  document.addEventListener("mousedown", event => {
    if (origin !== undefined) {
      stop();
      if (event.button === 1) event.preventDefault();
      return;
    }
    if (event.button !== 1 || !(event.target instanceof Element) ||
        event.target.closest("a, button, input, select, textarea, [contenteditable]")) return;
    event.preventDefault();
    origin = pointer = event.clientY;
    previous = performance.now();
    remainder = 0;
    held = true;
    dragged = false;
    document.documentElement.classList.add("auto-scrolling");
    frame = requestAnimationFrame(scroll);
  });
  document.addEventListener("mousemove", event => {
    if (origin === undefined) return;
    pointer = event.clientY;
    if (held && Math.abs(pointer - origin) > 12) dragged = true;
  });
  document.addEventListener("mouseup", event => {
    if (event.button !== 1) return;
    held = false;
    if (dragged) stop();
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") stop(); });
  document.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("blur", stop);
  return () => origin !== undefined;
}

if ("ResizeObserver" in window) virtualize(list, data);
