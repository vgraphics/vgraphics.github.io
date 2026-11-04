// The legal line, by kind of page (George, 29 Oct 2026: "at footer we mention the GEMI and AFM. These are only required
// at the website not in the apps. Apps just can say VGraphics. Nothing more is required."; narrowed 31 Oct 2026, of the
// line in an email's footer: "No need to show these in the email. These are required only at company page at
// vgraphics.gr. Remove from everywhere else."):
// - the company page, /company/, alone carries the company's details: its name VGRAPHICS SINGLE MEMBER P.C., its
//   G.E.MI. and VAT numbers and its town, in its footer (COMPANY_LEGAL) as in its text;
// - every other website page (landing, wiki, gallery, privacy, terms and the like, the company's /tv/ and /join/ doors
//   too) says "© <year> VGraphics. All rights reserved" with links to the company, privacy and terms pages
//   (SITE_LEGAL);
// - a product's screens, the game or app itself, say only "© <year> VGraphics" (PRODUCT_LEGAL); its Company link and
//   its Settings → About keep the details one tap away.
// One exception is in the text, not the footer (GDPR art. 13): a privacy policy names the data controller in the one
// sentence CONTROLLER, the company's name without its numbers or town. check-site holds each kind of page to its line,
// tools/lib/partials.mjs writes the template's, and the Deployer's projects write theirs.
export const PRODUCT_LEGAL = '&copy; 2026 VGraphics'
export const SITE_LEGAL = '&copy; 2026 VGraphics. All rights reserved · <a href="/company/">Company</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms of use</a>'
export const COMPANY_LEGAL = '&copy; 2026 VGRAPHICS SINGLE MEMBER P.C. All rights reserved · G.E.MI. no. 181823306000 · VAT no. EL802736373 · Kalamaria, Greece · <a href="/company/">Company information</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms of use</a>'
export const CONTROLLER = 'The data controller is VGRAPHICS SINGLE MEMBER P.C. (VGraphics). Contact: <a href="mailto:info@vgraphics.gr">info@vgraphics.gr</a>. Company details: <a href="/company/">vgraphics.gr/company/</a>'

// A product's screens on the site: a game's or app's play page (an app's is its try page), a game's TV, join and demo
// pages (/<product>/play/, /<product>/tv/, /<product>/join/, /<product>/demo/, and the pages in those folders), the page
// a look's QR code opens (/<product>/look/: Speedometer's, one screen with its Play and try-it links, the master's call
// of 4 Nov 2026), and VHub's web app, the hub (/hub/), all but its privacy policy (/hub/privacy.html), a website page.
export const isProductScreen = (path) => /^\/[^/]+\/(play|tv|join|demo|look)\//.test(path) || (path.startsWith('/hub/') && path !== '/hub/privacy.html')

/** The company page, the one page with the company's details. */
export const isCompanyPage = (path) => path === '/company/'

/** A privacy policy (/privacy/, /<product>/privacy.html, its source copy, /hub/privacy.html), which names the controller. */
export const isPolicy = (path) => /\/privacy(?:\/|\.html$)/.test(path)

const NAME = 'VGRAPHICS SINGLE MEMBER P.C.'
// The company's details, which only the company page shows.
const DETAILS = ['G.E.MI.', '181823306000', 'EL802736373', 'VAT no.', 'Kalamaria']
// The controller sentence's own words, where a policy may name the company.
const NAMED_CONTROLLER = `The data controller is ${NAME} (VGraphics)`

// What is wrong with a page's legal line, for the page at `path`: a list of messages, none when it is right. screen:
// whether it is a product's screen, by its address unless known otherwise (a Unity WebGL page is one wherever it is).
export function legalProblems(path, html, screen = isProductScreen(path)) {
  if (isCompanyPage(path)) {
    const out = [NAME, 'G.E.MI. no. 181823306000', 'VAT no. EL802736373'].filter((s) => !html.includes(s)).map((s) => `missing "${s}"`)
    if (!/(?:©|&copy;) \d{4} VGRAPHICS SINGLE MEMBER P\.C\. All rights reserved/.test(html)) out.push(`no copyright line "© <year> ${NAME} All rights reserved"`)
    for (const link of ['/privacy/', '/terms/']) if (!html.includes(`href="${link}"`)) out.push(`no link to ${link}`)
    return out
  }
  const where = screen ? 'a product screen' : 'a website page'
  const out = DETAILS.filter((s) => html.includes(s))
    .map((s) => `${where} shows "${s}": the company's details belong on /company/ only, everywhere else says "© <year> VGraphics"`)
  if ((isPolicy(path) ? html.split(NAMED_CONTROLLER).join('') : html).includes(NAME)) {
    out.push(`${where} names "${NAME}"${isPolicy(path) ? ' outside the sentence "The data controller is …"' : ''}: the company's name belongs on /company/ only`)
  }
  if (screen) {
    if (!/(?:©|&copy;) \d{4} VGraphics\b/.test(html)) out.push('a product screen without its legal line "© <year> VGraphics"')
    return out
  }
  // Our art and songs are ours (George, 27 Oct 2026: "How can we protect our art and songs so nobody else copies
  // them?"): every website page carries the copyright line and links the terms of use. (The party games' pages wrap
  // "All rights reserved" in a span, which their kit puts in the page's language.)
  if (!/(?:©|&copy;) \d{4} VGraphics\.(?:\s|<span[^>]*>)+All rights reserved/.test(html)) out.push('no copyright line "© <year> VGraphics. All rights reserved"')
  // The company page has the details; the site's privacy policy is what Google's OAuth consent screen (VGraphics
  // Deployer) and AdSense look for.
  for (const link of ['/company/', '/privacy/', '/terms/']) if (!html.includes(`href="${link}"`)) out.push(`no link to ${link}`)
  return out
}

// The company footer (the home page's footer.site-foot) as other pages carry it: a product screen (the hub's pages)
// swaps its legal paragraph for the short line (VHub's productFooter makes the same swap), the company page for the full
// one.
const SITE_PARAGRAPH = /<p>(?:©|&copy;) (\d{4}) (?:VGraphics\.|VGRAPHICS SINGLE MEMBER P\.C\.) All rights reserved[\s\S]*?<\/p>/
export const productFoot = (foot) => foot?.replace(SITE_PARAGRAPH, '<p>© $1 VGraphics</p>')
export const companyFoot = (foot) => foot?.replace(SITE_PARAGRAPH, (_, year) => `<p>${COMPANY_LEGAL.replace('&copy; 2026', `© ${year}`)}</p>`)
