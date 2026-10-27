// A creator's page (the web market design §4.4): https://vgraphics.gr/speedometer-wallpaper/creators/?u=<VHub uid>,
// reached from a creator's name anywhere in the web market. Their VHub picture and name, their live layouts (30 at
// most, the per-creator cap, so one read holds them all), most used first, and two totals worked out here: the uses of
// all their layouts, and their average stars (all the stars over all the ratings). Each card has a Report link to the
// layout's own form; a creator's name or picture is reported in the app, which sends it to VHub.
(function () {
  "use strict";
  const root = document.querySelector(".mk-creator-page");
  if (!root || !window.SpeedoMarket) return;
  const M = window.SpeedoMarket;
  const $ = (id) => document.getElementById(id);
  const uid = new URLSearchParams(location.search).get("u") || "";
  const list = root.querySelector(".mk-grid");

  async function load() {
    $("creator-failed").hidden = true;
    M.placeholders(list, 4);
    try {
      const [layouts, people] = await Promise.all([M.byCreator(uid), M.profiles(uid ? [uid] : [])]);
      const profile = people.get(uid);
      if (profile) {
        $("creator-name").textContent = profile.name;
        document.title = `${profile.name}: Speedometer layouts`;
        window.VHubAvatars.draw($("creator-avatar"), profile, 256);
      }
      const uses = layouts.reduce((sum, l) => sum + l.uses, 0);
      const ratings = layouts.reduce((sum, l) => sum + l.ratingCount, 0);
      const starsGiven = layouts.reduce((sum, l) => sum + l.average * l.ratingCount, 0);
      $("creator-layouts").textContent = M.format(layouts.length);
      $("creator-uses").textContent = M.format(uses);
      $("creator-stars").textContent = ratings ? (starsGiven / ratings).toFixed(1) : "–";
      const made = await M.cards(layouts);
      made.forEach((item, i) => {
        const link = document.createElement("a");
        link.className = "mk-report-link";
        link.href = `${M.layoutUrl(layouts[i].code)}#report`;
        link.textContent = "Report";
        item.querySelector(".mk-body").append(link);
      });
      list.replaceChildren(...made);
      $("creator-empty").hidden = layouts.length > 0;
      $("creator-note").hidden = !layouts.length;
    } catch (failure) {
      list.replaceChildren();
      $("creator-failed").hidden = false;
      M.error(`creator: ${failure && failure.message ? failure.message : failure}`);
    }
    root.setAttribute("data-state", "ready");
  }

  $("creator-retry").addEventListener("click", load);
  load();
  M.event("market_view", { page: "creator" });
})();
