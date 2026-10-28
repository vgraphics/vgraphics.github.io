// The VHub entry on a product's pages (tools/lib/partials.mjs vhubEntry: every closing card, and Palermo Noir's links):
// "Get your VHub name" for everyone, and for a player signed in to VHub on this site, their VHub name and picture,
// linking to their profile (George, 28 Oct 2026: "I am logged in. Shouldnt it show my name and avatar here?").
// The session is the hub's own, read where assets/private.js reads it (keep the two in step), but only VHub's record:
// the products' Firebase projects keep theirs in the same database. The name and picture are VHub's profiles/{uid},
// which anyone may read (VHub backend/firestore.rules), the picture drawn by assets/vhub-avatars.js. A guest without a
// name keeps "Get your VHub name". menu.js loads this file on a page with an entry.
(() => {
  const KEY = "AIzaSyATJwSy3S0iXt8DHegIhLEBKrtPtJX5gG8"; // VHub's public web key, as exitwise/ranking/boards.js
  const PROFILES = "https://firestore.googleapis.com/v1/projects/vgraphics-vhub/databases/(default)/documents/profiles/";
  const SESSION = `firebase:authUser:${KEY}:`;
  const entries = document.querySelectorAll("[data-vhub]");
  if (!entries.length) return;

  const uidOf = (record) => {
    const value = record && typeof record.fbase_key === "string" && record.fbase_key.startsWith(SESSION) ? record.value : null;
    return value && typeof value.uid === "string" ? value.uid : null;
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

  stored().then(async (records) => {
    const uid = [...records, ...local()].map(uidOf).find(Boolean);
    if (!uid) return;
    let fields;
    try {
      const r = await fetch(`${PROFILES}${encodeURIComponent(uid)}?key=${KEY}&mask.fieldPaths=name&mask.fieldPaths=avatar&mask.fieldPaths=photo`);
      if (!r.ok) return;
      fields = (await r.json()).fields || {};
      if (!window.VHubAvatars) await import("/assets/vhub-avatars.js");
    } catch (e) {
      return;
    }
    const name = fields.name && fields.name.stringValue;
    if (!name || !window.VHubAvatars) return;
    const player = { uid, avatar: fields.avatar ? Number(fields.avatar.integerValue) || 0 : undefined, photo: Number(fields.photo && fields.photo.integerValue) || null };
    for (const a of entries) {
      a.href = "/hub/profile/";
      a.classList.add("signed-in");
      a.setAttribute("aria-label", `${name}: your VHub profile`);
      window.VHubAvatars.draw(a.querySelector(".vhub-face"), player);
      a.querySelector(".vhub-name").textContent = name;
      const note = a.querySelector(".vhub-note");
      if (note) note.textContent = "Your VHub profile";
    }
  });
})();
