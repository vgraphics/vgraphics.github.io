// Which layout a game-settings choice gets in the avatar menu (assets/account.js, row()). A choice whose segments fit
// beside the setting's name stays the segmented control; one that doesn't (Palermo Noir's home look: 4 labels, about
// 450 px, in a menu about 360 px wide) becomes a column of option cards, one full-width row per option.
// The menu is closed while its rows are built, so there is nothing to measure yet: the width is estimated from the
// label lengths, with the numbers of account.css's `.vm-seg button` (0.82rem bold text, 11px side padding, 2px gaps,
// 3px frame). The limit is what a segmented control may take of the menu's narrowest row (a 360px menu, 20px side
// padding, 16px gap, and 110px kept for the name).
export const CHAR_PX = 7.4;
export const SEGMENT_PAD_PX = 22;
export const SEGMENT_MIN_PX = 32;
export const SEGMENT_GAP_PX = 2;
export const FRAME_PX = 6;
export const SEG_LIMIT_PX = 190;

/** The width a segmented control with these labels would take, in px. */
export function segmentedWidth(labels) {
  const parts = labels.map((l) => Math.max(SEGMENT_MIN_PX, Math.ceil(String(l).length * CHAR_PX) + SEGMENT_PAD_PX));
  return parts.reduce((a, b) => a + b, 0) + Math.max(0, parts.length - 1) * SEGMENT_GAP_PX + FRAME_PX;
}

/** True when the choice's options belong in stacked option cards. A text-size choice draws "A"s, never labels. */
export function isLongChoice(labels) {
  return labels.length > 0 && segmentedWidth(labels) > SEG_LIMIT_PX;
}
