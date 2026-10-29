// VHub's session on this site and a player's public profile, read without the SDK, so a page loads no Firebase to show
// who is signed in. The session is the hub's own, which the browser keeps for vgraphics.gr (assets/private.js reads it
// the same way: keep the two in step), and only VHub's record: the products' Firebase projects keep theirs in the same
// database. The profile is VHub's profiles/{uid}, which anyone may read (VHub backend/firestore.rules). Used by the
// VHub avatar (assets/account.js) and the VHub entry (assets/vhub.js), which get the pictures' drawing here too.
const KEY = "AIzaSyATJwSy3S0iXt8DHegIhLEBKrtPtJX5gG8"; // VHub's public web key, as exitwise/ranking/boards.js
const PROFILES = "https://firestore.googleapis.com/v1/projects/vgraphics-vhub/databases/(default)/documents/profiles/";
const SESSION = `firebase:authUser:${KEY}:`;

const sessionOf = (record) => {
  const value = record && typeof record.fbase_key === "string" && record.fbase_key.startsWith(SESSION) ? record.value : null;
  return value && typeof value.uid === "string" ? { uid: value.uid, guest: value.isAnonymous === true } : null;
};

// Firebase's records in IndexedDB; a browser where nobody has signed in has no such database, and none is left behind.
const stored = () => new Promise((resolve) => {
  if (!window.indexedDB) return resolve([]);
  const open = indexedDB.open("firebaseLocalStorageDb");
  open.onupgradeneeded = () => open.transaction && open.transaction.abort();
  open.onerror = open.onblocked = () => resolve([]);
  open.onsuccess = () => {
    const db = open.result;
    const done = (records) => { db.close(); resolve(records); };
    try {
      if (!db.objectStoreNames.contains("firebaseLocalStorage")) return done([]);
      const all = db.transaction("firebaseLocalStorage", "readonly").objectStore("firebaseLocalStorage").getAll();
      all.onsuccess = () => done(all.result);
      all.onerror = () => done([]);
    } catch (e) {
      done([]);
    }
  };
});

// Firebase's records in localStorage, where it keeps them when IndexedDB is off.
const local = () => {
  const records = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(SESSION)) continue;
      try {
        records.push({ fbase_key: key, value: JSON.parse(localStorage.getItem(key)) });
      } catch (e) {
        // not a session
      }
    }
  } catch (e) {
    // no storage: no session
  }
  return records;
};

/** The browser's VHub session: { uid, guest }, or null when nobody is signed in here. */
export async function vhubSession() {
  return [...(await stored()), ...local()].map(sessionOf).find(Boolean) ?? null;
}

const int = (field) => (field ? Number(field.integerValue) : NaN);

/** A player's public profile: { name, avatar, photo, level, products }, or null when it can't be read. */
export async function vhubProfile(uid) {
  try {
    const fields = ["name", "avatar", "photo", "level", "products"].map((f) => `mask.fieldPaths=${f}`).join("&");
    const r = await fetch(`${PROFILES}${encodeURIComponent(uid)}?key=${KEY}&${fields}`);
    if (!r.ok) return null;
    const f = (await r.json()).fields || {};
    return {
      name: (f.name && f.name.stringValue) || null,
      avatar: Number.isFinite(int(f.avatar)) ? int(f.avatar) : undefined,
      photo: int(f.photo) || null,
      level: int(f.level) || 1,
      products: ((f.products && f.products.arrayValue && f.products.arrayValue.values) || []).map((v) => v.stringValue).filter(Boolean),
    };
  } catch (e) {
    return null;
  }
}

let asking = null;
let tries = 0;
/**
 * VHub's picture drawing (assets/vhub-avatars.js): window.VHubAvatars, or null when it didn't come. Nothing waits on it
 * to fail: the avatar keeps its mark and the entry its face, and the next call asks again. A classic script, so a
 * failed fetch isn't remembered as a failed module import is, and a retry asks past the cache. (The boards,
 * exitwise/ranking/boards.js, and the Speedometer market, speedometer-wallpaper/market/market.js, load it the same way.)
 */
export function vhubAvatars() {
  if (window.VHubAvatars) return Promise.resolve(window.VHubAvatars);
  return (asking ??= new Promise((resolve) => {
    const n = tries++;
    const script = document.createElement("script");
    script.src = "/assets/vhub-avatars.js" + (n ? `?retry=${n}` : "");
    script.onload = script.onerror = () => {
      asking = null;
      if (!window.VHubAvatars) script.remove();
      resolve(window.VHubAvatars || null);
    };
    document.head.append(script);
  }));
}
