// George's admin page, vgraphics.gr/admin/: the VHub repo's admin/ app, which only the Deployer's vhub-admin project
// writes (README, "The app pages"). It is the studio's own page for every game and app, behind VHub's sign-in, and only
// the studio's account passes VHub's server. It stays out of search engines:
// - every page in admin/ says noindex and nofollow in its robots meta tag (adminProblems, check-site's admin rule);
// - sitemap.xml never lists one, whatever its markup says (tools/build-sitemap.mjs);
// - robots.txt leaves it alone: a Disallow would keep search engines from reading the noindex, and they could still list
//   the address.
// It is a product's screen with the short legal line, "© 2026 VGraphics" (tools/lib/legal.mjs), and its scripts are
// built elsewhere (check-site's BUILT_ELSEWHERE and BUILT).

/** Whether the page at `path` (its address on the site) is the admin page's. */
export const isAdminPage = (path) => path.startsWith('/admin/')

/** Whether a file of the site (its path in the repo, with either separator) is in the admin page's folder. */
export const inAdminFolder = (file) => /^admin[\\/]/.test(file)

/** The words of a page's robots meta tag, lower-cased. */
const robotsWords = (html) =>
  (html.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? '').toLowerCase().split(/[\s,]+/).filter(Boolean)

/** What leaves the admin page at `path` in search engines' reach: a list of messages, none when it is right. */
export function adminProblems(path, html) {
  if (!isAdminPage(path)) return []
  const words = robotsWords(html)
  if (words.includes('noindex') && words.includes('nofollow')) return []
  return ['not kept out of search: the admin page\'s head needs <meta name="robots" content="noindex, nofollow">']
}
