// The soundtrack block of a product page (George, 22 Oct 2026: "a playlist and a small player where players can listen
// to the app or game OSTs"): the album cover with a record that turns while the music plays, a small player with a
// waveform to seek on and a volume control, the track list, and its links to YouTube and SoundCloud.
// tools/build-pages.mjs writes it for
// a { "type": "soundtrack" } block in page.json; assets/soundtrack.js plays it and assets/soundtrack.css draws it in
// the product's theme. The durations come from page.json and the waveforms from <product>/audio/peaks.json
// (tools/make-soundtrack.py), so the block is complete before anything loads, and nothing loads until the visitor
// presses play.
//   album       the album's name, shown in the mini-bar and on a phone's lock screen
//   cover       { src, widths, width, height, alt }: a square cut of the key art (tools/make-soundtrack.py), as
//               src-<width>.avif and .webp
//   background  { wide, tall } or null: the player's backdrop, each { src, widths } like the cover; without it the
//               player lies over its own cover, blurred
//   youtube, soundcloud   the product's collection on each (its YouTube playlist, its SoundCloud album), or null (no
//               button). George, 22 Oct 2026: "Add social icon button to project landing page." No Spotify (23 Oct:
//               "Skip spotify. I dont pay for that.").
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
  // The speaker with its sound waves (one when low, two when high) or a cross when muted: soundtrack.css shows the
  // ones its data-level asks for
  volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.6a1 1 0 0 1 1-1h2.9l4.2-3.6a.9.9 0 0 1 1.5.7v12.6a.9.9 0 0 1-1.5.7l-4.2-3.6H4.5a1 1 0 0 1-1-1z"/><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path class="v-low" d="M16 9.4a3.7 3.7 0 0 1 0 5.2"/><path class="v-high" d="M18.7 6.7a7.5 7.5 0 0 1 0 10.6"/><path class="v-off" d="M16.5 9.5l5 5m0-5l-5 5"/></g></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  // Simple Icons (CC0), one colour as each brand's guidelines allow
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>',
  soundcloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/></svg>',
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
  // The waveform (all of it, the stretch up to the pointer, the played part) under a see-through range input
  const scrub = `<div class="ost-wave" aria-hidden="true"><svg class="ost-wave-all"><path/></svg><svg class="ost-wave-hover"><path/></svg><svg class="ost-wave-played"><path/></svg></div>
                <input class="ost-range" type="range" min="0" max="${seconds(first.duration)}" step="any" value="0" aria-label="Seek" aria-valuetext="0:00 of ${esc(first.duration)}">`
  // The volume, on the player and on the mini-bar: a speaker that mutes and unmutes, and a slider drawn like the
  // waveform, its twelve bars rising with the level, under a see-through range input
  const ramp = Array.from({ length: 12 }, (_, i) => {
    const h = 6 + (18 * i) / 11
    return `M${(((i + 0.5) * 80) / 12).toFixed(1)} ${(22 - h / 2).toFixed(1)}v${h.toFixed(1)}`
  }).join('')
  const volume = `<div class="ost-volume">
                ${button('mute', 'Mute', ICONS.volume).replace('<button', '<button aria-pressed="false" data-level="high"')}
                <div class="ost-vol waved"><div class="ost-wave" aria-hidden="true">${['all', 'hover', 'played'].map((k) => `<svg class="ost-wave-${k}" viewBox="0 0 80 44" preserveAspectRatio="none"><path d="${ramp}"/></svg>`).join('')}</div><input class="ost-range" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume" aria-valuetext="100%" data-ost="volume"></div>
              </div>`
  const rows = b.tracks.map((t, i) => {
    const wave = peaks[t.src.split('/').pop()]
    return `<li style="--c: var(--swatch-${(i % theme.swatches.length) + 1})"><button class="ost-track" type="button" data-src="${esc(t.src)}" data-duration="${seconds(t.duration)}"${wave ? ` data-peaks="${wave.join(',')}"` : ''}${i ? '' : ' aria-current="true"'}><span class="ost-n" aria-hidden="true"><b>${i + 1}</b><i class="ost-eq"><i></i><i></i><i></i></i></span><span class="ost-t"><span>${esc(t.title)}</span></span><span class="ost-d"><span class="sr-only">, </span>${esc(t.duration)}</span></button></li>`
  })
  const links = [['youtube', 'YouTube'], ['soundcloud', 'SoundCloud']].filter(([k]) => b[k])
    .map(([k, name]) => `<a class="ost-link" href="${esc(b[k])}" aria-label="${esc(b.album)} on ${name}">${ICONS[k]}<span>${name}</span></a>`)
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
                ${scrub}
                <span class="ost-times"><span data-ost="cur">0:00</span><span data-ost="dur">${esc(first.duration)}</span></span>
              </div>
              <div class="ost-controls">
                ${volume}
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
              <p class="ost-links"><span>Listen on</span>${links.join('')}</p>` : ''}
            </div>
          </div>
          <audio preload="none"></audio>
          <p class="sr-only" aria-live="polite" data-ost="live"></p>
          <div class="ost-mini" role="region" aria-label="Soundtrack player" hidden>
            <button class="ost-mini-show" type="button" data-ost="show"><img src="${esc(`${c.src}-${c.widths[0]}.webp`)}" alt="" width="48" height="48"><span><span class="sr-only">Back to the player: </span><b data-ost="title">${esc(first.title)}</b><small>${esc(b.album)}</small></span></button>
            <div class="ost-seek">
              <span data-ost="cur">0:00</span>
              <div class="ost-scrub">
                ${scrub}
              </div>
              <span data-ost="dur">${esc(first.duration)}</span>
            </div>
            ${play}
            ${button('next', 'Next track', ICONS.next)}
            ${volume}
            ${button('close', 'Stop and close the player', ICONS.close)}
          </div>
        </div>`
}
