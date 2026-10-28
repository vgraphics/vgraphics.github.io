// Every expandable on the site opens and closes with an animation (George, 26 Oct 2026: "FAQ must open/close with
// animation always. One open at a time."; 27 Oct 2026: "FAQs and every kind of expandable like that must always
// open/close with animation. Its a general rule."; D:\Projects\Mine\CLAUDE.md). This file drives two kinds:
// - every details on a page: the questions of a faq block (tools/lib/faq.mjs) and of the About panels under the play and
//   try pages (which other repos write too), the updates in What's new's big card (tools/lib/news.mjs), and any other.
//   details and summary open and close on their own without script; this file takes over the summary's clicks (Enter
//   and Space on a focused summary are clicks too). In a list of questions and answers (.faq), and in What's new's list
//   of updates (.news-list), one is open at a time.
// - a tour's parts (the "tour" block, tools/build-pages.mjs): numbered spots on a screen, each opening its part of the
//   list beside it, one part open at a time. A part's button or spot opens it; without script every part stays open.
// Either way:
// - a row opens by growing from its head (the summary, the part's button) to its full height as what lies under the
//   head fades in, and closes the same way back, a little faster; both ease out, and the chevron turns with it
//   (assets/product.css);
// - a click while a row moves turns it round from where it is;
// - opening one closes any other open one in its list, with its own close, and the head being opened stays where it is
//   on the screen while the rows above it close;
// - under prefers-reduced-motion nothing slides: what lies under the head comes and goes with a short fade.
// For a details the browser keeps the rest: the open state screen readers announce (a closing row keeps it until its
// close ends), find-in-page opening a row (which then closes the others in its list), and all of it without script.
// Clicks are taken where they land, so a details a script adds later is driven too, and a click a page's own script
// has already handled (preventDefault) is left to it.
// menu.js loads this on every page; tools/check-site.mjs ([faq-js]) holds every page with an expandable to it, and
// fails any other kind of expandable until this file drives it.
const EASE = "cubic-bezier(.2, .8, .2, 1)";
const OPEN = { duration: 260, easing: EASE };
const CLOSE = { duration: 200, easing: EASE };
// Under reduced motion: the fade alone, shorter.
const FADE_IN = { duration: 150, easing: EASE };
const FADE_OUT = { duration: 100, easing: EASE };
const still = matchMedia("(prefers-reduced-motion: reduce)");

// A row: the box that grows and shrinks (a details, a tour's part), its head that stays in sight (the summary, the
// part's button), and what lies under the head, which shows while the row is open.
const isPart = (item) => item.matches(".part");
const headOf = (item) => item.querySelector(isPart(item) ? ":scope > button" : ":scope > summary");
const bodyOf = (item) => [...item.children].filter((el) => el !== headOf(item));
const shown = (item) => (isPart(item) ? bodyOf(item).some((el) => !el.hidden) : item.open);
function show(item, on) {
  if (isPart(item)) for (const el of bodyOf(item)) el.hidden = !on;
  else item.open = on;
}
const closing = (item) => item.classList.contains("faq-closing");
const isOpen = (item) => shown(item) && !closing(item);

// Each moving row's animations; a row is in here from the start of its move to its end.
const moving = new Map();

function stop(item) {
  for (const a of moving.get(item) ?? []) a.cancel();
  moving.delete(item);
  item.classList.remove("faq-moving");
}

// Takes a row out of any move it is in and readies it for the next, clipped (faq-moving), and says how it stands on the
// screen: its height, and how far what lies under its head shows. Clipped, a last child's margin stays inside the row
// as it will while it moves (What's new's rows have one).
function lift(item) {
  const [first] = bodyOf(item);
  const fade = shown(item) && first ? +getComputedStyle(first).opacity : 0;
  const mid = moving.has(item) ? item.getBoundingClientRect().height : null;
  stop(item);
  item.classList.add("faq-moving");
  return [mid ?? item.getBoundingClientRect().height, fade];
}

// Runs a row's animations, each held at its end until all are done, then done() settles the row in the same task.
function play(item, steps, done) {
  const anims = steps.map(([el, frames, timing]) => el.animate(frames, { ...timing, fill: "forwards" }));
  moving.set(item, anims);
  item.classList.add("faq-moving");
  Promise.all(anims.map((a) => a.finished)).then(
    () => {
      if (moving.get(item) !== anims) return;
      stop(item);
      done();
      keep();
    },
    () => {} // cancelled: a newer move took over
  );
  if (held) tick();
}

function open(item) {
  const [from, fade] = lift(item);
  item.classList.remove("faq-closing");
  show(item, true);
  const to = item.getBoundingClientRect().height;
  const body = bodyOf(item);
  play(
    item,
    still.matches
      ? body.map((el) => [el, { opacity: [fade, 1] }, FADE_IN])
      : [[item, { height: [`${from}px`, `${to}px`] }, OPEN], ...body.map((el) => [el, { opacity: [fade, 1] }, OPEN])],
    () => {}
  );
}

// Closes a row, and says how much shorter it gets.
function close(item) {
  const [from, fade] = lift(item);
  item.classList.add("faq-closing");
  const box = getComputedStyle(item);
  const head = getComputedStyle(headOf(item));
  const edges = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"].reduce((sum, k) => sum + parseFloat(box[k]), 0);
  const to = headOf(item).getBoundingClientRect().height + parseFloat(head.marginTop) + parseFloat(head.marginBottom) + edges;
  const body = bodyOf(item);
  play(
    item,
    still.matches
      ? body.map((el) => [el, { opacity: [fade, 0] }, FADE_OUT])
      : [[item, { height: [`${from}px`, `${to}px`] }, CLOSE], ...body.map((el) => [el, { opacity: [fade, 0] }, CLOSE])],
    () => {
      item.classList.remove("faq-closing");
      show(item, false);
    }
  );
  return from - to;
}

// The head just clicked stays where it is on the screen while rows above it close: each frame what it scrolls in (the
// page, or a box that scrolls on its own, as What's new's big card does) scrolls by as much as they moved it there (so
// a visitor's own scrolling is left alone). The browser's scroll anchoring would move it as well, so it is off
// meanwhile.
let held = null;
let box = null;
let heldTop = 0;
let owed = 0;
const topIn = (el) => el.getBoundingClientRect().top + (box ? box.scrollTop : scrollY);

// The nearest box around an element that scrolls on its own, or null for the page.
function scrollerOf(el) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const y = getComputedStyle(p).overflowY;
    if ((y === "auto" || y === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}

function hold(head) {
  if (box) box.style.overflowAnchor = "";
  held = head;
  box = scrollerOf(head);
  heldTop = topIn(head);
  owed = 0;
  (box ?? document.body).style.overflowAnchor = "none";
}

function keep() {
  if (!held) return;
  const top = topIn(held);
  owed += top - heldTop;
  heldTop = top;
  if (Math.abs(owed) >= 0.5) {
    const y = box ? box.scrollTop : scrollY;
    (box ?? window).scrollBy({ top: owed, behavior: "instant" });
    owed -= (box ? box.scrollTop : scrollY) - y;
  }
}

// Every frame while rows move; then the head is let go and scroll anchoring comes back.
let ticking = false;
function tick() {
  if (ticking) return;
  ticking = true;
  const frame = () => {
    keep();
    if (moving.size) {
      requestAnimationFrame(frame);
      return;
    }
    ticking = false;
    held = null;
    (box ?? document.body).style.overflowAnchor = "";
    box = null;
  };
  requestAnimationFrame(frame);
}

// The details in a list where one is open at a time (questions and answers, What's new's updates); null for any other.
const listOf = (item) => (item.parentElement?.matches(".faq, .news-list") ? [...item.parentElement.children].filter((el) => el.matches("details")) : null);

// A details' summary clicked, unless on a link or a control inside it.
document.addEventListener("click", (e) => {
  const head = e.target.closest?.("summary");
  const item = head?.parentElement;
  if (e.defaultPrevented || !item?.matches("details") || headOf(item) !== head || !bodyOf(item).length) return;
  const control = e.target.closest("a[href], button, input, select, textarea, label");
  if (control && head.contains(control)) return;
  e.preventDefault();
  const list = listOf(item);
  if (list) hold(head);
  if (isOpen(item)) {
    close(item);
  } else {
    for (const other of list ?? []) if (other !== item && isOpen(other)) close(other);
    open(item);
  }
});

// Opened by the browser (find-in-page): the others in its list close.
document.addEventListener(
  "toggle",
  (e) => {
    const item = e.target;
    const list = item instanceof HTMLDetailsElement && listOf(item);
    if (!list || !item.open || closing(item) || !list.some((o) => o !== item && isOpen(o))) return;
    hold(headOf(item));
    for (const other of list) if (other !== item && isOpen(other)) close(other);
  },
  true
);

// A tour: at the start only the part its data-open names is open. A part's button or spot opens that part and closes
// the open one; a spot on a phone-width screen, where the list stands under the screen, brings the part's button into
// sight, where it will be once the parts above it have closed.
const narrow = matchMedia("(max-width: 900px)");
for (const tour of document.querySelectorAll(".tour")) {
  const parts = [...tour.querySelectorAll(".part")];
  const spots = [...tour.querySelectorAll(".spot")];
  const idOf = (part) => headOf(part).getAttribute("aria-controls");
  const mark = (id) => {
    for (const part of parts) headOf(part).setAttribute("aria-expanded", idOf(part) === id);
    for (const s of spots) s.setAttribute("aria-expanded", s.getAttribute("aria-controls") === id);
  };
  mark(tour.dataset.open);
  for (const part of parts) show(part, idOf(part) === tour.dataset.open);
  tour.addEventListener("click", (e) => {
    const button = e.target.closest(".part > button, .spot");
    const part = button && parts.find((p) => idOf(p) === button.getAttribute("aria-controls"));
    if (!part || isOpen(part)) return;
    const head = headOf(part);
    if (button === head) hold(head);
    mark(idOf(part));
    let lost = 0;
    for (const other of parts) {
      if (other === part || !isOpen(other)) continue;
      const shorter = close(other);
      if (parts.indexOf(other) < parts.indexOf(part)) lost += shorter;
    }
    open(part);
    if (button !== head && narrow.matches) {
      const { top, bottom } = head.getBoundingClientRect();
      const by = Math.min(0, top - lost) || Math.max(0, bottom - lost - innerHeight);
      if (by) scrollBy({ top: by });
    }
  });
}
