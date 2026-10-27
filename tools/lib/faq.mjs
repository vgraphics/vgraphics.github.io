// "Questions and answers" on every product's landing page (George, 25 Oct 2026, on the Speedometer web ideas page:
// "This apply as global rule. All landing pages must have it."; D:\Projects\Mine\CLAUDE.md): the template's "faq"
// block, a list of questions that each open their answer (details and summary, so it works without script, and keyboards
// and screen readers get it from the browser), and the same questions as FAQPage structured data in the page's head.
// assets/faq.js, which menu.js loads, animates the opening and closing and keeps one open at a time (George, 26 Oct
// 2026: "FAQ must open/close with animation always. One open at a time.").
// The questions come from the block's items in page.json, or from the file its src names beside page.json (faq.json):
// [{ q, a }], q in plain words, a trusted HTML from this repo, one paragraph or a list of them. Words about the
// product's demo in an answer, <span data-demo>…</span>, are left out while the demo is private (partials.mjs demoText).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { demoText, esc, ICONS } from './partials.mjs'
import { root } from './product.mjs'

// The block's questions, and what's wrong with them (check-site reports it): its items, else its src's file in the
// page's folder. site: the product's page.json site, for the words about its demo.
export function readFaq(b, dir, site) {
  let items = b.items
  if (!items) {
    const file = join(root, dir, b.src ?? 'faq.json')
    if (!existsSync(file)) return { items: [], problems: [`no ${b.src ?? 'faq.json'} for its faq block`] }
    try {
      items = JSON.parse(readFileSync(file, 'utf8'))
    } catch (e) {
      return { items: [], problems: [`${b.src ?? 'faq.json'} isn't valid JSON: ${e.message}`] }
    }
  }
  if (!Array.isArray(items) || !items.length) return { items: [], problems: ['the faq block has no questions'] }
  const problems = []
  items.forEach((i, n) => {
    if (typeof i?.q !== 'string' || !i.q.trim()) problems.push(`question ${n + 1} has no q`)
    else if (/<[a-z]/i.test(i.q)) problems.push(`question ${n + 1}'s q has markup: a question is plain words`)
    if (!paragraphs(i?.a).length || paragraphs(i.a).some((p) => typeof p !== 'string' || !p.trim())) problems.push(`question ${n + 1} has no answer (a)`)
  })
  const said = (a) => (Array.isArray(a) ? a.map((p) => demoText(site, p)) : demoText(site, a))
  return { items: problems.length ? [] : items.map((i) => ({ ...i, a: said(i.a) })), problems }
}

const paragraphs = (a) => (Array.isArray(a) ? a : a == null ? [] : [a])

export function faq(items) {
  return `<div class="faq">
          ${items.map((i) => `<details class="faq-item"><summary>${esc(i.q)}${ICONS.chevron}</summary><div class="faq-a">${paragraphs(i.a).map((p) => `<p>${p}</p>`).join('')}</div></details>`).join('\n          ')}
        </div>`
}

// An answer's words for the structured data, without its markup.
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ', rsquo: '\u2019', times: '\u00d7', euro: '\u20ac' }
const words = (html) => html.replace(/<[^>]+>/g, '').replace(/&(amp|lt|gt|quot|#39|nbsp|rsquo|times|euro);/g, (_, e) => ENTITIES[e]).replace(/\s+/g, ' ').trim()

export const faqData = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: paragraphs(i.a).map(words).join(' ') } })),
})
