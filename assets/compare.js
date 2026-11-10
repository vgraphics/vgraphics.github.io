// A before-and-after (tools/lib/compare.mjs): the handle follows a drag anywhere on the pictures, or a tap; the slider
// under it takes the arrow keys, Home and End, and says how much of each picture shows. On a touch screen an up or
// down swipe still scrolls the page (touch-action: pan-y in assets/product.css): the browser takes it, and the handle
// only moves for a sideways drag or a tap. menu.js loads this on a page with one.
const frames = document.querySelectorAll(".compare-frame");

for (const frame of frames) {
  const range = frame.querySelector(".compare-range");
  if (!range) continue;
  const { before, after } = range.dataset;
  const set = (value) => {
    const at = Math.round(Math.min(100, Math.max(0, value)));
    frame.style.setProperty("--at", `${at}%`);
    range.value = String(at);
    range.setAttribute("aria-valuetext", `${before} ${at}%, ${after} ${100 - at}%`);
    // A tag whose side has nearly gone hides, so it never names the other picture.
    frame.classList.toggle("is-before-gone", at < 18);
    frame.classList.toggle("is-after-gone", at > 82);
  };
  const to = (event) => {
    const box = frame.getBoundingClientRect();
    set(((event.clientX - box.left) / box.width) * 100);
  };
  range.disabled = false;
  set(Number(range.value));
  range.addEventListener("input", () => set(Number(range.value)));

  // A mouse moves the handle as it presses; a finger or pen once it moves sideways (an up or down swipe is the
  // browser's, which then cancels the pointer), or where it lifts after a tap.
  let held = null;
  let moved = false;
  frame.addEventListener("pointerdown", (event) => {
    if (held !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    held = event.pointerId;
    moved = false;
    frame.setPointerCapture(event.pointerId);
    frame.classList.add("is-dragging");
    if (event.pointerType === "mouse") {
      event.preventDefault(); // keeps focus off the picture; the slider gets it below, for the keys
      range.focus({ preventScroll: true });
      to(event);
    }
  });
  frame.addEventListener("pointermove", (event) => {
    if (event.pointerId !== held) return;
    moved = true;
    to(event);
  });
  const release = (event, tapped) => {
    if (event.pointerId !== held) return;
    if (tapped && !moved && event.pointerType !== "mouse") to(event);
    held = null;
    frame.classList.remove("is-dragging");
  };
  frame.addEventListener("pointerup", (event) => release(event, true));
  frame.addEventListener("pointercancel", (event) => release(event, false));
}
