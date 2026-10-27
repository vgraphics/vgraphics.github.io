// No text selection and no right-click on any page (George, 26 Oct 2026: "Dont allow text selection and right clicking
// in any page. Global rule. Selected highlighted text must have color of app or game."). This file links
// assets/no-select.css, which turns selecting off and colours what text fields select in the page's own colour, and
// keeps the browser's own menu shut: right-click, and the long press on a phone. Nothing is dragged out of the page
// either: not a picture, nor a link (a picture in a link drags as the link). Text fields people type in keep their menu
// and their drags, so Paste works there as ever, and so does an element made to be dragged (draggable="true").
// As a light deterrent (George, 27 Oct 2026), the keys that open the developer tools or the page's source do nothing,
// and the developer console shows a warning that the site is VGraphics' and not to be copied, once. Nothing more: no
// watching for the tools, so the page works the same with them open, and its error reporting with it.
//
// menu.js loads this on every page with a header, so the template's pages, the hand-made ones and those other repos
// write (the hub's) all get it with no line of their own; a page without one loads it with
// <script src="/assets/no-select.js" defer></script> (tools/check-site.mjs checks every page does one or the other).
(() => {
  // First in the head, so a page's own rules (another repo's piece for its pages, say) win over these at equal weight.
  if (!document.querySelector('link[href="/assets/no-select.css"]')) {
    const sheet = document.createElement("link");
    sheet.rel = "stylesheet";
    sheet.href = "/assets/no-select.css";
    document.head.prepend(sheet);
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

  // F12, Ctrl+Shift+I, J and C, Ctrl+U, and on a Mac Cmd+Option+I, J, C and U. By the key's place (code), since Option
  // and a Greek layout change the letter a key types. Before the page's own handlers (the game's), which still get the
  // key. A text field keeps them, where one may mean something else (Ctrl+U underlines), and every other key works as
  // ever: F5, Ctrl+R, zoom, copy and paste.
  const devKey = (e) => e.key === "F12" ||
    (e.ctrlKey && !e.altKey && !e.metaKey && (e.shiftKey ? /^Key[IJC]$/ : /^KeyU$/).test(e.code)) ||
    (e.metaKey && e.altKey && !e.ctrlKey && /^Key[IJCU]$/.test(e.code));
  addEventListener("keydown", (e) => {
    if (devKey(e) && !within(e.target, FIELD)) e.preventDefault();
  }, true);

  // The warning, as large as Facebook's "Stop!", in the page's language, with the terms of use. Once a page: the hub's,
  // the party kit's and the Exitwise play page's pieces print the same one under the same mark, and the first prints it.
  // This one waits for the page to load, so the kit, which knows a phone's language, comes first on its pages.
  const WARNED = Symbol.for("vgraphics.console-warning");
  const WARNING = {
    en: ["Stop!", "This site, with its art, music and code, belongs to VGraphics. Copying any of it is not allowed.\nTerms of use: https://vgraphics.gr/terms/"],
    el: ["Σταματήστε!", "Αυτός ο ιστότοπος, με την τέχνη, τη μουσική και τον κώδικά του, ανήκει στη VGraphics. Δεν επιτρέπεται η αντιγραφή κανενός μέρους του.\nΌροι χρήσης: https://vgraphics.gr/terms/"],
  };
  const warn = () => {
    if (globalThis[WARNED]) return;
    globalThis[WARNED] = true;
    const [stop, words] = WARNING[document.documentElement.lang.startsWith("el") ? "el" : "en"];
    console.log(`%c${stop}%c\n${words}`, "color:#E5322D;font-size:52px;font-weight:bold;-webkit-text-stroke:1px #000", "font-size:16px;line-height:1.5");
  };
  if (document.readyState === "complete") warn();
  else addEventListener("load", warn, { once: true });
})();
