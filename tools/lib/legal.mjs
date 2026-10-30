// The legal line: the full one on the website, a short one in the products (George, 29 Oct 2026: "at footer we mention
// the GEMI and AFM. These are only required at the website not in the apps. Apps just can say VGraphics. Nothing more is
// required."). The website's own pages (landing, wiki, gallery, company, privacy, terms and the like, the company's /tv/
// and /join/ doors too) carry the company's name, its G.E.MI. and VAT numbers and links to the company, privacy and
// terms pages. A product's screens, the game or app itself, say only "© <year> VGraphics"; its Company link and its
// Settings → About keep the details one tap away. check-site holds each kind of page to its line, tools/lib/partials.mjs
// writes the short one on the template's product screens (the try pages), and the Deployer's projects write it on theirs.
export const PRODUCT_LEGAL = '&copy; 2026 VGraphics'

// A product's screens on the site: a game's or app's play page (an app's is its try page), a game's TV, join and demo
// pages (/<product>/play/, /<product>/tv/, /<product>/join/, /<product>/demo/, and the pages in those folders), and
// VHub's web app, the hub (/hub/), all but its privacy policy (/hub/privacy.html), a website page.
export const isProductScreen = (path) => /^\/[^/]+\/(play|tv|join|demo)\//.test(path) || (path.startsWith('/hub/') && path !== '/hub/privacy.html')

// The company's details, which a product screen never shows.
const DETAILS = ['G.E.MI.', '181823306000', 'EL802736373', 'VAT no.']

// What is wrong with a page's legal line, for the page at `path`: a list of messages, none when it is right. screen:
// whether it is a product's screen, by its address unless known otherwise (a Unity WebGL page is one wherever it is).
export function legalProblems(path, html, screen = isProductScreen(path)) {
  if (screen) {
    const out = DETAILS.filter((s) => html.includes(s))
      .map((s) => `a product screen shows "${s}": the company's details belong on the website's pages; the product says only "© <year> VGraphics"`)
    if (!/(?:©|&copy;) \d{4} VGraphics\b/.test(html)) out.push('a product screen without its legal line "© <year> VGraphics"')
    return out
  }
  const out = ['VGRAPHICS SINGLE MEMBER P.C.', 'G.E.MI. no. 181823306000', 'VAT no. EL802736373'].filter((s) => !html.includes(s)).map((s) => `missing "${s}"`)
  if (!/href="\/company\/"/.test(html)) out.push('no link to /company/')
  // The site's privacy policy: Google's OAuth consent screen (VGraphics Deployer) and AdSense look for it.
  if (!/href="\/privacy\/"/.test(html)) out.push('no link to /privacy/')
  // Our art and songs are ours (George, 27 Oct 2026: "How can we protect our art and songs so nobody else copies
  // them?"): every website page carries the copyright line and links the terms of use. (The party games' pages wrap
  // "All rights reserved" in a span, which their kit puts in the page's language.)
  if (!/(?:©|&copy;) \d{4} VGRAPHICS SINGLE MEMBER P\.C\.(?:\s|<span[^>]*>)+All rights reserved/.test(html)) out.push('no copyright line "© <year> VGRAPHICS SINGLE MEMBER P.C. All rights reserved"')
  if (!/href="\/terms\/"/.test(html)) out.push('no link to /terms/')
  return out
}

// The company footer (the home page's footer.site-foot) as a product screen carries it: the same, with its full legal
// paragraph in the short line (VHub's productFooter makes the same swap for the hub's pages).
export const productFoot = (foot) => foot?.replace(/<p>(?:©|&copy;) (\d{4}) VGRAPHICS SINGLE MEMBER P\.C\.[\s\S]*?<\/p>/, '<p>© $1 VGraphics</p>')
