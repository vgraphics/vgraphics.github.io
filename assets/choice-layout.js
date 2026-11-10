// Which layout a game-settings choice gets in the avatar menu (assets/account.js, row()). A choice whose segments fit
// beside the setting's name stays the segmented control; one that doesn't (Palermo Noir's home look: 4 labels, about
// 450 px, in a menu about 360 px wide) becomes a column of option cards, one full-width row per option.
// The menu is closed while its rows are built, so there is nothing to measure yet: the widths are estimated from the
// text, with the numbers of account.css (`.vm-seg button`: 0.82rem bold text, 11px side padding, 2px gaps, 3px frame;
// `.vm-row-name`: 1rem semibold; `.vm-row`: a 16px gap; the menu 360px wide with 20px side padding). A choice stays
// segmented when its name, the gap and the control all fit on the row; otherwise it becomes cards.
export const CHAR_PX = 7.4;
export const SEGMENT_PAD_PX = 22;
export const SEGMENT_MIN_PX = 32;
export const SEGMENT_GAP_PX = 2;
export const FRAME_PX = 6;
export const NAME_CHAR_PX = 8.2;
export const ROW_GAP_PX = 16;
export const MENU_PX = 360;
export const MENU_PAD_PX = 20;
export const ROW_PX = MENU_PX - 2 * MENU_PAD_PX;

/** The width a segmented control with these labels would take, in px. */
export function segmentedWidth(labels) {
  const parts = labels.map((l) => Math.max(SEGMENT_MIN_PX, Math.ceil(String(l).length * CHAR_PX) + SEGMENT_PAD_PX));
  return parts.reduce((a, b) => a + b, 0) + Math.max(0, parts.length - 1) * SEGMENT_GAP_PX + FRAME_PX;
}

/** The width a setting's name takes on its line, in px. */
export function nameWidth(name) {
  return Math.ceil(String(name).length * NAME_CHAR_PX);
}

/** True when the choice's options belong in stacked option cards: the name, the gap and the segmented control don't fit
 *  the row. A text-size choice draws "A"s, never labels, and is never asked. */
export function isLongChoice(labels, name = '') {
  return labels.length > 0 && nameWidth(name) + ROW_GAP_PX + segmentedWidth(labels) > ROW_PX;
}
