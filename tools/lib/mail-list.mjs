// Help and the newsletter on every page of the website (newsletter-and-tickets design, approved by George on 30 Oct
// 2026; the rule: "Newsletter and open ticket section so users can report problems, bugs, new features etc."). Each
// product page's footer links Help to VHub's ticket page for that product and carries a one-line sign-up for its news;
// the company pages' footer carries the sign-up for VGraphics news and a Help link. assets/mail-list.js sends a
// sign-up to VHub's `email` function; VHub mails the confirmation link (double opt-in). Nothing here is named
// "newsletter": blockers hide such files and elements (check-site's `blockers`).

// The site folders whose product has a newsletter topic: VHub's catalog id and the name its news goes by. A product
// gets one when VHub's catalog lists it (Palermo Noir stays out while it is unlisted: its pages offer VGraphics news).
const TOPICS = {
  exitwise: { id: 'exitwise', name: 'Exitwise' },
  'speedometer-wallpaper': { id: 'speedometer', name: 'Speedometer' },
}

// The product's VHub id for its Help link, listed or not.
const PRODUCTS = { exitwise: 'exitwise', 'speedometer-wallpaper': 'speedometer', palermo: 'palermo' }

// The words the form shows; VHub's consent record keeps this id, so a change to the words gets a new one.
export const WORDING = 'site-footer-1'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The Help link of a product's footer: VHub's ticket page, set to that product. */
export function helpLink(slug) {
  const id = PRODUCTS[slug]
  return [id ? `/hub/support/?p=${id}` : '/hub/support/', 'Help']
}

/**
 * What is wrong with a page's Help and sign-up, for check-site's help-mail rule: messages, none when it is right.
 * - VHub's own pages (/hub/…) are left out: their footer is the company footer, which the menu rule holds them to
 *   (sign-up included), copied from the site at each vhub-hub release. /hub/join/ is VHub's invite page, not a game's.
 * - A product's play, TV, join and demo screens are the product alone: no sign-up (its own menu has it).
 * - Every other page with the template's footer or the company footer links Help and carries the sign-up.
 */
export function helpMailProblems(path, html) {
  if (path.startsWith('/hub/')) return []
  if (/^\/[^/]+\/(play|tv|join|demo)\//.test(path)) {
    return html.includes('class="mail-list"') ? ['a play, TV, join or demo screen carries the sign-up for news: the product alone, its own menu has it'] : []
  }
  const foot = html.match(/<footer class="(?:foot|site-foot)\b[^"]*">[\s\S]*?<\/footer>/)?.[0]
  if (!foot) return []
  const out = []
  if (!foot.includes('href="/hub/support/')) out.push('the footer has no Help link to /hub/support/')
  if (!foot.includes('class="mail-list"')) out.push('the footer has no sign-up for news by email (tools/lib/mail-list.mjs)')
  return out
}

/**
 * What is wrong with a page's header for check-site's help-mail rule (George, 31 Oct 2026: "Help menu, I found it.
 * Barely visible."): a company header or a product's header without its Help link. VHub's pages are left to the menu
 * rule, which holds them to the company header.
 */
export function headerHelpProblems(path, html) {
  if (path.startsWith('/hub/')) return []
  const head = html.match(/<header class="(?:site-head|top)\b[^"]*">[\s\S]*?<\/header>/)?.[0]
  if (!head || head.includes('href="/hub/support/')) return []
  return ['the header has no Help link to /hub/support/']
}

/** The one-line sign-up: `slug` a product's folder, or null for the company pages (VGraphics news). */
export function mailList(slug) {
  const topic = slug ? TOPICS[slug] : null
  const title = topic ? `Get ${topic.name} news by email` : 'Get VGraphics news by email'
  const id = `ml-${slug ?? 'vgraphics'}`
  return `<form class="mail-list" data-topic="${esc(topic?.id ?? 'vgraphics')}" data-product="${esc(PRODUCTS[slug] ?? 'vgraphics')}" data-wording="${WORDING}" novalidate>
        <label class="mail-list-title" for="${id}">${esc(title)}</label>
        <span class="mail-list-row"><input id="${id}" type="email" name="email" autocomplete="email" placeholder="you@example.com" required><button class="btn" type="submit">Sign up</button></span>
        <span class="mail-list-trap" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></span>
        <span class="mail-list-fine">For people aged 16 and over. One email a month at most, and you can leave in one tap. <a href="/privacy/#website">Privacy</a></span>
        <span class="mail-list-said" role="status"></span>
      </form>`
}
