// The VGraphics intro (Games repo, docs/brand/splash/INTEGRATION.md): the party games' copy of Exitwise's
// brand-intro.js. Same film, same behaviour; it takes the element it covers and the film's size from its script tag,
// and finds the films next to itself, so one file on vgraphics.gr serves the TV of every party game:
//
//   <script src="/tv/start-up/brand-intro.js" data-under="intro-box" data-film="1080"></script>
//
// - data-under: the id of the element the intro covers ("loader" by default, Exitwise's);
// - data-film: "1080" for TVs (the MP4 alone), "720" by default (the WebM, then the MP4).
// A tap, click or key skips it to what's underneath, never past it. VGIntro.gameReady(then) works as in Exitwise's
// copy, with the welcome art held 2 s rather than 1.2 s (George, 22 Oct 2026: "Loading screen must show for at least 2
// seconds."). Added here: VGIntro.playing() says whether it's still on, and the document gets a "vgintro:done" event the
// moment it starts to fade, so a page can hold its own keys until then.
(function () {
  var script = document.currentScript;
  var loader = document.getElementById((script && script.getAttribute("data-under")) || "loader");
  if (!loader) return;
  var film = script && script.getAttribute("data-film") === "1080" ? "1080" : "720";
  var folder = script && script.src ? script.src.replace(/[^/]*$/, "") : "brand-intro/";
  var WELCOME_MS = 2000; // the welcome art never just flashes
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
  video.preload = "auto";
  video.disablePictureInPicture = true;
  // The 1080 film is an MP4 alone: its WebM was never encoded (the master frames are gone), and asking for it cost every
  // page a 404 before the MP4 played (George's demo, 27 Oct 2026).
  var films = [["vgraphics-intro-" + film + ".mp4", "video/mp4"]];
  if (film !== "1080") films.unshift(["vgraphics-intro-" + film + ".webm", "video/webm"]);
  films.forEach(function (file) {
    var source = document.createElement("source");
    source.src = folder + file[0];
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
    document.dispatchEvent(new Event("vgintro:done"));
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
    },
    playing: function () { return !over; }
  };
})();
