// The Fenwick tree maps scrolling offsets to variable-height cards in O(log n).
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

  measure(index, height) {
    const delta = height - this.values[index];
    if (Math.abs(delta) < 0.1) return false;
    this.values[index] = height;
    for (let i = index + 1; i < this.tree.length; i += i & -i) this.tree[i] += delta;
    return true;
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

const list = document.getElementById("cards");
const data = JSON.parse(document.getElementById("card-data").textContent);
if (data.length > list.children.length) virtualize(list, data);

function virtualize(list, data) {
  const mounted = new Map([...list.children].map(card => [Number(card.dataset.index), card]));
  const pending = new Map();
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const card = entry.target;
      const index = Number(card.dataset.index);
      if (mounted.get(index) === card) {
        pending.set(index, entry.borderBoxSize[0].blockSize);
      }
    }
    schedule();
  });

  let heights;
  let layoutKey;
  let frame = 0;
  let printing = false;

  function makeCard(index) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.index = index;
    card.innerHTML = data[index][0];
    return card;
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
    const atEnd = pageEnd > 0 && scrollY >= pageEnd - 2;
    const sample = mounted.values().next().value;
    const style = getComputedStyle(sample);
    const gap = parseFloat(getComputedStyle(list).rowGap);
    const width = list.clientWidth;
    const lineHeight = parseFloat(style.lineHeight);
    const innerWidth = width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 2;
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + 2;
    const key = [width, lineHeight, padding, gap].join();
    const anchor = heights?.at(scrollY - top) ?? 0;
    const before = heights?.offset(anchor) ?? 0;

    if (key !== layoutKey) {
      // Seed unknown heights from the content's line widths, then measure the real cards.
      const columns = Math.max(1, innerWidth / parseFloat(style.fontSize));
      heights = new Heights(Float64Array.from(data, ([, lines]) => {
        const rows = lines.reduce((sum, line) => sum + Math.max(1, Math.ceil(line / columns)), 0);
        return padding + rows * lineHeight + gap;
      }));
      layoutKey = key;
      pending.clear();
      for (const [index, card] of mounted) {
        pending.set(index, card.getBoundingClientRect().height);
      }
    }

    for (const [index, height] of pending) heights.measure(index, height + gap);
    pending.clear();

    const contentHeight = heights.offset(data.length) - gap;
    list.style.height = contentHeight + "px";

    // Keep the leading card in place when measurements above it change.
    const delta = heights.offset(anchor) - before;
    const desired = atEnd ? document.documentElement.scrollHeight - viewport : scrollY + delta;
    if (Math.abs(scrollY - desired) >= 1) window.scrollTo(0, desired);

    const offset = window.scrollY - top;
    const first = heights.at(offset - viewport);
    const last = heights.at(offset + viewport * 2);
    const focused = document.activeElement?.closest(".card");
    for (const [index, card] of mounted) {
      if ((index < first || index > last) && card !== focused) {
        observer.unobserve(card);
        mounted.delete(index);
        card.remove();
      }
    }

    // Walk backwards so new nodes can be inserted in reading order without moving old ones.
    let next = focused && Number(focused.dataset.index) > last ? focused : null;
    for (let i = last; i >= first; i--) {
      let card = mounted.get(i);
      if (!card) {
        card = makeCard(i);
        list.insertBefore(card, next);
        mounted.set(i, card);
        observer.observe(card);
      }
      next = card;
    }
    for (const [index, card] of mounted) card.style.top = heights.offset(index) + "px";
  }

  list.classList.add("virtual");
  for (const card of mounted.values()) observer.observe(card);
  const widthObserver = new ResizeObserver(schedule);
  widthObserver.observe(list);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("focusout", schedule);

  window.addEventListener("beforeprint", () => {
    if (printing) return;
    printing = true;
    cancelAnimationFrame(frame);
    frame = 0;
    list.classList.remove("virtual");
    list.style.height = "";
    const all = document.createDocumentFragment();
    for (let i = 0; i < data.length; i++) all.append(makeCard(i));
    list.replaceChildren(all);
  });
  window.addEventListener("afterprint", () => {
    if (!printing) return;
    printing = false;
    list.replaceChildren(...[...mounted].sort(([a], [b]) => a - b).map(([, card]) => card));
    list.classList.add("virtual");
    render();
  });

  render();
}
