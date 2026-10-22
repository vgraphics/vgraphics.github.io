// The soundtrack block of a product page (George, 22 Oct 2026: "a playlist and a small player where players can listen
// to the app or game OSTs"): the album cover with a record that turns while the music plays, a small player with a
// waveform to seek on, the track list, and the album's links on YouTube and Spotify. tools/build-pages.mjs writes it for
// a { "type": "soundtrack" } block in page.json; assets/soundtrack.js plays it and assets/soundtrack.css draws it in
// the product's theme. The durations come from page.json and the waveforms from <product>/audio/peaks.json
// (tools/make-soundtrack.py), so the block is complete before anything loads, and nothing loads until the visitor
// presses play.
//   album       the album's name, shown in the mini-bar and on a phone's lock screen
//   cover       { src, widths, width, height, alt }: a square cut of the key art (tools/make-soundtrack.py), as
//               src-<width>.avif and .webp
//   background  { wide, tall } or null: the player's backdrop, each { src, widths } like the cover; without it the
//               player lies over its own cover, blurred
//   youtube, spotify   the album on each, or null (no icon)
//   tracks      [{ title, src, duration: "m:ss" }], src an .m4a in <product>/audio/
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { esc } from './partials.mjs'
import { root } from './product.mjs'

const ICONS = {
  play: '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 5.3v13.4a1.2 1.2 0 0 0 1.8 1l10.4-6.7a1.2 1.2 0 0 0 0-2L10 4.3a1.2 1.2 0 0 0-1.8 1z"/></svg>',
  pause: '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="5.6" y="4.6" width="4.6" height="14.8" rx="1.7"/><rect x="13.8" y="4.6" width="4.6" height="14.8" rx="1.7"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.4" y="5.2" width="3.2" height="13.6" rx="1.6"/><path d="M19.6 6.4v11.2a1.2 1.2 0 0 1-1.86 1L9.6 13a1.2 1.2 0 0 1 0-2l8.14-5.6a1.2 1.2 0 0 1 1.86 1z"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="16.4" y="5.2" width="3.2" height="13.6" rx="1.6"/><path d="M4.4 6.4v11.2a1.2 1.2 0 0 0 1.86 1L14.4 13a1.2 1.2 0 0 0 0-2L6.26 5.4a1.2 1.2 0 0 0-1.86 1z"/></svg>',
  loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2.5l3 3-3 3M4 11.5v-1a5 5 0 0 1 5-5h11M7 21.5l-3-3 3-3M20 12.5v1a5 5 0 0 1-5 5H4"/></svg><b class="ost-one" aria-hidden="true">1</b>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  // Simple Icons (CC0), one colour as each brand's guidelines allow
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>',
  spotify: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15 10.56 18.72 12.84c.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>',
}

const seconds = (d) => d.split(':').reduce((t, n) => t * 60 + Number(n), 0)
const set = (img, ext) => img.widths.map((w) => `${img.src}-${w}.${ext} ${w}w`).join(', ')
const largest = (img, ext) => `${img.src}-${img.widths.at(-1)}.${ext}`

// The player's backdrop: the tall picture on narrow screens, the wide one elsewhere; lazy, so it waits for the scroll.
function backdrop(bg, cover) {
  if (!bg) return `<span class="ost-backdrop blur" aria-hidden="true"><img src="${esc(`${cover.src}-${cover.widths[0]}.webp`)}" alt="" loading="lazy" decoding="async"></span>`
  const sources = (img, media) => ['avif', 'webp'].map((ext) => `<source${media ? ` media="${media}"` : ''} type="image/${ext}" srcset="${esc(set(img, ext))}" sizes="(max-width: 619px) 100vw, 1120px">`).join('')
  return `<picture class="ost-backdrop" aria-hidden="true">${sources(bg.tall, '(max-width: 619px)')}${sources(bg.wide)}<img src="${esc(largest(bg.wide, 'webp'))}" alt="" loading="lazy" decoding="async"></picture>`
}

export function soundtrack(b, { slug, theme }) {
  const c = b.cover
  const first = b.tracks[0]
  const peaksFile = join(root, slug, 'audio', 'peaks.json')
  const peaks = existsSync(peaksFile) ? JSON.parse(readFileSync(peaksFile, 'utf8')) : {}
  const sizes = '(max-width: 619px) 56vw, 260px'
  const button = (name, label, icon) => `<button class="ost-btn ost-${name}" type="button" data-ost="${name}" aria-label="${label}">${icon}</button>`
  const play = button('play', 'Play', ICONS.play + ICONS.pause)
  const rows = b.tracks.map((t, i) => {
    const wave = peaks[t.src.split('/').pop()]
    return `<li style="--c: var(--swatch-${(i % theme.swatches.length) + 1})"><button class="ost-track" type="button" data-src="${esc(t.src)}" data-duration="${seconds(t.duration)}"${wave ? ` data-peaks="${wave.join(',')}"` : ''}${i ? '' : ' aria-current="true"'}><span class="ost-n" aria-hidden="true"><b>${i + 1}</b><i class="ost-eq"><i></i><i></i><i></i></i></span><span class="ost-t">${esc(t.title)}</span><span class="ost-d"><span class="sr-only">, </span>${esc(t.duration)}</span></button></li>`
  })
  const links = [['youtube', 'YouTube'], ['spotify', 'Spotify']].filter(([k]) => b[k])
    .map(([k, name]) => `<a class="ost-link" href="${esc(b[k])}" aria-label="${esc(b.album)} on ${name}" title="${name}">${ICONS[k]}</a>`)
  return `<div class="ost" data-album="${esc(b.album)}" data-artwork="${esc(largest(c, 'webp'))}">
          <div class="ost-player">
            ${backdrop(b.background, c)}
            <div class="ost-art">
              <span class="ost-vinyl" aria-hidden="true"><span class="ost-disc"><img src="${esc(`${c.src}-${c.widths[0]}.webp`)}" alt="" width="${c.widths[0]}" height="${c.widths[0]}" loading="lazy" decoding="async"></span></span>
              <picture class="ost-cover">
                <source type="image/avif" srcset="${esc(set(c, 'avif'))}" sizes="${sizes}">
                <img src="${esc(largest(c, 'webp'))}" srcset="${esc(set(c, 'webp'))}" sizes="${sizes}" alt="${esc(c.alt)}" width="${c.width}" height="${c.height}" loading="lazy" decoding="async">
              </picture>
            </div>
            <div class="ost-deck">
              <p class="ost-now"><span class="ost-label" data-ost="label">Track 1 of ${b.tracks.length}</span><span class="ost-title" data-ost="title">${esc(first.title)}</span></p>
              <div class="ost-seek">
                <div class="ost-wave" aria-hidden="true"><svg class="ost-wave-all"><path/></svg><svg class="ost-wave-played"><path/></svg></div>
                <input class="ost-range" type="range" min="0" max="${seconds(first.duration)}" step="any" value="0" aria-label="Seek" aria-valuetext="0:00 of ${esc(first.duration)}">
                <span class="ost-times"><span data-ost="cur">0:00</span><span data-ost="dur">${esc(first.duration)}</span></span>
              </div>
              <div class="ost-controls">
                <div class="ost-transport">
                  ${button('prev', 'Previous track', ICONS.prev)}
                  ${play}
                  ${button('next', 'Next track', ICONS.next)}
                </div>
                ${button('loop', 'Loop: off', ICONS.loop).replace('<button', '<button data-loop="off"')}
              </div>
            </div>
            <div class="ost-tracks">
              <ol class="ost-list" aria-label="Tracks">
                ${rows.join('\n                ')}
              </ol>${links.length ? `
              <p class="ost-links"><span>Also on</span>${links.join('')}</p>` : ''}
            </div>
          </div>
          <audio preload="none"></audio>
          <p class="sr-only" aria-live="polite" data-ost="live"></p>
          <div class="ost-mini" role="region" aria-label="Soundtrack player" hidden>
            <span class="ost-mini-p" aria-hidden="true"></span>
            <button class="ost-mini-show" type="button" data-ost="show"><img src="${esc(`${c.src}-${c.widths[0]}.webp`)}" alt="" width="48" height="48"><span><span class="sr-only">Back to the player: </span><b data-ost="title">${esc(first.title)}</b><small>${esc(b.album)}</small></span></button>
            ${play}
            ${button('next', 'Next track', ICONS.next)}
            ${button('close', 'Stop and close the player', ICONS.close)}
          </div>
        </div>`
}
