// Play and try pages are the product alone, and its About text has a page of its own (George, 29 Oct 2026, on the About
// panel under every play and try page: "Go with the no. And this applies for all. I never asked for that about section.
// I think we did it for goodle. Is there a better way? When we play we play. No scroll needed."; then "Yes, that way"
// to each product's About text on its own page; D:\Projects\Mine\CLAUDE.md, "Play and try pages are the product
// alone"). check-site holds every product's play and try pages, whoever writes them, and its About page to it.

// A product's play or try page: /<product>/play/ (a game, or an app's try page) and /<product>/demo/ (a guided demo).
export const isPlayPage = (path) => /^\/[^/]+\/(play|demo)\/$/.test(path)

// An id or class naming an About panel or its button: "about" as one of its hyphenated parts (#about, .demo-about,
// #about-go, #about-title).
const ABOUT = /(^|-)about(-|$)/i
const words = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

// What is wrong with a play or try page: html, its markup; slug, its product; template, true for a page built here from
// its page.json; about, false for a product's TV or join page, which needs no About link. A list of messages, none when
// it is the product alone.
// - No About panel and no button to one: nothing named about (an id or class), and no button that says About or Back
//   to the game.
// - Nothing under the product: not the website's footer (class "foot", the template's and the party kit's), and on a
//   template page a screen (page.json "screen"), which leaves out the hero, the sections' headings, the closing card and
//   the footer for the slim bar.
// - A link to the product's About page, /<product>/about/, where it needs no scrolling (its bar or its menu).
// What a script writes later, a <template> holds, and comments are not read.
export function playPageProblems(html, slug, { template = false, about = true } = {}) {
  const out = []
  const body = (html.split(/<body\b/i)[1] ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  const named = new Set()
  let footer = false
  for (const [, tag, attrs] of body.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
    const id = attrs.match(/\sid="([^"]*)"/)?.[1]
    const classes = attrs.match(/\sclass="([^"]*)"/)?.[1].trim().split(/\s+/) ?? []
    if (id && ABOUT.test(id)) named.add(`#${id}`)
    for (const c of classes) if (ABOUT.test(c)) named.add(`.${c}`)
    if (tag.toLowerCase() === 'footer' && classes.some((c) => c === 'foot' || c === 'foot-art')) footer = true
  }
  if (named.size) out.push(`has an About panel or its button (${[...named].join(', ')}): what the product is goes on its About page, /${slug}/about/`)
  const buttons = [...body.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((m) => words(m[1])).filter((w) => /\babout\b|\bback to the game\b/i.test(w))
  if (buttons.length) out.push(`has a button to words under the product ("${buttons.join('", "')}"): link the About page instead, /${slug}/about/`)
  if (footer) out.push('has the website\'s footer (class "foot") under the product: a play or try page ends with a slim bar, as the template\'s screens and the web games\' play pages do')
  if (template && !/<html\b[^>]*\sclass="(?:[^"]*\s)?screen(?:\s[^"]*)?"/.test(html)) {
    out.push('is built from its page.json without "screen": give it "screen": { "heading" }, so the template draws the product alone, with nothing to scroll')
  }
  if (about && !new RegExp(`\\shref="(?:https://vgraphics\\.gr)?/${slug}/about/"`).test(body)) out.push(`doesn't link its About page, /${slug}/about/, in its bar or its menu`)
  return out
}

// What is wrong with the About page of a product that has a play or try page. built: <product>/about/page.json exists
// (the template's page, tools/build-pages.mjs); page: that page.json (its sections, for the questions); site: the
// product's site block (its menu); landing: the product's landing page as built. A list of messages, none when it's
// right: the page exists from the template, has a few questions of its own (a faq block with "schema": false, since the
// landing page's questions are the product's FAQPage, and none the landing page already asks: AdSense's review of 29
// Oct 2026 wants its words to be its own), and the product's menu and its landing page's own words link it.
const asked = (q) => q.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim().toLowerCase()
export function aboutProblems(slug, { built, page, site, landing }) {
  const about = `/${slug}/about/`
  if (!built) return [`${slug} has a play or try page but no About page: add ${slug}/about/page.json (tools/build-pages.mjs), what the product is, how to play or use it, what's inside and a few questions`]
  const out = []
  const faqs = (page?.sections ?? []).flatMap((s) => s.blocks ?? []).filter((b) => b.type === 'faq')
  if (!faqs.length) out.push(`${about} has no questions: give it a section with a faq block`)
  if (faqs.some((b) => b.schema !== false)) out.push(`${about}'s questions carry FAQPage data: give its faq block "schema": false (the product's FAQPage is its landing page's)`)
  const landingAsks = new Set([...(landing ?? '').matchAll(/<summary>([^<]*)/g)].map((m) => asked(m[1])))
  const again = faqs.flatMap((b) => b.items ?? []).filter((i) => typeof i?.q === 'string' && landingAsks.has(asked(i.q))).map((i) => i.q)
  if (again.length) out.push(`${about} asks what the landing page's questions already ask ("${again.join('", "')}"): ask its own`)
  if (!(site?.nav ?? []).some((n) => n.href === about)) out.push(`the product's menu (${slug}/page.json site.nav) doesn't link its About page, ${about}`)
  const main = landing?.match(/<main\b[\s\S]*<\/main>/)?.[0] ?? ''
  if (!main.includes(`href="${about}"`)) out.push(`the landing page's own words (its <main>) don't link the About page, ${about}: a section's "more" link does`)
  return out
}
