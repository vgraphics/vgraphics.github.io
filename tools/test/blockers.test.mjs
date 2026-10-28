// Which of our files a blocker would drop (tools/lib/blockers.mjs, check-site's "blockers" rule). George, 27 Oct 2026:
// "Demo still not loading. Stays at 5% of loading." Palermo's consent-banner-<hash>.js was blocked by Fanboy's
// cookie-notice list, and the demo never started.
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { blockedBy, kindOf, readRules } from '../lib/blockers.mjs'

const rules = (...lines) => readRules(['! source A list', ...lines].join('\n'))
const blocked = (path, ...lines) => blockedBy(path, rules(...lines))?.text ?? null

test('the copy of the lists drops what George lost, and lets its new name through', () => {
  const copy = readRules(readFileSync(new URL('../blocker-rules.txt', import.meta.url), 'utf8'))
  assert.match(blockedBy('palermo/game/consent-banner-ClJut0TF.js', copy)?.list ?? '', /Fanboy/)
  assert.equal(blockedBy('palermo/game/part-ClJut0TF.js', copy), null)
})

test('a pattern matches anywhere in the address, and says which list it comes from', () => {
  const hit = blockedBy('palermo/game/consent-banner-ClJut0TF.js', rules('/consent-banner-'))
  assert.deepEqual([hit?.text, hit?.list], ['/consent-banner-', 'A list'])
  assert.equal(blocked('palermo/game/part-ClJut0TF.js', '/consent-banner-'), null)
})

test('^ is a separator, * anything and | an end', () => {
  assert.equal(blocked('assets/ads/x.js', '/ads^'), '/ads^')
  assert.equal(blocked('assets/adsense.js', '/ads^'), null)
  assert.equal(blocked('a/banner-big.webp', '/banner-*.webp'), '/banner-*.webp')
  assert.equal(blocked('a/track.js', 'track.js|'), 'track.js|')
  assert.equal(blocked('a/track.json', 'track.js|'), null)
})

test('a regular expression works, its own $ included', () => {
  assert.equal(blocked('a/consent_banner.js', '/\\/consent[-_]banner/'), '/\\/consent[-_]banner/')
  assert.equal(blocked('a/pixel.js', '/pixel\\.js$/'), '/pixel\\.js$/')
  assert.equal(blocked('a/pixel.js', '/\\/pixel/$image'), null)
})

test('a rule for another kind of file passes ours by', () => {
  assert.equal(blocked('a/banner.js', '/banner.$image'), null)
  assert.equal(blocked('a/banner.webp', '/banner.$image'), '/banner.$image')
  assert.equal(blocked('a/banner.js', '/banner.$~image'), '/banner.$~image')
  assert.equal(blocked('a/stats.json', '/stats.$xhr'), '/stats.$xhr')
})

test('a rule for another site, or only for third-party requests, never reaches ours', () => {
  assert.equal(blocked('a/consent-banner-x.js', '||example.com/consent-banner-'), null)
  assert.equal(blocked('a/consent-banner-x.js', '||cdn-*.example.net^'), null)
  assert.equal(blocked('a/x.js', 'email.example.it$image'), null)
  assert.equal(blocked('a/consent-banner-x.js', '/consent-banner-$third-party'), null)
  assert.equal(blocked('a/consent-banner-x.js', '/consent-banner-$domain=example.com'), null)
  assert.equal(blocked('a/consent-banner-x.js', '/consent-banner-$domain=~example.com'), '/consent-banner-$domain=~example.com')
  assert.equal(blocked('a/consent-banner-x.js', '/consent-banner-$domain=vgraphics.gr'), '/consent-banner-$domain=vgraphics.gr')
  assert.equal(blocked('a/consent-banner-x.js', '||vgraphics.gr/a/consent'), '||vgraphics.gr/a/consent')
  // A bare file name is no site name.
  assert.equal(blocked('a/ads.js', 'ads.js'), 'ads.js')
})

test('an exception lets a file through, and cosmetic rules and other actions never block', () => {
  assert.equal(blocked('a/consent-banner-ok.js', '/consent-banner-', '@@/consent-banner-ok'), null)
  assert.equal(blocked('a/x.js', 'vgraphics.gr##.banner', 'vgraphics.gr##+js(set-constant, x, 1)'), null)
  assert.equal(blocked('a/x.js', '/x.js$removeparam=y', '/x.js$csp=script-src none', '/x.js$popup'), null)
  assert.equal(blocked('a/x.js', '/x.js$redirect=noopjs'), '/x.js$redirect=noopjs')
})

test('only files a page loads count', () => {
  assert.equal(kindOf('palermo/demo/index.html'), null)
  assert.equal(blocked('consent-banner-x/index.html', '/consent-banner-'), null)
  assert.deepEqual(['a.mjs', 'a.css', 'a.avif', 'a.mp3', 'a.woff2', 'a.wasm'].map(kindOf), ['script', 'stylesheet', 'image', 'media', 'font', 'xhr'])
})
