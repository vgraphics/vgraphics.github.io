// The parts of a page only VGraphics' testers see while they are private: a product's demo before it opens (page.json
// site.demo.private; George, 27 Oct 2026: "palermo demo must only show if i am logged in with garithos account. Else
// hide it."). The template (tools/lib/partials.mjs) writes them in <template class="private">, inert, so nobody else
// gets them; menu.js loads this file on a page that has one. For a tester signed in to VHub on this site, each takes its
// place in the page, and the header is measured again ("private-shown"). A hide, not a lock: the pages are public.
// The site doesn't run VHub. The hub (/hub/) keeps its Firebase session where Firebase keeps every session of this
// origin: IndexedDB's firebaseLocalStorageDb, a record { fbase_key, value } per signed-in app, keyed
// "firebase:authUser:<api key>:<app>", or localStorage under the same key where IndexedDB is off. Signing out removes it.
// A session's uid is the VHub account. The Palermo repo's web/src/demo/gate.ts opens the demo page the same way: keep
// the two in step.
(() => {
  // The testers' VHub accounts: Garithos, George's (VHub's profiles/{uid} of that name).
  const TESTERS = ["WVpqEzbUrlWDHUli0vtT5uDeme22"];
  const USER = "firebase:authUser:";
  const parts = document.querySelectorAll("template.private");
  if (!parts.length) return;

  const uidOf = (record) => {
    const value = record && typeof record.fbase_key === "string" && record.fbase_key.startsWith(USER) ? record.value : null;
    return value && typeof value.uid === "string" ? value.uid : null;
  };

  // Firebase's records in IndexedDB. A browser where nobody has signed in has no such database: the open's upgrade is
  // aborted, so none is left behind for Firebase to find.
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
        if (!key || !key.startsWith(USER)) continue;
        try {
          records.push({ fbase_key: key, value: JSON.parse(localStorage.getItem(key)) });
        } catch (e) {
          // not a session
        }
      }
    } catch (e) {
      // no storage: no sessions
    }
    return records;
  };

  stored().then((records) => {
    if (![...records, ...local()].some((r) => TESTERS.includes(uidOf(r)))) return;
    for (const part of parts) part.replaceWith(part.content);
    document.dispatchEvent(new Event("private-shown"));
  });
})();
