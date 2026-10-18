// Exitwise's global boards, shared by the ranking page and the home page's podium.
// The game's global boards (ArrowPuzzle Core StatsBoards, Game LeaderboardUi), read from Firestore without signing
// in: the rules let anyone run a stats query of at most 100 and read single profiles and pictures, nothing else
// (docs/firebase/exitwise-firestore.rules in the game's repo). The API key is the web game's public key.
window.ExitwiseBoards = (() => {
  const PROJECT = "exitwise-b8e6f";
  const KEY = "AIzaSyCr9DTTkc9Us5D5D1yR9wvRJ5L-cQs_4jQ";
  const TOP = 100;
  let base = "https://firestore.googleapis.com/v1/";
  let project = PROJECT;
  // Local testing only: ?emulator=127.0.0.1:PORT reads a Firestore emulator (project demo-exitwise) instead.
  const emulator = new URLSearchParams(location.search).get("emulator");
  if (emulator && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /^(localhost|127\.0\.0\.1):\d{2,5}$/.test(emulator)) {
    base = `http://${emulator}/v1/`;
    project = "demo-exitwise";
  }
  const ROOT = `projects/${project}/databases/(default)/documents`;

  const BOARDS = {
    progress: { title: "Progress", caption: "Highest level, then perfect clears", column: "Level", order: ["highestLevel", "perfectClears"], field: "highestLevel",
      empty: "Nobody has a global rank yet. Win level 1 to get one." },
    perfect: { title: "Perfect", caption: "Levels won without losing a heart", column: "Perfect clears", order: ["perfectClears"], field: "perfectClears",
      empty: "Win a level without losing a heart to get on this board." },
    maps: { title: "Maps", caption: "Other players' maps cleared", column: "Maps cleared", order: ["customCleared"], field: "customCleared",
      empty: "Clear another player's custom map to get on this board." },
    creators: { title: "Creators", caption: "Plays of their maps by other players", column: "Plays", order: ["creatorPlays"], field: "creatorPlays",
      empty: "Publish a custom map. Its plays put you on this board." },
  };
  const STAT_FIELDS = ["highestLevel", "perfectClears", "customCleared", "creatorPlays"];

  // The game's 12 preset avatars (Game AvatarElement): a coloured disc with a white symbol, on a 100 × 100 grid.
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
  // The avatar of a player without a profile: FNV-1a over the id's UTF-16 units, as AvatarElement.ForPlayer.
  const avatarFor = uid => {
    let h = 2166136261;
    for (let i = 0; i < uid.length; i++) h = Math.imul(h ^ uid.charCodeAt(i), 16777619) >>> 0;
    return h % 12;
  };
  // Username.Anonymous: "Player" and the start of the id.
  const anonymous = uid => "Player " + uid.slice(0, 4).toUpperCase();

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

  // Single documents, at most 100 a call, in any order: id → fields.
  async function getAll(collection, ids, fieldPaths) {
    const found = new Map();
    for (let i = 0; i < ids.length; i += 100) {
      const answer = await call(":batchGet", { documents: ids.slice(i, i + 100).map(id => `${ROOT}/${collection}/${id}`), mask: { fieldPaths } });
      for (const x of answer) if (x.found) found.set(idOf(x.found.name), x.found.fields || {});
    }
    return found;
  }

  // A board's rows as the game builds them (StatsBoardTable): players with 0 left out, equal players share a rank.
  // `top` reads only the first rows (the home page's podium); the rules allow at most 100.
  async function loadBoard(id, top = TOP) {
    const b = BOARDS[id];
    const answer = await call(":runQuery", { structuredQuery: {
      from: [{ collectionId: "stats" }],
      select: { fields: STAT_FIELDS.map(fieldPath => ({ fieldPath })) },
      orderBy: b.order.map(fieldPath => ({ field: { fieldPath }, direction: "DESCENDING" })),
      limit: top,
    } });
    const readTime = answer.find(x => x.readTime)?.readTime;
    const players = answer.filter(x => x.document).map(x => {
      const f = x.document.fields || {};
      const stats = {};
      for (const key of STAT_FIELDS) stats[key] = int(f, key);
      return { uid: idOf(x.document.name), stats };
    }).filter(p => /^[A-Za-z0-9_-]{1,128}$/.test(p.uid) && p.stats[b.field] > 0);
    const compare = (x, y) => (y.stats[b.field] - x.stats[b.field]) || (id === "progress" ? y.stats.perfectClears - x.stats.perfectClears : 0);
    players.sort(compare);
    players.forEach((p, i) => { p.rank = i > 0 && compare(players[i - 1], p) === 0 ? players[i - 1].rank : i + 1; });

    const profiles = players.length ? await getAll("profiles", players.map(p => p.uid), ["name", "avatar", "photo"]) : new Map();
    for (const p of players) {
      const f = profiles.get(p.uid);
      const name = f?.name?.stringValue;
      p.name = name || null;
      p.avatar = f && f.avatar ? int(f, "avatar") : avatarFor(p.uid);
      p.photo = f ? int(f, "photo") : 0;
    }
    return { players, time: readTime ? new Date(readTime) : new Date() };
  }

  // Pictures that passed the check, for the profiles that have one; a removed or replaced one keeps the preset.
  async function loadPhotos(players) {
    const wanted = players.filter(p => p.photo > 0 && p.picture === undefined);
    if (!wanted.length) return false;
    const photos = await getAll("photos", wanted.map(p => p.uid), ["image", "version"]);
    for (const p of wanted) {
      const f = photos.get(p.uid);
      const bytes = f?.image?.bytesValue;
      p.picture = f && int(f, "version") === p.photo && typeof bytes === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(bytes) ? bytes : null;
    }
    return true;
  }

  return { TOP, BOARDS, avatarSvg, anonymous, loadBoard, loadPhotos };
})();
