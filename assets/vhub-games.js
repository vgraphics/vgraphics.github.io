// A game's or app's row in the VHub avatar's menu (account.js), the same in "Settings for your games and apps" and in
// "Your other games and apps" (George, 28 Oct 2026: "Use logo only (icon not letters) and then app name. Use rounded
// clip for aps icons and same size for all."): its store icon from VHub's catalog (`icon`: the round logo alone, edge
// to edge), clipped to a rounded tile the same size for every product, then its name on one line, then the chevron
// (account.css). A product the catalog gives no icon keeps an empty tile of that size, so the names still line up.
// It builds with the el() it's given, so tools/test/vhub-games.test.mjs runs it without a DOM.

/** The tile's edge in CSS pixels, every product's the same (account.css .vm-game-icon). */
export const ICON_PX = 40;

/** The name the menu shows: Speedometer Live Wallpaper's is "Speedometer", as in its settings' heading. */
export const shortName = (product) => (product.id === "speedometer" ? "Speedometer" : product.name);

/** One product's row: a button with its icon tile and its name; `choose` runs on a tap. */
export function gameRow(el, product, choose) {
  const tile = product.icon
    ? el("img", { class: "vm-game-icon", src: product.icon, alt: "", width: ICON_PX, height: ICON_PX, decoding: "async" })
    : el("span", { class: "vm-game-icon", "aria-hidden": "true" });
  return el("button", { type: "button", class: "vm-game", click: choose }, tile, el("span", { class: "vm-game-name" }, shortName(product)));
}
