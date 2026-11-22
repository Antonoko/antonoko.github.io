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
  const [html, lines, factor, , tint, offset] = data[index];
  const card = document.createElement("article");
  card.className = "card";
  card.classList.toggle("card--balance", lines.length === 1 && lines[0] <= 90);
  card.dataset.index = index;
  card.dataset.tint = tint;
  card.style.setProperty("--size-factor", factor);
  card.style.setProperty("--note-offset", offset + "px");
  card.innerHTML = html;
  return card;
}

function defineRows(entries, columns) {
  const rows = [];
  const rowOfCard = new Int32Array(entries.length);
  for (let start = 0; start < entries.length;) {
    let count = Math.min(columns, entries.length - start);
    if (count === 3 && entries.slice(start, start + count).some(entry => entry[3] > 1.53)) {
      count = 2;
    }
    const weights = entries.slice(start, start + count).map(entry => Math.max(1, entry[3]));
    rowOfCard.fill(rows.length, start, start + count);
    rows.push({ start, weights });
    start += count;
  }
  return { rows, rowOfCard };
}

function virtualize(list, entries) {
  if (entries.length === 0) return;

  const initial = new Map([...list.children].map(card => [Number(card.dataset.index), card]));
  const mounted = new Map();
  const pending = new Map();
  const observer = new ResizeObserver(changes => {
    for (const entry of changes) {
      const row = Number(entry.target.dataset.row);
      if (mounted.get(row) === entry.target) {
        pending.set(row, entry.borderBoxSize[0].blockSize);
      }
    }
    schedule();
  });

  let rows, rowOfCard, heights, layoutKey, rowColumns;
  let frame = 0;
  let printing = false;
  let savedScroll = 0;

  function makeRow(index) {
    const { start, weights } = rows[index];
    const row = document.createElement("div");
    row.className = "note-row";
    row.dataset.row = index;
    row.style.gridTemplateColumns = weights.map(weight => `minmax(0, ${weight}fr)`).join(" ");
    for (let card = start; card < start + weights.length; card++) {
      row.append(initial.get(card) ?? makeCard(card));
      initial.delete(card);
    }
    return row;
  }

  function clearRows() {
    observer.disconnect();
    mounted.clear();
    pending.clear();
    list.replaceChildren();
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
    const atEnd = Boolean(heights) && pageEnd > 0 && scrollY >= pageEnd - 2;
    const anchor = heights?.at(scrollY - top) ?? 0;
    const anchorCard = rows?.[anchor].start ?? 0;
    const before = heights?.offset(anchor) ?? 0;

    const style = getComputedStyle(list);
    const width = list.clientWidth;
    const gap = parseFloat(style.rowGap);
    const columns = Number(style.getPropertyValue("--note-columns"));
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight);
    const key = [width, gap, columns, fontSize, lineHeight].join();

    if (key !== layoutKey) {
      const sample = list.querySelector(".card");
      const cardStyle = sample && getComputedStyle(sample);
      const padX = cardStyle ? parseFloat(cardStyle.paddingLeft) * 2 + 2 : 48;
      const padY = cardStyle ? parseFloat(cardStyle.paddingTop) * 2 + 2 : 42;
      if (columns !== rowColumns) {
        ({ rows, rowOfCard } = defineRows(entries, columns));
        rowColumns = columns;
        clearRows();
      }

      heights = new Heights(Float64Array.from(rows, ({ start, weights }) => {
        const available = width - gap * (weights.length - 1);
        const totalWeight = weights.reduce((total, weight) => total + weight, 0);
        return gap + Math.max(...weights.map((weight, relative) => {
          const [, lines, factor, , , offset] = entries[start + relative];
          const characters = Math.max(1, (available * weight / totalWeight - padX) / (fontSize * factor));
          const linesNeeded = lines.reduce((total, line) => total + Math.max(1, Math.ceil(line / characters)), 0);
          return padY + linesNeeded * lineHeight * factor + (columns === 1 ? 0 : offset);
        }));
      }));
      layoutKey = key;
      pending.clear();
      for (const [index, row] of mounted) pending.set(index, row.getBoundingClientRect().height);
    }

    for (const [index, height] of pending) heights.measure(index, height + gap);
    pending.clear();
    list.style.height = heights.offset(rows.length) - gap + "px";

    const delta = heights.offset(rowOfCard[anchorCard]) - before;
    const desired = atEnd ? document.documentElement.scrollHeight - viewport : scrollY + delta;
    if (!isAutoScrolling() && Math.abs(scrollY - desired) >= 1) window.scrollTo(0, desired);

    const offset = window.scrollY - top;
    const first = heights.at(offset - viewport);
    const last = heights.at(offset + viewport * 2);
    const focused = document.activeElement?.closest(".note-row");
    for (const [index, row] of mounted) {
      if ((index < first || index > last) && row !== focused) {
        observer.unobserve(row);
        mounted.delete(index);
        row.remove();
      }
    }

    let next = focused && Number(focused.dataset.row) > last ? focused : null;
    for (let index = last; index >= first; index--) {
      let row = mounted.get(index);
      if (!row) {
        row = makeRow(index);
        list.insertBefore(row, next);
        mounted.set(index, row);
        observer.observe(row);
      }
      next = row;
    }
    for (const [index, row] of mounted) row.style.top = heights.offset(index) + "px";
  }

  list.classList.add("virtual");
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
    clearRows();
    list.classList.remove("virtual");
    list.style.height = "";
    const all = document.createDocumentFragment();
    for (let i = 0; i < entries.length; i++) all.append(makeCard(i));
    list.append(all);
  });
  window.addEventListener("afterprint", () => {
    if (!printing) return;
    printing = false;
    list.classList.add("virtual");
    list.replaceChildren();
    list.style.height = heights.offset(rows.length) + "px";
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
