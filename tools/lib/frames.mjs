// The "frame" block (tools/build-pages.mjs): a product's build that a repo of its own serves under vgraphics.gr, framed
// full screen on the product's page, from the same origin (the master coordinator, 2 Nov 2026: Palermo Noir's Unity
// WebGL build at /vg--palermo-play/, framed by /palermo/play/, /join/, /tv/ and /demo/, each page made from this
// template; the Deployer's palermo-unity-web). The page is a screen (page.json "screen"): the header, the frame filling
// the window and the slim bar, nothing to scroll. assets/frame.js points the frame at the build with the page's own
// query and hash, so a room code from a QR or a shared link reaches the game.
//
// page.json: { "type": "frame", "src", "title" }
//   src    the build's address, a folder of SERVED_ELSEWHERE with the page's route ("/vg--palermo-play/?route=play")
//   title  the frame's name for screen readers ("Palermo Noir")
//
// A page that another repo's release puts in place waits at <product>/frames/<page>.json until then (palermo-unity-web
// copies it to <product>/<page>/page.json when Unity takes the page over, then runs tools/build-pages.mjs; the web's
// pages hold those addresses until then). check-site builds the waiting pages too, so they meet the play pages' rules
// before they go live, and holds a page put in place to its source.
import { existsSync, readdirSync } from 'node:fs'
import { esc } from './partials.mjs'

// vgraphics.gr's folders that another of the account's Pages repos serves (a project site under the same domain), so
// the site has no file there: vgraphics/vg--palermo-play, Palermo Noir's Unity WebGL build.
export const SERVED_ELSEWHERE = ['vg--palermo-play']

// What a game in a frame may use: sound before a tap, full screen, keeping the screen awake, copying a room's code.
export const frameBlock = (b) =>
  `<iframe class="frame" data-src="${esc(b.src)}" title="${esc(b.title)}" allow="autoplay; fullscreen; screen-wake-lock; clipboard-write" allowfullscreen></iframe>`

const framesOf = (page) => (page.sections ?? []).flatMap((s) => s.blocks ?? []).filter((b) => b.type === 'frame')
export const hasFrame = (page) => framesOf(page).length > 0

// The pages waiting in a product's frames/ folder, by name.
export const frameSources = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : [])

// What is wrong with the frame of a page.json, if anything: name, the page's folder (its route). One frame, on a
// screen, of a build in a folder of SERVED_ELSEWHERE, opening on the page's own route, with a name for screen readers.
export function frameProblems(page, name) {
  const frames = framesOf(page)
  if (!frames.length) return []
  const out = []
  if (!page.screen) out.push('frames a build without "screen": give it "screen": { "heading" }, so the frame fills the window with nothing to scroll')
  if (frames.length > 1) out.push(`has ${frames.length} frames: one build fills the screen`)
  for (const b of frames) {
    const src = String(b.src ?? '')
    const folder = src.match(/^\/([^/?#]+)\//)?.[1]
    if (!SERVED_ELSEWHERE.includes(folder)) {
      out.push(`frames ${src || 'nothing'}: a frame shows a build another Pages repo serves under vgraphics.gr, from the same origin (${SERVED_ELSEWHERE.map((f) => `/${f}/`).join(', ')}; tools/lib/frames.mjs SERVED_ELSEWHERE)`)
    }
    const route = new URLSearchParams(src.split('#')[0].split('?')[1] ?? '').get('route')
    if (route !== name) out.push(`frames ${src || 'nothing'} with ${route ? `route ${route}` : 'no route'}: the build opens on the page's own, ?route=${name}`)
    if (!b.title) out.push('its frame has no title, its name for screen readers')
  }
  return out
}
