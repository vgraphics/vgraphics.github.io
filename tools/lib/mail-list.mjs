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
