// Questions and answers that open and close smoothly, one at a time (George, 26 Oct 2026: "FAQ must open/close with
// animation always. One open at a time."; D:\Projects\Mine\CLAUDE.md). The "faq" block (tools/lib/faq.mjs) is a list of
// details rows, which open and close on their own without script; this file takes over their questions' clicks (Enter
// and Space on a focused question are clicks too), so that:
// - an answer opens by growing from its question to its full height as it fades in, and closes the same way back, a
//   little faster; both ease out, and the chevron turns with it (assets/product.css);
// - a click while a row moves turns it round from where it is;
// - opening one closes any other open one in the same list, with its own close, and the question being opened stays
//   where it is on the screen while the rows above it close;
// - under prefers-reduced-motion nothing slides: the answer comes and goes with a short fade.
// The browser keeps the rest: the open state screen readers announce (a closing row keeps it until its close ends),
// find-in-page opening a row (which then closes the others), and all of it without script.
// menu.js loads this on every page with a faq block; tools/check-site.mjs holds those pages to it.
const EASE = "cubic-bezier(.2, .8, .2, 1)";
const OPEN = { duration: 260, easing: EASE };
const CLOSE = { duration: 200, easing: EASE };
// Under reduced motion: the fade alone, shorter.
const FADE_IN = { duration: 150, easing: EASE };
const FADE_OUT = { duration: 100, easing: EASE };
const still = matchMedia("(prefers-reduced-motion: reduce)");

// Each moving row's animations; a row is in here from the start of its move to its end.
const moving = new Map();
const closing = (item) => item.classList.contains("faq-closing");
const answerOf = (item) => item.querySelector(".faq-a");
const summaryOf = (item) => item.querySelector(":scope > summary");

function stop(item) {
  for (const a of moving.get(item) ?? []) a.cancel();
  moving.delete(item);
  item.classList.remove("faq-moving");
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
  const answer = answerOf(item);
  const from = item.getBoundingClientRect().height;
  const shown = item.open ? +getComputedStyle(answer).opacity : 0;
  stop(item);
  item.classList.remove("faq-closing");
  item.open = true;
  const to = item.getBoundingClientRect().height;
  play(
    item,
    still.matches
      ? [[answer, { opacity: [shown, 1] }, FADE_IN]]
      : [
          [item, { height: [`${from}px`, `${to}px`] }, OPEN],
          [answer, { opacity: [shown, 1] }, OPEN],
        ],
    () => {}
  );
}

function close(item) {
  const answer = answerOf(item);
  const from = item.getBoundingClientRect().height;
  const shown = +getComputedStyle(answer).opacity;
  stop(item);
  item.classList.add("faq-closing");
  const box = getComputedStyle(item);
  const edges = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"].reduce((sum, k) => sum + parseFloat(box[k]), 0);
  const to = summaryOf(item).getBoundingClientRect().height + edges;
  play(
    item,
    still.matches
      ? [[answer, { opacity: [shown, 0] }, FADE_OUT]]
      : [
          [item, { height: [`${from}px`, `${to}px`] }, CLOSE],
          [answer, { opacity: [shown, 0] }, CLOSE],
        ],
    () => {
      item.classList.remove("faq-closing");
      item.open = false;
    }
  );
}

// The question just clicked stays where it is on the screen while rows above it close: each frame the page scrolls by
// as much as they moved it in the page (so a visitor's own scrolling is left alone). The browser's scroll anchoring
// would move it as well, so it is off meanwhile.
let held = null;
let heldTop = 0;
let owed = 0;
const pageTop = (el) => el.getBoundingClientRect().top + scrollY;

function hold(summary) {
  held = summary;
  heldTop = pageTop(summary);
  owed = 0;
  document.body.style.overflowAnchor = "none";
}

function keep() {
  if (!held) return;
  const top = pageTop(held);
  owed += top - heldTop;
  heldTop = top;
  if (Math.abs(owed) >= 0.5) {
    const y = scrollY;
    scrollBy({ top: owed, behavior: "instant" });
    owed -= scrollY - y;
  }
}

// Every frame while rows move; then the question is let go and scroll anchoring comes back.
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
    document.body.style.overflowAnchor = "";
  };
  requestAnimationFrame(frame);
}

for (const list of document.querySelectorAll(".faq")) {
  const items = [...list.querySelectorAll(":scope > details")];
  const closeOthers = (item) => {
    for (const other of items) if (other !== item && other.open && !closing(other)) close(other);
  };
  for (const item of items) {
    const summary = summaryOf(item);
    if (!summary || !answerOf(item)) continue;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      hold(summary);
      if (item.open && !closing(item)) {
        close(item);
      } else {
        closeOthers(item);
        open(item);
      }
    });
    // Opened by the browser (find-in-page): the others close.
    item.addEventListener("toggle", () => {
      if (!item.open || closing(item) || !items.some((o) => o !== item && o.open && !closing(o))) return;
      hold(summary);
      closeOthers(item);
    });
  }
}
