// The "frame" block (tools/build-pages.mjs): a product's build that a repo of its own serves under vgraphics.gr, framed
// full screen on the product's page, from the same origin (the master coordinator, 2 Nov 2026: Palermo Noir's Unity
// WebGL build at /vg--palermo-play/, framed by /palermo/play/, /join/, /tv/ and /demo/, each page made from this
// template; the Deployer's palermo-unity-web). The page is a screen (page.json "screen"), nothing to scroll, with no
// site header: the game draws its own, its VHub avatar and its language, so a header would put two avatars on screen,
// mix the languages and take a phone's room (the master, 3 Nov 2026, from palermo-unity via the Palermo coordinator;
// "play and try pages are the product alone"). A play or demo page is the frame and the slim bar (← Palermo Noir ·
// About · Privacy · © 2026 VGraphics); a TV or join page the frame alone, with no bar either ("screen": { "bare": true };
// the Palermo coordinator, 2 Nov 2026: a TV page is driven by a remote, and George approved the join door as it is,
// with its language button and short legal line inside it), the legal line in the build's own page. assets/frame.js points the frame at the
// build with the page's own query and hash, so a room code from a QR or a shared link reaches the game.
//
// page.json: { "type": "frame", "src", "title" }
//   src    the build's address, a folder of SERVED_ELSEWHERE with the page's route ("/vg--palermo-play/?route=play")
//   title  the frame's name for screen readers ("Palermo Noir")
//
// A page that another repo's release puts in place waits at <product>/frames/<page>.json until then (palermo-unity-web
// copies it to <product>/<page>/page.json when Unity takes the page over, then runs tools/build-pages.mjs; the web's
// pages hold those addresses until then). check-site builds the waiting pages too, so they meet the play pages' rules
// before they go live, and holds a page put in place to its source.
//
// Of the seven Unity pages' rules (tools/lib/unity-pages.mjs), a frame page keeps these itself: the product alone
// (play-alone), the short legal line (legal-footer; a bare page's is in its build), no-select, and a TV or join page out
// of search (noindex). The build keeps all seven (analytics and error reports, the shared loading bar and no source maps
// besides) in its own repo, where check-site can't see it: tools/check-unity-build.mjs holds it to them when the
// Deployer publishes it.
import { existsSync, readdirSync } from 'node:fs'
import { legalProblems } from './legal.mjs'
import { esc } from './partials.mjs'
import { playPageProblems } from './play-pages.mjs'
import { isDoor, NO_SELECT } from './unity-pages.mjs'

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
// screen, of a build in a folder of SERVED_ELSEWHERE, opening on the page's own route, with a name for screen readers;
// a TV or join page kept out of search.
export function frameProblems(page, name) {
  const frames = framesOf(page)
  if (!frames.length) return []
  const out = []
  if (!page.screen) out.push('frames a build without "screen": give it "screen": { "heading" }, so the frame fills the window with nothing to scroll')
  const door = isDoor(`/x/${name}/`)
  if (door && !/noindex/.test(page.robots ?? '')) out.push('is a TV or join page, which search engines must not list: give it "robots": "noindex"')
  if (page.screen && door && !page.screen.bare) out.push('is a TV or join page, the frame alone: give it "screen": { "bare": true }, with no header, menu, avatar or bar')
  if (page.screen?.bare && !door) out.push('is a play or demo page: drop "bare", so it keeps the play-page shell, the header and the bar with its About link')
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

// A bare frame page as built: no bar (the TV and join pages).
export const isBare = (html) => /<html\b[^>]*\sclass="(?:[^"]*\s)?bare(?:\s[^"]*)?"/.test(html)

// What is wrong with a frame page's shell, as built: html, its markup; path, its address. A list of [rule, message]:
// no site header on any (the game draws its own); the slim bar with its About link on a play or demo page; nothing
// under the frame on a TV or join page.
export function frameShellProblems(html, path) {
  const out = []
  const body = (html.split(/<body\b[^>]*>/i)[1] ?? '').replace(/<!--[\s\S]*?-->/g, '')
  const bar = body.match(/<footer class="screen-bar">[\s\S]*?<\/footer>/)?.[0]
  if (/<header\b/i.test(body)) out.push(['play-alone', 'has a site header over the game, which draws its own (its VHub avatar, its language): a frame page is the frame and the slim bar ("play and try pages are the product alone")'])
  if (isDoor(path)) {
    if (bar || /<footer\b/i.test(body)) out.push(['play-alone', 'is a TV or join page with a bar under the frame: it is the frame alone ("screen": { "bare": true })'])
  } else if (!bar || !bar.includes(`href="/${path.split('/')[1]}/about/"`)) {
    out.push(['play-alone', 'has no slim bar with its About link under the frame (← the product · About · Privacy · © <year> VGraphics): drop "bare"'])
  }
  return out
}

// The legal line's problems on a frame page: a bare one's line is in its build (tools/check-unity-build.mjs holds it
// there), so only the company's details are refused on the page itself.
export const frameLegalProblems = (path, html) => legalProblems(path, html, true).filter((m) => !(isBare(html) && /without its legal line/.test(m)))

// The rules a frame page keeps itself, on the page as built: html, its markup; path, its address. A list of
// [rule, message], none when it keeps them (its frame's own are frameProblems'). check-site gets these from its own
// checks on the pages it serves; a page still waiting in frames/ is held to them here.
export function framePageProblems(html, path) {
  const out = frameShellProblems(html, path)
  for (const m of playPageProblems(html, path.split('/')[1], { template: true, about: !isDoor(path) })) out.push(['play-alone', m])
  for (const m of frameLegalProblems(path, html)) out.push(['legal-footer', m])
  if (!NO_SELECT.test(html)) out.push(['no-select', 'loads neither /assets/menu.js nor /assets/no-select.js, the no-select piece: make the page with the template'])
  return out
}
