// Exitwise's playable board beside the intro (demo/board.html): a small solvable level with three hearts.
(() => {
  // A small solvable level: cells run tail to head, then the head's direction.
  const LEVEL = [[[1,6],[2,6],[2,5],"U"],[[0,1],[0,0],[1,0],[2,0],[3,0],"R"],[[4,2],[5,2],[5,3],"D"],[[2,3],[1,3],"L"],[[4,1],[5,1],[5,0],"U"],[[1,2],[0,2],[0,3],[0,4],"D"],[[0,5],[1,5],[1,4],[2,4],[3,4],"R"],[[3,2],[3,3],[4,3],[4,4],"D"],[[3,5],[4,5],"R"],[[5,4],[5,5],"D"],[[3,6],[4,6],[5,6],"R"]];
  const COLS = 6, ROWS = 7, CELL = 60, PAD = 30, STROKE = 22;
  const COLORS = ["#FF6B6B", "#FF922B", "#F2B705", "#3BB273", "#1C9FD8", "#8C5CF0"];
  const DIRS = { U: [0, -1, -90], D: [0, 1, 90], L: [-1, 0, 180], R: [1, 0, 0] };
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const svg = document.getElementById("board");
  const hearts = [...document.querySelectorAll(".heart")];
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
    const p = a.path.getPointAtLength(a.body + along);
    a.head.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${DIRS[a.dir][2]})`);
    a.line.style.strokeDashoffset = -along;
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
    a.line.style.stroke = "var(--mistake)";
    a.head.style.fill = a.head.style.stroke = "var(--mistake)";
    if (navigator.vibrate) navigator.vibrate(40);
    lives -= 1;
    hearts[lives]?.classList.add("lost");
    await animate(110 + push * 0.5, t => placeHead(a, push * t));
    await animate(320, t => placeHead(a, push * (1 - t) * (1 - t)));
    a.line.style.stroke = a.color;
    a.head.style.fill = a.head.style.stroke = a.color;
    a.busy = false;
    if (lives <= 0) {
      over = true;
      showOverlay("Out of hearts", "Look for an arrow with nothing in its way, then tap.", "Try again");
    }
  }

  function build() {
    svg.querySelectorAll("g, rect, circle").forEach(n => n.remove());
    overlay.classList.remove("show");
    hearts.forEach(h => h.classList.remove("lost"));
    lives = 3;
    over = false;

    el("rect", { x: 6, y: 6, width: 408, height: 468, rx: 26, fill: "var(--surface-2)" }, svg);
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const [cx, cy] = center([x, y]);
        el("circle", { cx, cy, r: 4, fill: "var(--dot)" }, svg);
      }

    arrows = LEVEL.map((spec, i) => {
      const cells = spec.slice(0, -1), dir = spec[spec.length - 1];
      const [dx, dy] = DIRS[dir];
      const pts = cells.map(center);
      const [hx, hy] = pts[pts.length - 1];
      const body = (cells.length - 1) * CELL;
      const travel = body + CELL * (Math.max(COLS, ROWS) + 2);
      const d = "M" + pts.map(p => p.join(" ")).join(" L") + ` L${hx + dx * travel} ${hy + dy * travel}`;
      const color = COLORS[i % COLORS.length];

      const g = el("g", { class: "arrow enter", tabindex: 0, role: "button", "aria-label": `${color} arrow pointing ${{ U: "up", D: "down", L: "left", R: "right" }[dir]}` }, svg);
      g.style.animationDelay = i * 45 + "ms";
      el("path", { class: "halo", d: "M" + pts.map(p => p.join(" ")).join(" L"), fill: "none", "stroke-width": CELL * 0.9, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      const path = el("path", { d, fill: "none", stroke: color, "stroke-width": STROKE, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      const total = path.getTotalLength();
      path.style.strokeDasharray = `${body} ${total + body}`;
      const head = el("path", { d: "M27 0 L-5 -19 L-5 19 Z", fill: color, stroke: color, "stroke-width": 6, "stroke-linejoin": "round" }, g);

      const a = { cells, dir, color, g, path, line: path, head, body, travel, busy: false };
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
