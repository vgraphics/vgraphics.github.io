// The VGraphics intro over the game's loading screen (docs/brand/splash/INTEGRATION.md). It plays while the game
// downloads, then fades to show the loader underneath (the game's art and loading bar), which has been counting all
// along. A tap, click or key skips to the loader, never past it. Same file in both templates (BrandIntroTests).
// The page calls VGIntro.gameReady(then) when Unity is ready: the intro gives way at once if it's still on, and
// then() runs once the welcome art has been seen.
(function () {
  var loader = document.getElementById("loader");
  if (!loader) return;
  var WELCOME_MS = 1200; // the welcome art never just flashes
  var NO_FRAME_MS = 1000; // no picture by then: skip the intro
  var CAP_MS = 4000; // never longer
  var STILL_MS = 1000; // reduced motion: the film's last frame, held
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var style = document.createElement("style");
  style.textContent =
    "#brand-intro { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 10; background: #0A090D;" +
    " transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1); }" +
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
  video.preload = "auto";
  video.disablePictureInPicture = true;
  [["vgraphics-intro-720.webm", "video/webm"], ["vgraphics-intro-720.mp4", "video/mp4"]].forEach(function (file) {
    var source = document.createElement("source");
    source.src = "brand-intro/" + file[0];
    source.type = file[1];
    video.appendChild(source);
  });
  layer.appendChild(video);
  loader.appendChild(layer);

  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
  var playing = false;
  var over = false;
  var shownAt = 0;
  var onReady = null;

  // The page's then(), once the art under the intro has been on screen for WELCOME_MS; at once if there is no art.
  var welcome = function () {
    var then = onReady;
    onReady = null;
    var wait = loader.classList.contains("with-art") ? Math.max(0, shownAt + WELCOME_MS - now()) : 0;
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
    }, fade);
    if (onReady) welcome();
  };
  var skip = function () { finish(false); };

  if (reduce) {
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
  video.addEventListener("error", skip);
  video.lastChild.addEventListener("error", skip); // neither file could play
  layer.addEventListener("pointerdown", skip);
  document.addEventListener("keydown", skip);

  window.VGIntro = {
    gameReady: function (then) {
      onReady = then;
      if (over) welcome();
      else finish(true);
    }
  };
})();
