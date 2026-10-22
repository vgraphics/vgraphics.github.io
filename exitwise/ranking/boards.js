// Exitwise's global boards, shared by the ranking page, the home and services pages' podium and the multiplayer page.
// VHub keeps them (VHub repo catalog/exitwise.json; the hub shows the same boards at /hub/boards/), read from VHub's
// Firestore without signing in: its rules let anyone list at most 100 entries of a board. Each entry carries the
// player's card (name, avatar, picture version), so one query draws a board, and approved pictures are public in VHub's
// Storage. Ordered, ranked and drawn as the hub does (VHub sdk/ts/src/socialApis.ts, pictures.ts). The API key is VHub's
// public web key.
window.ExitwiseBoards = (() => {
  const KEY = "AIzaSyATJwSy3S0iXt8DHegIhLEBKrtPtJX5gG8";
  const TOP = 100;
  let base = "https://firestore.googleapis.com/v1/";
  let storage = "https://firebasestorage.googleapis.com";
  let project = "vgraphics-vhub";
  let bucket = "vgraphics-vhub.firebasestorage.app";
  // Local testing only: ?emulator=127.0.0.1 reads VHub's emulators (project demo-vhub, Firestore on 8085, Storage on
  // 9199, as VHub's backend/firebase.json), and ?emulator=127.0.0.1:PORT a Firestore emulator on another port.
  const emulator = new URLSearchParams(location.search).get("emulator");
  if (emulator && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /^(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(emulator)) {
    const host = emulator.split(":")[0];
    base = `http://${emulator.includes(":") ? emulator : host + ":8085"}/v1/`;
    storage = `http://${host}:9199`;
    project = "demo-vhub";
    bucket = "demo-vhub.appspot.com";
  }
  const ROOT = `projects/${project}/databases/(default)/documents`;

  // The page's ids, VHub's boards and the counters behind them, with the catalog's captions.
  const BOARDS = {
    score: { board: "exitwise.score", title: "Score", caption: "Points for every level won: fewer hearts lost and faster wins earn more", column: "Score", field: "score", tiebreak: "highestLevel",
      empty: "Nobody has a score yet. Win level 1 to get one." },
    perfect: { board: "exitwise.perfect", title: "Perfect", caption: "Levels won without losing a heart", column: "Perfect clears", field: "perfectClears",
      empty: "Win a level without losing a heart to get on this board." },
    maps: { board: "exitwise.maps", title: "Maps", caption: "Other players' maps cleared", column: "Maps cleared", field: "customCleared",
      empty: "Clear another player's custom map to get on this board." },
    creators: { board: "exitwise.creators", title: "Creators", caption: "Plays of their maps by other players", column: "Plays", field: "creatorPlays",
      empty: "Publish a custom map. Its plays put you on this board." },
  };

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
  const avatarSvg = n => {
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
  function drawAvatar(el, p, size = 96) {
    const preset = () => { el.innerHTML = avatarSvg(p.avatar); };
    if (!p.photo) return preset();
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = preset;
    img.src = `${storage}/v0/b/${bucket}/o/${encodeURIComponent(`photos/${p.uid}/${p.photo}/${size}.jpg`)}?alt=media`;
    el.replaceChildren(img);
  }

  async function call(path, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const r = await fetch(`${base}${ROOT}${path}?key=${KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } finally {
      clearTimeout(timer);
    }
  }
  const idOf = name => name.slice(name.lastIndexOf("/") + 1);
  const int = (fields, key) => Number(fields?.[key]?.integerValue ?? 0) || 0;

  // A board's rows as the hub builds them: by value, then tie-break, highest first; rows equal on both share a rank.
  // `stats` holds the board's counter and its tie-break counter (the Score board's is the highest level). `top` reads
  // only the first rows (the podium); the rules allow at most 100.
  async function loadBoard(id, top = TOP) {
    const b = BOARDS[id];
    const answer = await call(`/leaderboards/${b.board}:runQuery`, { structuredQuery: {
      from: [{ collectionId: "entries" }],
      select: { fields: ["name", "avatar", "photo", "value", "tiebreak"].map(fieldPath => ({ fieldPath })) },
      orderBy: ["value", "tiebreak"].map(fieldPath => ({ field: { fieldPath }, direction: "DESCENDING" })),
      limit: top,
    } });
    const readTime = answer.find(x => x.readTime)?.readTime;
    const players = answer.filter(x => x.document).map(x => {
      const f = x.document.fields || {};
      const uid = idOf(x.document.name);
      const value = int(f, "value"), tiebreak = int(f, "tiebreak");
      const stats = { [b.field]: value };
      if (b.tiebreak) stats[b.tiebreak] = tiebreak;
      const photo = f.photo?.integerValue;
      return {
        uid, value, tiebreak, stats,
        name: f.name?.stringValue || null,
        avatar: f.avatar?.integerValue !== undefined ? int(f, "avatar") : avatarFor(uid),
        // The approved picture's version; 0 or none draws the preset.
        photo: /^[1-9]\d{0,17}$/.test(photo ?? "") ? photo : null,
      };
    });
    players.forEach((p, i) => {
      const q = players[i - 1];
      p.rank = q && q.value === p.value && q.tiebreak === p.tiebreak ? q.rank : i + 1;
    });
    return { players, time: readTime ? new Date(readTime) : new Date() };
  }

  return { TOP, BOARDS, anonymous, drawAvatar, loadBoard };
})();
