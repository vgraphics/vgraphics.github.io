// A product's screens by the folder under /<product>/ that holds them, in one place for the rules that tell them apart:
// the legal line (tools/lib/legal.mjs), the Unity and frame pages' TV and join rules (tools/lib/unity-pages.mjs,
// tools/lib/frames.mjs), the help-mail rule (tools/lib/mail-list.mjs), the noindex rule below and the sitemap
// (tools/build-sitemap.mjs). A new TV or join folder is added to DOOR_FOLDERS once and every rule follows.
//
// Palermo Noir's old-TV page, /palermo/tv-classic/ (George, 10 Nov 2026: "Palermo tv button is not working"), is a TV
// screen like /palermo/tv/: the TV at /palermo/tv/ sends a TV whose browser can't run it there, and every link, QR and
// door still names /palermo/tv/, so the page is kept out of search and out of the sitemap.

// A product's TV and join pages, the doors a TV or a phone comes in by.
export const DOOR_FOLDERS = ['tv', 'tv-classic', 'join']

/**
 * A test for the addresses in the given folders of a product: /<product>/<folder>/, and the pages in those folders.
 * The company's own /tv/ and /join/ are no product's, so no folder here.
 */
export function inFolders(folders) {
  const under = new RegExp(`^/[^/]+/(?:${folders.join('|')})/`)
  return (path) => under.test(path)
}

/** A product's TV or join page: /<product>/tv/, /<product>/tv-classic/ or /<product>/join/, or a page in those folders. */
export const isDoor = inFolders(DOOR_FOLDERS)

/**
 * What leaves a TV or join page at `path` (its address on the site) in search engines' reach: a list of messages, none
 * when it is right or the page is no door. Every one says noindex, as every door does (check-site's noindex rule), in
 * its markup (a comment doesn't count) and so out of sitemap.xml, which also never lists one (tools/build-sitemap.mjs).
 */
export function doorProblems(path, html) {
  if (!isDoor(path) || /<meta name="robots" content="[^"]*noindex/i.test(html.replace(/<!--[\s\S]*?-->/g, ''))) return []
  return ['is a TV or join page, which search engines must not list: add <meta name="robots" content="noindex">']
}
