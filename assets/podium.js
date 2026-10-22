// The Global ranking card's podium (#podium, on the home and services pages): the live top 3 of Exitwise's Score
// board on VHub, as on /exitwise/ranking/. Needs /exitwise/ranking/boards.js first. Anything that fails leaves the
// plain 2-1-3 steps.
(async () => {
  const podium = document.getElementById("podium");
  if (!podium || !window.ExitwiseBoards) return;
  const { loadBoard, drawAvatar, anonymous } = window.ExitwiseBoards;
  try {
    const top = (await loadBoard("score", 3)).players.slice(0, 3);
    if (!top.length) return;
    top.forEach((p, i) => {
      const place = podium.querySelector(".p" + (i + 1));
      const av = document.createElement("span");
      av.className = "av";
      drawAvatar(av, p, 256);
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = p.name || anonymous(p.uid);
      const pts = document.createElement("span");
      pts.className = "pts";
      pts.textContent = p.stats.score.toLocaleString("en-US");
      const lv = document.createElement("span");
      lv.className = "lv";
      lv.textContent = "Lv " + p.stats.highestLevel.toLocaleString("en-US");
      place.querySelector(".who").replaceChildren(av, name, pts, lv);
      place.querySelector(".step").textContent = p.rank;
    });
    document.getElementById("podium-text").textContent = "Top players: " +
      top.map(p => `${p.rank}. ${p.name || anonymous(p.uid)}, ${p.stats.score.toLocaleString("en-US")} points, level ${p.stats.highestLevel}`).join("; ") + ".";
  } catch (e) { /* keep the plain podium */ }
})();
