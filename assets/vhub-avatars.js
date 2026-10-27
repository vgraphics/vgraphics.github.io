// VHub players' pictures on the static pages, read signed out: an approved photo from VHub's Storage, or the player's
// preset avatar, drawn as VHub draws it (VHub sdk/ts/src/pictures.ts). The Speedometer layout market uses it for its
// creators; exitwise/ranking/boards.js still has its own copy of the same drawing.
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

  // Fills `el` with the player's approved photo (96 or 256 px), or their preset when there's none or it won't load.
  // `p` is { uid, avatar, photo }: photo the approved picture's version, or null.
  function draw(el, p, size = 96) {
    const preset = () => { el.innerHTML = svg(typeof p.avatar === "number" ? p.avatar : avatarFor(p.uid)); };
    if (!p.photo) return preset();
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.onerror = preset;
    img.src = `${storage}/v0/b/${bucket}/o/${encodeURIComponent(`photos/${p.uid}/${p.photo}/${size}.jpg`)}?alt=media`;
    el.replaceChildren(img);
  }

  return { svg, avatarFor, anonymous, draw };
})();
