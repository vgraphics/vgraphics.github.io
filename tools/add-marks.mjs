// Writes our names' ™ into the pages that miss them (README "Our names as trade marks"): the hand-made pages, which no
// builder writes, and any page check-site's trademark rule names, after a merge too.
//   node tools/add-marks.mjs              every served page
//   node tools/add-marks.mjs <file>...    those pages
// The template's pages get theirs from build-pages, build-wiki and build-devlog; for those, run the builder instead.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './lib/product.mjs'
import { withMarks } from './lib/marks.mjs'

const given = process.argv.slice(2).map((f) => f.replaceAll('\\', '/'))
const files = given.length ? given : execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.html'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
let pages = 0
for (const file of files) {
  const abs = join(root, file)
  const { html, added } = withMarks('/' + file.replace(/(^|\/)index\.html$/, '$1'), readFileSync(abs, 'utf8'))
  if (!added.length) continue
  writeFileSync(abs, html)
  pages++
  console.log(`${file}: ${added.map((a) => `${a.name}™ (${a.where})`).join(', ')}`)
}
console.log(`${pages} page(s) given their ™`)
