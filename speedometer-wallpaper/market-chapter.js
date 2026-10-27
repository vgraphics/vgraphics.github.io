// The landing's "Layouts made by drivers" chapter (the web market design §4.1): the market's three counts, which the
// Deployer writes once a day, and a row of six cards: Layout of the week first, with its ribbon, then the five most
// used live layouts. A card opens its layout's page; "See all" opens the market.
(function () {
  "use strict";
  const root = document.querySelector(".mk-chapter");
  if (!root || !window.SpeedoMarket) return;
  const M = window.SpeedoMarket;
  const ROW = 6;
  const list = root.querySelector(".mk-grid");
  const failed = root.querySelector('[data-market="failed"]');

  async function load() {
    failed.hidden = true;
    M.placeholders(list, ROW);
    try {
      const [stats, featured, popular] = await Promise.all([M.stats(), M.featured(), M.list({ tab: "popular", limit: ROW })]);
      if (stats) {
        root.querySelectorAll("[data-count]").forEach((b) => { b.textContent = M.format(stats[b.getAttribute("data-count")] || 0); });
        if (stats.live) root.querySelector('[data-market="all"]').textContent = `See all ${M.format(stats.live)} layouts`;
      }
      const row = (featured ? [featured] : []).concat(popular.layouts.filter((l) => !featured || l.id !== featured.id)).slice(0, ROW);
      list.replaceChildren(...await M.cards(row, featured && featured.id));
      list.hidden = !row.length;
    } catch (failure) {
      list.replaceChildren();
      failed.hidden = false;
      M.error(`chapter: ${failure && failure.message ? failure.message : failure}`);
    }
  }

  root.querySelector('[data-market="retry"]').addEventListener("click", load);
  M.config().then((c) => {
    const make = root.querySelector('[data-market="make"]');
    make.href = `${c.store}&referrer=${encodeURIComponent("utm_source=vgraphics.gr&utm_medium=layout_market&utm_content=make_your_own")}`;
  });
  // The chapter reads the market when it comes near the screen, so a visitor who never scrolls to it costs no reads.
  if (window.IntersectionObserver) {
    const watch = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      watch.disconnect();
      load();
      M.event("market_view", { page: "landing" });
    }, { rootMargin: "600px" });
    watch.observe(root);
  } else {
    load();
  }
})();
