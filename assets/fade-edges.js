// Fading edges for boxes that scroll on their own (George, 24 Oct 2026: "No hard cut on list. Use fading edges.";
// "These are general rules for all games and apps.", D:\Projects\Mine\CLAUDE.md "Long lists scroll in their own box").
// Each side a box can still scroll toward fades out over its --fade-size (30px unless its stylesheet says), growing from
// nothing as the box leaves that end, so nothing is cut hard and a side with nothing beyond it stays crisp.
//
// The fade is a mask on the box, so it stays put while the content scrolls under it. Where the scrollbar takes room
// beside the content, its strip is left out of the mask, so the bar never fades. A box with a background of its own
// (a menu panel) would fade that too: its stylesheet sets --fade-mode: overlay, and this file then only keeps the
// numbers current for the stylesheet's own fade, drawn in the box's colour (see the menus in product.css and
// vgraphics.css). Either way the box gets, on every scroll and resize:
//   data-more    "up", "down", "left", "right": the sides more content lies beyond
//   --fade-start, --fade-end    how far the fade reaches at the top (left) and the bottom (right) now, in px
//
// Every element with the class fade-edges gets it, those added later too (the hub draws its pages after load);
// fadeEdges(box) adds one by hand. menu.js loads this on every page with a header; the storybook reader loads it
// itself. Scrollbar colours stay in each stylesheet (the product's colour).
const done = new WeakSet();

export function fadeEdges(box) {
  if (done.has(box)) return;
  done.add(box);
  let queued = false;

  const update = () => {
    queued = false;
    const s = getComputedStyle(box);
    const size = parseFloat(s.getPropertyValue("--fade-size")) || 30;
    const down = box.scrollHeight - box.clientHeight;
    const across = box.scrollWidth - box.clientWidth;
    const vertical = down > 1;
    let start = 0;
    let end = 0;
    let bar = 0;
    if (vertical) {
      start = Math.min(size, Math.max(0, box.scrollTop));
      end = Math.min(size, Math.max(0, down - box.scrollTop));
      bar = box.offsetWidth - box.clientWidth - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth);
    } else if (across > 1) {
      start = Math.min(size, Math.max(0, box.scrollLeft));
      end = Math.min(size, Math.max(0, across - box.scrollLeft));
      bar = box.offsetHeight - box.clientHeight - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth);
    }
    // Under a pixel is the end itself (scroll positions can be fractional).
    if (start < 1) start = 0;
    if (end < 1) end = 0;
    const more = vertical ? [start && "up", end && "down"] : [start && "left", end && "right"];
    box.dataset.more = more.filter(Boolean).join(" ");
    box.style.setProperty("--fade-start", start + "px");
    box.style.setProperty("--fade-end", end + "px");

    let mask = "";
    if ((start || end) && s.getPropertyValue("--fade-mode").trim() !== "overlay") {
      bar = Math.max(0, Math.round(bar));
      const fade = (to) => `linear-gradient(${to}, transparent, #000 ${start}px, #000 calc(100% - ${end}px), transparent)`;
      mask = vertical
        ? `${fade("to bottom")} left top / calc(100% - ${bar}px) 100% no-repeat, linear-gradient(#000, #000) right top / ${bar}px 100% no-repeat`
        : `${fade("to right")} left top / 100% calc(100% - ${bar}px) no-repeat, linear-gradient(#000, #000) left bottom / 100% ${bar}px no-repeat`;
    }
    box.style.webkitMask = mask;
    box.style.mask = mask;
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  box.addEventListener("scroll", queue, { passive: true });
  // The box changes size (the window, a menu opening), or its content does (rows drawn later).
  const resized = new ResizeObserver(queue);
  resized.observe(box);
  for (const child of box.children) resized.observe(child);
  update();
}

const scan = (root) => {
  if (root.matches && root.matches(".fade-edges")) fadeEdges(root);
  if (root.querySelectorAll) root.querySelectorAll(".fade-edges").forEach(fadeEdges);
};
scan(document);
new MutationObserver((records) => {
  for (const r of records) for (const node of r.addedNodes) if (node.nodeType === 1) scan(node);
}).observe(document.documentElement, { childList: true, subtree: true });
