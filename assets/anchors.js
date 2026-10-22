// Section links on the product pages (George, 22 Oct 2026: "All sections ... must have anchors and copy on click"):
// a click on a heading's .anchor (tools/build-pages.mjs) copies the section's address, puts its #id in the address bar
// without a jump, and says "Link copied" beside the icon for a moment. Without the Clipboard API it stays a plain link.
(() => {
  if (!navigator.clipboard) return;
  const live = document.createElement("p");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  document.body.append(live);

  document.addEventListener("click", async (e) => {
    const a = e.target.closest("a.anchor");
    if (!a) return;
    e.preventDefault();
    const url = location.origin + location.pathname + a.hash;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      location.hash = a.hash;
      return;
    }
    history.replaceState(null, "", a.hash);
    live.textContent = "Link copied";
    const tip = document.createElement("span");
    tip.textContent = "Link copied";
    tip.setAttribute("aria-hidden", "true");
    tip.style.cssText =
      "position:absolute;z-index:20;padding:6px 10px;border-radius:var(--radius-sm,8px);background:var(--ink);color:var(--page);" +
      "font:var(--label-weight,700) 0.8rem/1 var(--label-font,sans-serif);white-space:nowrap;pointer-events:none";
    const r = a.getBoundingClientRect();
    tip.style.left = r.left + scrollX + r.width / 2 + "px";
    tip.style.top = r.top + scrollY - 34 + "px";
    tip.style.translate = "-50% 0";
    document.body.append(tip);
    setTimeout(() => tip.remove(), 1600);
    setTimeout(() => (live.textContent = ""), 1600);
  });
})();
