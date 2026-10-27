// The reader's theme on every page with a light and a dark look: the company pages and the hub (George, 27 Oct 2026:
// "At settings allow me to select dark or light theme if we support it"). The hub's Settings offers System, Light and
// Dark; the choice is kept in this browser (localStorage "vg-theme"), and System, or no choice yet, follows the device.
// Each such page loads this file in its head, before its stylesheets and without defer, so it paints in the right theme
// from the first frame (tools/check-site.mjs checks). assets/vgraphics.css reads <html data-theme>; the theme-color
// metas and the <picture> sources meant for one scheme (the logo) follow here, since their media queries can't see the
// attribute. Product pages have one look each and don't load it.
(() => {
  const KEY = "vg-theme";
  const DARK = "(prefers-color-scheme: dark)";
  const LIGHT = "(prefers-color-scheme: light)";
  const CHOICES = ["system", "light", "dark"];
  const SCHEMED = 'meta[name="theme-color"][media], source[media]';

  const stored = () => {
    try {
      const value = localStorage.getItem(KEY);
      return CHOICES.includes(value) ? value : null;
    } catch {
      return null;
    }
  };
  let choice = stored() ?? "system";

  // A media attribute that asks for one scheme answers the chosen one instead (its own query kept in data-scheme).
  const follow = (el) => {
    const media = el.dataset.scheme ?? el.getAttribute("media");
    if (media !== DARK && media !== LIGHT) return;
    el.dataset.scheme = media;
    const wants = media === DARK ? "dark" : "light";
    el.setAttribute("media", choice === "system" ? media : choice === wants ? "all" : "not all");
  };
  const followAll = (root) => {
    for (const el of root.querySelectorAll(SCHEMED)) follow(el);
  };
  const apply = () => {
    if (choice === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = choice;
    followAll(document);
  };
  apply();

  // The logo's <picture> comes after this file: its sources are set as the parser adds them, before its image picks one.
  if (document.readyState === "loading") {
    const parsing = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (node.matches(SCHEMED)) follow(node);
          else if (node.firstElementChild) followAll(node);
        }
      }
    });
    parsing.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", () => {
      parsing.disconnect();
      followAll(document);
    });
  }

  const changed = () => {
    apply();
    window.dispatchEvent(new CustomEvent("vg-theme", { detail: choice }));
  };

  window.vgTheme = {
    /** "system", "light" or "dark". */
    get: () => choice,
    /** Whether this browser has a choice of its own (a new one has none, and may take the VHub account's). */
    chosen: () => stored() !== null,
    /** Whether the page shows its dark look now. */
    dark: () => choice === "dark" || (choice === "system" && matchMedia(DARK).matches),
    set: (next) => {
      choice = CHOICES.includes(next) ? next : "system";
      try {
        localStorage.setItem(KEY, choice);
      } catch {
        // Storage is off (some private windows): this page still changes.
      }
      changed();
    },
  };

  // Changed in another tab of the site
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    choice = stored() ?? "system";
    changed();
  });
})();
