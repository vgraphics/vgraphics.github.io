// No text selection and no right-click on any page (George, 26 Oct 2026: "Dont allow text selection and right clicking
// in any page. Global rule. Selected highlighted text must have color of app or game."). This file links
// assets/no-select.css, which turns selecting off and colours what text fields select in the page's own colour, and
// keeps the browser's own menu shut: right-click, and the long press on a phone. Nothing is dragged out of the page
// either: not a picture, nor a link (a picture in a link drags as the link). Text fields people type in keep their menu
// and their drags, so Paste works there as ever, and so does an element made to be dragged (draggable="true").
//
// menu.js loads this on every page with a header, so the template's pages, the hand-made ones and those other repos
// write (the hub's) all get it with no line of their own; a page without one loads it with
// <script src="/assets/no-select.js" defer></script> (tools/check-site.mjs checks every page does one or the other).
(() => {
  if (!document.querySelector('link[href="/assets/no-select.css"]')) {
    const sheet = document.createElement("link");
    sheet.rel = "stylesheet";
    sheet.href = "/assets/no-select.css";
    document.head.append(sheet);
  }

  // The text fields of no-select.css.
  const FIELD = 'textarea, [contenteditable]:not([contenteditable="false"]), input' +
    ["checkbox", "radio", "range", "color", "file", "submit", "reset", "button", "image", "hidden"].map((t) => `:not([type="${t}"])`).join("");
  // A drag can start on a text node.
  const within = (target, selector) => (target instanceof Element ? target : target?.parentElement)?.closest(selector);

  addEventListener("contextmenu", (e) => {
    if (!within(e.target, FIELD)) e.preventDefault();
  });
  addEventListener("dragstart", (e) => {
    if (!within(e.target, `${FIELD}, [draggable="true"]`)) e.preventDefault();
  });
})();
