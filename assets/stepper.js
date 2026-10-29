// The chapter stepper (George, 24 Oct 2026: "On the right of the page, very right left of scrollbar, in mid vertical, a
// stepper that updated during scroll. I can click any bullet. Hovering shows what chapter it is. One chapter per
// anchor. This is a generic rule for all games and projects so implement for all."): a column of bullets at the
// screen's right edge, just left of the scrollbar and centred on its height, one per chapter of the page. As the page
// scrolls, the bullet of the chapter being read fills and the rail fills up to it; a click on any bullet scrolls to its
// chapter (smoothly, unless the visitor asks for reduced motion); hovering or focusing one shows the chapter's name.
//
// A chapter is what a link in the page's <main> points at: a heading's link to itself (a.anchor, tools/lib/
// partials.mjs, on every product page, wiki page and other page made from the template) or a link in a <nav> of the
// page's own ("On this page" in the policies). In the page's order, each id once, named by its heading or by the
// link's words. tools/check-site.mjs reads the same chapters from the markup. A page with fewer than two shows none.
//
// menu.js loads this on every page with a header, as it loads fade-edges.js, so the template's pages, the hand-made
// ones and those other repos write (the hub's) all get it with no line of their own; a page without a header can load
// it with <script type="module" src="/assets/stepper.js">. Its look is assets/stepper.css, in the page's own colour (the
// scrollbar's), which this file links only on a page with chapters.
//
// A page that draws its content after loading (VHub's hub draws each of its pages once VHub has started, and again on
// every move to another of its pages) gets its chapters read again whenever <main>'s content changes: the stepper is
// drawn when there are two or more, drawn anew when they change, and taken away when fewer than two are left.
//
// It keeps clear of what it would cover: it fades out while the closing card, the footer or a fixed panel (the try
// page's statistics question, the soundtrack's mini-bar) reaches it, it hides on a screen too short for it, and the
// phone menu makes it inert and dims it like the rest of the page. On touch screens it is a slim rail that only shows
// where the reader is (stepper.css).
const HEADING = "h1, h2, h3, h4, h5, h6";
// What it fades out over (above): the page's foot, and the fixed panels that might reach the right edge.
const AVOID = "body > footer, .cta-band .panel, .try-consent, .ost-mini";

function chaptersOf(root) {
  const found = new Map();
  for (const a of root.querySelectorAll('a.anchor[href^="#"], nav a[href^="#"]')) {
    const id = decodeURIComponent(a.hash.slice(1));
    const target = id && document.getElementById(id);
    if (!target || found.has(id)) continue;
    const name = (a.classList.contains("anchor") ? a.closest(HEADING) : a)?.textContent.replace(/\s+/g, " ").trim();
    if (name) found.set(id, { id, target, name });
  }
  return [...found.values()].sort((x, y) => (x.target.compareDocumentPosition(y.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}

/** Whether two lists are the same chapters: the same ids and names, on the same elements, in the same order. */
export function sameChapters(a, b) {
  return a.length === b.length && a.every((c, i) => c.id === b[i].id && c.name === b[i].name && c.target === b[i].target);
}

/**
 * One stepper for the page's chapters as they are now. Each call of what it returns reads them (`scan`); when they
 * changed, it stops the stepper drawn for the old ones and draws one for the new (`show`, which returns its stop), or
 * none for fewer than two.
 */
export function keeper(scan, show) {
  let drawn = [];
  let stop = null;
  return () => {
    const chapters = scan();
    if (stop && sameChapters(drawn, chapters)) return;
    stop?.();
    stop = null;
    drawn = [];
    if (chapters.length < 2) return;
    drawn = chapters;
    stop = show(chapters);
  };
}

/** Draws the stepper for these chapters of `main`; returns what takes it away again, with all it listens to. */
function start(main, chapters) {
  // Every listener of this stepper goes with it (stop, below).
  const gone = new AbortController();
  const on = { signal: gone.signal };
  const nav = document.createElement("nav");
  nav.className = "vg-stepper";
  nav.setAttribute("aria-label", "Chapters");
  const list = document.createElement("ol");
  const links = chapters.map(({ id, name }) => {
    const item = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + id;
    a.innerHTML = '<span class="vg-stepper-dot" aria-hidden="true"></span><span class="vg-stepper-label"></span>';
    a.lastChild.textContent = name;
    item.append(a);
    list.append(item);
    return a;
  });
  nav.append(list);
  // After the content and before the footer, so Tab reaches it once the chapters are read.
  if (main === document.body) main.append(nav);
  else main.after(nav);

  // The chapter being read: the last one whose top has passed the reading line, 30% down the screen (and at least
  // 140px, below the header). Above the first, none.
  const shown = chapters.map(() => true);
  const height = () => document.documentElement.clientHeight;
  const line = () => Math.round(Math.max(height() * 0.3, 140));
  const read = () => {
    const y = line();
    let k = -1;
    for (let i = 0; i < chapters.length; i++) {
      if (!shown[i]) continue;
      if (chapters[i].target.getBoundingClientRect().top > y) break;
      k = i;
    }
    return k;
  };
  let current;
  const mark = (k) => {
    if (k === current) return;
    current = k;
    links.forEach((a, i) => {
      if (i === k) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      a.classList.toggle("done", i < k);
    });
    const visible = shown.flatMap((on, i) => (on ? [i] : []));
    const at = visible.indexOf(k);
    list.style.setProperty("--progress", at > 0 ? at / (visible.length - 1) : 0);
  };

  // The observers only say when a chapter crosses the reading line; the frame after, the stepper reads where the
  // chapters are. Nothing runs on the scroll itself. While a click's scroll runs, the clicked chapter stays marked.
  let holding = false;
  let queued = false;
  const update = () => {
    if (holding || queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (!holding) mark(read());
    });
  };

  // Two observers, made again whenever the screen changes size: one on a one-pixel band at the reading line, and one on
  // the stepper's own box (and a little around it), which tells it when something it must not cover reaches it.
  let band;
  let avoid;
  const watch = () => {
    band?.disconnect();
    avoid?.disconnect();
    const y = line();
    band = new IntersectionObserver(update, { rootMargin: `${-y}px 0px ${y + 1 - height()}px 0px` });
    chapters.forEach((c) => band.observe(c.target));
    if (nav.hidden) return;
    const r = nav.getBoundingClientRect();
    const w = document.documentElement.clientWidth;
    const px = (n) => `${Math.round(n)}px`;
    const over = new Map();
    avoid = new IntersectionObserver((entries) => {
      for (const e of entries) over.set(e.target, e.isIntersecting);
      nav.classList.toggle("away", [...over.values()].some(Boolean));
    }, { rootMargin: [-(r.top - 8), r.right + 8 - w, r.bottom + 8 - height(), -(r.left - 8)].map(px).join(" ") });
    document.querySelectorAll(AVOID).forEach((el) => avoid.observe(el));
  };

  // Chapters the page hides (the wiki's filters hide whole sections) lose their bullets; with fewer than two left, the
  // stepper goes. On a screen too short for every bullet clear of the header and the mini-bar, it hides too.
  // --n, the bullets shown, sets their spacing (stepper.css). hidden is set only when it changes, as setting it at all
  // is a change the page's observer hears.
  const hide = (el, on) => {
    if (el.hidden !== on) el.hidden = on;
  };
  const refresh = () => {
    if (gone.signal.aborted) return;
    chapters.forEach((c, i) => {
      shown[i] = c.target.getClientRects().length > 0;
      hide(links[i].parentElement, !shown[i]);
    });
    const n = shown.filter(Boolean).length;
    hide(nav, n < 2);
    nav.style.setProperty("--n", n);
    nav.classList.toggle("cramped", nav.offsetHeight > height() - 176);
    current = undefined;
    watch();
    update();
  };
  let pending = false;
  const later = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      refresh();
    });
  };
  addEventListener("resize", later, on);
  const hiding = new MutationObserver(later);
  hiding.observe(main, { subtree: true, attributes: true, attributeFilter: ["hidden"] });
  // A jump that crosses no line on its way (Home, End, a link to a chapter) still lands on the right bullet.
  addEventListener("hashchange", update, on);
  if ("onscrollend" in window) addEventListener("scrollend", update, on);

  // A click scrolls to the chapter and puts its address in the address bar without a new history step. From the
  // keyboard, the chapter's heading takes the focus too, so Tab goes on from there.
  let clicks = 0;
  nav.addEventListener("click", (e) => {
    const i = links.indexOf(e.target.closest("a"));
    if (i < 0) return;
    e.preventDefault();
    const { id, target } = chapters[i];
    holding = true;
    mark(i);
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(history.state, "", "#" + id);
    if (!e.detail) {
      const heading = target.matches(HEADING) ? target : target.querySelector(HEADING) ?? target;
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    // The scroll is over once no scroll event has come for 150 ms; a newer click takes over from this one.
    const click = ++clicks;
    let timer;
    const done = () => {
      removeEventListener("scroll", wait);
      if (click === clicks) holding = false;
    };
    const wait = () => {
      clearTimeout(timer);
      timer = setTimeout(done, 150);
    };
    addEventListener("scroll", wait, { passive: true, signal: gone.signal });
    wait();
  });

  refresh();
  return () => {
    gone.abort();
    hiding.disconnect();
    band?.disconnect();
    avoid?.disconnect();
    nav.remove();
  };
}

function boot() {
  const main = document.querySelector("main") ?? document.body;
  const sync = keeper(() => chaptersOf(main), (chapters) => start(main, chapters));
  // stepper.css comes once, with the first two chapters; until it has loaded, no stepper is drawn.
  let sheet = "none";
  const check = () => {
    if (sheet === "ready") return sync();
    if (sheet === "loading" || chaptersOf(main).length < 2) return;
    sheet = "loading";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/assets/stepper.css";
    link.addEventListener("load", () => {
      sheet = "ready";
      sync();
    }, { once: true });
    document.head.append(link);
  };
  // Content drawn or changed after loading: the chapters are read again the frame after, once however much changed.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      check();
    });
  }).observe(main, { childList: true, subtree: true });
  check();
}

// Imported without a page (tools/test/stepper.test.mjs), it only lends its bookkeeping.
if (typeof document !== "undefined") boot();
