// Versioned picture addresses (the platform coordinator's job 23; George, 10 Nov 2026: "Yes, do it", to "Give the site's
// images a long cache lifetime ... file names that change with the picture, plus an .htaccess change").
//
// PageSpeed's top hint on every page was "use efficient cache lifetimes": a picture keeps its name when its bytes change,
// so it could only be cached for ten minutes. A page now names a picture by a version of its name:
//   img/hero.webp   is written   img/hero.1a2b3c4d.webp      (the first 8 hex digits of the file's SHA-256)
// The files keep their names in git, so nobody changes how pictures are added. The generators (tools/build-pages.mjs,
// build-wiki.mjs, build-devlog.mjs) write the versioned names, tools/version-images.mjs does it for every page made by
// hand or by the Deployer, and .htaccess maps name.<hash>.ext back to name.ext and caches that address for a year
// (tools/lib/htaccess.mjs). A changed picture is a new address; check-site fails on a page that names a local picture
// without its version, or with one that is no longer its file's (a stale hash would keep the old picture for a year).
//
// What is rewritten: every address of a picture that is a file of this site, wherever a page writes one: src, href,
// poster, srcset and imagesrcset (and any data-*srcset), a data-* attribute holding one address, content (the link
// preview), style="... url(...)", and the quoted addresses and url() of a page's <script> and <style> (its JSON-LD).
// Not rewritten: text, comments, alt and the other words of an attribute, another site's pictures, addresses of files
// the site doesn't have, and the pictures inside the Unity builds (they are other repos' releases and keep their ten
// minutes). Addresses a script builds at run time, and url() in a stylesheet, are not pages: they keep the ten minutes
// and are listed in tools/image-version-known-gaps.json (check-site).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { demoPieces, documents, pieces } from './product.mjs'
import { isUnityPage, unityFramework } from './unity-pages.mjs'

export const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** The pictures a page may name, as an alternation. .htaccess lists the same ones (tools/test/htaccess.test.mjs holds them). */
export const IMAGE_EXTENSIONS = 'avif|webp|jpe?g|png|gif|svg|ico'
/** Hex digits of the SHA-256 in a version. */
export const HASH_LENGTH = 8

export const hashBytes = (bytes) => createHash('sha256').update(bytes).digest('hex').slice(0, HASH_LENGTH)

// A file's version, kept while its size and time stay the same: a page names the same pictures again and again.
const known = new Map()
export function hashOf(file) {
  const { size, mtimeMs } = statSync(file)
  const seen = known.get(file)
  if (seen && seen.size === size && seen.mtimeMs === mtimeMs) return seen.hash
  const hash = hashBytes(readFileSync(file))
  known.set(file, { size, mtimeMs, hash })
  return hash
}

const VERSIONED = new RegExp(`^(.+)\\.([0-9a-f]{${HASH_LENGTH}})(\\.(?:${IMAGE_EXTENSIONS}))$`, 'i')
const EXTENSION = new RegExp(`(\\.(?:${IMAGE_EXTENSIONS}))$`, 'i')
const VERSION = new RegExp(`\\.[0-9a-f]{${HASH_LENGTH}}(?=\\.(?:${IMAGE_EXTENSIONS})$)`, 'i')

/** A versioned name's parts: hero.1a2b3c4d.webp is { stem: 'hero.webp', hash: '1a2b3c4d' }; null for any other name. */
export function splitVersion(name) {
  const m = name.match(VERSIONED)
  return m && m[2] === m[2].toLowerCase() ? { stem: m[1] + m[3], hash: m[2] } : null
}

/** hero.webp with the version 1a2b3c4d: hero.1a2b3c4d.webp. */
export const versionedName = (name, hash) => name.replace(EXTENSION, `.${hash}$1`)

const isFile = (path) => {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

/**
 * The file a picture address names, as a path: the file itself, or, for a versioned name with no file of its own, the
 * file it stands for. For the places that ask whether an address leads somewhere (links, preview pictures, sizes).
 * `path` is a file system path; one that leads nowhere comes back unchanged.
 */
export function realFile(path) {
  if (existsSync(path)) return path
  const v = splitVersion(basename(path))
  const real = v && join(dirname(path), v.stem)
  return real && existsSync(real) ? real : path
}

// The folders of the Unity builds (the page's own and its build's, as check-site finds them): other repos' releases write
// their files, so a page that names one keeps the plain name.
const unity = new Map()
export function unityDirs(root = siteRoot) {
  if (unity.has(root)) return unity.get(root)
  const dirs = new Set()
  try {
    const served = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.html'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\0').filter((f) => f && existsSync(join(root, f)))
    for (const file of served) {
      const html = readFileSync(join(root, file), 'utf8')
      if (!isUnityPage(html)) continue
      dirs.add(posix.dirname(file))
      const framework = unityFramework(html)
      if (!framework) continue
      let clean = framework.replace(/[?#].*$/, '')
      try {
        clean = decodeURIComponent(clean)
      } catch {}
      const build = posix.dirname(clean.startsWith('/') ? clean.slice(1) : posix.join(posix.dirname(file), clean))
      dirs.add(posix.basename(build) === 'Build' ? posix.dirname(build) : build)
    }
  } catch {
    // Not a git checkout (a test's folder): no Unity builds to leave alone.
  }
  dirs.delete('.')
  const list = [...dirs]
  unity.set(root, list)
  return list
}

/**
 * What a picture address (host, path, tail: the parts of a reference) is: { state: 'skip' } when it isn't ours to version,
 * { state: 'ok' } when it carries its file's current version, else { state: 'unversioned' | 'stale', hash, rewrite }
 * with the path to write in its place.
 */
function judge(host, rawPath, ctx) {
  const skip = { state: 'skip' }
  if ((host && !rawPath.startsWith('/')) || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(rawPath)) return skip
  let path
  try {
    path = decodeURIComponent(rawPath)
  } catch {
    return skip
  }
  const file = ctx.file?.replace(/\\/g, '/')
  const abs = path.startsWith('/') ? path.slice(1) : file ? posix.normalize(posix.join(posix.dirname(file), path)) : null
  if (!abs || abs.startsWith('../')) return skip
  const root = ctx.root ?? siteRoot
  if ((ctx.unityDirs ?? unityDirs(root)).some((d) => abs.startsWith(`${d}/`))) return skip
  const dir = posix.dirname(abs)
  const name = posix.basename(abs)
  const rawName = rawPath.slice(rawPath.lastIndexOf('/') + 1)
  const before = rawPath.slice(0, rawPath.length - rawName.length)
  if (isFile(join(root, abs))) {
    // A file that has such a name itself (a hash its maker gave it) stays as it is.
    if (splitVersion(name)) return { state: 'ok' }
    const hash = hashOf(join(root, abs))
    return { state: 'unversioned', hash, rewrite: before + versionedName(rawName, hash) }
  }
  const v = splitVersion(name)
  const real = v && join(root, dir, v.stem)
  if (!real || !isFile(real)) return skip
  const hash = hashOf(real)
  if (v.hash === hash) return { state: 'ok' }
  return { state: 'stale', hash, rewrite: before + rawName.replace(VERSION, `.${hash}`) }
}

const URL_PARTS = new RegExp(`^((?:https?:\\/\\/(?:www\\.)?vgraphics\\.gr)?)([^?#]*\\.(?:${IMAGE_EXTENSIONS}))([?#].*)?$`, 'i')
// One address (a whole attribute value, or a srcset entry's first word): its picture's version in it, if it is ours.
function mapUrl(url, ctx, visit) {
  const m = url.match(URL_PARTS)
  if (!m) return url
  const [, host, path, tail = ''] = m
  const found = judge(host, path, ctx)
  if (found.state === 'skip' || found.state === 'ok') return url
  const want = host + found.rewrite + tail
  visit?.({ ref: url, state: found.state, want })
  return want
}

// A script's or style's text (and a style attribute): a picture address is a quoted string or inside url( ).
const CODE_REF = new RegExp(`(?<=["'\`(]\\s*)((?:https?:\\/\\/(?:www\\.)?vgraphics\\.gr)?[A-Za-z0-9_\\-./%@+~]+\\.(?:${IMAGE_EXTENSIONS}))(?=[?#"'\`)\\s]|$)`, 'gi')
const mapCode = (code, ctx, visit) => code.replace(CODE_REF, (url) => mapUrl(url, ctx, visit))

// The words of an attribute, never a picture's address.
const WORDS = /^(?:alt|title|placeholder|value|summary|label|aria-[\w-]+)$/
function mapAttribute(name, value, ctx, visit) {
  if (WORDS.test(name)) return value
  if (/srcset$/.test(name)) return value.split(',').map((entry) => entry.replace(/^(\s*)(\S+)/, (all, space, url) => space + mapUrl(url, ctx, visit))).join(',')
  if (name === 'style') return mapCode(value, ctx, visit)
  const one = value.match(/^(\s*)(\S+)(\s*)$/)
  return one ? one[1] + mapUrl(one[2], ctx, visit) + one[3] : value
}

const ATTRIBUTE = /(\s)([^\s"'<>/=]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
function mapTag(tag, ctx, visit) {
  return tag.replace(ATTRIBUTE, (all, space, name, equals, double, single, bare) => {
    const value = double ?? single ?? bare
    const next = mapAttribute(name.toLowerCase(), value, ctx, visit)
    if (next === value) return all
    const quote = double !== undefined ? '"' : single !== undefined ? "'" : ''
    return `${space}${name}${equals}${quote}${next}${quote}`
  })
}

// A tag's end is the first ">" outside its quoted values.
const TAG = '<[a-zA-Z](?:"[^"]*"|\'[^\']*\'|[^>"\'])*>'
const SEGMENT = new RegExp(`<!--[\\s\\S]*?-->|<(script|style)\\b(?:"[^"]*"|'[^']*'|[^>"'])*>[\\s\\S]*?<\\/\\1\\s*>|${TAG}`, 'gi')
const OPEN_TAG = new RegExp(`^${TAG}`)
function mapHtml(html, ctx, visit) {
  return html.replace(SEGMENT, (segment, block) => {
    if (segment.startsWith('<!--')) return segment
    if (!block) return mapTag(segment, ctx, visit)
    const open = segment.match(OPEN_TAG)[0]
    const close = segment.match(/<\/[^>]*>$/)[0]
    return mapTag(open, ctx, visit) + mapCode(segment.slice(open.length, segment.length - close.length), ctx, visit) + close
  })
}

/**
 * `html` with every local picture address carrying its file's current version (a missing or stale one is written).
 * `file` is the page's path in the site (exitwise/about/index.html), which its relative addresses start from; `root` the
 * site's folder; `unityDirs` the Unity folders to leave alone (found from the site when not given).
 */
export const versionImages = (html, ctx = {}) => mapHtml(html, ctx)

/** The addresses in `html` that don't carry their file's current version: [{ ref, state: 'unversioned' | 'stale', want }]. */
export function imageRefs(html, ctx = {}) {
  const found = []
  mapHtml(html, ctx, (r) => found.push(r))
  return found
}

/** `code` (a stylesheet or script the generator writes) with every local picture address carrying its file's version. */
export const versionCode = (code, ctx = {}) => mapCode(code, ctx)

/** The addresses of local pictures a script or stylesheet names (code, not a page) without a version: [{ ref, state, want }]. */
export function codeImageRefs(code, ctx = {}) {
  const found = []
  mapCode(code, ctx, (r) => found.push(r))
  return found
}

const slash = (f) => f.split('\\').join('/')

/**
 * The HTML files the site serves as pages, as paths in the site ('/'-separated): what git tracks or would add, minus the
 * pieces the template sets into pages (embeds, documents, intro demos) and the Unity builds' pages, which are other
 * repos' releases. The pages version-images rewrites and check-site holds to the version rule.
 */
export function servedPages(root = siteRoot) {
  const served = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.html'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 })
    .split('\0').filter((f) => f && existsSync(join(root, f))).map(slash)
  const notPages = new Set([...pieces(), ...demoPieces(), ...documents().map((d) => d.file)].map(slash))
  const builds = unityDirs(root)
  return served.filter((f) => !notPages.has(f) && !builds.some((d) => f.startsWith(`${d}/`)))
}

/** What check-site says of a page: its pictures' addresses that lack their file's current version, as one message (or none). */
export function imageVersionProblems(html, ctx = {}) {
  const bad = imageRefs(html, ctx)
  if (!bad.length) return []
  const stale = bad.filter((r) => r.state === 'stale').length
  const sample = bad.slice(0, 2).map((r) => `${r.ref} should be ${r.want}`).join('; ')
  return [`${bad.length} picture address${bad.length === 1 ? '' : 'es'} without the file's current version${stale ? ` (${stale} stale: the picture changed)` : ''}, such as ${sample}: run node tools/version-images.mjs (a page the template writes: its generator, node tools/build-pages.mjs, build-wiki.mjs or build-devlog.mjs)`]
}

/**
 * The shrink-only list of code that names local pictures (tools/image-version-known-gaps.json): `found` is the files with
 * such addresses ([file, count]), `listed` the entries ({ path, owner, why }; a path ending in "/" holds every file under
 * it). Each [file, message] is a problem: a file with addresses that no entry covers, an entry that covers none now (fixed,
 * gone or out of scope), and an entry without its owner or its reason.
 */
export function imageGapProblems(found, listed) {
  const covers = (entry, file) => (entry.path.endsWith('/') ? file.startsWith(entry.path) : file === entry.path)
  const out = []
  for (const g of listed) {
    if (!g.path || !g.owner || !g.why) out.push([g.path ?? '(an entry)', "an entry in tools/image-version-known-gaps.json names its path, its owner and why the code can't carry versions"])
    else if (!found.some(([file]) => covers(g, file))) out.push([g.path, 'is listed in tools/image-version-known-gaps.json but names no unversioned local picture now: remove the entry'])
  }
  for (const [file, count] of found) {
    if (!listed.some((g) => g.path && covers(g, file))) out.push([file, `names ${count} local picture${count === 1 ? '' : 's'} in code, which can't carry a version (cached ten minutes): list the file in tools/image-version-known-gaps.json with its owner and why, or have the page that uses it name the versioned address`])
  }
  return out
}

/**
 * Writes the versions into one page (`file`, its path in the site) in place: the number of addresses changed. A page already
 * right is left alone, so running it again changes nothing.
 */
export function versionFile(file, { root = siteRoot, unityDirs: dirs } = {}) {
  const path = join(root, file)
  const html = readFileSync(path, 'utf8')
  const ctx = { file, root, unityDirs: dirs }
  const changed = imageRefs(html, ctx).length
  if (changed) writeFileSync(path, mapHtml(html, ctx))
  return changed
}
