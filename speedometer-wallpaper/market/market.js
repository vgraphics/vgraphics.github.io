// Speedometer's layout market on vgraphics.gr (the web market design, approved 26 Oct 2026): a shop window. It reads the
// market's live layouts from Speedometer's Firestore (speedometer-wallpaper) over REST, signed out, and the creators'
// public names and pictures from VHub's, as the Exitwise ranking does; it writes only a report, which never hides a
// layout (Games SpeedometerWallpaper/firebase/firestore.rules, webReports). The landing's chapter, the market page,
// a layout's page, a creator's page, the style pages' row and the try page all use this one piece.
//
// Pictures are the app's own drawing: the web version (the try page's engine, /speedometer-wallpaper/play/app/) draws
// each card's layout as a still frame, one engine for the page, at idle, only for the cards near the screen. Where it
// can't run (no WebAssembly GC: Safari before 18.2) a card shows its style's picture, labelled so.
//
// The engine's folder, Google Play, the prices and the statistics id come from the try page's own block
// (play/page.json), so they are written in one place. Statistics only with the try page's yes (localStorage
// speedometer.analytics = "granted"); these pages never ask by themselves.
window.SpeedoMarket = (() => {
  "use strict";

  // VHub's public web key (as exitwise/ranking/boards.js). Speedometer's project has no web app, and Firestore's REST
  // reads of public documents need no key.
  const VHUB_KEY = "AIzaSyATJwSy3S0iXt8DHegIhLEBKrtPtJX5gG8";
  let speedoBase = "https://firestore.googleapis.com/v1/";
  let vhubBase = "https://firestore.googleapis.com/v1/";
  let speedoProject = "speedometer-wallpaper";
  let vhubProject = "vgraphics-vhub";
  // Local testing only: ?emulator=127.0.0.1 on localhost reads the emulators (Speedometer's Firestore on 18480, project
  // demo-speedometer, as SpeedometerWallpaper/firebase/firebase.json; VHub's on 8085, demo-vhub), and
  // ?emulator=127.0.0.1:PORT Speedometer's on another port. Never against the live projects from a test page.
  const emulator = new URLSearchParams(location.search).get("emulator");
  if (emulator && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /^(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(emulator)) {
    const host = emulator.split(":")[0];
    speedoBase = `http://${emulator.includes(":") ? emulator : host + ":18480"}/v1/`;
    vhubBase = `http://${host}:8085/v1/`;
    speedoProject = "demo-speedometer";
    vhubProject = "demo-vhub";
  }
  const SPEEDO = `projects/${speedoProject}/databases/(default)/documents`;
  const VHUB = `projects/${vhubProject}/databases/(default)/documents`;

  const PAGE_SIZE = 20;
  const CREATOR_MOST = 50;
  const TIMEOUT_MS = 15000;
  const PROFILES_PER_CALL = 100;
  // Share codes: 6 characters from CDFGHJKMNPQRTVWXY34679 (the app's MarketCodes): no vowels, no look-alikes.
  const CODE = /^[CDFGHJKMNPQRTVWXY34679]{6}$/;
  const REPORTED_KEY = "speedometer.reported";
  const REPORTED_MOST = 200;
  const CONSENT_KEY = "speedometer.analytics";
  const STILL_MARGIN = "400px";
  const STILL_MOST_SIDE = 1400;
  const PIXEL_RATIO_MOST = 2;
  const PLAY_PAGE = "/speedometer-wallpaper/play/page.json";
  const STYLES_FILE = "/speedometer-wallpaper/styles/styles.json";
  const LAYOUT_PAGE = "/speedometer-wallpaper/l/?c=";
  const CREATOR_PAGE = "/speedometer-wallpaper/creators/?u=";
  const PACKAGE = "com.vgraphics.speedometerwallpaper";

  // The app's words for the four screens (DeviceShape) and the report reasons (MarketReportReason).
  const SHAPES = { phone: "Phone", tall: "Tall / Flip", foldable: "Foldable", tablet: "Tablet" };
  const REASONS = { name: "Rude name", spam: "Spam or a copy", broken: "Broken", other: "Something else" };
  // The 42 widgets in the app's words (logic_resources strings_layouts.xml, layouts__widget__<kind>__name).
  const WIDGETS = {
    main: "Main gauge", ram: "RAM", signal: "Signal", wifi: "Wi-Fi", link_speed: "Link speed", battery: "Battery",
    temperature: "Temperature", clock: "Clock", date: "Date", lights: "Warning lights", now_playing: "Now Playing",
    counts: "Calls and messages", status: "Status", shift_lights: "Shift lights", display: "Info display",
    strip: "Info strip", backplate: "Backplate", trip: "Trip distance", average_speed: "Average speed",
    top_speed: "Top speed", drive_time: "Drive time", trip_computer: "Trip computer", zero_to_100: "0–100 timer",
    g_force: "G-force", odometer: "Odometer", climb_rate: "Climb rate", heading: "Heading", altitude: "Altitude",
    tilt: "Tilt", sun: "Sunrise and sunset", moon: "Moon", weather: "Weather", air_pressure: "Air pressure",
    battery_time: "Battery time", data_speed: "Data speed", storage: "Storage", steps: "Steps today",
    next_alarm: "Next alarm", next_event: "Next event", music_controls: "Music buttons", volume: "Volume",
    second_clock: "Second clock",
  };
  const TABS = { popular: "uses", new: "createdAt", top: "topRated" };
  const numbers = new Intl.NumberFormat("en");
  const dates = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const stored = key => {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  };
  const store = (key, value) => {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private windows may refuse; the page works without */ }
  };

  // ---------- Firestore over REST ----------

  async function call(url, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const r = await fetch(url, body === undefined ? { signal: controller.signal } : {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal,
      });
      if (r.status === 404 || r.status === 403) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // A Firestore value as plain JavaScript.
  const plain = v => {
    if (!v) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return Number(v.doubleValue);
    if ("booleanValue" in v) return v.booleanValue;
    if ("timestampValue" in v) return new Date(v.timestampValue);
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(plain);
    if ("mapValue" in v) return fieldsOf(v.mapValue.fields);
    return null;
  };
  const fieldsOf = fields => Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [k, plain(v)]));
  const idOf = name => name.slice(name.lastIndexOf("/") + 1);
  const text = s => ({ stringValue: s });
  const filter = (field, op, value) => ({ fieldFilter: { field: { fieldPath: field }, op, value } });

  async function runQuery(structuredQuery) {
    const answer = await call(`${speedoBase}${SPEEDO}:runQuery`, { structuredQuery });
    if (!answer) throw new Error("The market refused the query");
    return answer.filter(x => x.document).map(x => x.document);
  }

  const getDoc = async path => {
    const doc = await call(`${speedoBase}${SPEEDO}/${path}`);
    return doc && doc.fields ? doc : null;
  };

  // A layout document as the pages use it. `frame` is read from the layout's own data, for the shape of its picture.
  function layoutOf(doc) {
    const f = fieldsOf(doc.fields);
    let frame = { aspect: 2.1, orientation: "portrait" };
    try {
      const data = JSON.parse(f.data);
      const aspect = Number(data.frame && data.frame.aspect);
      if (aspect >= 1 && aspect <= 4) frame = { aspect, orientation: data.frame.orientation === "landscape" ? "landscape" : "portrait" };
    } catch (e) { /* an unreadable layout keeps the phone's frame; its preview says it can't be drawn */ }
    const count = f.ratingCount || 0;
    return {
      id: idOf(doc.name),
      name: f.name || "",
      code: f.code || "",
      creatorUid: f.creatorUid || "",
      data: f.data || "",
      madeWith: f.madeWith || "classic",
      shapes: f.shapes || [],
      widgetKinds: f.widgetKinds || [],
      nowPlaying: !!f.nowPlaying,
      status: f.status,
      uses: f.uses || 0,
      ratingCount: count,
      average: count ? (f.ratingSum || 0) / count : 0,
      createdAt: f.createdAt || null,
      frame,
      cursor: null,
      doc,
    };
  }

  // ---------- The market's reads ----------

  // A page of live layouts, as the app's tabs and filters list them (market-schema.md "Queries and indexes"): 20 a
  // page (or `limit`, for a row that shows fewer: every document read counts on the free plan), the next one from
  // `after` (the last layout's cursor).
  async function list({ tab = "popular", shape = null, nowPlaying = false, after = null, limit = PAGE_SIZE } = {}) {
    const field = TABS[tab] || TABS.popular;
    const filters = [filter("status", "EQUAL", text("live"))];
    if (shape && SHAPES[shape]) filters.push(filter("shapes", "ARRAY_CONTAINS", text(shape)));
    if (nowPlaying) filters.push(filter("nowPlaying", "EQUAL", { booleanValue: true }));
    if (tab === "top") filters.push(filter("topRated", "GREATER_THAN", { integerValue: "0" }));
    const query = {
      from: [{ collectionId: "layouts" }],
      where: { compositeFilter: { op: "AND", filters } },
      orderBy: [{ field: { fieldPath: field }, direction: "DESCENDING" }, { field: { fieldPath: "__name__" }, direction: "DESCENDING" }],
      limit: Math.min(limit, PAGE_SIZE),
    };
    if (after) query.startAt = { values: [after.value, { referenceValue: after.name }], before: false };
    const docs = await runQuery(query);
    const layouts = docs.map(layoutOf);
    layouts.forEach(l => { l.cursor = { value: l.doc.fields[field], name: l.doc.name }; });
    return { layouts, next: layouts.length === query.limit ? layouts[layouts.length - 1].cursor : null };
  }

  // The code in a search box's text: a code typed as it is, or a pasted share link.
  function codeIn(textTyped) {
    const typed = String(textTyped || "").trim();
    const fromLink = typed.match(/[?&]c=([A-Za-z0-9]{6})\b/) || typed.match(/\/l\/([A-Za-z0-9]{6})\b/);
    const code = (fromLink ? fromLink[1] : typed).toUpperCase();
    return CODE.test(code) ? code : null;
  }

  // A share code opens its layout's page; anything else is a name-prefix search (the app's): 20 at most.
  async function search(textTyped) {
    const code = codeIn(textTyped);
    if (code) return { code };
    const key = String(textTyped || "").trim().toLowerCase();
    if (!key) return { layouts: [] };
    const docs = await runQuery({
      from: [{ collectionId: "layouts" }],
      where: { compositeFilter: { op: "AND", filters: [
        filter("status", "EQUAL", text("live")),
        filter("nameKey", "GREATER_THAN_OR_EQUAL", text(key)),
        filter("nameKey", "LESS_THAN", text(key + "")),
      ] } },
      orderBy: [{ field: { fieldPath: "nameKey" }, direction: "ASCENDING" }],
      limit: PAGE_SIZE,
    });
    return { layouts: docs.map(layoutOf) };
  }

  // The live layout a code opens, or null: the code is unknown, or its layout was hidden or removed.
  async function byCode(code) {
    if (!CODE.test(code)) return null;
    const entry = await getDoc(`layoutCodes/${code}`);
    const layoutId = entry && plain(entry.fields.layoutId);
    if (!layoutId) return null;
    const doc = await getDoc(`layouts/${layoutId}`);
    const layout = doc && layoutOf(doc);
    return layout && layout.status === "live" ? layout : null;
  }

  // A creator's live layouts, most used first: 30 at most per creator, so one page holds them all.
  async function byCreator(uid) {
    if (!/^[A-Za-z0-9]{1,128}$/.test(uid)) return [];
    const docs = await runQuery({
      from: [{ collectionId: "layouts" }],
      where: { compositeFilter: { op: "AND", filters: [filter("creatorUid", "EQUAL", text(uid)), filter("status", "EQUAL", text("live"))] } },
      orderBy: [{ field: { fieldPath: "uses" }, direction: "DESCENDING" }],
      limit: CREATOR_MOST,
    });
    return docs.map(layoutOf);
  }

  // The most used live layouts made with a style (its page's row).
  async function byStyle(styleId, most) {
    const docs = await runQuery({
      from: [{ collectionId: "layouts" }],
      where: { compositeFilter: { op: "AND", filters: [filter("status", "EQUAL", text("live")), filter("madeWith", "EQUAL", text(styleId))] } },
      orderBy: [{ field: { fieldPath: "uses" }, direction: "DESCENDING" }],
      limit: most,
    });
    return docs.map(layoutOf);
  }

  // The landing's counts, written once a day by the Deployer; null before the first run.
  async function stats() {
    const doc = await getDoc("marketStats/current");
    return doc && fieldsOf(doc.fields);
  }

  // Layout of the week, or null when there is none or it isn't live any more.
  async function featured() {
    const doc = await getDoc("marketFeatured/current");
    const layoutId = doc && plain(doc.fields.layoutId);
    if (!layoutId) return null;
    const layout = await getDoc(`layouts/${layoutId}`);
    const found = layout && layoutOf(layout);
    return found && found.status === "live" ? found : null;
  }

  // ---------- Creators (VHub's public profiles) ----------

  // VHub's avatar drawing (assets/vhub-avatars.js): the market's pages load it beside this file; the try page, which
  // loads only this one, gets it here.
  let avatarsLoad = null;
  function avatars() {
    if (window.VHubAvatars) return Promise.resolve(window.VHubAvatars);
    if (!avatarsLoad) {
      avatarsLoad = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/assets/vhub-avatars.js";
        script.onload = () => resolve(window.VHubAvatars);
        script.onerror = () => reject(new Error("No avatars"));
        document.head.appendChild(script);
      });
    }
    return avatarsLoad;
  }

  const profileCache = new Map();
  // Each creator's { uid, name, avatar, photo, level, frame }, read in batches and kept for the visit; a deleted or
  // nameless player is "Player XXXX" with their preset avatar, as the hub shows them. The picture wears the rank frame
  // the creator chose on VHub (assets/vhub-avatars.js).
  async function profiles(uids) {
    await avatars();
    const wanted = [...new Set(uids)].filter(uid => uid && !profileCache.has(uid));
    for (let i = 0; i < wanted.length; i += PROFILES_PER_CALL) {
      const chunk = wanted.slice(i, i + PROFILES_PER_CALL);
      let answer = null;
      try {
        answer = await call(`${vhubBase}${VHUB}:batchGet?key=${VHUB_KEY}`, {
          documents: chunk.map(uid => `${VHUB}/profiles/${uid}`),
          mask: { fieldPaths: ["name", "avatar", "photo", "level", "frame"] },
        });
      } catch (e) {
        answer = null;
      }
      const found = new Map((answer || []).filter(x => x.found).map(x => [idOf(x.found.name), fieldsOf(x.found.fields)]));
      chunk.forEach(uid => {
        const f = found.get(uid) || {};
        const photo = f.photo ? String(f.photo) : "";
        profileCache.set(uid, {
          uid,
          name: f.name || window.VHubAvatars.anonymous(uid),
          avatar: typeof f.avatar === "number" ? f.avatar : window.VHubAvatars.avatarFor(uid),
          photo: /^[1-9]\d{0,17}$/.test(photo) ? photo : null,
          level: typeof f.level === "number" ? f.level : undefined,
          frame: typeof f.frame === "string" ? f.frame : null,
        });
      });
    }
    return new Map(uids.map(uid => [uid, profileCache.get(uid) || {
      uid, name: window.VHubAvatars.anonymous(uid), avatar: window.VHubAvatars.avatarFor(uid), photo: null,
    }]));
  }

  // ---------- The site's own facts ----------

  let configLoad = null;
  // The try page's block: { engine, store, referrer, prices, measurementId }.
  function config() {
    if (!configLoad) {
      configLoad = fetch(PLAY_PAGE).then(r => r.json()).then(page => {
        const block = page.sections.flatMap(s => s.blocks || []).find(b => b.type === "try") || {};
        return {
          engine: block.engine || "/speedometer-wallpaper/play/app/",
          store: block.store || `https://play.google.com/store/apps/details?id=${PACKAGE}`,
          prices: block.prices || {},
          measurementId: block.measurementId || null,
        };
      });
    }
    return configLoad;
  }

  let stylesLoad = null;
  // The 19 styles in catalogue order: { id, slug, name, free, image }, from the style pages' own data.
  function styles() {
    if (!stylesLoad) {
      stylesLoad = fetch(STYLES_FILE).then(r => r.json()).then(data => ({
        published: !!data.published,
        list: data.styles.map(s => ({ id: s.id, slug: s.slug, name: s.name, free: !!s.free, image: s.image })),
      }));
    }
    return stylesLoad;
  }
  const styleIn = (all, id) => all.list.find(s => s.id === id) || { id, slug: id, name: id, free: false, image: id };

  // ---------- Statistics (only with the try page's yes) ----------

  let gtagLoaded = false;
  async function event(name, params) {
    try {
      if (stored(CONSENT_KEY) !== "granted") return;
      const { measurementId } = await config();
      if (!measurementId) return;
      if (!window.gtag || !document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        if (!gtagLoaded) {
          gtagLoaded = true;
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
          window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
          window.gtag("js", new Date());
          window.gtag("config", measurementId);
          const script = document.createElement("script");
          script.async = true;
          script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
          document.head.appendChild(script);
        }
      }
      window.gtag("event", name, params || {});
    } catch (e) { /* statistics never break the page */ }
  }
  let errorsLeft = 10;
  function error(message) {
    console.warn("[market]", message);
    if (errorsLeft-- > 0) event("exception", { description: String(message).substring(0, 100), fatal: false });
  }

  // ---------- Pictures ----------

  let stillsLoad = null;
  function engine() {
    if (!stillsLoad) {
      stillsLoad = config().then(c => new Promise((resolve, reject) => {
        const begin = () => {
          const ready = () => {
            if (!window.VGTry.isSupported()) return reject({ reason: "unsupported" });
            window.VGTry.stills({ base: c.engine }).then(resolve, failure => reject({ reason: "failed", failure }));
          };
          if (window.VGTry) return ready();
          // The try block on the same page may be loading it already: wait for that one, never a second copy.
          const src = c.engine + "vgtry.js";
          const script = [...document.scripts].find((s) => s.getAttribute("src") === src) || document.createElement("script");
          script.addEventListener("load", ready);
          script.addEventListener("error", () => reject({ reason: "missing" }));
          if (!script.src) {
            script.src = src;
            document.head.appendChild(script);
          }
        };
        // After the first paint, when the page is quiet, as the try page loads it.
        if (window.requestIdleCallback) window.requestIdleCallback(begin, { timeout: 2000 });
        else setTimeout(begin, 200);
      }));
    }
    return stillsLoad;
  }

  const stillCache = new Map();
  let stillChain = Promise.resolve();
  const watcher = window.IntersectionObserver ? new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach(e => {
      watcher.unobserve(e.target);
      const job = e.target.__still;
      if (job) job();
    });
  }, { rootMargin: STILL_MARGIN }) : null;

  // The style's own picture where the engine can't draw the layout: a real render of the style, not of the layout,
  // and the card says so.
  async function fallback(img, styleId, reason) {
    const all = await styles();
    const card = img.closest(".mk-card, .mk-preview");
    img.src = `${(await config()).engine}styles/${styleIn(all, styleId).image}.jpg`;
    if (card) {
      card.classList.add("is-fallback");
      const note = card.querySelector(".mk-note");
      if (note) note.textContent = reason === "unsupported" ? "Preview needs a newer browser" : "Preview unavailable";
    }
  }

  // Draws `layout` in the style `styleId` into `img` once it comes near the screen. Drawings take turns.
  function preview(layout, styleId, img) {
    const job = () => {
      stillChain = stillChain.then(async () => {
        if (!img.isConnected) return;
        const ratio = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_MOST);
        const box = img.getBoundingClientRect();
        const landscape = layout.frame.orientation === "landscape";
        let width = Math.round(Math.max(box.width, 120) * ratio);
        let height = Math.round(landscape ? width / layout.frame.aspect : width * layout.frame.aspect);
        const scale = Math.min(1, STILL_MOST_SIDE / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const key = `${layout.id}:${styleId}:${width}x${height}`;
        try {
          let url = stillCache.get(key);
          if (!url) {
            const stills = await engine();
            url = await stills.draw({ style: styleId, data: layout.data, width, height });
            stillCache.set(key, url);
          }
          img.src = url;
          img.closest(".mk-card, .mk-preview")?.classList.add("is-drawn");
        } catch (failure) {
          const reason = failure && failure.reason;
          if (reason) await fallback(img, styleId, reason);
          else {
            img.closest(".mk-card, .mk-preview")?.classList.add("is-broken");
            const note = img.closest(".mk-card, .mk-preview")?.querySelector(".mk-note");
            if (note) note.textContent = "Preview unavailable";
            error(`still ${layout.code}: ${failure && failure.message ? failure.message : failure}`);
          }
        }
      }).catch(() => { /* one card's trouble never stops the next card's drawing */ });
    };
    if (watcher) {
      img.__still = job;
      watcher.observe(img);
    } else {
      job();
    }
  }

  // ---------- Pieces of the pages ----------

  const layoutUrl = code => LAYOUT_PAGE + encodeURIComponent(code);
  const creatorUrl = uid => CREATOR_PAGE + encodeURIComponent(uid);

  // Google Play with the layout's code, for the app to open it after the install (design §4.6).
  async function playUrl(code, medium) {
    const { store } = await config();
    const referrer = `utm_source=vgraphics.gr&utm_medium=${medium}&utm_content=layout_${code}`;
    return `${store}&referrer=${encodeURIComponent(referrer)}`;
  }

  // Android's way into the app: the layout's link as an intent for the app's package; without the app, Chrome comes
  // back to the page with &app=none.
  function appIntent(code) {
    const link = `${location.host}/speedometer-wallpaper/l/?c=${code}`;
    const back = encodeURIComponent(`${location.protocol}//${link}&app=none`);
    return `intent://${link}#Intent;scheme=https;package=${PACKAGE};S.browser_fallback_url=${back};end`;
  }

  const starsText = layout => layout.ratingCount
    ? `${layout.average.toFixed(1)} stars from ${numbers.format(layout.ratingCount)} rating${layout.ratingCount === 1 ? "" : "s"}`
    : "";
  const usesText = n => `${numbers.format(n)} use${n === 1 ? "" : "s"}`;

  const el = (tag, cls, content) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content != null) node.textContent = content;
    return node;
  };

  // The stars and their count, hidden below one rating: "★ 4.3 (12)".
  function stars(layout) {
    const node = el("span", "mk-stars");
    if (!layout.ratingCount) {
      node.hidden = true;
      return node;
    }
    node.setAttribute("aria-label", starsText(layout));
    node.append(el("b", null, `★ ${layout.average.toFixed(1)}`), el("small", null, ` (${numbers.format(layout.ratingCount)})`));
    return node;
  }

  // A creator's name with their picture, linking to their page.
  function byline(profile) {
    const link = el("a", "mk-by");
    link.href = creatorUrl(profile.uid);
    const pic = el("span", "mk-avatar");
    window.VHubAvatars.draw(pic, profile, 96);
    link.append(pic, el("span", "mk-by-name", profile.name));
    return link;
  }

  // The tags' icons (George picked the icon pills, 27 Oct 2026): the four screens (DeviceShape) and Now Playing,
  // drawn in the tags' accent.
  const ICONS = {
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    tall: '<rect x="7.5" y="1.5" width="9" height="21" rx="2.5"/><path d="M7.5 12h9"/>',
    foldable: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M12 4.5v15"/>',
    tablet: '<rect x="3.5" y="3" width="17" height="18" rx="2.5"/><path d="M10.5 18h3"/>',
    now_playing: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  };
  const icon = kind => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "mk-ico");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ICONS[kind];
    return svg;
  };

  // One tag: the app's words in a pill, with its icon when it has one (a screen, Now Playing); Now Playing has the
  // accent's own pill. `kind` is a screen (SHAPES) or a widget (WIDGETS). Cards and a layout's page both use it.
  function tag(words, kind = null) {
    const item = el("li", "mk-tag");
    if (kind && ICONS[kind]) item.append(icon(kind));
    else item.classList.add("is-plain");
    if (kind === "now_playing") item.classList.add("is-feature");
    item.append(words);
    return item;
  }

  const shapeTags = layout => {
    const tags = el("ul", "mk-tags");
    layout.shapes.filter(s => SHAPES[s]).forEach(s => tags.append(tag(SHAPES[s], s)));
    if (layout.nowPlaying) tags.append(tag(WIDGETS.now_playing, "now_playing"));
    return tags;
  };

  // A layout's card: its picture drawn in the style it was made with, name, creator, stars, uses, style and screens.
  // `ribbon` puts "Layout of the week" on it.
  function card(layout, { profile, style, ribbon = false }) {
    const item = el("li", "mk-card");
    const pic = el("a", "mk-pic");
    pic.href = layoutUrl(layout.code);
    pic.setAttribute("aria-label", `${layout.name}, made with ${style.name}`);
    const img = el("img");
    img.alt = "";
    img.decoding = "async";
    img.width = 180;
    img.height = 380;
    pic.append(img);
    if (ribbon) pic.append(el("span", "mk-ribbon", "Layout of the week"));
    pic.append(el("span", "mk-note"));
    const body = el("div", "mk-body");
    const title = el("h3", "mk-name");
    const titleLink = el("a", null, layout.name);
    titleLink.href = layoutUrl(layout.code);
    title.append(titleLink);
    const meta = el("p", "mk-meta");
    meta.append(stars(layout), el("span", "mk-uses", usesText(layout.uses)));
    body.append(title, byline(profile), meta, el("p", "mk-made", `Made with ${style.name}`), shapeTags(layout));
    item.append(pic, body);
    preview(layout, layout.madeWith, img);
    return item;
  }

  // Cards for `layouts`, with their creators and styles read first; `featuredId` gets the ribbon.
  async function cards(layouts, featuredId = null) {
    const [people, all] = await Promise.all([profiles(layouts.map(l => l.creatorUid)), styles()]);
    return layouts.map(l => card(l, { profile: people.get(l.creatorUid), style: styleIn(all, l.madeWith), ribbon: l.id === featuredId }));
  }

  // Grey card shapes while the first read is on its way: no names, nothing that looks like a real layout.
  function placeholders(list, count) {
    list.replaceChildren(...Array.from({ length: count }, () => {
      const item = el("li", "mk-card is-placeholder");
      item.setAttribute("aria-hidden", "true");
      item.append(el("span", "mk-pic"), el("span", "mk-body"));
      return item;
    }));
  }

  // ---------- Reports ----------

  const reportedCodes = () => {
    try { return JSON.parse(stored(REPORTED_KEY) || "[]"); } catch (e) { return []; }
  };
  const wasReported = code => reportedCodes().includes(code);

  // A web report (firestore.rules webReports): the layout, its code, the reason and the message, with the server's
  // time. Nothing about the reporter. It never counts toward hiding the layout; the Deployer's tab shows it.
  async function report(layout, reason, message) {
    if (!REASONS[reason]) throw new Error("Pick a reason");
    const id = Array.from(crypto.getRandomValues(new Uint8Array(20)), b => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[b % 62]).join("");
    const r = await fetch(`${speedoBase}${SPEEDO}:commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writes: [{
        update: { name: `${SPEEDO}/webReports/${id}`, fields: {
          layoutId: text(layout.id), code: text(layout.code), reason: text(reason),
          message: text(String(message || "").slice(0, 500)), status: text("open"),
        } },
        updateTransforms: [{ fieldPath: "createdAt", setToServerValue: "REQUEST_TIME" }],
        currentDocument: { exists: false },
      }] }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    store(REPORTED_KEY, JSON.stringify([layout.code, ...reportedCodes().filter(c => c !== layout.code)].slice(0, REPORTED_MOST)));
    event("layout_report", { reason, code: layout.code });
  }

  // The try page's market layouts (assets/try/try.js, the block's "layouts"): a code's layout, its style and who
  // made it, or null.
  window.VGTryLayouts = {
    resolve: async code => {
      const layout = await byCode(code);
      if (!layout) return null;
      const people = await profiles([layout.creatorUid]);
      return { data: layout.data, madeWith: layout.madeWith, name: layout.name, by: people.get(layout.creatorUid).name, href: layoutUrl(code) };
    },
  };

  return {
    SHAPES, REASONS, WIDGETS, CODE,
    list, search, codeIn, byCode, byCreator, byStyle, stats, featured, profiles, config, styles, styleIn,
    preview, fallback, card, cards, placeholders, stars, byline, tag, shapeTags, starsText, usesText,
    layoutUrl, creatorUrl, playUrl, appIntent, report, wasReported, event, error,
    format: n => numbers.format(n),
    date: d => (d ? dates.format(d) : ""),
  };
})();
