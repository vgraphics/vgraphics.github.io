// The party games' TV welcome (D:\Projects\Mine\CLAUDE.md, "Start-up", step 3; Games repo, INTEGRATION.md, "The party
// games"): the game's key art with the squishy, chubby loading bar (Exitwise's web loader is the model), from the first
// frame of a game's TV page until its app has joined the room, and for at least 2 s (George, 22 Oct 2026: "Loading
// screen must show for at least 2 seconds."). The VGraphics intro already played on vgraphics.gr/tv, before the code
// was typed. One file on vgraphics.gr serves every party game, and each game's TV page names its own art, logo and
// colours (the track's are optional: a light pill without them):
//
//   <div id="party-welcome" data-art="../art/key-art-wide.webp" data-art-tall="../art/key-art-tall.webp"
//        data-logo="../art/logo.svg" data-accent="#E8B65A" data-accent-lip="#B8862E"
//        data-track="#0E1B2B" data-track-lip="#050B13" data-groove="#060D16" data-rim="#E8B65A"></div>
//   <script src="../../tv/start-up/welcome.js"></script>
//
// The bar is the game's, not Exitwise's: no arrowhead (George, 26 Oct 2026: "Palermo tv loading shows a loading arrow.
// This was from exitwise. Style the new loading properly."). Its fill runs in the accent like a lit fuse, with a spark
// at its head that flickers, stretches as it shoots ahead and squashes as it stops.
//
// The app calls PartyWelcome.progress(0 to 1) as it gets on, and PartyWelcome.ready(then) once the lobby is drawn
// underneath: the bar fills and hops, and a timer holds the welcome until it has been up 2 s and the key art, if it
// came, has been seen for 2 s; then it fades out over 300 ms and then(ms) gets how long it was up (the app logs
// splash_shown). PartyWelcome.look({ art, artTall, accent, accentLip }) changes the art late; PartyWelcome.hide()
// removes it at once. Plain ES5 and CSS that 2022 TV browsers (Chromium 85) run; only transforms and opacity move.
// The timer is tested in site/test/welcome.test.ts.
(function () {
  var root = document.getElementById("party-welcome");
  if (!root) return;
  var SHOWN_MS = 2000; // the least time the welcome, and the key art once it's there, stays up
  var FADE_MS = 300;
  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
  var startedAt = now(); // the welcome's first frame: this script runs as the page is parsed
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var style = document.createElement("style");
  style.textContent = [
    "#party-welcome { position: fixed; left: 0; top: 0; right: 0; bottom: 0; z-index: 1000; display: flex;",
    " flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 12vh; background: #0A090D;",
    " transition: opacity 0.3s; --pw-accent: #E8B65A; --pw-accent-lip: #B8862E; --pw-track: #FFFDF8; --pw-track-lip: #DED4C4;",
    " --pw-groove: #ECE4D6; --pw-rim: rgba(0, 0, 0, 0); }",
    // No selecting, no long-press menu and no dragging the art (George, 26 Oct 2026: "Dont allow text selection and
    // right clicking in any page."), until the app's KitRoot does it for the whole page and blocks the right-click menu.
    "#party-welcome { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }",
    "#party-welcome img { -webkit-user-drag: none; }",
    "#party-welcome.pw-done { opacity: 0; pointer-events: none; }",
    // The game's logo, top left as on its landing page's hero.
    ".pw-logo { position: absolute; left: 4vw; top: 5vh; z-index: 1; height: 13vh; width: auto; opacity: 0; transition: opacity 0.6s; }",
    ".pw-logo.pw-in { opacity: 1; }",
    // Portrait (the TV page on a phone, "use this phone as the table"): top centre, where a tall art keeps its sky.
    "@media (max-aspect-ratio: 1/1) { .pw-logo { left: 50%; top: 3vh; height: 10vh; transform: translateX(-50%); } }",
    // The art: cover-fitted, its tall crop on portrait screens, settling from a touch larger as it appears.
    ".pw-art { position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; opacity: 0; transition: opacity 0.3s; }",
    ".pw-art img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; }",
    ".pw-art::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 36%;",
    " background: linear-gradient(rgba(10, 9, 13, 0), rgba(10, 9, 13, 0.55)); }",
    "#party-welcome.pw-with-art .pw-art { opacity: 1; }",
    ".pw-art.pw-settle img { animation: pw-settle 1.6s cubic-bezier(0.23, 1, 0.32, 1) both; }",
    "@keyframes pw-settle { from { transform: scale(1.04); } to { transform: scale(1); } }",
    // The bar, chubby: a pill on a darker lip with a groove (and the game's rim), and in the groove the fill in the
    // game's accent, with a spark at its head.
    ".pw-bar { --h: 40px; --lip: 4px; --pad: 7px; --t: calc(var(--h) - var(--lip) - 2 * var(--pad));",
    " --hl: calc(var(--t) * 1.1); --lead: calc(var(--hl) + var(--t) / 2); position: relative; width: 420px; max-width: 62vw; height: var(--h); }",
    ".pw-shadow { position: absolute; left: 5%; right: 5%; bottom: -12px; height: 24px; border-radius: 50%;",
    " background: radial-gradient(closest-side, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0)); }",
    ".pw-hop, .pw-jelly, .pw-track { position: absolute; left: 0; top: 0; right: 0; bottom: 0; }",
    ".pw-hop { transform-origin: 50% 100%; }",
    ".pw-jelly { transform-origin: 0 50%; }",
    ".pw-track { border-radius: 999px; background: var(--pw-track);",
    " box-shadow: inset 0 calc(var(--lip) * -1) 0 var(--pw-track-lip), 0 0 0 2px var(--pw-rim); }",
    ".pw-groove, .pw-head { position: absolute; left: var(--pad); right: var(--pad); top: var(--pad); height: var(--t); }",
    ".pw-groove { overflow: hidden; border-radius: 999px; background: var(--pw-groove); box-shadow: inset 0 3px 3px rgba(0, 0, 0, 0.28); }",
    // The fill: the accent with a bright thread along its top, darker at its tail, like a fuse that's burning.
    ".pw-fill { position: absolute; top: 0; bottom: 0; left: calc(var(--t) / 2 - var(--hl)); width: 100%; border-radius: 999px;",
    " background: linear-gradient(90deg, var(--pw-accent-lip), var(--pw-accent) 60%);",
    " box-shadow: inset 0 -4px 0 var(--pw-accent-lip), inset 0 3px 0 rgba(255, 246, 216, 0.45); }",
    ".pw-fill, .pw-head { transform: translateX(calc(var(--lead) - 100%)); transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1); }",
    ".pw-tip { position: absolute; right: 0; top: 50%; width: var(--hl); height: calc(var(--t) * 1.5); margin-top: calc(var(--t) * -0.75);",
    " transform-origin: 0 50%; }",
    // The spark: a hot core in a glow of the accent, flickering.
    ".pw-spark { position: absolute; left: 0; top: 50%; width: calc(var(--t) * 1.5); height: calc(var(--t) * 1.5);",
    " margin: calc(var(--t) * -0.75) 0 0 calc(var(--t) * -0.75); border-radius: 50%;",
    " background: radial-gradient(circle, #FFFBEA 0, #FFF1C2 22%, var(--pw-accent) 46%, rgba(0, 0, 0, 0) 70%);",
    " animation: pw-flicker 0.9s ease-in-out infinite alternate; }",
    "@keyframes pw-flicker { from { opacity: 0.85; transform: scale(0.92); } to { opacity: 1; transform: scale(1.1); } }",
    "@media (prefers-reduced-motion: reduce) { .pw-art.pw-settle img { animation: none; } .pw-spark { animation: none; }",
    " .pw-fill, .pw-head { transition-duration: 0.2s; } }"
  ].join("");
  document.head.appendChild(style);

  root.innerHTML =
    '<div class="pw-art"><img alt="" decoding="async"></div>' +
    '<div class="pw-bar" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
    '<div class="pw-shadow"></div><div class="pw-hop"><div class="pw-jelly">' +
    '<div class="pw-track"><div class="pw-groove"><div class="pw-fill"></div></div></div>' +
    '<div class="pw-head"><div class="pw-tip"><span class="pw-spark"></span></div></div></div></div></div>';

  // The logo, once it has come (a missing one leaves no broken picture).
  var logoSrc = root.getAttribute("data-logo");
  if (logoSrc) {
    var logo = document.createElement("img");
    logo.className = "pw-logo";
    logo.alt = "";
    logo.onload = function () { logo.className = "pw-logo pw-in"; };
    logo.src = logoSrc;
    root.insertBefore(logo, root.firstChild);
  }

  var art = root.querySelector(".pw-art");
  var img = art.querySelector("img");
  var shownAt = -1;
  var tall = window.matchMedia ? window.matchMedia("(max-aspect-ratio: 1/1)") : null;
  var arts = { wide: "", tall: "" };

  var showArt = function () {
    var src = tall && tall.matches && arts.tall ? arts.tall : arts.wide;
    if (!src || img.getAttribute("src") === src) return;
    img.src = src;
    var shown = function () {
      if (shownAt < 0) shownAt = now();
      art.classList.add("pw-settle");
      root.classList.add("pw-with-art");
    };
    // A late or broken picture is no reason to wait: the bar carries on without it.
    if (img.decode) img.decode().then(shown, function () {});
    else img.onload = shown;
  };
  var COLOURS = { accent: "--pw-accent", accentLip: "--pw-accent-lip", track: "--pw-track", trackLip: "--pw-track-lip",
    groove: "--pw-groove", rim: "--pw-rim" };
  var look = function (options) {
    for (var key in COLOURS) if (options[key]) root.style.setProperty(COLOURS[key], options[key]);
    arts = { wide: options.art || arts.wide, tall: options.artTall || arts.tall };
    showArt();
  };
  look({
    art: root.getAttribute("data-art"),
    artTall: root.getAttribute("data-art-tall"),
    accent: root.getAttribute("data-accent"),
    accentLip: root.getAttribute("data-accent-lip"),
    track: root.getAttribute("data-track"),
    trackLip: root.getAttribute("data-track-lip"),
    groove: root.getAttribute("data-groove"),
    rim: root.getAttribute("data-rim")
  });

  // The loading bar, as Exitwise's web loader moves it: steps that ease in and never go back. Each step stretches the
  // spark as it shoots ahead, squashes it as it stops and wobbles the bar; full, the bar hops.
  var bar = root.querySelector(".pw-bar");
  var part = function (name) { return root.querySelector(".pw-" + name); };
  var fill = part("fill"), head = part("head"), tip = part("tip"), jelly = part("jelly"), hop = part("hop"), shadow = part("shadow");
  var lively = typeof tip.animate === "function" && !reduce;
  var target = 0, shownValue = 0, last = -1e4, timer = 0, settled = 0;
  var UP = "cubic-bezier(0.61, 1, 0.88, 1)", DOWN = "cubic-bezier(0.12, 0, 0.39, 0)";
  var wobble = function (amount, frame) {
    var frames = [];
    for (var i = 0; i <= 24; i++) {
      var t = i * 25;
      frames.push({ transform: frame(i < 24 ? amount * Math.exp(-t / 150) * Math.sin(t / 44.6) / 0.66 : 0) });
    }
    return frames;
  };
  var squish = function (jump, wholeBar) {
    var amount = Math.min(0.3, 0.08 + jump * 0.6);
    tip.animate(wobble(amount, function (q) { return "scale(" + (1 + q) + ", " + (1 - 0.7 * q) + ")"; }), 600);
    if (wholeBar) {
      jelly.animate(wobble(amount, function (q) { return "scale(" + (1 + 0.06 * q) + ", " + (1 - 0.3 * q) + ")"; }),
        { duration: 600, delay: 40 });
    }
  };
  var bounce = function () {
    hop.animate([
      { offset: 0, transform: "translateY(0) scale(1, 1)", easing: UP },
      { offset: 0.16, transform: "translateY(0) scale(1.04, 0.84)", easing: UP },
      { offset: 0.44, transform: "translateY(-40%) scale(0.97, 1.08)", easing: DOWN },
      { offset: 0.64, transform: "translateY(0) scale(1.05, 0.86)", easing: UP },
      { offset: 0.8, transform: "translateY(-10%) scale(0.99, 1.03)", easing: DOWN },
      { offset: 0.92, transform: "translateY(0) scale(1.01, 0.98)" },
      { offset: 1, transform: "translateY(0) scale(1, 1)" }
    ], 620);
    shadow.animate([
      { offset: 0, transform: "scale(1, 1)", opacity: 1, easing: UP },
      { offset: 0.16, transform: "scale(1.05, 1)", opacity: 1, easing: UP },
      { offset: 0.44, transform: "scale(0.8, 0.8)", opacity: 0.5, easing: DOWN },
      { offset: 0.64, transform: "scale(1.06, 1)", opacity: 1, easing: UP },
      { offset: 0.8, transform: "scale(0.95, 0.95)", opacity: 0.85, easing: DOWN },
      { offset: 1, transform: "scale(1, 1)", opacity: 1 }
    ], 620);
  };
  var step = function () {
    clearTimeout(timer);
    if (target <= shownValue) return;
    // One gulp at a time: a big one after half a second, a small one after a longer beat, the last one at once.
    var wait = (target < 1 ? (target - shownValue >= 0.04 ? 500 : 900) : 0) - (now() - last);
    if (wait > 0) {
      timer = setTimeout(step, wait);
      return;
    }
    var jump = target - shownValue;
    shownValue = target;
    last = now();
    var at = "translateX(calc(" + (1 - shownValue).toFixed(4) + " * (var(--lead) - 100%)))";
    fill.style.transform = at;
    head.style.transform = at;
    bar.setAttribute("aria-valuenow", String(Math.floor(shownValue * 100)));
    if (lively) squish(jump, shownValue < 1);
    if (shownValue < 1) return;
    if (lively) setTimeout(bounce, 150);
    settled = last + (lively ? 770 : 0);
  };
  var progress = function (value) {
    if (!(value > target)) return;
    target = Math.min(1, value);
    step();
  };

  var gone = false;
  var remove = function () {
    if (gone) return;
    gone = true;
    root.classList.add("pw-done");
    setTimeout(function () { root.remove(); }, FADE_MS + 100);
  };
  var readyAsked = false;
  window.PartyWelcome = {
    look: look,
    progress: progress,
    ready: function (then) {
      if (readyAsked || gone) return;
      readyAsked = true;
      progress(1);
      // The timer: the bar's hop ends, the welcome has been up 2 s, and the key art, if it came, has been seen for 2 s
      // (no wait for an art that isn't there). It looks again when it fires, in case the art came meanwhile.
      var due = function () {
        if (gone) return;
        var at = now();
        var art = shownAt < 0 ? 0 : shownAt + SHOWN_MS - at;
        var wait = Math.max(settled - at, startedAt + SHOWN_MS - at, art);
        if (wait > 0) {
          setTimeout(due, wait);
          return;
        }
        remove();
        if (then) then(Math.round(at - startedAt));
      };
      // The last gulp may still be waiting its turn.
      setTimeout(due, Math.max(0, last + 20 - now()));
    },
    hide: remove
  };
  progress(0.05);
})();
