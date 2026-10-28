// Exitwise's playable board on the intro's stage (demo/board.html): a small solvable level with three hearts, drawn the
// way the game draws its boards from now on, George's pick "A3 Flat candy" of 22 Oct 2026 (Games repo,
// docs/arrow-looks/ and docs/game1-arrow-escape.md): flat colour arrows in the UI's ink outline, on a card in a cream
// frame, in the first world's colours.
(() => {
  // A small solvable level: cells run tail to head, then the head's direction.
  const LEVEL = [[[1,6],[2,6],[2,5],"U"],[[0,1],[0,0],[1,0],[2,0],[3,0],"R"],[[4,2],[5,2],[5,3],"D"],[[2,3],[1,3],"L"],[[4,1],[5,1],[5,0],"U"],[[1,2],[0,2],[0,3],[0,4],"D"],[[0,5],[1,5],[1,4],[2,4],[3,4],"R"],[[3,2],[3,3],[4,3],[4,4],"D"],[[3,5],[4,5],"R"],[[5,4],[5,5],"D"],[[3,6],[4,6],[5,6],"R"]];
  const COLS = 6, ROWS = 7, CELL = 60;
  // The game's sizes, in cells: the card is the cells grown by 0.28 with round corners, in a 0.3 frame (BoardCard);
  // arrows are 0.45 wide with bends of 0.27 and an outline of 0.033 (TubeArrow). PAD fits the frame in the viewBox.
  const GROW = 0.28 * CELL, FRAME = 0.3 * CELL, PAD = 36;
  const W = 0.45 * CELL, BEND = 0.27 * CELL, EDGE = 2;
  // The Meadow, the first world (WorldStyles.cs): its card, the stripe in its frame, its dots and its arrows.
  const WORLD = {
    card: "#FFFDF8", rim: "#E8DCC6", dot: "#C0AF95",
    arrows: [["red", "#EE4D5C"], ["orange", "#D9580E"], ["yellow", "#BE8508"], ["green", "#1F9F52"], ["blue", "#1E88DA"], ["purple", "#8C5CF0"]],
  };
  const DIRS = { U: [0, -1, -90, "up"], D: [0, 1, 90, "down"], L: [-1, 0, 180, "left"], R: [1, 0, 0, "right"] };
  // The light comes from the upper left, as in the game: each lighter layer sits a little towards it.
  const LIGHT = [-0.6, -0.8];
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The UI's ink, its cream and the mistake red are the theme pack's, as the game's Palette shares them with its UI.
  const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const INK = rgb(token("--ink")), CREAM = rgb(token("--surface")), MISTAKE = rgb(token("--mistake")), WHITE = [255, 255, 255];
  const css = (c) => `rgb(${c.map(Math.round).join(" ")})`;
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const dim = (a, k) => a.map((v) => v * k);
  // An arrow's four layers (Palette.Outline and FlatCandy): the outline, the shaded far edge, the face, the sheen.
  const look = (c) => ({ o: css(mix(dim(c, 0.55), INK, 0.55)), b: css(mix(c, dim(c, 0.86), 0.6)), m: css(c), s: css(mix(c, WHITE, 0.2)) });
  const BAD = look(MISTAKE);

  const svg = document.getElementById("board");
  const hearts = [...document.querySelectorAll(".heart")];
  const heartsBox = document.querySelector(".hearts");
  const left = document.querySelector(".left");
  const overlay = document.querySelector(".overlay");
  let arrows, alive, lives, over;

  const center = ([x, y]) => [PAD + x * CELL + CELL / 2, PAD + y * CELL + CELL / 2];
  const el = (name, attrs, parent) => {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  };
  const animate = (ms, step) => new Promise(done => {
    if (reduced) ms = 1;
    const start = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - start) / ms);
      step(t);
      t < 1 ? requestAnimationFrame(frame) : done();
    };
    requestAnimationFrame(frame);
  });

  // The cells' middles as a line with round bends, then on out past the board's edge; and the length up to the head.
  function route(pts, dir, travel) {
    const [dx, dy] = DIRS[dir];
    let d = `M${pts[0][0]} ${pts[0][1]}`, bends = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
      const ux = Math.sign(x - px), uy = Math.sign(y - py), vx = Math.sign(nx - x), vy = Math.sign(ny - y);
      if (ux === vx && uy === vy) continue;
      bends++;
      d += ` L${x - ux * BEND} ${y - uy * BEND} A${BEND} ${BEND} 0 0 ${ux * vy - uy * vx > 0 ? 1 : 0} ${x + vx * BEND} ${y + vy * BEND}`;
    }
    const [hx, hy] = pts[pts.length - 1];
    d += ` L${hx} ${hy} L${hx + dx * travel} ${hy + dy * travel}`;
    return { d, body: (pts.length - 1) * CELL - bends * BEND * (2 - Math.PI / 2) };
  }

  // The head: a triangle with round corners (Meadow's heads), scaled by k about its middle.
  function head(k) {
    const tip = 23.5, back = -3.5, half = 17, mid = (tip + back * 2) / 3;
    const at = (x) => mid + (x - mid) * k;
    return `M${at(tip)} 0 L${at(back)} ${-half * k} L${at(back)} ${half * k} Z`;
  }

  function rayCells(a) {
    const [dx, dy] = DIRS[a.dir];
    let [x, y] = a.cells[a.cells.length - 1];
    const out = [];
    for (x += dx, y += dy; x >= 0 && x < COLS && y >= 0 && y < ROWS; x += dx, y += dy) out.push(x + "," + y);
    return out;
  }

  function blockerDistance(a) {
    const taken = new Set();
    for (const b of alive) if (b !== a) b.cells.forEach(c => taken.add(c[0] + "," + c[1]));
    const ray = rayCells(a);
    const i = ray.findIndex(c => taken.has(c));
    return i < 0 ? 0 : i + 1;
  }

  function placeHead(a, along) {
    const p = a.lines[0].getPointAtLength(a.body + along);
    a.heads.forEach(h => h.setAttribute("transform", `translate(${p.x} ${p.y})`));
    a.lines.forEach(l => (l.style.strokeDashoffset = -along));
  }

  function paint(a, c) {
    for (const k in c) a.g.style.setProperty("--" + k, c[k]);
  }

  function setLeft() {
    left.textContent = alive.size + (alive.size === 1 ? " arrow left" : " arrows left");
  }

  function showOverlay(title, text, button) {
    overlay.querySelector("h3").textContent = title;
    overlay.querySelector("p").textContent = text;
    overlay.querySelector("button").textContent = button;
    overlay.classList.add("show");
    overlay.querySelector("button").focus({ preventScroll: true });
  }

  async function tap(a) {
    if (over || a.busy || !alive.has(a)) return;
    a.busy = true;
    const blocked = blockerDistance(a);
    if (!blocked) {
      alive.delete(a);
      setLeft();
      a.g.style.pointerEvents = "none";
      await animate(560 + a.travel * 0.35, t => {
        placeHead(a, a.travel * t * t);
        a.g.style.opacity = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      });
      a.g.remove();
      if (!alive.size) {
        over = true;
        setTimeout(() => showOverlay("Board clear!", "That's Exitwise. The full game has 600 levels, up to 100×100.", "Play again"), 250);
      }
      return;
    }
    const push = (blocked - 1) * CELL + CELL * 0.3;
    paint(a, BAD);
    if (navigator.vibrate) navigator.vibrate(40);
    lives -= 1;
    hearts[lives]?.classList.add("lost");
    heartsBox.setAttribute("aria-label", `${lives} ${lives === 1 ? "heart" : "hearts"} left`);
    await animate(110 + push * 0.5, t => placeHead(a, push * t));
    await animate(320, t => placeHead(a, push * (1 - t) * (1 - t)));
    paint(a, a.look);
    a.busy = false;
    if (lives <= 0) {
      over = true;
      showOverlay("Out of hearts", "Look for an arrow with nothing in its way, then tap.", "Try again");
    }
  }

  // The card and its frame, from the outside in: the ink outline, the cream frame, the world's stripe, an ink line at
  // the card's edge, then the card, a little darker towards its edge, and a dot in every cell.
  function card() {
    const ring = (out, fill) => el("rect", {
      x: PAD - GROW - out, y: PAD - GROW - out, width: COLS * CELL + 2 * (GROW + out), height: ROWS * CELL + 2 * (GROW + out),
      rx: GROW + out, fill,
    }, svg);
    ring(FRAME, css(mix(CREAM, INK, 0.8)));
    ring(FRAME - 0.035 * CELL, css(CREAM));
    ring(0.09 * CELL, WORLD.rim);
    ring(0.035 * CELL, css(CREAM));
    ring(0.03 * CELL, css(mix(CREAM, INK, 0.55)));
    ring(0, WORLD.card);
    [[2.5, 0.05], [7, 0.025], [11.5, 0.012]].forEach(([inset, alpha]) => {
      const r = ring(-inset, "none");
      r.setAttribute("stroke", css(INK));
      r.setAttribute("stroke-opacity", alpha);
      r.setAttribute("stroke-width", 4.5);
    });
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const [cx, cy] = center([x, y]);
        el("circle", { cx, cy, r: 3.4, fill: WORLD.dot }, svg);
      }
  }

  function build() {
    svg.replaceChildren();
    overlay.classList.remove("show");
    hearts.forEach(h => h.classList.remove("lost"));
    heartsBox.setAttribute("aria-label", "3 hearts left");
    lives = 3;
    over = false;
    card();

    arrows = LEVEL.map((spec, i) => {
      const cells = spec.slice(0, -1), dir = spec[spec.length - 1];
      const [, , turn, way] = DIRS[dir];
      const pts = cells.map(center);
      const travel = (cells.length - 1) * CELL + CELL * (Math.max(COLS, ROWS) + 2);
      const { d, body } = route(pts, dir, travel);
      const [name, color] = WORLD.arrows[i % WORLD.arrows.length];

      const g = el("g", { class: "arrow enter", tabindex: 0, role: "button", "aria-label": `${name} arrow pointing ${way}` }, svg);
      g.style.animationDelay = i * 45 + "ms";
      el("path", { class: "halo", d: "M" + pts.map(p => p.join(" ")).join(" L"), fill: "none", "stroke-width": CELL * 0.9, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      // Body and head layer by layer, each lighter one smaller and nearer the light, so the outline runs round both
      // as one shape: [width, head scale, head stroke, distance towards the light] for the outline, edge, face, sheen.
      const layers = [["o", W + 2 * EDGE, 1, 5 + 2 * EDGE, 0], ["b", W, 1, 5, 0], ["m", W * 0.84, 0.86, 4.3, W * 0.08], ["s", W * 0.38, 0.44, 2.5, W * 0.2]];
      const lines = [], heads = [];
      for (const [k, width, scale, round, shift] of layers) {
        const [sx, sy] = [LIGHT[0] * shift, LIGHT[1] * shift];
        lines.push(el("path", { class: "l" + k, d, fill: "none", "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", transform: `translate(${sx} ${sy})` }, g));
        const h = el("g", {}, g);
        el("path", { class: "h" + k, d: head(scale), "stroke-width": round, "stroke-linejoin": "round", transform: `translate(${sx} ${sy}) rotate(${turn})` }, h);
        heads.push(h);
      }
      const total = lines[0].getTotalLength();
      lines.forEach(l => (l.style.strokeDasharray = `${body} ${total + body}`));

      const a = { cells, dir, g, lines, heads, body, travel, look: look(rgb(color)), busy: false };
      paint(a, a.look);
      placeHead(a, 0);
      g.addEventListener("click", () => tap(a));
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(a); } });
      return a;
    });
    alive = new Set(arrows);
    setLeft();
  }

  document.querySelector(".reset").addEventListener("click", build);
  overlay.querySelector("button").addEventListener("click", build);
  build();
})();
