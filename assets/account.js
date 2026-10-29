// The VHub avatar, the last item of every header, and the menu it opens (George, 28 Oct 2026: "All pages must show the
// VHub avatar clickable on top right after any play or try button. Clicking must show settings that apply to mobile
// settings too"; VHub docs/superpowers/specs/2026-10-28-vhub-settings-sync-design.md section 4). menu.js loads this file
// on every page with the avatar.
// - The avatar: the VHub mark, and for a signed-in player (never a guest) their picture with a ring and a small level
//   badge in the product's colour, from VHub's session and public profile (assets/vhub-session.js), with no SDK.
// - The menu, a drop-down under it (a sheet from the bottom on a phone), grows from the avatar and fades in, and closes
//   a little faster (reduced motion: a short fade). Its first opening loads VHub's site bridge, /hub/sdk/vhub-site-1.js
//   (window.VHubSite), which signs in, reads the catalog's menu settings and reads and writes game settings.
//   - Signed out, or a guest: the sign-in invite, with Google's button. A sign-in VHub can't finish here (the account is
//     another one's, or it owes the setup's answers) goes on in the hub.
//   - Signed in: the account (picture, name, level, Profile, Account settings), the page's product's settings (a switch
//     for an on/off, a segmented control for a choice), the other games and apps (each its icon and name, vhub-games.js),
//     Sign out and the hub.
//   Every change is VHub's at once (it queues and sends it); a change made elsewhere shows as it comes.
// Its words follow the page's language; the settings' own come from VHub's catalog in both.
import { vhubAvatars, vhubProfile, vhubSession } from "/assets/vhub-session.js";
import { gameRow, shortName } from "/assets/vhub-games.js";

const button = document.querySelector(".vhub-avatar");
const face = button && button.querySelector(".vhub-avatar-face");
const MARK = face ? face.innerHTML : "";
const lang = (document.documentElement.lang || "en").toLowerCase().startsWith("el") ? "el" : "en";
const still = matchMedia("(prefers-reduced-motion: reduce)");
const phone = matchMedia("(max-width: 560px)");
const BRIDGE = "/hub/sdk/vhub-site-1.js";
/** How long the menu waits for VHub's copy of a product's settings before it shows what it has. */
const SETTINGS_WAIT_MS = 4000;

const WORDS = {
  en: {
    menu: "Your VHub account",
    signIn: "Sign in to VHub",
    pitch: "One account for every VGraphics game and app. Your level, friends and game settings follow you to every device.",
    guest: "Sign in to keep your progress and settings.",
    without: "Every game works without an account too. Its settings then stay on that device.",
    loading: "Loading…",
    offline: "Couldn't reach VHub. Try again in a moment.",
    hub: "Open the hub",
    profile: "Profile",
    accountSettings: "Account settings",
    level: (n) => `Level ${n}`,
    toNext: (xp, n) => `${xp} XP to level ${n}`,
    settingsOf: (name) => `${name} settings`,
    follow: "Saved in VHub. They follow you to every phone, PC and TV.",
    others: "Your other games and apps",
    yours: "Settings for your games and apps",
    all: "All games and apps",
    signOut: "Sign out",
    you: (name, n) => `Your VHub account: ${name}, level ${n}`,
    google: "Sign in with Google",
    blocked: "Your browser blocked Google's window. Press the button again, or allow pop-ups for vgraphics.gr.",
  },
  el: {
    menu: "Ο λογαριασμός σου στο VHub",
    signIn: "Σύνδεση στο VHub",
    pitch: "Ένας λογαριασμός για κάθε παιχνίδι και εφαρμογή της VGraphics. Το επίπεδό σου, οι φίλοι σου και οι ρυθμίσεις των παιχνιδιών σε ακολουθούν σε κάθε συσκευή.",
    guest: "Συνδέσου για να κρατήσεις την πρόοδο και τις ρυθμίσεις σου.",
    without: "Κάθε παιχνίδι παίζεται και χωρίς λογαριασμό. Τότε οι ρυθμίσεις του μένουν σε εκείνη τη συσκευή.",
    loading: "Φόρτωση…",
    offline: "Δεν ήταν δυνατή η σύνδεση με το VHub. Δοκίμασε ξανά σε λίγο.",
    hub: "Άνοιγμα του hub",
    profile: "Προφίλ",
    accountSettings: "Ρυθμίσεις λογαριασμού",
    level: (n) => `Επίπεδο ${n}`,
    toNext: (xp, n) => `${xp} XP για το επίπεδο ${n}`,
    settingsOf: (name) => `Ρυθμίσεις ${name}`,
    follow: "Αποθηκεύονται στο VHub. Σε ακολουθούν σε κάθε κινητό, υπολογιστή και τηλεόραση.",
    others: "Τα άλλα παιχνίδια και οι εφαρμογές σου",
    yours: "Ρυθμίσεις για τα παιχνίδια και τις εφαρμογές σου",
    all: "Όλα τα παιχνίδια και οι εφαρμογές",
    signOut: "Αποσύνδεση",
    you: (name, n) => `Ο λογαριασμός σου στο VHub: ${name}, επίπεδο ${n}`,
    google: "Σύνδεση με Google",
    blocked: "Ο φυλλομετρητής σου μπλόκαρε το παράθυρο της Google. Πάτα ξανά το κουμπί ή επίτρεψε τα αναδυόμενα παράθυρα για το vgraphics.gr.",
  },
};
const t = WORDS[lang];

/** An element with attributes (a function is a listener) and children (text stays text). */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (typeof v === "function") node.addEventListener(k, v);
    else if (k === "class") node.className = v;
    else node.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) node.append(c);
  return node;
}

const sheet = (href) => {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  document.head.append(el("link", { rel: "stylesheet", href }));
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- The player and the avatar ----------

let session = null;
let profile = null;
/** The latest drawing: an older one still on its way stops when it lands. */
let drawing = 0;

const signedIn = () => Boolean(session && !session.guest && profile);

// A signed-in player's VHub rank frame around their picture (George, 29 Oct 2026: "Yes, show it"), reaching at most 1.35
// of the 44px picture: 59px, inside the product bar's 64px and the company and hub bar's 72px, and under 8px past its
// sides, inside the folded bar's 8px gap to the menu and play buttons. The frame takes the ring's place (account.css).
const HEADER_REACH = 1.35;

async function drawAvatar() {
  const mine = ++drawing;
  const nextSession = await vhubSession();
  const nextProfile = nextSession && !nextSession.guest ? await vhubProfile(nextSession.uid) : null;
  if (mine !== drawing) return;
  session = nextSession;
  profile = nextProfile;
  button.querySelector(".vhub-avatar-level")?.remove();
  if (!signedIn()) {
    window.VHubAvatars?.plain(face);
    face.innerHTML = MARK;
    button.classList.remove("signed-in");
    button.setAttribute("aria-label", t.signIn);
    return;
  }
  // Without the pictures' drawing the mark stays; the next drawing asks again.
  const pictures = await vhubAvatars();
  if (mine !== drawing) return;
  if (pictures) {
    const player = { uid: session.uid, avatar: profile.avatar, photo: profile.photo, level: profile.level, frame: profile.frame };
    pictures.draw(face, player, 96, HEADER_REACH);
  }
  button.classList.add("signed-in");
  button.append(el("span", { class: "vhub-avatar-level", "aria-hidden": "true" }, String(profile.level)));
  button.setAttribute("aria-label", t.you(profile.name || window.VHubAvatars?.anonymous(session.uid) || "", profile.level));
}

// ---------- VHub's site bridge ----------

let bridge = null;
function loadBridge() {
  if (window.VHubSite) return Promise.resolve(window.VHubSite);
  bridge ??= new Promise((resolve, reject) => {
    const script = el("script", { src: BRIDGE });
    script.onload = () => (window.VHubSite ? resolve(window.VHubSite) : reject(new Error("no VHubSite")));
    script.onerror = () => reject(new Error(`${BRIDGE} didn't load`));
    document.head.append(script);
  }).catch((error) => {
    bridge = null;
    throw error;
  });
  return bridge;
}

// ---------- The menu ----------

let menu = null;
let body = null;
let closing = null;
/** The product whose settings show, or null for the list (company pages). */
let view = null;
let stopWatch = null;
/** The latest drawing of the menu's contents: an older one, still waiting on VHub, gives way (and stops its watch). */
let rendering = 0;

const isOpen = () => menu !== null && closing === null;
const current = (mine) => mine === rendering && isOpen();

function place() {
  if (!menu) return;
  menu.classList.toggle("vm-sheet", phone.matches);
  if (phone.matches) {
    menu.style.top = menu.style.right = menu.style.maxHeight = "";
    return;
  }
  const head = button.closest("header")?.getBoundingClientRect();
  const b = button.getBoundingClientRect();
  const top = Math.round((head ? head.bottom : b.bottom) + 8);
  menu.style.top = `${top}px`;
  // The page's own width, its scrollbar left out, so the menu's right edge meets the avatar's.
  menu.style.right = `${Math.max(16, Math.round(document.documentElement.clientWidth - b.right))}px`;
  menu.style.maxHeight = `${innerHeight - top - 16}px`;
}

function focusables() {
  return [...menu.querySelectorAll('a[href], button:not([disabled]), input, [tabindex="0"]')].filter((n) => n.offsetWidth || n.offsetHeight);
}

function openMenu() {
  if (isOpen()) return;
  sheet("/assets/switch.css");
  if (closing) {
    closing();
    closing = null;
  }
  body = el("div", { class: "vm-body" });
  menu = el("div", { class: "vhub-menu vm-enter", id: "vhub-menu", role: "dialog", "aria-label": t.menu, tabindex: "-1" }, body);
  if (still.matches) menu.classList.add("vm-still");
  document.body.append(menu);
  button.setAttribute("aria-expanded", "true");
  button.setAttribute("aria-controls", "vhub-menu");
  place();
  requestAnimationFrame(() => requestAnimationFrame(() => menu?.classList.remove("vm-enter")));
  import("/assets/fade-edges.js").then((m) => body && m.fadeEdges(body)).catch(() => {});
  view = null;
  render().then(() => {
    const first = menu && focusables()[0];
    (first || menu)?.focus({ preventScroll: true });
  });
}

function closeMenu(refocus) {
  if (!menu || closing) return;
  const leaving = menu;
  rendering++;
  stopWatch?.();
  stopWatch = null;
  button.setAttribute("aria-expanded", "false");
  button.removeAttribute("aria-controls");
  leaving.classList.add("vm-leave");
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    leaving.remove();
    if (menu === leaving) menu = body = null;
    if (closing === finish) closing = null;
  };
  closing = finish;
  // The menu's own fade, not a switch's or a segment's inside it.
  leaving.addEventListener("transitionend", (e) => e.target === leaving && finish());
  setTimeout(finish, 300);
  if (refocus) button.focus();
}

button?.addEventListener("click", () => (isOpen() ? closeMenu(false) : openMenu()));
document.addEventListener("click", (e) => {
  if (isOpen() && !menu.contains(e.target) && !button.contains(e.target)) closeMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (!isOpen()) return;
  if (e.key === "Escape") {
    closeMenu(true);
  } else if (e.key === "Tab" && menu.contains(document.activeElement)) {
    const stops = focusables();
    if (!stops.length) return;
    const at = stops.indexOf(document.activeElement);
    if (e.shiftKey ? at <= 0 : at === stops.length - 1) {
      e.preventDefault();
      stops[e.shiftKey ? stops.length - 1 : 0].focus();
    }
  }
});
addEventListener("resize", place);
phone.addEventListener?.("change", place);
addEventListener("pagehide", () => closeMenu(false));

/** Shows `nodes` in the menu (only while this opening is still the one on screen). */
function show(...nodes) {
  if (!body) return;
  body.replaceChildren(...nodes.flat().filter(Boolean));
}

function offline() {
  show(el("div", { class: "vm-card" }, el("p", { class: "vm-line" }, t.offline), el("a", { class: "vm-button", href: "/hub/" }, t.hub)));
}

async function render() {
  const mine = ++rendering;
  show(el("p", { class: "vm-loading" }, t.loading));
  let site;
  try {
    site = await loadBridge();
  } catch (e) {
    if (current(mine)) offline();
    return;
  }
  const player = await site.ready().catch(() => null);
  if (!current(mine)) return;
  if (!player || player.kind === "guest") return renderSignedOut(site, Boolean(player));
  return renderSignedIn(site, player);
}

// ---------- Signed out ----------

/** Google's "G", as Google's sign-in branding draws it. */
const GOOGLE_G =
  '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function renderSignedOut(site, guest) {
  // Our own button in the page's language (one language per page): Google's own button speaks the language of the
  // Google account signed in to the browser, whatever the page asks. Google's window opens from its click.
  const google = el("button", { type: "button", class: "vm-gbtn", disabled: true }, el("span", { class: "vm-gbtn-g" }), el("span", {}, t.google));
  google.querySelector(".vm-gbtn-g").innerHTML = GOOGLE_G;
  const note = el("p", { class: "vm-small vm-gnote", role: "status" });
  show(
    el(
      "div",
      { class: "vm-card" },
      el("span", { class: "vm-mark", "aria-hidden": "true" }),
      el("h2", { class: "vm-title" }, t.signIn),
      el("p", { class: "vm-line" }, guest ? t.guest : t.pitch),
      google,
      note,
      el("p", { class: "vm-small" }, t.without),
    ),
  );
  body.querySelector(".vm-mark").innerHTML = MARK;
  if (isDark(menu)) google.classList.add("vm-gbtn-dark");
  site.prepareGoogle().then(
    () => (google.disabled = false),
    () => google.replaceWith(el("a", { class: "vm-button", href: "/hub/profile/" }, t.signIn)),
  );
  google.addEventListener("click", () => {
    google.disabled = true;
    note.textContent = "";
    // Nothing is awaited before this: Google's window opens inside the click.
    site.googleSignIn().then((outcome) => {
      google.disabled = false;
      if (outcome === "conflict" || outcome === "setup") location.href = "/hub/profile/";
      else if (outcome === "signed-in" || outcome === "linked") void drawAvatar().then(() => isOpen() && render());
      else if (outcome === "blocked") note.textContent = t.blocked;
      else if (outcome === "error") note.textContent = t.offline;
    });
  });
}

/** Whether the menu's own surface is dark, for Google's button. */
function isDark(node) {
  const m = getComputedStyle(node).backgroundColor.match(/\d+(\.\d+)?/g);
  if (!m) return false;
  const [r, g, b] = m.map(Number);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

// ---------- Signed in ----------

const text = (words) => (words ? words[lang] || words.en : "");
const pathOf = (url) => {
  try {
    return new URL(url, location.origin).pathname;
  } catch (e) {
    return null;
  }
};

async function renderSignedIn(site, player) {
  const mine = ++rendering;
  const [me, menus] = await Promise.all([site.profile().catch(() => null), site.menus().catch(() => [])]);
  if (!current(mine)) return;
  const here = menus.find((m) => {
    const path = pathOf(m.product.links?.page);
    return path && path !== "/" && location.pathname.startsWith(path);
  });
  const played = new Set(me?.products ?? profile?.products ?? []);
  const ordered = [...menus].sort((a, b) => Number(played.has(b.product.id)) - Number(played.has(a.product.id)));
  const shown = view ? menus.find((m) => m.product.id === view) : here;
  const again = () => void renderSignedIn(site, player);

  const parts = [await account(site, me, player.uid), links()];
  let watching = null;
  if (shown) {
    const part = await settings(site, shown, here, again);
    parts.push(part.section);
    watching = part.unwatch;
  }
  if (!current(mine)) {
    // A newer drawing (or the menu's closing) took over: this one's watch goes with it.
    watching?.();
    return;
  }
  stopWatch?.();
  stopWatch = watching;
  const rest = ordered.filter((m) => m !== shown);
  if (!shown || rest.length) {
    if (!(view && !here)) parts.push(games(rest, here ? t.others : t.yours, again));
  }
  parts.push(foot(site));
  show(parts);
}

async function account(site, me, uid) {
  const pic = el("span", { class: "vm-pic", "aria-hidden": "true" });
  void vhubAvatars().then((pictures) => pictures?.draw(pic, { uid, avatar: me?.avatar ?? profile?.avatar, photo: me?.photo ?? profile?.photo }, 256));
  const level = me?.level ?? profile?.level ?? 1;
  let next = null;
  if (typeof site.level === "function" && typeof me?.xp === "number") next = await site.level(me.xp).catch(() => null);
  const bar = next ? Math.max(0, Math.min(1, next.into / Math.max(1, next.needed))) : null;
  return el(
    "div",
    { class: "vm-account" },
    pic,
    el(
      "div",
      { class: "vm-who" },
      el("b", { class: "vm-name" }, me?.name || profile?.name || window.VHubAvatars?.anonymous(uid) || ""),
      el("span", { class: "vm-level" }, next ? `${t.level(level)} · ${t.toNext(next.needed - next.into, next.next)}` : t.level(level)),
      bar === null ? null : el("span", { class: "vm-bar" }, el("span", { style: `width: ${Math.round(bar * 100)}%` })),
    ),
  );
}

const links = () =>
  el("div", { class: "vm-links" }, el("a", { href: "/hub/profile/" }, t.profile), el("a", { href: "/hub/settings/" }, t.accountSettings));

function games(list, title, again) {
  if (!list.length) return null;
  return el(
    "section",
    { class: "vm-games", "aria-label": title },
    el("h3", { class: "vm-section" }, title),
    list.map((m) =>
      gameRow(el, m.product, () => {
        view = m.product.id;
        again();
      }),
    ),
  );
}

/** The shown product's settings, and the function that stops following VHub's changes to them. */
async function settings(site, shown, here, again) {
  const name = shortName(shown.product);
  const section = el("section", { class: "vm-settings", "aria-label": t.settingsOf(name) });
  if (shown !== here) {
    section.append(
      el(
        "button",
        {
          type: "button",
          class: "vm-back",
          click: () => {
            view = null;
            again();
          },
        },
        here ? shortName(here.product) : t.all,
      ),
    );
  }
  section.append(el("h3", { class: "vm-section" }, t.settingsOf(name)), el("p", { class: "vm-note" }, t.follow));
  let store = null;
  try {
    store = await site.gameSettings(shown.product.id);
    await Promise.race([store.ready(), wait(SETTINGS_WAIT_MS)]);
  } catch (e) {
    store = null;
  }
  const rows = shown.settings.map((spec, i) => row(spec, i, store));
  section.append(el("div", { class: "vm-rows" }, rows.map((r) => r.node)));
  const unwatch = store
    ? store.watch((values, changed, from) => {
        if (from !== "vhub") return;
        for (const r of rows) if (changed.includes(r.key)) r.set(values[r.key] ?? r.fallback);
      })
    : null;
  return { section, unwatch };
}

/** One setting's row: a switch for an on/off, a segmented control for a choice. */
function row(spec, index, store) {
  const fallback = spec.default ?? null;
  const value = store && Object.prototype.hasOwnProperty.call(store.values, spec.key) ? store.values[spec.key] : fallback;
  const id = `vm-set-${index}`;
  const save = (v) => store?.set({ [spec.key]: v });
  const words = el("span", { class: "vm-row-words" }, el("span", { class: "vm-row-name", id: `${id}-name` }, text(spec.label)), spec.help ? el("small", { class: "vm-row-help" }, text(spec.help)) : null);
  if (spec.type === "bool") {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.className = "switch";
    box.setAttribute("role", "switch");
    box.setAttribute("aria-labelledby", `${id}-name`);
    box.checked = value === true;
    box.disabled = !store;
    box.addEventListener("change", () => save(box.checked));
    return { key: spec.key, fallback, node: el("label", { class: "vm-row" }, words, box), set: (v) => (box.checked = v === true) };
  }
  const options = spec.options || [];
  const group = el("div", { class: `vm-seg${spec.draw === "textSize" ? " vm-seg-sizes" : ""}`, role: "radiogroup", "aria-labelledby": `${id}-name` });
  const buttons = options.map((o, i) =>
    el(
      "button",
      {
        type: "button",
        role: "radio",
        disabled: !store,
        "aria-label": spec.draw === "textSize" ? text(o.label) : null,
        style: spec.draw === "textSize" ? `font-size: ${(0.75 + i * 0.12).toFixed(2)}rem` : null,
        click: () => {
          pick(o.value);
          save(o.value);
        },
      },
      spec.draw === "textSize" ? "A" : text(o.label),
    ),
  );
  const pick = (v) => {
    const at = options.findIndex((o) => o.value === v);
    buttons.forEach((b, i) => {
      b.setAttribute("aria-checked", String(i === at));
      // One stop for Tab: the chosen segment, else the first.
      b.tabIndex = i === (at < 0 ? 0 : at) ? 0 : -1;
    });
  };
  group.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const now = buttons.indexOf(document.activeElement);
    const next = buttons[(Math.max(0, now) + step + buttons.length) % buttons.length];
    next.focus();
    next.click();
  });
  group.append(...buttons);
  pick(value);
  return { key: spec.key, fallback, node: el("div", { class: "vm-row" }, words, group), set: pick };
}

function foot(site) {
  return el(
    "div",
    { class: "vm-foot" },
    el(
      "button",
      {
        type: "button",
        class: "vm-signout",
        click: async () => {
          await site.signOut().catch(() => {});
          await drawAvatar();
          closeMenu(true);
        },
      },
      t.signOut,
    ),
    el("a", { class: "vm-hub", href: "/hub/" }, t.hub),
  );
}

if (button && face) {
  sheet("/assets/account.css");
  sheet("/assets/switch.css");
  // Set here: check-site lets no page's markup carry aria-expanded on anything but the menus' own buttons.
  button.setAttribute("aria-expanded", "false");
  void drawAvatar();
  // A sign-in or sign-out elsewhere: the hub's pages (VHub hub/src/me-marker.ts fires "vhub-me" and keeps the
  // "vhub.me" marker in this site's storage) and other tabs.
  addEventListener("vhub-me", () => void drawAvatar());
  addEventListener("storage", (e) => {
    if (e.key === "vhub.me" || (e.key && e.key.startsWith("firebase:authUser:"))) void drawAvatar();
  });
}
