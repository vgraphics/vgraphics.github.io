// The landing's "Layouts made by drivers" chapter (the web market design §4.1): the market's three counts, counted live
// on the server each visit, and a row of six cards: Layout of the week first, with its ribbon, then the five most used
// live layouts. A card opens its layout's page; "See all" opens the market.
(function () {
  "use strict";
  const root = document.querySelector(".mk-chapter");
  if (!root || !window.SpeedoMarket) return;
  const M = window.SpeedoMarket;
  const ROW = 6;
  // The counts' words for a count of one ("new this week" stays as it is).
  const ONE = { live: "layout shared", uses: "time used" };
  const list = root.querySelector(".mk-grid");
  const failed = root.querySelector('[data-market="failed"]');

  // The counts, or "–" when the market doesn't answer: never an old number.
  function showCounts(stats) {
    root.querySelectorAll("[data-count]").forEach((b) => {
      const key = b.getAttribute("data-count");
      const n = stats ? stats[key] || 0 : null;
      const words = b.nextElementSibling;
      b.textContent = stats ? M.format(n) : "–";
      words.dataset.many = words.dataset.many || words.textContent;
      words.textContent = n === 1 && ONE[key] ? ONE[key] : words.dataset.many;
    });
    root.querySelector('[data-market="all"]').textContent = stats && stats.live > 1 ? `See all ${M.format(stats.live)} layouts` : "See all layouts";
  }

  async function load() {
    failed.hidden = true;
    M.placeholders(list, ROW);
    // The counts stand apart from the cards: either can fail without the other.
    M.stats().then(showCounts, (failure) => {
      showCounts(null);
      M.error(`counts: ${failure && failure.message ? failure.message : failure}`);
    });
    try {
      const [featured, popular] = await Promise.all([M.featured(), M.list({ tab: "popular", limit: ROW })]);
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
