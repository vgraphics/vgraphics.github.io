// The cursors (George, 24 Oct 2026: "Can we get custom cursors on each landing page?"). A product's theme pack may hold
// theme/cursor.svg (the pointer), cursor-link.svg (the hand over whatever clicks) and cursor-text.svg (the text cursor
// in text fields): 32 x 32, the click point in the svg's data-hotspot="x y" (tools/make-cursors.mjs draws them).
// tools/build-pages.mjs writes them into theme.css as --cursor, --cursor-link and --cursor-text, for mice and
// trackpads only; assets/cursors.css, which every page links, puts them to use, with the system's cursor wherever
// one is missing. VGraphics' own (assets/img/cursor*.svg) are set by hand in assets/vgraphics.css.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Each cursor's file and token name, and the system cursor it stands in for
export const CURSORS = { cursor: 'auto', 'cursor-link': 'pointer', 'cursor-text': 'text' }

// A cursor picture's click point, [x, y], or a message saying what's wrong with it.
export function hotspot(svg) {
  if (!/^<svg\b[^>]*\swidth="32"[^>]*\sheight="32"/.test(svg)) return 'is not a 32 x 32 svg'
  const m = svg.match(/^<svg\b[^>]*\sdata-hotspot="(\d+) (\d+)"/)
  if (!m) return 'has no data-hotspot="x y" (its click point)'
  const at = [+m[1], +m[2]]
  return at.every((v) => v < 32) ? at : `has its click point ${at.join(' ')} outside the picture`
}

// The cursors in a theme pack: dir is its folder on disk, url its address. { tokens: [[name, css value]], problems }
export function readCursors(dir, url) {
  const tokens = [], problems = []
  for (const [name, system] of Object.entries(CURSORS)) {
    const file = join(dir, `${name}.svg`)
    if (!existsSync(file)) continue
    const at = hotspot(readFileSync(file, 'utf8'))
    if (typeof at === 'string') problems.push(`${name}.svg ${at}`)
    else tokens.push([name, `url("${url}/${name}.svg") ${at.join(' ')}, ${system}`])
  }
  return { tokens, problems }
}

// The tokens as theme.css sets them: for mice and trackpads only, so phones and tablets never load the pictures.
export const cursorCss = (tokens) => (tokens.length ? `@media (hover: hover) and (pointer: fine) {
  :root {
${tokens.map(([name, value]) => `    --${name}: ${value};`).join('\n')}
  }
}
` : '')
