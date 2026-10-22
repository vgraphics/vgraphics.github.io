// The soundtrack player of the product pages (markup: tools/lib/soundtrack.mjs; look: soundtrack.css): play, pause,
// previous and next, loop (off, all the tracks, this one), a waveform to seek on and the track list. Once the music has
// started, a mini-bar at the bottom of the screen keeps the controls in reach while the player is out of view, until
// the visitor closes it, which stops the music. Nothing loads before the first press of play: the <audio> has
// preload="none" and no source until then. Media keys and a phone's lock screen work through the Media Session API,
// where the browser has it.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const session = "mediaSession" in navigator ? navigator.mediaSession : null;
  const LOOP = { off: "Loop: off", all: "Loop: all tracks", one: "Loop: this track" };
  const clock = (s) => {
    const t = Math.max(0, Math.floor(s || 0));
    return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
  };

  function player(root) {
    const audio = root.querySelector("audio");
    const deck = root.querySelector(".ost-deck");
    const seekBox = root.querySelector(".ost-seek");
    const wave = root.querySelector(".ost-wave");
    const range = root.querySelector(".ost-range");
    const rows = [...root.querySelectorAll(".ost-track")];
    const live = root.querySelector('[data-ost="live"]');
    const mini = root.querySelector(".ost-mini");
    const main = (name) => root.querySelector('.ost-player [data-ost="' + name + '"]');
    const both = (name) => [main(name), mini.querySelector('[data-ost="' + name + '"]')].filter(Boolean);
    let at = 0; // the current track
    let started = false; // play was pressed, and the mini-bar wasn't closed since
    let inView = true;
    let dragging = false;
    let loop = "off";

    // Last in the page: fixed to the screen whatever its ancestors do, and last in the tab order.
    document.body.append(mini);

    const track = () => rows[at];
    const title = () => track().querySelector(".ost-t").textContent;
    const loaded = () => audio.getAttribute("src") === track().dataset.src;
    const length = () => (loaded() && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : Number(track().dataset.duration));

    function state(s) {
      root.dataset.state = s;
      mini.dataset.state = s;
      both("play").forEach((b) => b.setAttribute("aria-label", s === "paused" ? "Play" : "Pause"));
      if (session) session.playbackState = s === "paused" ? "paused" : "playing";
    }

    function show(t) {
      const len = length();
      const p = len ? Math.min(1, t / len) : 0;
      range.value = t;
      seekBox.style.setProperty("--p", p * 100 + "%");
      mini.style.setProperty("--p", p);
      main("cur").textContent = clock(t);
      if (document.activeElement !== range) range.setAttribute("aria-valuetext", clock(t) + " of " + clock(len));
    }

    // The current track's waveform, a bar every 4 pixels, averaged down from its peaks (0-100).
    function draw() {
      const peaks = (track().dataset.peaks || "").split(",").filter(Boolean).map(Number);
      seekBox.classList.toggle("waved", peaks.length > 1);
      const w = wave.clientWidth;
      const h = wave.clientHeight;
      if (peaks.length < 2 || !w) return;
      const n = Math.max(24, Math.min(peaks.length, Math.floor(w / 4)));
      let d = "";
      for (let i = 0; i < n; i++) {
        const from = Math.floor((i * peaks.length) / n);
        const to = Math.max(from + 1, Math.floor(((i + 1) * peaks.length) / n));
        let sum = 0;
        for (let j = from; j < to; j++) sum += peaks[j];
        const bar = Math.max(3, ((sum / (to - from)) / 100) * (h - 4));
        d += "M" + (((i + 0.5) * w) / n).toFixed(1) + " " + ((h - bar) / 2).toFixed(1) + "v" + bar.toFixed(1);
      }
      wave.querySelectorAll("svg").forEach((svg) => svg.setAttribute("viewBox", "0 0 " + w + " " + h));
      wave.querySelectorAll("path").forEach((path) => path.setAttribute("d", d));
    }

    function describe() {
      if (!session || !window.MediaMetadata) return;
      session.metadata = new MediaMetadata({
        title: title(),
        artist: "VGraphics",
        album: root.dataset.album,
        artwork: [{ src: root.dataset.artwork, sizes: "640x640", type: "image/webp" }],
      });
    }

    function position() {
      if (!session || !session.setPositionState || !loaded() || !isFinite(audio.duration)) return;
      try {
        session.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, audio.duration) });
      } catch (e) {}
    }

    function select(i) {
      at = (i + rows.length) % rows.length;
      rows.forEach((r, n) => (n === at ? r.setAttribute("aria-current", "true") : r.removeAttribute("aria-current")));
      both("title").forEach((el) => (el.textContent = title()));
      main("label").textContent = "Track " + (at + 1) + " of " + rows.length;
      main("dur").textContent = clock(track().dataset.duration);
      range.max = track().dataset.duration;
      draw();
      show(0);
      if (started) describe();
    }

    function start() {
      if (!loaded() || audio.error) {
        const from = Number(range.value); // a place picked on the waveform before the track loaded
        audio.src = track().dataset.src;
        if (from) audio.currentTime = from;
        live.textContent = "Now playing: " + title();
      }
      main("label").textContent = "Track " + (at + 1) + " of " + rows.length;
      started = true;
      state("loading");
      describe();
      place();
      audio.play().catch(() => {
        if (audio.paused) state("paused");
      });
    }

    const toggle = () => (audio.paused ? start() : audio.pause());

    function skip(by) {
      const playing = !audio.paused;
      select(at + by);
      if (playing) start();
    }

    // Previous restarts the track after its first 3 seconds, as on most players.
    const back = () => (loaded() && audio.currentTime > 3 ? seek(0) : skip(-1));

    function seek(t) {
      t = Math.max(0, Math.min(length(), t));
      if (loaded() && audio.readyState) audio.currentTime = t; // otherwise start() takes it from the bar
      show(t);
    }

    function stop() {
      audio.pause();
      started = false;
      place();
    }

    function setLoop(mode) {
      loop = LOOP[mode] ? mode : "off";
      audio.loop = loop === "one";
      const b = main("loop");
      b.dataset.loop = loop;
      b.setAttribute("aria-label", LOOP[loop]);
      b.title = LOOP[loop];
    }

    // The mini-bar is on while the music has started and the player's controls are off the screen.
    function place() {
      const on = started && !inView;
      if (on === mini.classList.contains("on")) return;
      if (on && mini.hidden) {
        mini.hidden = false;
        mini.getBoundingClientRect(); // laid out below the screen first, so it slides in
      }
      // The footer's words make room for the bar: its height, its gap to the screen's edge and a little air.
      if (on) document.documentElement.style.setProperty("--ost-room", mini.offsetHeight + parseFloat(getComputedStyle(mini).bottom) + 8 + "px");
      mini.classList.toggle("on", on);
      document.documentElement.classList.toggle("ost-room", on);
    }

    audio.addEventListener("playing", () => state("playing"));
    audio.addEventListener("waiting", () => state("loading"));
    audio.addEventListener("pause", () => state("paused"));
    audio.addEventListener("timeupdate", () => dragging || show(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => {
      range.max = audio.duration;
      main("dur").textContent = clock(audio.duration);
      position();
    });
    audio.addEventListener("seeked", position);
    audio.addEventListener("ended", () => {
      if (at < rows.length - 1 || loop === "all") {
        select(at + 1);
        start();
      } else {
        select(0);
      }
    });
    audio.addEventListener("error", () => {
      if (!audio.getAttribute("src")) return;
      state("paused");
      main("label").textContent = "Didn't load. Press play to try again";
      live.textContent = title() + " didn't load.";
    });

    both("play").forEach((b) => b.addEventListener("click", toggle));
    both("next").forEach((b) => b.addEventListener("click", () => skip(1)));
    main("prev").addEventListener("click", back);
    main("loop").addEventListener("click", () => {
      setLoop(Object.keys(LOOP)[(Object.keys(LOOP).indexOf(loop) + 1) % 3]);
      live.textContent = LOOP[loop];
      try {
        localStorage.setItem("ost-loop", loop);
      } catch (e) {}
    });
    rows.forEach((row, i) => row.addEventListener("click", () => (i === at ? toggle() : (select(i), start()))));

    range.addEventListener("input", () => {
      dragging = true;
      show(Number(range.value));
    });
    range.addEventListener("change", () => {
      dragging = false;
      seek(Number(range.value));
    });
    ["pointerup", "blur"].forEach((e) => range.addEventListener(e, () => (dragging = false)));
    // Arrows move 5 seconds and Page Up/Down 15, as the seek bars of YouTube and most players do.
    range.addEventListener("keydown", (e) => {
      const by = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -15, PageUp: 15 }[e.key];
      const t = e.key === "Home" ? 0 : e.key === "End" ? length() - 1 : by ? Number(range.value) + by : null;
      if (t === null) return;
      e.preventDefault();
      seek(t);
      range.setAttribute("aria-valuetext", clock(range.value) + " of " + clock(length()));
    });
    // The stretch of the waveform up to the pointer, in the half-way colour
    range.addEventListener("pointermove", (e) => {
      const r = range.getBoundingClientRect();
      seekBox.style.setProperty("--h", Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)) + "%");
    });
    range.addEventListener("pointerleave", () => seekBox.style.setProperty("--h", "0%"));

    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      place();
    }).observe(deck);
    new ResizeObserver(draw).observe(wave.parentElement);
    mini.querySelector('[data-ost="close"]').addEventListener("click", () => {
      stop();
      main("play").focus({ preventScroll: true });
    });
    mini.querySelector('[data-ost="show"]').addEventListener("click", () => {
      deck.scrollIntoView({ behavior: reduce.matches ? "instant" : "smooth", block: "center" });
      main("play").focus({ preventScroll: true });
    });

    if (session) {
      const on = (action, fn) => {
        try {
          session.setActionHandler(action, fn);
        } catch (e) {}
      };
      on("play", start);
      on("pause", () => audio.pause());
      on("stop", stop);
      on("previoustrack", back);
      on("nexttrack", () => skip(1));
      on("seekto", (d) => seek(d.seekTime));
    }

    try {
      setLoop(localStorage.getItem("ost-loop"));
    } catch (e) {
      setLoop("off");
    }
    draw();
  }

  document.querySelectorAll(".ost").forEach(player);
})();
