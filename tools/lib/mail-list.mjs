// Help and the newsletter on every page of the website (newsletter-and-tickets design, approved by George on 30 Oct
// 2026; the rule: "Newsletter and open ticket section so users can report problems, bugs, new features etc."). Each
// product page's footer links Help to VHub's ticket page for that product and carries a one-line sign-up for its news,
// as do its closing card and its landing page's What's new (WORDINGS); the company pages' footer carries the sign-up
// for VGraphics news and a Help link. assets/mail-list.js sends a
// sign-up to VHub's `email` function; VHub mails the confirmation link (double opt-in). Nothing here is named
// "newsletter": blockers hide such files and elements (check-site's `blockers`).
import { DOOR_FOLDERS, inFolders } from './screens.mjs'

// A product's play and demo pages and its TV and join pages (/<product>/tv/, its old-TV page /<product>/tv-classic/,
// /<product>/join/, shared with the other rules: tools/lib/screens.mjs): the product alone, with no sign-up.
const isSignUpFree = inFolders(['play', 'demo', ...DOOR_FOLDERS])

// The site folders whose product has a newsletter topic: VHub's catalog id and the name its news goes by. A product
// gets one when VHub's catalog lists it (Palermo Noir stays out while it is unlisted: its pages offer VGraphics news).
const TOPICS = {
  exitwise: { id: 'exitwise', name: 'Exitwise' },
  'speedometer-wallpaper': { id: 'speedometer', name: 'Speedometer' },
}

// The product's VHub id for its Help link, listed or not.
const PRODUCTS = { exitwise: 'exitwise', 'speedometer-wallpaper': 'speedometer', palermo: 'palermo' }

// Where a sign-up stands (George's "Keep" marks on the mail review page, 3 Nov 2026), each with the id of the words its
// form shows; VHub's consent record keeps the id, so a change to the words gets a new one.
// - foot: the footer's one-line sign-up, on every page;
// - news: a slim row at the end of a landing page's What's new, "Get the next update by email" (tools/lib/news.mjs);
// - close: under the closing card's buttons, for people not ready to play yet (tools/lib/partials.mjs closing()).
export const WORDINGS = { foot: 'site-footer-1', news: 'site-news-1', close: 'site-closing-1' }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ENVELOPE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>'
const FINE = 'For people aged 16 and over. One email a month at most, and you can leave in one tap. <a href="/privacy/#website">Privacy</a>'

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
  if (isSignUpFree(path)) {
    return /<form class="mail-list[\s"]/.test(html) ? ['a play, TV, join or demo screen carries the sign-up for news: the product alone, its own menu has it'] : []
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

/**
 * A sign-up for news by email: `slug` a product's folder, or null for the company pages (VGraphics news); `place` where
 * it stands (WORDINGS). On a product's page its Sign up is the product's play button (.play-cta, assets/product.css),
 * on the company pages their own .btn. The news row says "Get the next update by email" beside an envelope, with
 * shorter fine print; the closing card's starts with "Not ready yet?". Every one is the same form to assets/mail-list.js.
 */
export function mailList(slug, place = 'foot') {
  const topic = slug ? TOPICS[slug] : null
  const title = `Get ${topic?.name ?? 'VGraphics'} news by email`
  const id = `ml-${slug ?? 'vgraphics'}${place === 'foot' ? '' : `-${place}`}`
  const row = `<span class="mail-list-row"><input id="${id}" type="email" name="email" autocomplete="email" placeholder="you@example.com" required><button class="${slug ? 'play-cta' : 'btn'}" type="submit">Sign up</button></span>`
  // A product without a topic of its own (Palermo Noir) offers VGraphics news there too, and says so.
  const head = place === 'news'
    ? `<span class="mail-list-mark" aria-hidden="true">${ENVELOPE}</span>
        <span class="mail-list-text"><label class="mail-list-title" for="${id}">${topic ? 'Get the next update by email' : esc(title)}</label><span class="mail-list-fine">One email a month at most, for people aged 16 and over. <a href="/privacy/#website">Privacy</a></span></span>`
    : `${place === 'close' ? `<span class="mail-list-or">Not ready yet?</span>
        ` : ''}<label class="mail-list-title" for="${id}">${esc(title)}</label>`
  return `<form class="mail-list${place === 'foot' ? '' : ` mail-list-${place}`}" data-topic="${esc(topic?.id ?? 'vgraphics')}" data-product="${esc(PRODUCTS[slug] ?? 'vgraphics')}" data-wording="${WORDINGS[place]}" novalidate>
        ${head}
        ${row}
        <span class="mail-list-trap" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></span>${place === 'news' ? '' : `
        <span class="mail-list-fine">${FINE}</span>`}
        <span class="mail-list-said" role="status"></span>
      </form>`
}

/**
 * What is wrong with the look of a page's sign-ups, for check-site's sign-up-look rule (George's "Keep" marks on the
 * mail review page, 3 Nov 2026: Speedometer's yellow Sign up was its own --cta in the chunky .btn, Exitwise's shape).
 * - On a product's page each sign-up is that product's own, and its Sign up is the product's play button alone:
 *   .play-cta, in the product's --play (else --sb) and --play-ink, from the theme the page links, which is the
 *   product's own and no other's. No .btn, and no colours of its own (a style attribute).
 * - The company pages keep their own button, never a product's .play-cta (its tokens aren't there).
 * - VHub's pages are left to the menu rule, which holds them to the company footer.
 */
export function signUpLookProblems(path, html) {
  if (path.startsWith('/hub/')) return []
  const forms = [...html.matchAll(/<form class="mail-list[\s"][\s\S]*?<\/form>/g)].map((m) => m[0])
  if (!forms.length) return []
  const slug = path.split('/')[1]
  const submit = (form) => [...form.matchAll(/<button\b([^>]*)>/g)].map((m) => m[1]).find((a) => /\stype="submit"/.test(a)) ?? ''
  const classes = (attrs) => attrs.match(/\sclass="([^"]*)"/)?.[1].split(/\s+/) ?? []
  if (!Object.hasOwn(PRODUCTS, slug)) {
    return forms.some((f) => classes(submit(f)).includes('play-cta')) ? ["a company page's sign-up has a product's play button (.play-cta): the company pages keep their own .btn"] : []
  }
  const out = []
  const themes = [...html.matchAll(/<link rel="stylesheet" href="\/([^/"]+)\/theme\/theme\.css">/g)].map((m) => m[1])
  if (!themes.includes(slug)) out.push(`the page doesn't link /${slug}/theme/theme.css, the product's tokens its sign-up reads`)
  for (const other of new Set(themes.filter((t) => t !== slug))) out.push(`the page links /${other}/theme/theme.css, another product's tokens`)
  for (const form of forms) {
    const at = `the sign-up ${form.match(/<input id="([^"]*)"/)?.[1] ?? ''}`.trim()
    const product = form.match(/\sdata-product="([^"]*)"/)?.[1]
    if (product !== PRODUCTS[slug]) out.push(`${at} is ${product ?? 'no product'}'s, not ${PRODUCTS[slug]}'s`)
    const button = classes(submit(form))
    if (!button.includes('play-cta')) out.push(`${at}: its Sign up isn't the product's play button (class "play-cta")`)
    if (button.some((c) => /^btn(-|$)/.test(c))) out.push(`${at}: its Sign up carries .btn, the chunky --cta button: the play button's look alone`)
    if (/\sstyle="/.test(form)) out.push(`${at} sets colours of its own (a style attribute): the product's tokens only`)
  }
  return out
}

/**
 * What is wrong with assets/product.css for the sign-up-look rule: the sign-up's buttons (its Sign up, and the next step
 * and main button after the press) take their colours from .play-cta alone. So no rule about the sign-up (one naming
 * .mail-list or .mail-state) reads the chunky button's --cta tokens, or sets the colours of a .play-cta or .btn in it.
 */
export function signUpCssProblems(css) {
  const out = []
  for (const [, head, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = head.slice(head.lastIndexOf(';') + 1).trim()
    if (!/\.mail-(list|state)\b/.test(selector)) continue
    if (/var\(--cta(-ink|-edge)?\s*[,)]/.test(body)) out.push(`"${selector}" reads the chunky button's --cta tokens: the sign-up takes the play button's (--play, --sb, --play-ink)`)
    if (/\.(play-cta|btn)\b/.test(selector) && /(^|;)\s*(background|background-color|color|border-color)\s*:/.test(body)) {
      out.push(`"${selector}" sets the colours of the sign-up's button: .play-cta gives them, from the product's tokens`)
    }
  }
  return out
}
