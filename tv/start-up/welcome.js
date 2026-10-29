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
// A game with its art in several sizes also names them, each art with its srcset and sizes, and the browser loads only
// the one that covers its screen (George, 27 Oct 2026: "8k for all and based on device we show different resolution"):
// data-art-srcset="../art/wide.webp 1920w, ../art/wide-7680.webp 7680w" data-art-sizes="100vw", and data-art-tall-srcset
// and data-art-tall-sizes the same way. data-art and data-art-tall stay the picture for browsers without srcset.
//
// The bar is the game's, not Exitwise's: no arrowhead (George, 26 Oct 2026: "Palermo tv loading shows a loading arrow.
// This was from exitwise. Style the new loading properly."). Its fill runs in the accent like a lit fuse, with a spark
// at its head that flickers, stretches as it shoots ahead and squashes as it stops.
//
// The app calls PartyWelcome.progress(0 to 1) as it gets on, and PartyWelcome.ready(then) once the lobby is drawn
// underneath. The bar never shows more than the app has said, and fills no faster than the clock across those 2 s
// (and the key art's own 2 s once it appears), so it starts empty and is full just as the welcome may go; then it
// hops, and a timer holds the welcome until it has been up 2 s and the key art, if it came, has been seen for 2 s; then
// it fades out over 300 ms and then(ms) gets how long it was up (the app logs splash_shown). PartyWelcome.look({ art, artTall, artSrcset, artSizes, artTallSrcset, artTallSizes, accent, accentLip })
// changes the art late (a new art without its own srcset drops the old one's); PartyWelcome.hide()
// removes it at once. Plain ES5 and CSS that 2022 TV browsers (Chromium 85) run; only transforms and opacity move.
//
// It never waits for good on a page whose code can't run (George, 27 Oct 2026: "Demo still not loading. Stays at 5% of
// loading."; a cookie-notice blocker had dropped the demo's consent-banner-*.js). Its failsafe needs nothing from the
// page: an error that proves the page's code can't run (a module script of the HTML that didn't load, a SyntaxError
// from a file in its folder, a dynamic import that failed) ends it at once, and so does a page that never said a word
// (progress, ready or hide) 12 s after the intro. Then the welcome goes and a plain message in the page's language says
// so, with a Reload button and, when a file was blocked, a word about ad blockers. A page that spoke but isn't ready
// 30 s after the intro loses the welcome without a message: it's running, and draws its own state. Each failure is
// kept on the device, since the page that should report it may never run; PartyWelcome.failures() hands the page this
// load's and earlier loads' failures, once, for its error reporting. A ready() after a failure still gets its then(ms),
// and takes the message away unless an error caused it.
// The timer and the failsafe are tested in site/test/welcome.test.ts.
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
    // Fill and head move together by transform (the script plans each glide as a transition).
    ".pw-fill, .pw-head { transform: translateX(calc(var(--lead) - 100%)); }",
    ".pw-tip { position: absolute; right: 0; top: 50%; width: var(--hl); height: calc(var(--t) * 1.5); margin-top: calc(var(--t) * -0.75);",
    " transform-origin: 0 50%; }",
    // Inside the tip, so the spark can stretch with its speed while the tip squashes.
    ".pw-stretch { position: absolute; left: 0; top: 0; right: 0; bottom: 0; transform-origin: 0 50%; }",
    // The spark: a hot core in a glow of the accent, flickering.
    ".pw-spark { position: absolute; left: 0; top: 50%; width: calc(var(--t) * 1.5); height: calc(var(--t) * 1.5);",
    " margin: calc(var(--t) * -0.75) 0 0 calc(var(--t) * -0.75); border-radius: 50%;",
    " background: radial-gradient(circle, #FFFBEA 0, #FFF1C2 22%, var(--pw-accent) 46%, rgba(0, 0, 0, 0) 70%);",
    " animation: pw-flicker 0.9s ease-in-out infinite alternate; }",
    "@keyframes pw-flicker { from { opacity: 0.85; transform: scale(0.92); } to { opacity: 1; transform: scale(1.1); } }",
    "@media (prefers-reduced-motion: reduce) { .pw-art.pw-settle img { animation: none; } .pw-spark { animation: none; } }",
    // The failsafe's message: plain, over everything, its button in the game's accent.
    "#party-welcome-failed { position: fixed; left: 0; top: 0; right: 0; bottom: 0; z-index: 1001; display: flex;",
    " flex-direction: column; align-items: center; justify-content: center; padding: 24px; background: #0A090D;",
    " color: #F2EDE4; text-align: center; font: 18px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;",
    " -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }",
    "#party-welcome-failed p { max-width: 30em; margin: 0 0 16px; }",
    "#party-welcome-failed .pw-hint { font-size: 15px; opacity: 0.75; }",
    "#party-welcome-failed button { margin-top: 8px; min-height: 48px; padding: 12px 32px; border: 0; border-radius: 999px;",
    " background: var(--pw-accent, #E8B65A); color: #0A090D; font: inherit; font-weight: 700; cursor: pointer; }",
    "#party-welcome-failed button:focus-visible { outline: 3px solid #FFFFFF; outline-offset: 3px; }"
  ].join("");
  document.head.appendChild(style);

  root.innerHTML =
    '<div class="pw-art"><img alt="" decoding="async"></div>' +
    '<div class="pw-bar" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
    '<div class="pw-shadow"></div><div class="pw-hop"><div class="pw-jelly">' +
    '<div class="pw-track"><div class="pw-groove"><div class="pw-fill"></div></div></div>' +
    '<div class="pw-head"><div class="pw-tip"><div class="pw-stretch"><span class="pw-spark"></span></div></div></div></div></div></div>';

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
  var arts = { wide: "", tall: "", wideSet: "", tallSet: "", wideSizes: "", tallSizes: "" };

  var showArt = function () {
    var useTall = tall && tall.matches && arts.tall;
    var src = useTall ? arts.tall : arts.wide;
    if (!src || img.getAttribute("src") === src) return;
    // The sizes before the picture, so the browser fetches only the one for this screen: a phone never loads the 8K.
    img.sizes = (useTall ? arts.tallSizes : arts.wideSizes) || "100vw";
    img.srcset = (useTall ? arts.tallSet : arts.wideSet) || "";
    img.src = src;
    var shown = function () {
      if (shownAt < 0) {
        shownAt = now();
        artCame(); // the bar's pace: the key art's own 2 s
      }
      art.classList.add("pw-settle");
      root.classList.add("pw-with-art");
    };
    // A late or broken picture is no reason to wait: the bar carries on without it.
    if (img.decode) img.decode().then(shown, function () {});
    else img.onload = shown;
  };
  var COLOURS = { accent: "--pw-accent", accentLip: "--pw-accent-lip", track: "--pw-track", trackLip: "--pw-track-lip",
    groove: "--pw-groove", rim: "--pw-rim" };
  var accent = "";
  var look = function (options) {
    for (var key in COLOURS) if (options[key]) root.style.setProperty(COLOURS[key], options[key]);
    if (options.accent) accent = options.accent;
    arts = {
      wide: options.art || arts.wide,
      tall: options.artTall || arts.tall,
      wideSet: options.artSrcset || (options.art ? "" : arts.wideSet),
      tallSet: options.artTallSrcset || (options.artTall ? "" : arts.tallSet),
      wideSizes: options.artSizes || (options.art ? "" : arts.wideSizes),
      tallSizes: options.artTallSizes || (options.artTall ? "" : arts.tallSizes)
    };
    showArt();
  };
  look({
    art: root.getAttribute("data-art"),
    artTall: root.getAttribute("data-art-tall"),
    artSrcset: root.getAttribute("data-art-srcset"),
    artSizes: root.getAttribute("data-art-sizes"),
    artTallSrcset: root.getAttribute("data-art-tall-srcset"),
    artTallSizes: root.getAttribute("data-art-tall-sizes"),
    accent: root.getAttribute("data-accent"),
    accentLip: root.getAttribute("data-accent-lip"),
    track: root.getAttribute("data-track"),
    trackLip: root.getAttribute("data-track-lip"),
    groove: root.getAttribute("data-groove"),
    rim: root.getAttribute("data-rim")
  });

  // The loading bar, paced as every start-up's is (Exitwise's web loader, loadingBar(), in the Games repo's
  // WebGLTemplates): never ahead of what the app has said, never back, and no faster than the clock across the
  // welcome's 2 s, on the same curve (half steady, half smoothstep), so it fills from empty and is full just as the
  // welcome may go, never sooner (it used to jump to full and sit there while the timer ran). Once the key art appears
  // it fills from where it is to full at the end of the art's own 2 s. Each glide is a CSS transition planned ahead,
  // and the spark's stretch with the speed, a squash and the bar's wobble at each quarter, and the hop at full are
  // animations planned ahead too: only transforms, which the compositor runs while the page is busy.
  var bar = root.querySelector(".pw-bar");
  var part = function (name) { return root.querySelector(".pw-" + name); };
  var fill = part("fill"), head = part("head"), tip = part("tip"), stretchy = part("stretch"), jelly = part("jelly"), hop = part("hop"),
    shadow = part("shadow");
  var lively = typeof tip.animate === "function" && !reduce;
  // linear() easing (Chromium 113 on) lets a glide follow the curve; older TV browsers glide straight from stop to stop.
  var curved = !!(window.CSS && window.CSS.supports && window.CSS.supports("transition-timing-function", "linear(0, 1)"));
  var UP = "cubic-bezier(0.61, 1, 0.88, 1)", DOWN = "cubic-bezier(0.12, 0, 0.39, 0)";
  var easeOut = function (x) { x = Math.min(1, Math.max(0, x)); return 1 - (1 - x) * (1 - x) * (1 - x); };
  var smooth = function (x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  var target = 0, base = 0, from = startedAt, until = startedAt + SHOWN_MS, settled = Infinity;
  // The clock: from base at `from` to full at `until`.
  var paced = function (t) {
    if (t < from) return base;
    if (t >= until) return 1;
    var u = (t - from) / (until - from);
    return base + (1 - base) * (0.5 * u + 0.5 * smooth(u));
  };
  // The fill's way as planned: from a at ta to b at tb, along way(0 to 1).
  var a = 0, b = 0, ta = 0, tb = 0, way = function (u) { return u; };
  var at = function (t) { return t >= tb ? b : t <= ta ? a : a + (b - a) * way((t - ta) / (tb - ta)); };
  var effects = [], stretch = null;
  var place = function (shown) { return "translateX(calc(" + (1 - shown).toFixed(4) + " * (var(--lead) - 100%)))"; };
  var wobble = function (amount, frame) {
    var frames = [];
    for (var i = 0; i <= 24; i++) {
      var t = i * 25;
      frames.push({ transform: frame(i < 24 ? amount * Math.exp(-t / 150) * Math.sin(t / 44.6) / 0.66 : 0) });
    }
    return frames;
  };
  var later = function (element, frames, timing) {
    effects.push({ at: now() + (timing.delay || 0), run: element.animate(frames, timing) });
  };
  // `delay` ms from now: the spark squashes, and the bar wobbles a beat later (not when full: it hops then).
  var gulp = function (delay, amount, full) {
    later(tip, wobble(amount, function (q) { return "scale(" + (1 + q) + ", " + (1 - 0.7 * q) + ")"; }), { duration: 600, delay: delay });
    if (!full) {
      later(jelly, wobble(amount, function (q) { return "scale(" + (1 + 0.06 * q) + ", " + (1 - 0.3 * q) + ")"; }),
        { duration: 600, delay: delay + 40 });
    }
  };
  var bounce = function (delay) {
    later(hop, [
      { offset: 0, transform: "translateY(0) scale(1, 1)", easing: UP },
      { offset: 0.16, transform: "translateY(0) scale(1.04, 0.84)", easing: UP },
      { offset: 0.44, transform: "translateY(-40%) scale(0.97, 1.08)", easing: DOWN },
      { offset: 0.64, transform: "translateY(0) scale(1.05, 0.86)", easing: UP },
      { offset: 0.8, transform: "translateY(-10%) scale(0.99, 1.03)", easing: DOWN },
      { offset: 0.92, transform: "translateY(0) scale(1.01, 0.98)" },
      { offset: 1, transform: "translateY(0) scale(1, 1)" }
    ], { duration: 620, delay: delay });
    later(shadow, [
      { offset: 0, transform: "scale(1, 1)", opacity: 1, easing: UP },
      { offset: 0.16, transform: "scale(1.05, 1)", opacity: 1, easing: UP },
      { offset: 0.44, transform: "scale(0.8, 0.8)", opacity: 0.5, easing: DOWN },
      { offset: 0.64, transform: "scale(1.06, 1)", opacity: 1, easing: UP },
      { offset: 0.8, transform: "scale(0.95, 0.95)", opacity: 0.85, easing: DOWN },
      { offset: 1, transform: "scale(1, 1)", opacity: 1 }
    ], { duration: 620, delay: delay });
  };
  // From where the fill is now to as far as the app has said: along the clock, after a quick catch-up if the clock ran
  // on ahead while the bar waited for the app.
  var plan = function () {
    var t = now(), shown = at(t), goal = target;
    if (goal <= shown) return;
    var catchUp = paced(t) > shown + 1e-3 ? 450 : 0;
    var go = function (t2) {
      var w = catchUp ? easeOut((t2 - t) / catchUp) : 1;
      return shown + (Math.max(shown, Math.min(goal, paced(t2))) - shown) * w;
    };
    // When the way first reaches `share` (it only ever grows), found by halving.
    var reach = function (share, end) {
      var lo = t, hi = end;
      for (var n = 0; n < 32; n++) {
        var mid = (lo + hi) / 2;
        if (go(mid) < share) lo = mid;
        else hi = mid;
      }
      return hi;
    };
    var end = Math.max(t + catchUp, paced(t) >= goal ? t : reach(goal, Math.max(until, t + catchUp)));
    var ms = Math.max(1, end - t), steps = Math.max(2, Math.min(60, Math.round(ms / 40))), points = [];
    a = shown;
    b = goal;
    ta = t;
    tb = t + ms;
    way = curved ? function (u) { return (go(t + u * ms) - shown) / (goal - shown); } : function (u) { return u; };
    for (var n = 0; n <= steps; n++) points.push(way(n / steps).toFixed(4));
    var easing = curved ? "linear(" + points.join(", ") + ")" : "linear";
    fill.style.transition = head.style.transition = "transform " + Math.round(ms) + "ms " + easing;
    fill.style.transform = head.style.transform = place(goal);
    bar.setAttribute("aria-valuenow", String(Math.floor(goal * 100)));
    // What the last plan had still to come gives way to this one's.
    for (var i = 0; i < effects.length; i++) if (effects[i].at > t) effects[i].run.cancel();
    effects = [];
    if (lively) {
      // The spark stretches with the speed (bars a second) and settles back as the fill stops.
      var frames = [];
      for (n = 0; n <= steps; n++) {
        var t2 = t + ms * n / steps, speed = (at(t2 + 8) - at(t2 - 8)) / 16 * 1000, k = Math.min(0.3, 0.2 * Math.max(0, speed));
        frames.push({ offset: (ms * n / steps) / (ms + 120), transform: "scale(" + (1 + k).toFixed(3) + ", " + (1 - 0.5 * k).toFixed(3) + ")" });
      }
      frames.push({ offset: 1, transform: "scale(1, 1)" });
      if (stretch) stretch.cancel();
      stretch = stretchy.animate(frames, ms + 120);
      [0.25, 0.5, 0.75].forEach(function (quarter) {
        if (shown < quarter && goal >= quarter) gulp(reach(quarter, tb) - t, 0.12, false);
      });
      if (goal >= 1) {
        gulp(ms, 0.3, true);
        bounce(ms + 150);
      }
    }
    if (goal >= 1) settled = tb + (lively ? 770 : 0);
  };
  var progress = function (value) {
    if (!(value > target)) return;
    target = Math.min(1, value);
    plan();
  };
  // The key art has appeared: from where the bar is, full at the end of the art's 2 s.
  var artCame = function () {
    var t = now();
    base = at(t);
    from = t;
    until = shownAt + SHOWN_MS;
    plan();
  };

  var gone = false;
  var remove = function () {
    if (gone) return;
    gone = true;
    root.classList.add("pw-done");
    setTimeout(function () { root.remove(); }, FADE_MS + 100);
  };
  var readyAsked = false;

  // The failsafe. The intro is over at vgintro:done, at the welcome's first frame on a page without one, and 5 s in
  // at the latest (brand-intro.js stops itself at 4 s).
  var SILENT_MS = 12000; // past the intro: a page that never said a word has failed
  var SLOW_MS = 30000; // past the intro: a page that spoke but isn't ready loses the welcome anyway
  var INTRO_MS = 5000;
  // A rejection that means code never came: a module that didn't link, a dynamic import that didn't load.
  var MISSING = /^SyntaxError|dynamically imported module|Importing a module script failed/i;
  var STORE = "party-welcome-failures:" + window.location.pathname;
  var introAt = startedAt + INTRO_MS;
  var spoke = false; // the page called progress, ready or hide
  var cause = null; // the first error before ready, which a later failure names
  var blocked = false; // a script or stylesheet didn't load, or a module came without the code asked of it
  var failure = null; // this load's, once the failsafe has fired
  var handed = false; // failures() has handed it to the page
  var notice = null;
  var listed = null; // the HTML's module scripts and modulepreloads, once it's parsed
  var watch = 0;
  var earlier = [];
  try {
    earlier = JSON.parse(window.localStorage.getItem(STORE) || "[]");
  } catch (e) {} // no storage: nothing kept
  if (!Array.isArray(earlier)) earlier = [];

  var fileOf = function (url) { return String(url || "").replace(/[?#].*$/, "").replace(/^.*\//, ""); };
  var folderOf = function (url) { return String(url || "").replace(/[?#].*$/, "").replace(/[^/]*$/, ""); };
  // The page's code: a file in the folder of one of its module scripts (a stray error in the site's menu.js is no reason).
  var ours = function (url) {
    var folder = folderOf(url);
    var code = listed || document.querySelectorAll('script[type="module"], link[rel="modulepreload"]');
    for (var i = 0; i < code.length; i++) if (folder && folderOf(code[i].src || code[i].href) === folder) return true;
    return false;
  };
  var inHtml = function (element) {
    var code = element.tagName === "SCRIPT" ? element.type === "module" : element.rel === "modulepreload";
    if (!code || !listed) return code; // while the HTML is parsed, every module script is its own
    for (var i = 0; i < listed.length; i++) if (listed[i] === element) return true;
    return false;
  };

  var WORDS = {
    en: ["Something stopped the game from starting. Reload, or try another browser.",
      "An ad blocker or a privacy filter may have stopped part of it: allow this site, then reload.", "Reload"],
    el: ["Κάτι εμπόδισε το παιχνίδι να ξεκινήσει. Φορτώστε ξανά τη σελίδα ή δοκιμάστε άλλο πρόγραμμα περιήγησης.",
      "Ίσως το σταμάτησε ένα πρόγραμμα αποκλεισμού διαφημίσεων ή ένα φίλτρο απορρήτου: επιτρέψτε αυτόν τον ιστότοπο και φορτώστε ξανά.",
      "Επαναφόρτωση"]
  };
  var say = function () {
    var lang = String(document.documentElement.getAttribute("lang") || "").slice(0, 2).toLowerCase();
    var words = WORDS[lang === "el" ? "el" : "en"];
    var line = function (text, className) {
      var p = document.createElement("p");
      if (className) p.className = className;
      p.textContent = text;
      notice.appendChild(p);
    };
    notice = document.createElement("div");
    notice.id = "party-welcome-failed";
    notice.setAttribute("role", "alert");
    if (accent) notice.style.setProperty("--pw-accent", accent);
    line(words[0]);
    if (blocked) line(words[1], "pw-hint");
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = words[2];
    button.addEventListener("click", function () { window.location.reload(); });
    notice.appendChild(button);
    document.body.appendChild(notice);
    button.focus();
  };
  var unsay = function () {
    if (notice) notice.remove();
    notice = null;
  };

  // Gives up on the page: the welcome goes, the failure is kept for the page to report, and, unless the page is
  // running, the message says so.
  var fail = function (reason, script, message) {
    if (readyAsked || gone) return;
    clearTimeout(watch);
    failure = { reason: reason, script: script || (cause ? cause.script : ""), message: message || (cause ? cause.message : ""),
      blocked: blocked, ms: Math.round(now() - startedAt), at: Date.now() };
    try {
      window.localStorage.setItem(STORE, JSON.stringify(earlier.concat([failure]).slice(-5)));
    } catch (e) {} // no storage: only a page that recovers can report it
    remove();
    if (reason !== "slow") say();
  };
  var watchdog = function () {
    clearTimeout(watch);
    if (readyAsked || gone) return;
    var wait = introAt + (spoke ? SLOW_MS : SILENT_MS) - now();
    if (wait > 0) watch = setTimeout(watchdog, wait);
    else fail(spoke ? "slow" : "silent");
  };
  document.addEventListener("vgintro:done", function () {
    introAt = Math.min(introAt, now());
    watchdog();
  });
  // Parsed: the page's module scripts have run or failed. A page with no intro counts from the first frame.
  document.addEventListener("DOMContentLoaded", function () {
    listed = document.querySelectorAll('script[type="module"], link[rel="modulepreload"]');
    if (!window.VGIntro) introAt = startedAt;
    watchdog();
  });
  watchdog(); // and if the page never gets parsed (a module script that never comes), 5 s + 12 s in
  // A file that didn't load (the capture phase sees them all), or an uncaught error.
  window.addEventListener("error", function (event) {
    if (readyAsked || gone) return;
    var element = event.target;
    if (element && element.tagName) {
      if (element.tagName !== "SCRIPT" && element.tagName !== "LINK") return; // a picture is no reason
      blocked = true;
      if (inHtml(element)) fail("error", fileOf(element.src || element.href), "the file didn't load");
      return;
    }
    var message = String(event.message || "");
    if (!message || message === "Script error.") return; // another site's script, with nothing to go on
    if (!cause) cause = { script: fileOf(event.filename), message: message };
    if (ours(event.filename) && /SyntaxError/.test(message + (event.error ? " " + event.error.name : ""))) {
      // A module without the export asked of it: a file swapped for an empty one (a blocker) or from another release.
      if (/import|export|binding/i.test(message)) blocked = true;
      fail("error", fileOf(event.filename), message);
    }
  }, true);
  window.addEventListener("unhandledrejection", function (event) {
    if (readyAsked || gone) return;
    var reason = event.reason || {};
    var message = (reason.name ? reason.name + ": " : "") + String(reason.message || reason);
    var url = /https?:\/\/[^\s'"]+/.exec(message);
    if (!cause) cause = { script: url ? fileOf(url[0]) : "", message: message };
    if (!MISSING.test(message)) return;
    blocked = true;
    fail("error", url ? fileOf(url[0]) : "", message);
  });

  window.PartyWelcome = {
    look: look,
    progress: function (value) {
      spoke = true;
      progress(value);
    },
    ready: function (then) {
      if (readyAsked || (gone && !failure)) return;
      readyAsked = true;
      spoke = true;
      clearTimeout(watch);
      if (failure) {
        // The failsafe went first. A page that was only late has the screen now; after an error the message stays,
        // since code is missing whatever the page says (its own cap may call this without it).
        if (failure.reason !== "error") unsay();
        if (then) then(Math.round(now() - startedAt));
        return;
      }
      progress(1);
      // The timer: the bar is full (at the end of the 2 s, or later if the app was) and its hop over, the welcome has
      // been up 2 s, and the key art, if it came, has been seen for 2 s (no wait for an art that isn't there). It looks
      // again when it fires, in case the art came meanwhile.
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
      setTimeout(due, 0);
    },
    hide: function () {
      spoke = true;
      unsay();
      remove();
    },
    // What stopped the start-up on this page, for its error reporting: earlier loads' failures, then this load's, each
    // { reason: "error" | "silent" | "slow", script, message, blocked, ms, at, earlier }. Each is handed over once.
    failures: function () {
      var all = earlier;
      for (var i = 0; i < all.length; i++) all[i].earlier = true;
      if (failure && !handed) {
        handed = true;
        failure.earlier = false;
        all = all.concat([failure]);
      }
      earlier = [];
      try {
        window.localStorage.removeItem(STORE);
      } catch (e) {}
      return all;
    }
  };
  progress(0.05);
})();
