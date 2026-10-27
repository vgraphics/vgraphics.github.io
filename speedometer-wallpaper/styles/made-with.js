// A style page's "Layouts made with <style>" chapter (the web market design §5.1): the six most used live layouts made
// with the page's style, as cards, read when the chapter comes near the screen. The style is the page's own, from its
// address (/speedometer-wallpaper/styles/<slug>/) and styles.json.
(function () {
  "use strict";
  const root = document.querySelector(".mk-made-with");
  if (!root || !window.SpeedoMarket) return;
  const M = window.SpeedoMarket;
  const ROW = 6;
  const list = root.querySelector(".mk-grid");
  const slug = (location.pathname.match(/\/styles\/([a-z0-9-]+)\/?$/) || [])[1];

  async function load() {
    root.querySelector('[data-market="failed"]').hidden = true;
    M.placeholders(list, ROW);
    try {
      const style = (await M.styles()).list.find((s) => s.slug === slug);
      const layouts = style ? await M.byStyle(style.id, ROW) : [];
      list.replaceChildren(...await M.cards(layouts));
      root.querySelector('[data-market="empty"]').hidden = layouts.length > 0;
    } catch (failure) {
      list.replaceChildren();
      root.querySelector('[data-market="failed"]').hidden = false;
      M.error(`style ${slug}: ${failure && failure.message ? failure.message : failure}`);
    }
  }

  root.querySelector('[data-market="retry"]').addEventListener("click", load);
  if (window.IntersectionObserver) {
    const watch = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      watch.disconnect();
      load();
      M.event("market_view", { page: "style", style: slug });
    }, { rootMargin: "600px" });
    watch.observe(root);
  } else {
    load();
  }
})();
