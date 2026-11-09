// The VGraphics intro, the one shared copy every web product loads (D:\Projects\Mine\CLAUDE.md, "Start-up"; the Games
// repo's docs/brand/splash/INTEGRATION.md): the 2.8 s logo film over the product's loading screen, which keeps counting
// underneath. It plays while the product downloads, then fades to show what it covers (the welcome art and the squishy
// bar). A tap, click or key (a TV remote's too) skips it to that screen, never past it. Under reduced motion the film's
// last frame (the still lockup) holds 1 s instead.
// It joins the party games' copy (/tv/start-up/brand-intro.js) and Exitwise's (exitwise/play/brand-intro/) into one
// file (the master, 3 Nov 2026, the palermo repo's WebGL design, open question 17); both take it in their own repos.
//
//   <script src="/assets/startup/brand-intro.js" data-under="loader" data-film="720"></script>
//
// - data-under: the id of the element it covers, which must be positioned ("loader" by default);
// - data-film: "1080" for TVs (the MP4 alone: that film has no WebM), "720" by default (the WebM, then the MP4). The
//   films sit beside this file and are loaded by absolute address, so the page may be at any folder of vgraphics.gr.
// - html.no-intro: nothing at all, no film and no VGIntro (a Palermo Noir join link goes straight in);
// - html.no-film: the film never plays (a TV vgraphics.gr/tv sent, which played it already): it gives way at once, as
//   when it can't play, and the welcome art still has its 2 s.
//
// The welcome art: the page adds the class with-art to the covered element once its picture can be drawn; without it
// there is nothing to hold. The page's side:
//   VGIntro.gameReady(then)    the product is ready: the intro gives way at once if it's still on ("Never delay"), and
//                              then() runs once the welcome art has been on screen WELCOME_MS (at once with no art)
//   VGIntro.welcomeMs()        how long the art has been on screen, in ms, for the product's splash_shown; -1 while
//                              it isn't yet, or if it never came
//   VGIntro.welcomeWindow(fn)  fn(from, until), performance.now() ms, once the intro has gone (and again if the art
//                              comes after it): the shared bar fills across it, bar.pace(Infinity, Infinity) until then
//   VGIntro.playing()          whether the intro is still on
//   document "vgintro:done"    the moment it starts to fade, so a page can hold its own keys until then
// ES5 alone (no let, const, arrows or template strings), so it parses on any TV. tools/test/brand-intro.test.mjs checks
// the timing ("a timer enforces it, a test proves it").
(function () {
  var script = document.currentScript;
  var attr = function (name) { return script && script.getAttribute ? script.getAttribute(name) : null; };
  var html = document.documentElement;
  var loader = document.getElementById(attr("data-under") || "loader");
  if (!loader || html.classList.contains("no-intro")) return;
  var film = !html.classList.contains("no-film");
  var size = attr("data-film") === "1080" ? "1080" : "720";
  var FOLDER = "/assets/startup/";
  var WELCOME_MS = 2000; // the welcome art never just flashes: at least 2 s (George, 22 Oct 2026)
  var NO_FRAME_MS = 1000; // no picture by then: skip the intro
  var CAP_MS = 4000; // never longer
  var STILL_MS = 1000; // reduced motion: the film's last frame, held
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var style = document.createElement("style");
  style.textContent =
    "#brand-intro { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 10; background: #0A090D;" +
    " pointer-events: auto; transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1); }" +
    "#brand-intro.quick { transition-duration: 0.3s; }" +
    "#brand-intro.gone { opacity: 0; pointer-events: none; }" +
    // The film is square with edges of the background colour, so it letterboxes without a seam.
    "#brand-intro video { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: contain; }";
  document.head.appendChild(style);

  var layer = document.createElement("div");
  layer.id = "brand-intro";
  layer.setAttribute("aria-hidden", "true");
  var video = document.createElement("video");
  // Muted and inline, the only way browsers autoplay.
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("muted", "");
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = film ? "auto" : "none";
  video.disablePictureInPicture = true;
  // The 1080 film is an MP4 alone: asking for a WebM that isn't there cost every TV a 404 before the MP4 played.
  var films = [["vgraphics-intro-" + size + ".mp4", "video/mp4"]];
  if (size !== "1080") films.unshift(["vgraphics-intro-" + size + ".webm", "video/webm"]);
  films.forEach(function (file) {
    var source = document.createElement("source");
    source.src = FOLDER + file[0];
    source.type = file[1];
    video.appendChild(source);
  });
  layer.appendChild(video);
  loader.appendChild(layer);

  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
  var playing = false;
  var over = false;
  var gone = false;
  var shownAt = 0;
  var onReady = null;
  var bars = [];
  // When the welcome art came (the page gives the covered element with-art once its picture can be drawn), or -1.
  var artAt = -1;
  var artCame = function () {
    if (artAt < 0 && loader.classList.contains("with-art")) artAt = now();
    return artAt >= 0;
  };
  // The art is on screen from when the intro over it has gone, or from its own arrival if that was later.
  var artFrom = function () { return Math.max(shownAt, artAt); };
  // The page's bar: then(from, until) once the intro has gone. It fills from where it is at `from` to full at `until`,
  // just as the product may come in; with no art there is nothing to wait for, and until is from.
  var open = function (then) {
    var from = artCame() ? artFrom() : now();
    then(from, artCame() ? from + WELCOME_MS : from);
  };
  if (!artCame() && window.MutationObserver) {
    new MutationObserver(function (changes, watch) {
      if (!artCame()) return;
      watch.disconnect();
      // Art after the intro has gone: its own 2 s, so the bar's too.
      if (gone) bars.forEach(open);
    }).observe(loader, { attributes: true, attributeFilter: ["class"] });
  }

  // The page's then(), once the art has been on screen for WELCOME_MS; at once if there is no art.
  var welcome = function () {
    var then = onReady;
    onReady = null;
    var wait = artCame() ? Math.max(0, artFrom() + WELCOME_MS - now()) : 0;
    setTimeout(then, wait);
  };
  var finish = function (quick) {
    if (over) return;
    over = true;
    var fade = quick ? 300 : 500;
    shownAt = now() + fade;
    document.removeEventListener("keydown", skip);
    if (quick) layer.classList.add("quick");
    layer.classList.add("gone");
    setTimeout(function () {
      video.pause();
      layer.remove();
      gone = true;
      bars.forEach(open);
    }, fade);
    if (onReady) welcome();
    var done;
    try {
      done = new Event("vgintro:done");
    } catch (e) { // an engine without the Event constructor
      done = document.createEvent("Event");
      done.initEvent("vgintro:done", false, false);
    }
    document.dispatchEvent(done);
  };
  var skip = function () { finish(false); };

  window.VGIntro = {
    gameReady: function (then) {
      onReady = then;
      if (over) welcome();
      else finish(true);
    },
    welcomeMs: function () {
      return over && artCame() && now() >= artFrom() ? Math.round(now() - artFrom()) : -1;
    },
    welcomeWindow: function (then) {
      bars.push(then);
      if (gone) open(then);
    },
    playing: function () { return !over; }
  };

  video.addEventListener("error", skip);
  video.lastChild.addEventListener("error", skip); // neither file could play
  layer.addEventListener("pointerdown", skip);
  document.addEventListener("keydown", skip);
  if (!film) {
    skip(); // played already: it gives way at once, as when it can't play
  } else if (reduce) {
    video.addEventListener("loadedmetadata", function () { video.currentTime = Math.max(0, video.duration - 0.05); });
    setTimeout(skip, STILL_MS);
  } else {
    video.addEventListener("playing", function () { playing = true; });
    video.addEventListener("ended", skip);
    var started = video.play();
    if (started && started.catch) started.catch(skip); // autoplay refused
    setTimeout(function () { if (!playing) skip(); }, NO_FRAME_MS);
    setTimeout(skip, CAP_MS);
  }
})();
