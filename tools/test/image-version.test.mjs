// Versioned picture addresses (tools/lib/image-version.mjs, tools/version-images.mjs, check-site's 'image-version' rule): a
// page names a picture as name.<first 8 hex of the file's SHA-256>.ext so the host can cache it for a year (.htaccess).
// Run: node --test tools/test/*.test.mjs
import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  codeImageRefs, hashBytes, imageGapProblems, imageRefs, imageVersionProblems, realFile, splitVersion, versionCode, versionedName,
  versionFile, versionImages,
} from '../lib/image-version.mjs'

// A small site: a page at a/index.html with its pictures, and a Unity build whose files other repos write.
const site = mkdtempSync(join(tmpdir(), 'vg-image-version-'))
const put = (path, bytes) => {
  mkdirSync(join(site, path, '..'), { recursive: true })
  writeFileSync(join(site, path), bytes)
}
put('a/img/hero.webp', 'hero bytes')
put('a/img/my pic.png', 'pic bytes')
put('img/logo.svg', '<svg/>')
put('build/x.png', 'unity')
put('favicon.ico', 'ico')
after(() => rmSync(site, { recursive: true, force: true }))
const sha8 = (text) => createHash('sha256').update(text).digest('hex').slice(0, 8)
const hero = sha8('hero bytes')
const pic = sha8('pic bytes')
const ctx = { file: 'a/index.html', root: site, unityDirs: ['build'] }

test('a version is the first 8 hex digits of the SHA-256 of the file', () => {
  assert.equal(hashBytes(Buffer.from('abc')), 'ba7816bf') // SHA-256("abc") = ba7816bf8f01cfea...
  assert.equal(hashBytes(Buffer.from('hero bytes')), hero)
  assert.notEqual(hashBytes(Buffer.from('hero byteS')), hero)
  assert.match(hashBytes(Buffer.alloc(0)), /^[0-9a-f]{8}$/)
})

test('a versioned name splits back to its file name, and nothing else does', () => {
  assert.deepEqual(splitVersion(`hero.${hero}.webp`), { stem: 'hero.webp', hash: hero })
  assert.deepEqual(splitVersion('a.b.12345678.PNG'), { stem: 'a.b.PNG', hash: '12345678' })
  for (const plain of ['hero.webp', 'hero.1a2b3c.webp', 'hero.1a2b3c4d5.webp', 'hero.1A2B3C4D.webp', 'hero.1a2b3c4d.js', 'hero.1a2b3c4d']) {
    assert.equal(splitVersion(plain), null, plain)
  }
  assert.equal(versionedName('hero.webp', '1a2b3c4d'), 'hero.1a2b3c4d.webp')
  assert.equal(versionedName('a.b.JPG', '1a2b3c4d'), 'a.b.1a2b3c4d.JPG')
})

test('a versioned address leads to the file it stands for', () => {
  assert.equal(realFile(join(site, 'a/img', `hero.${hero}.webp`)), join(site, 'a/img/hero.webp'))
  assert.equal(realFile(join(site, 'a/img', `hero.${'0'.repeat(8)}.webp`)), join(site, 'a/img/hero.webp')) // any hash: the host doesn't check it
  assert.equal(realFile(join(site, 'a/img/hero.webp')), join(site, 'a/img/hero.webp'))
  const gone = join(site, 'a/img', `gone.${hero}.webp`)
  assert.equal(realFile(gone), gone) // no such file: unchanged, so "does it exist" says no
})

test('every place a page names a picture gets the version', () => {
  const html = `<!doctype html><html><head>
<meta property="og:image" content="https://vgraphics.gr/a/img/hero.webp">
<meta name="twitter:image" content="https://vgraphics.gr/a/img/hero.webp">
<link rel="icon" href="/favicon.ico">
<link rel="preload" as="image" href="/a/img/hero.webp" imagesrcset="/a/img/hero.webp 1x, /a/img/hero.webp 2x">
<script type="application/ld+json">{"image":["https://vgraphics.gr/a/img/hero.webp"],"logo":"https://vgraphics.gr/img/logo.svg"}</script>
<style>.band{background:url("/a/img/hero.webp") center / cover}</style>
</head><body>
<picture><source type="image/webp" srcset="img/hero.webp 480w, /a/img/my%20pic.png 960w"><img src="img/hero.webp" alt="a hero"></picture>
<div style="--art: url(/a/img/hero.webp); background:url( '/img/logo.svg' )"></div>
<a href="/a/img/hero.webp" data-full='/a/img/hero.webp'>full size</a>
</body></html>`
  const out = versionImages(html, ctx)
  const h = `hero.${hero}.webp`
  assert.ok(out.includes(`<meta property="og:image" content="https://vgraphics.gr/a/img/${h}">`))
  assert.ok(out.includes(`<meta name="twitter:image" content="https://vgraphics.gr/a/img/${h}">`))
  assert.ok(out.includes(`<link rel="icon" href="/favicon.${sha8('ico')}.ico">`))
  assert.ok(out.includes(`href="/a/img/${h}" imagesrcset="/a/img/${h} 1x, /a/img/${h} 2x"`))
  assert.ok(out.includes(`"image":["https://vgraphics.gr/a/img/${h}"],"logo":"https://vgraphics.gr/img/logo.${sha8('<svg/>')}.svg"`))
  assert.ok(out.includes(`.band{background:url("/a/img/${h}") center / cover}`))
  assert.ok(out.includes(`srcset="img/${h} 480w, /a/img/my%20pic.${pic}.png 960w"`))
  assert.ok(out.includes(`<img src="img/${h}" alt="a hero">`))
  assert.ok(out.includes(`style="--art: url(/a/img/${h}); background:url( '/img/logo.${sha8('<svg/>')}.svg' )"`))
  assert.ok(out.includes(`href="/a/img/${h}" data-full='/a/img/${h}'`))
  assert.equal(out.replace(/\.[0-9a-f]{8}\.(webp|png|svg|ico)/g, '.$1'), html, 'only the versions were added')
})

test('what is not a local picture is left as it is', () => {
  const html = `<!-- <img src="/a/img/hero.webp"> -->
<img src="/a/img/gone.webp" alt="/a/img/hero.webp" title="img/hero.webp">
<img src="https://example.com/a/img/hero.webp"><img src="//cdn.example.com/hero.webp"><img src="data:image/png;base64,iVBORw0KGgo=">
<img src="/build/x.png"><img src="/a/img/hero.webp.txt"><script src="/a/img/hero.js"></script>
<p data-note="see a/img/hero.webp for the picture">see /a/img/hero.webp</p><meta name="description" content="The hero.webp picture, in full">
<p data-x="a>b"><img src="/a/img/hero.webp?x=1#f"></p>`
  const out = versionImages(html, ctx)
  assert.equal(out, html.replace('<img src="/a/img/hero.webp?x=1#f">', `<img src="/a/img/hero.${hero}.webp?x=1#f">`), 'a query and a fragment stay; a ">" in an attribute does not hide the tag')
})

test('a Unity build keeps its plain names, as the repos that release it write them', () => {
  assert.equal(versionImages('<img src="/build/x.png">', ctx), '<img src="/build/x.png">')
  assert.match(versionImages('<img src="/build/x.png">', { ...ctx, unityDirs: [] }), /\/build\/x\.[0-9a-f]{8}\.png/)
})

test('an address with the wrong version gets the current one, and a right one stays (the rewrite is idempotent)', () => {
  const stale = `<img src="/a/img/hero.${'0'.repeat(8)}.webp">`
  const once = versionImages(stale, ctx)
  assert.equal(once, `<img src="/a/img/hero.${hero}.webp">`)
  assert.equal(versionImages(once, ctx), once)
  const page = `<img src="/a/img/hero.webp"><img src="/a/img/my%20pic.png"><link href="/favicon.ico">`
  const first = versionImages(page, ctx)
  assert.equal(versionImages(first, ctx), first)
})

test('a relative address is read from the page that names it', () => {
  assert.equal(versionImages('<img src="img/hero.webp">', { ...ctx, file: 'a/index.html' }), `<img src="img/hero.${hero}.webp">`)
  assert.equal(versionImages('<img src="../../img/logo.svg">', { ...ctx, file: 'a/deep/index.html' }), `<img src="../../img/logo.${sha8('<svg/>')}.svg">`)
  assert.equal(versionImages('<img src="../img/logo.svg">', { ...ctx, file: 'a/deep/index.html' }), '<img src="../img/logo.svg">', 'a/img/logo.svg is no file')
  // Without the page's own path there is no way to tell where it points: left alone.
  assert.equal(versionImages('<img src="img/hero.webp">', { root: site, unityDirs: [] }), '<img src="img/hero.webp">')
})

test('imageRefs and the check-site message name what is missing and the tool to run', () => {
  const html = `<img src="/a/img/hero.webp"><img src="/a/img/hero.${hero}.webp"><img src="/a/img/my%20pic.${'1'.repeat(8)}.png"><img src="/a/img/gone.webp">`
  const refs = imageRefs(html, ctx)
  assert.deepEqual(refs.map((r) => [r.ref, r.state, r.want]), [
    ['/a/img/hero.webp', 'unversioned', `/a/img/hero.${hero}.webp`],
    [`/a/img/my%20pic.${'1'.repeat(8)}.png`, 'stale', `/a/img/my%20pic.${pic}.png`],
  ])
  const [message, ...more] = imageVersionProblems(html, ctx)
  assert.equal(more.length, 0)
  assert.match(message, /^2 picture addresses without the file's current version \(1 stale: the picture changed\)/)
  assert.match(message, /\/a\/img\/hero\.webp should be \/a\/img\/hero\.[0-9a-f]{8}\.webp/)
  assert.match(message, /node tools\/version-images\.mjs/)
  assert.match(message, /build-pages\.mjs, build-wiki\.mjs or build-devlog\.mjs/)
  assert.deepEqual(imageVersionProblems(versionImages(html, ctx), ctx), [])
  assert.match(imageVersionProblems('<img src="/a/img/hero.webp">', ctx)[0], /^1 picture address without/)
})

test('a picture that changed makes its old address stale', () => {
  put('a/img/moving.webp', 'first')
  const html = versionImages('<img src="/a/img/moving.webp">', ctx)
  assert.deepEqual(imageVersionProblems(html, ctx), [])
  put('a/img/moving.webp', 'second, longer so the file stamp changes too')
  const problems = imageVersionProblems(html, ctx)
  assert.equal(problems.length, 1)
  assert.match(problems[0], /1 stale: the picture changed/)
  assert.equal(versionImages(html, ctx), `<img src="/a/img/moving.${sha8('second, longer so the file stamp changes too')}.webp">`)
})

test('code is versioned with versionCode and counted by codeImageRefs', () => {
  const css = '.a{cursor:url("/img/logo.svg") 3 2,auto}.b{background:url(/a/img/hero.webp)}.c{background:url(/nowhere.png)}'
  assert.equal(codeImageRefs(css, ctx).length, 2)
  const out = versionCode(css, ctx)
  assert.ok(out.includes(`url("/img/logo.${sha8('<svg/>')}.svg")`))
  assert.ok(out.includes(`url(/a/img/hero.${hero}.webp)`))
  assert.ok(out.includes('url(/nowhere.png)'))
  assert.equal(codeImageRefs(out, ctx).length, 0)
  assert.equal(codeImageRefs('const icons = { a: "/a/img/hero.webp", b: `/img/logo.svg` }', ctx).length, 2)
  assert.equal(codeImageRefs('// hero.webp is drawn from a/img/hero.webp', ctx).length, 0, 'a comment names no address')
})

test('the shrink-only list of code that names pictures', () => {
  const listed = [
    { path: 'assets/a.js', owner: 'Platform coordinator', why: 'a script writes the address' },
    { path: 'hub/assets/', owner: 'VHub coordinator', why: 'built bundles' },
  ]
  assert.deepEqual(imageGapProblems([['assets/a.js', 1], ['hub/assets/x-1.js', 2], ['hub/assets/y-2.js', 1]], listed), [])
  // A file the list doesn't cover fails, naming where to list it.
  const unlisted = imageGapProblems([['assets/a.js', 1], ['hub/assets/x-1.js', 2], ['assets/b.css', 3]], listed)
  assert.equal(unlisted.length, 1)
  assert.equal(unlisted[0][0], 'assets/b.css')
  assert.match(unlisted[0][1], /names 3 local pictures in code.*tools\/image-version-known-gaps\.json/)
  // An entry that no longer names a picture (fixed, or the file is gone) fails until it is removed, so the list only shrinks.
  const fixed = imageGapProblems([['assets/a.js', 1]], listed)
  assert.deepEqual(fixed, [['hub/assets/', 'is listed in tools/image-version-known-gaps.json but names no unversioned local picture now: remove the entry']])
  // Every entry says who owns it and why.
  assert.equal(imageGapProblems([['assets/a.js', 1]], [{ path: 'assets/a.js' }])[0][0], 'assets/a.js')
  assert.match(imageGapProblems([], [{ owner: 'x', why: 'y' }])[0][1], /names its path, its owner and why/)
  // A folder entry is a prefix of whole folders: "hub/assets/" is not "hub/assets2.js".
  assert.equal(imageGapProblems([['hub/assets2.js', 1]], listed).filter(([f]) => f === 'hub/assets2.js').length, 1)
})

test('versionFile writes a page once, keeps its line endings, and does nothing the second time', () => {
  put('a/index.html', '<img src="/a/img/hero.webp">\r\n<img src="/img/logo.svg">\r\n')
  assert.equal(versionFile('a/index.html', { root: site, unityDirs: ['build'] }), 2)
  assert.equal(readFileSync(join(site, 'a/index.html'), 'utf8'), `<img src="/a/img/hero.${hero}.webp">\r\n<img src="/img/logo.${sha8('<svg/>')}.svg">\r\n`)
  assert.equal(versionFile('a/index.html', { root: site, unityDirs: ['build'] }), 0)
})
