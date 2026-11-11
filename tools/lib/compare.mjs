// A before-and-after: two pictures of one shot laid over each other, "before" left of a handle and "after" right of it,
// first made for Speedometer's "Seeing double?" (George, 10 Nov 2026, "film-before-after": KEEP): HUD mode on a bare
// windscreen, and with a HUD film. Drag anywhere on it (or tap a spot) to move the handle; its slider takes the arrow
// keys and tells screen readers how much of each shows. assets/compare.js drives it (menu.js loads it on a page with
// one) and assets/product.css draws it. Without script the handle stays in the middle, half of each picture showing.
// Both pictures are one place on their page (check-site's every-picture-once), so a pair is never shown twice.
// c: { before: { src, label, alt }, after: { src, label, alt }, widths, width, height, sizes?, caption?, label?, shop? }:
// src without its ending, as src-<width>.avif and .webp (tools/make-hud-film.py writes Speedometer's); label: the
// tag on its side ("Without film"); caption: a line under it; label: the slider's name (its two labels by default);
// shop: { item, label }, an Amazon chip on the "after" side's foot (tools/lib/shop.mjs; George, 11 Nov 2026, gear tips
// "C"), left out while its link holds a placeholder. Whoever sets the compare in a page adds the Associates line under
// it (shop.mjs disclosure). Used by a wiki entry's "compare" (tools/build-wiki.mjs), a question's "compare" in a faq
// block (tools/lib/faq.mjs) and a gear block's (tools/build-pages.mjs).
import { srcset } from './hero.mjs'
import { esc } from './partials.mjs'
import { shopChip, shopProblems } from './shop.mjs'

const ARROWS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>'

export function compare(c, sizes = c.sizes ?? '(min-width: 900px) 760px, 92vw') {
  const picture = (p, cls) =>
    `<picture class="${cls}">${['avif', 'webp'].map((x) => `<source type="image/${x}" srcset="${srcset(p, x, c.widths)}" sizes="${sizes}">`).join('')}<img src="${p.src}-${c.widths[0]}.webp" width="${c.width}" height="${c.height}" alt="${esc(p.alt)}" loading="lazy" decoding="async"></picture>`
  return `<figure class="compare">
            <div class="compare-frame">
              ${picture(c.after, 'compare-after')}
              ${picture(c.before, 'compare-before')}
              <span class="compare-tag compare-tag-before" aria-hidden="true">${esc(c.before.label)}</span>
              <span class="compare-tag compare-tag-after" aria-hidden="true">${esc(c.after.label)}</span>
              <input class="compare-range" type="range" min="0" max="100" step="1" value="50" disabled aria-label="${esc(c.label ?? `${c.before.label} or ${c.after.label}`)}" data-before="${esc(c.before.label)}" data-after="${esc(c.after.label)}">
              <span class="compare-handle" aria-hidden="true"><span class="compare-knob">${ARROWS}</span></span>${c.shop ? shopChip(c.shop) : ''}
            </div>${c.caption ? `
            <figcaption>${esc(c.caption)}</figcaption>` : ''}
          </figure>`
}

// What's wrong with a compare (check-site reports it): both pictures named, with their tags and words, and the sizes.
export function compareProblems(c) {
  const problems = []
  for (const side of ['before', 'after']) {
    const p = c?.[side]
    if (!p?.src || !p.label || !p.alt) problems.push(`its ${side} needs src, label and alt`)
  }
  if (!Array.isArray(c?.widths) || !c.widths.length || !c.width || !c.height) problems.push('it needs widths, width and height')
  if (c?.shop) problems.push(...shopProblems(c.shop))
  return problems
}
