// Exitwise's global boards, shared by the ranking page, the home and services pages' podium and the multiplayer page.
// VHub keeps them (VHub repo catalog/exitwise.json; the hub shows the same boards at /hub/boards/), read from VHub's
// Firestore without signing in: its rules let anyone list at most 100 entries of a board. Each entry carries the
// player's card (name, avatar, picture version, level, rank frame), so one query draws a board, and approved pictures
// are public in VHub's Storage. Ordered and ranked as the hub does (VHub sdk/ts/src/socialApis.ts); the pictures, in the
// frame each player wears, are drawn by the site's one VHub picture piece, assets/vhub-avatars.js. The API key is VHub's
// public web key.
window.ExitwiseBoards = (() => {
  const KEY = "AIzaSyATJwSy3S0iXt8DHegIhLEBKrtPtJX5gG8";
  const TOP = 100;
  let base = "https://firestore.googleapis.com/v1/";
  let project = "vgraphics-vhub";
  // Local testing only: ?emulator=127.0.0.1 reads VHub's emulators (project demo-vhub, Firestore on 8085, as VHub's
  // backend/firebase.json; assets/vhub-avatars.js reads its Storage), and ?emulator=127.0.0.1:PORT a Firestore emulator
  // on another port.
  const emulator = new URLSearchParams(location.search).get("emulator");
  if (emulator && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /^(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(emulator)) {
    const host = emulator.split(":")[0];
    base = `http://${emulator.includes(":") ? emulator : host + ":8085"}/v1/`;
    project = "demo-vhub";
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

  // The site's VHub pictures (assets/vhub-avatars.js), loaded with the first board.
  const avatars = () => window.VHubAvatars ? Promise.resolve() : import("/assets/vhub-avatars.js");
  // A player without a name, as the hub shows one: "Player" and the start of the id.
  const anonymous = uid => window.VHubAvatars.anonymous(uid);
  // Fills `el` with the player's approved photo (96 or 256 px), or their preset, in the rank frame they wear.
  const drawAvatar = (el, p, size = 96) => window.VHubAvatars.draw(el, p, size);

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
    const [answer] = await Promise.all([call(`/leaderboards/${b.board}:runQuery`, { structuredQuery: {
      from: [{ collectionId: "entries" }],
      select: { fields: ["name", "avatar", "photo", "level", "frame", "value", "tiebreak"].map(fieldPath => ({ fieldPath })) },
      orderBy: ["value", "tiebreak"].map(fieldPath => ({ field: { fieldPath }, direction: "DESCENDING" })),
      limit: top,
    } }), avatars()]);
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
        avatar: f.avatar?.integerValue !== undefined ? int(f, "avatar") : window.VHubAvatars.avatarFor(uid),
        // The approved picture's version; 0 or none draws the preset.
        photo: /^[1-9]\d{0,17}$/.test(photo ?? "") ? photo : null,
        // The player's VHub level and the rank frame they chose there (none on an entry from before frames).
        level: f.level?.integerValue !== undefined ? int(f, "level") : undefined,
        frame: f.frame?.stringValue || null,
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
