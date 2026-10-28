// VHub players' pictures on the static pages, read signed out: an approved photo from VHub's Storage, or the player's
// preset avatar, drawn as VHub draws it (VHub sdk/ts/src/pictures.ts), in the rank frame the player wears, as the hub's
// lists draw it (George, 26 Oct 2026: "do we see this badge anywhere else? If not we should"). Exitwise's boards
// (exitwise/ranking/boards.js: the ranking page, the home and services podium, the multiplayer page) and the Speedometer
// layout market's creators use it, and assets/vhub.js for a signed-in player's VHub entry.
window.VHubAvatars = (() => {
  let storage = "https://firebasestorage.googleapis.com";
  let bucket = "vgraphics-vhub.firebasestorage.app";
  // Local testing only: ?emulator=127.0.0.1 on localhost reads VHub's Storage emulator (9199, project demo-vhub).
  const emulator = new URLSearchParams(location.search).get("emulator");
  if (emulator && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /^(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(emulator)) {
    storage = `http://${emulator.split(":")[0]}:9199`;
    bucket = "demo-vhub.appspot.com";
  }

  // VHub's 12 preset avatars (Exitwise's AvatarElement): a coloured disc with a white symbol, on a 100 × 100 grid.
  const DISCS = ["#EE4D5C", "#1E88DA", "#1F9F52", "#8C5CF0", "#D9580E", "#BE8508", "#E0457B", "#0E9AA7", "#5B6CF0", "#C2410C", "#4D7C0F", "#3B3355"];
  const star = () => {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 === 0 ? 27 : 12;
      p.push((50 + Math.cos(a) * r).toFixed(2) + "," + (53 + Math.sin(a) * r).toFixed(2));
    }
    return `<polygon points="${p.join(" ")}"/>`;
  };
  const SYMBOLS = [
    c => `<path d="M30 74V46h26" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><polygon points="76,46 54,30 54,62"/>`,
    c => star(),
    c => `<path d="M50 74C33 62 22 50 24 39C26 27 43 24 50 36C57 24 74 27 76 39C78 50 67 62 50 74Z"/>`,
    c => `<polygon points="56,20 32,54 48,54 42,80 68,44 52,44"/>`,
    c => `<polygon points="26,68 24,36 38,50 50,30 62,50 76,36 74,68"/>`,
    c => `<circle cx="50" cy="50" r="25"/><circle cx="60" cy="42" r="21" fill="${c}"/>`,
    c => `<polygon points="50,22 76,50 50,78 24,50"/>`,
    c => `<circle cx="38" cy="40" r="5.5"/><circle cx="62" cy="40" r="5.5"/><path d="M68.79 56.84A20 20 0 0 1 31.21 56.84" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
    c => `<circle cx="50" cy="43" r="18"/><polygon points="41,56 59,56 57,68 43,68"/><path d="M45 76h10" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
    c => `<path d="M50 20C62 36 74 48 72 60C70 74 60 80 50 80C40 80 30 74 28 60C27 50 36 42 42 34C44 44 48 50 52 52C54 42 54 30 50 20Z"/>`,
    c => `<path d="M28 72C24 40 48 24 76 26C78 56 58 76 28 72Z"/><path d="M30 70L62 40" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
    c => `<circle cx="40" cy="68" r="10"/><path d="M48 68V26l22 8" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];
  const svg = n => {
    const i = ((n % 12) + 12) % 12, c = DISCS[i];
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="${c}"/><g fill="#fff">${SYMBOLS[i](c)}</g></svg>`;
  };
  // The avatar of a player without one: FNV-1a over the id's UTF-16 units, as VHub's avatarFor.
  const avatarFor = uid => {
    let h = 2166136261;
    for (let i = 0; i < uid.length; i++) h = Math.imul(h ^ uid.charCodeAt(i), 16777619) >>> 0;
    return h % 12;
  };
  // A player without a name, as the hub shows one: "Player" and the start of the id.
  const anonymous = uid => "Player " + uid.slice(0, 4).toUpperCase();

  // VHub's rank frames, wood to mythic (George, 26 Oct 2026: slimmer frames, "add 7 more ranks"): the level that unlocks
  // each (VHub catalog/vhub.json rewards), its drawing's size and its round opening's centre (fractions of the width and
  // the height) and radius (of the width), as VHub's hub/src/frame-geometry.ts. The drawings are the hub's own
  // /hub/frames/<id>.webp. A copy: change it with VHub's.
  const FRAMES = {
    wood: [5, 441, 480, 0.4968, 0.4621, 0.3624],
    stone: [10, 480, 427, 0.5014, 0.5044, 0.2827],
    iron: [20, 414, 480, 0.5, 0.3973, 0.3712],
    bronze: [30, 362, 480, 0.5, 0.5137, 0.2824],
    silver: [45, 362, 480, 0.4999, 0.5077, 0.2804],
    gold: [60, 322, 480, 0.5002, 0.511, 0.3065],
    platinum: [80, 324, 480, 0.4995, 0.5117, 0.3053],
    emerald: [100, 329, 480, 0.4988, 0.5098, 0.301],
    sapphire: [125, 324, 480, 0.5, 0.5163, 0.3073],
    ruby: [150, 325, 480, 0.5001, 0.5104, 0.3061],
    amethyst: [180, 480, 449, 0.5, 0.5181, 0.1914],
    diamond: [220, 480, 448, 0.5, 0.5188, 0.1914],
    mythic: [275, 478, 480, 0.4993, 0.502, 0.1865],
  };
  // How far a frame may reach, in pictures, before the picture shrinks to keep it in (the wings of the top ranks): a
  // quarter of the picture past each side at most, as the hub's lists (VHub hub/src/components/picture.tsx, sm and md).
  const REACH = 1.5;

  // The frame a player's picture wears, as the hub's shownFrame (VHub hub/src/logic.ts): the one they chose while their
  // level reaches it; chosen before the ladder asked more of it, the best one their level does reach (none below wood).
  // With no level known, the one chosen. Null for none, or an id the ladder doesn't know.
  function shownFrame(frame, level) {
    if (typeof frame !== "string" || !Object.hasOwn(FRAMES, frame)) return null;
    if (!(level > 0) || level >= FRAMES[frame][0]) return frame;
    let best = null;
    for (const [id, f] of Object.entries(FRAMES)) if (f[0] <= level) best = id;
    return best;
  }

  // Draws the frame `p` wears around the picture in `el`, as the hub's lists do: `el` keeps its size, so rows still line
  // up (George: "Avatars are not aligned. Borders makes some wider."); the picture tucks a little under the ring (smaller
  // only for a frame that would reach past REACH), and the drawing lies over it, its opening on the centre, reaching into
  // the room around `el`. The page's own disc and ring around the picture give way to the frame. `el` gets
  // data-framed, for a page that keeps room above or below it. A drawing that won't load leaves the picture as it was.
  function wear(el, p) {
    const id = shownFrame(p.frame, p.level);
    const pic = el.firstElementChild;
    if (!id || !pic) return;
    const [, width, height, cx, cy, r] = FRAMES[id];
    const across = 1 / (2 * r), down = across * height / width;
    const fit = Math.min(1, REACH / Math.max(across, down));
    const fw = fit * across * 100, fh = fit * down * 100;
    const art = document.createElement("img");
    art.alt = "";
    art.width = width;
    art.height = height;
    art.decoding = "async";
    art.dataset.frameArt = "";
    Object.assign(art.style, {
      position: "absolute", left: `${(50 - cx * fw).toFixed(3)}%`, top: `${(50 - cy * fh).toFixed(3)}%`,
      width: `${fw.toFixed(3)}%`, height: `${fh.toFixed(3)}%`,
      maxWidth: "none", pointerEvents: "none",
    });
    art.onerror = () => { if (el.dataset.framed === id) plain(el); };
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    Object.assign(el.style, { overflow: "visible", background: "transparent", boxShadow: "none" });
    Object.assign(pic.style, { transform: `scale(${(fit * 1.04).toFixed(4)})`, borderRadius: "50%" });
    el.dataset.framed = id;
    art.src = `/hub/frames/${id}.webp`;
    el.append(art);
  }

  // Takes a frame off `el`: the picture as the page draws it.
  function plain(el) {
    if (!el.dataset.framed) return;
    delete el.dataset.framed;
    for (const k of ["position", "overflow", "background", "boxShadow"]) el.style[k] = "";
    el.querySelectorAll(":scope > img[data-frame-art]").forEach(art => art.remove());
    if (el.firstElementChild) Object.assign(el.firstElementChild.style, { transform: "", borderRadius: "" });
  }

  // Fills `el` with the player's approved photo (96 or 256 px), or their preset when there's none or it won't load, in
  // the rank frame they wear. `p` is { uid, avatar, photo, level?, frame? }: photo the approved picture's version, or
  // null; frame the id they chose on VHub, or none.
  function draw(el, p, size = 96) {
    plain(el);
    const preset = () => {
      plain(el);
      el.innerHTML = svg(typeof p.avatar === "number" ? p.avatar : avatarFor(p.uid));
      wear(el, p);
    };
    if (!p.photo) return preset();
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.onerror = preset;
    img.src = `${storage}/v0/b/${bucket}/o/${encodeURIComponent(`photos/${p.uid}/${p.photo}/${size}.jpg`)}?alt=media`;
    el.replaceChildren(img);
    wear(el, p);
  }

  return { svg, avatarFor, anonymous, draw, shownFrame };
})();
