// Writes every local picture address on the site's pages as name.<hash>.ext, the first 8 hex digits of the file's SHA-256,
// so the host can cache a picture for a year (tools/lib/image-version.mjs, .htaccess, README "Hosting"; the platform
// coordinator's job 23, George, 10 Nov 2026: "Yes, do it").
//
//   node tools/version-images.mjs              rewrite every page that needs it, in place
//   node tools/version-images.mjs --check      only list them (exit 1 if any), change nothing
//   node tools/version-images.mjs hub/index.html exitwise/about/index.html   just these pages (paths in the site)
//
// The pages the template writes (tools/build-pages.mjs, build-wiki.mjs, build-devlog.mjs) already name the versioned
// addresses; this is for the rest: the home page, company, the hub and the doors the Deployer writes, the play and try
// pages, and any page made by hand. Run it again after a picture's bytes change (a new key art, tools/protect-art.mjs, a
// Recraft export) and after every Deployer run that writes pages (the hub, the party doors, a play page): a page that
// names a picture without its file's current version fails check-site, which names this tool.
// It is safe to run twice: a page that is right is left alone. The pictures' files keep their names in git.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { imageRefs, servedPages, siteRoot, unityDirs, versionFile } from './lib/image-version.mjs'

const args = process.argv.slice(2)
const check = args.includes('--check')
const named = args.filter((a) => !a.startsWith('--')).map((a) => a.split('\\').join('/'))
const pages = named.length ? named : servedPages()
const builds = unityDirs()
let total = 0
let touched = 0
for (const file of pages) {
  if (!existsSync(join(siteRoot, file))) {
    console.error(`${file}: no such page`)
    process.exit(2)
  }
  if (builds.some((d) => file.startsWith(`${d}/`))) {
    console.log(`${file}: a Unity build's page, written by its own repo: left as it is`)
    continue
  }
  const n = check ? imageRefs(readFileSync(join(siteRoot, file), 'utf8'), { file, root: siteRoot, unityDirs: builds }).length : versionFile(file, { root: siteRoot, unityDirs: builds })
  if (!n) continue
  touched++
  total += n
  console.log(`${file}: ${n} picture address${n === 1 ? '' : 'es'}${check ? ' without the current version' : ' versioned'}`)
}
console.log(`${touched} of ${pages.length} pages ${check ? 'need' : 'changed'}: ${total} address${total === 1 ? '' : 'es'}`)
if (check && touched) process.exit(1)
