// The ranking page's boards (exitwise/ranking/ranking.html, set in the page by tools/build-pages.mjs): the tabs, the
// top 3 as trophies, the list, and the empty and error states. The data and the avatars come from boards.js, loaded
// before this.
(() => {
  // The data and the avatars come from boards.js (VHub's boards), shared with the home page's podium.
  const { TOP, BOARDS, anonymous, drawAvatar, loadBoard } = window.ExitwiseBoards;
  const HEART = `<svg class="heart" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40S7 29 7 17a8.5 8.5 0 0 1 17-3 8.5 8.5 0 0 1 17 3c0 12-17 23-17 23z" fill="#FF5A6E"/></svg>`;
  const fmt = n => n.toLocaleString("en-US");
  const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;

  // ---------- Page ----------
  const $ = id => document.getElementById(id);
  const tabs = [...document.querySelectorAll(".tab")];
  const rows = $("rows"), state = $("state"), count = $("count"), refresh = $("refresh"), status = $("status");
  const cache = {};
  let board = "score", request = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function statCell(id, s) {
    const cell = document.createElement("span");
    cell.className = "stat";
    let html, label;
    if (id === "score") {
      html = `<span class="big">${fmt(s.score)}</span><span class="small">${s.score === 1 ? "point" : "points"}</span>`;
      label = `${plural(s.score, "point", "points")}, level ${fmt(s.highestLevel)}`;
    } else if (id === "perfect") {
      html = `<span class="big">${HEART}${fmt(s.perfectClears)}</span>`;
      label = plural(s.perfectClears, "perfect clear", "perfect clears");
    } else if (id === "maps") {
      html = `<span class="big">${fmt(s.customCleared)}</span><span class="small">${s.customCleared === 1 ? "map" : "maps"}</span>`;
      label = plural(s.customCleared, "map cleared", "maps cleared");
    } else {
      html = `<span class="big">${fmt(s.creatorPlays)}</span><span class="small">${s.creatorPlays === 1 ? "play" : "plays"}</span>`;
      label = plural(s.creatorPlays, "play of their maps", "plays of their maps");
    }
    cell.innerHTML = `<span aria-hidden="true">${html}</span><span class="sr-only">${label}</span>`;
    return cell;
  }

  function avatarCell(p) {
    const span = document.createElement("span");
    span.className = "avatar";
    drawAvatar(span, p);
    return span;
  }

  function drawRows(id, players, animate) {
    rows.textContent = "";
    players.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "row" + (animate && !reduced && i < 14 ? " enter" : "");
      if (animate && !reduced && i < 14) li.style.animationDelay = i * 28 + "ms";
      const rank = document.createElement("span");
      rank.className = "rank" + (p.rank <= 3 ? " r" + p.rank : "");
      rank.innerHTML = `<span class="sr-only">Rank </span>${p.rank}`;
      const name = document.createElement("span");
      name.className = "name" + (p.name ? "" : " anon");
      name.textContent = p.name || anonymous(p.uid);
      name.title = name.textContent;
      let who = name;
      if (id === "score") {
        who = document.createElement("span");
        who.className = "who";
        const lv = document.createElement("span");
        lv.className = "lv";
        lv.setAttribute("aria-hidden", "true");
        lv.textContent = "Lv " + fmt(p.stats.highestLevel);
        who.append(name, lv);
      }
      li.append(rank, avatarCell(p), who, statCell(id, p.stats));
      rows.appendChild(li);
    });
  }

  function trophyStat(id, s) {
    if (id === "score") return plural(s.score, "point", "points");
    if (id === "perfect") return plural(s.perfectClears, "perfect clear", "perfect clears");
    if (id === "maps") return plural(s.customCleared, "map", "maps");
    return plural(s.creatorPlays, "play", "plays");
  }

  // The first three as trophies above the list (the list still has them, for screen readers too).
  function drawTrophies(id, players, animate) {
    const trophies = $("trophies");
    trophies.textContent = "";
    players.slice(0, 3).forEach((p, i) => {
      const rank = Math.min(p.rank, 3);
      const div = document.createElement("div");
      div.className = "trophy t" + (i + 1) + (animate && !reduced ? " enter" : "");
      if (animate && !reduced) div.style.animationDelay = [80, 0, 160][i] + "ms";
      div.innerHTML = `<svg class="cup" viewBox="0 0 48 48">${trophyArt(CUPS[rank - 1], cupMark(rank))}</svg>`;
      const name = document.createElement("span");
      name.className = "tname" + (p.name ? "" : " anon");
      name.textContent = p.name || anonymous(p.uid);
      name.title = name.textContent;
      const stat = document.createElement("span");
      stat.className = "tstat";
      stat.textContent = trophyStat(id, p.stats);
      div.append(avatarCell(p), name, stat);
      trophies.appendChild(div);
    });
    trophies.hidden = players.length === 0;
  }

  function skeleton() {
    rows.textContent = "";
    for (let i = 0; i < 8; i++) {
      const li = document.createElement("li");
      li.className = "row skeleton";
      li.setAttribute("aria-hidden", "true");
      li.innerHTML = `<span class="rank"></span><span class="avatar"></span><span class="bar" style="width:${46 + (i * 37) % 40}%"></span><span class="stat"><span class="bar"></span></span>`;
      rows.appendChild(li);
    }
  }

  const PLAY = `<div class="stores"><a class="btn" href="/exitwise/play/"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>Play in your browser</a><a class="gp" href="https://play.google.com/store/apps/details?id=com.vgraphics.exitwise"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250"></a></div>`;
  // The trophy of an empty board, also drawn for each board's top 3: gold, silver and bronze, the rank on the cup.
  const trophyArt = (cup, mark) => `<rect x="6" y="40" width="36" height="5" rx="2.5" fill="#DED4C4"/><path d="M14 8h20v12a10 10 0 0 1-20 0z" fill="${cup}"/><path d="M14 11H8a6 6 0 0 0 6 9M34 11h6a6 6 0 0 1-6 9" fill="none" stroke="${cup}" stroke-width="3"/><rect x="21" y="29" width="6" height="7" fill="${cup}"/><rect x="15" y="35" width="18" height="5" rx="2" fill="#3B3355"/>${mark}`;
  const STAR = `<path d="M24 12l1.8 3.7 4 .6-2.9 2.8.7 4L24 21.2 20.4 23l.7-4-2.9-2.8 4-.6z" fill="#FFFDF8"/>`;
  const TROPHY = trophyArt("#F2B705", STAR);
  const CUPS = ["#F2B705", "#C3CAD6", "#E39A5E"];
  const cupMark = rank => rank === 1 ? STAR : `<text x="24" y="22" text-anchor="middle" font-family="Lilita One, Arial Rounded MT Bold, sans-serif" font-size="12" fill="#3B3355">${rank}</text>`;
  const CLOUD = `<path d="M14 36a9 9 0 0 1-1-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16z" fill="#E9E1D3"/><path d="M24 22v8" stroke="#3B3355" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="35" r="2.4" fill="#3B3355"/>`;

  function showState(kind) {
    const b = BOARDS[board];
    $("state-pic").innerHTML = kind === "empty" ? TROPHY : CLOUD;
    $("state-title").textContent = kind === "empty" ? "Be the first on this board" : "Couldn't load the ranking";
    $("state-text").textContent = kind === "empty" ? b.empty : "Check your connection and try again.";
    $("state-actions").innerHTML = kind === "empty" ? PLAY : `<button class="btn" type="button" id="retry">Try again</button>`;
    if (kind === "error") $("retry").addEventListener("click", () => show(board, true));
    state.hidden = false;
    $("cols").hidden = true;
  }

  function setUpdated(time) {
    const today = new Date().toDateString() === time.toDateString();
    const clock = time.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    $("updated").textContent = today ? `Updated at ${clock}` : `Updated ${time.toLocaleDateString(undefined, { day: "numeric", month: "short" })}, ${clock}`;
  }

  function render(id, data, animate) {
    rows.setAttribute("aria-busy", "false");
    setUpdated(data.time);
    const n = data.players.length;
    if (!n) {
      rows.textContent = "";
      $("trophies").hidden = true;
      showState("empty");
      count.hidden = true;
      status.textContent = `${BOARDS[id].title}: nobody on this board yet.`;
      return;
    }
    drawTrophies(id, data.players, animate);
    drawRows(id, data.players, animate);
    count.textContent = n >= TOP ? `The top ${TOP}` : plural(n, "player", "players") + " on this board";
    count.hidden = false;
    status.textContent = `${BOARDS[id].title}: ${plural(n, "player", "players")}.`;
  }

  async function show(id, reload) {
    const mine = ++request;
    const b = BOARDS[id];
    board = id;
    $("board-title").textContent = b.title;
    $("caption").textContent = b.caption;
    $("col-stat").textContent = b.column;
    state.hidden = true;
    $("cols").hidden = false;
    if (cache[id] && !reload) {
      render(id, cache[id], false);
      return;
    }
    count.hidden = true;
    $("trophies").hidden = true;
    rows.setAttribute("aria-busy", "true");
    skeleton();
    $("updated").textContent = "Loading…";
    refresh.disabled = true;
    refresh.setAttribute("aria-busy", "true");
    try {
      const data = await loadBoard(id);
      if (mine !== request) return;
      cache[id] = data;
      render(id, data, true);
    } catch (e) {
      if (mine !== request) return;
      rows.textContent = "";
      rows.setAttribute("aria-busy", "false");
      $("updated").textContent = "Not loaded";
      showState("error");
      status.textContent = "Couldn't load the ranking.";
    } finally {
      if (mine === request) {
        refresh.disabled = false;
        refresh.removeAttribute("aria-busy");
      }
    }
  }

  function select(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $("panel").setAttribute("aria-labelledby", tab.id);
    if (focus) tab.focus();
    const id = tab.dataset.board;
    history.replaceState(null, "", id === "score" ? location.pathname + location.search : "#" + id);
    show(id, false);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => { if (tab.getAttribute("aria-selected") !== "true") select(tab, false); });
    tab.addEventListener("keydown", e => {
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      select(tabs[(to + tabs.length) % tabs.length], true);
    });
  });
  refresh.addEventListener("click", () => show(board, true));
  const fromHash = () => tabs.find(t => "#" + t.dataset.board === location.hash) || tabs[0];
  addEventListener("hashchange", () => select(fromHash(), false));
  select(fromHash(), false);
})();

