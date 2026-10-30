// Unity WebGL pages (tools/lib/unity-pages.mjs; George, 30 Oct 2026: "Unity and browser must use unity too. We dont want
// to have 2 code bases."): which pages are Unity's, where their framework is, and the rules every one is held to, each
// failing with its own name: play-alone, legal-footer, no-select, analytics, loading-bar, source-maps and noindex.
// Then Exitwise's play page as it is served, which keeps all of them but the shared bar (check-site's OWN_BAR).
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'
import { isDoor, isUnityPage, unityFramework, unityPageProblems } from '../lib/unity-pages.mjs'

// A Unity page as a WebGL template on the shared pieces writes it: the game, its loader with the shared bar, the bar
// with the About link and the short legal line.
const PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/assets/cursors.css">
    <link rel="stylesheet" href="/assets/startup/loading-bar.css">
    <script src="/assets/no-select.js" defer></script>
    <style>
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
      #loader-bar { --vg-bar-track: #1F1F22; }
    </style>
  </head>
  <body>
    <canvas id="unity-canvas"></canvas>
    <div id="loader"><div id="loader-bar" class="vg-bar"></div><div id="loader-status">Loading</div></div>
    <footer><a href="/palermo/">&larr; Palermo Noir</a><a href="/palermo/about/">About</a><span class="legal">&copy; 2026 VGraphics</span></footer>
    <script src="/assets/startup/loading-bar.js"></script>
    <script src="Build/web.loader.js"></script>
    <script>
      var bar = VGLoadingBar(document.querySelector("#loader-bar"), { colour: "#B3122E" });
      createUnityInstance(document.querySelector("#unity-canvas"), {
        dataUrl: "Build/web.data",
        frameworkUrl: "Build/web.framework.js",
        codeUrl: "Build/web.wasm",
      }, function (progress) { bar.show(progress / 0.9); });
    </script>
  </body>
</html>`
// The game's framework with its analytics bridge (as Exitwise's ArrowPuzzleAnalytics.jslib builds into it).
const FRAMEWORK = `var Module = {};
window.addEventListener("error", function (e) { report(e.message) });
window.addEventListener("unhandledrejection", function (e) { report(String(e.reason)) });
function report(d) { window.gtag("event", "exception", { description: d, fatal: false }) }
script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);`
const FILES = ['index.html', 'Build/web.loader.js', 'Build/web.framework.js', 'Build/web.wasm', 'Build/web.data'].map((f) => `palermo/play/${f}`)

function problems(html = PAGE, { path = '/palermo/play/', framework = FRAMEWORK, files = FILES, texts = {} } = {}) {
  const text = (ref) => (ref in texts ? texts[ref] : ref === 'Build/web.framework.js' ? framework : files.includes(ref.replace(/^\//, '')) ? '' : null)
  return unityPageProblems(html, path, { text, files })
}
const rules = (found) => [...new Set(found.map(([rule]) => rule))]

test('a page is Unity\'s when its own script calls createUnityInstance()', () => {
  assert.equal(isUnityPage(PAGE), true)
  assert.equal(isUnityPage('<html><body><p>Built with createUnityInstance()</p><!-- <script>createUnityInstance(c)</script> --></body></html>'), false)
  assert.equal(isUnityPage('<html><body><script src="Build/web.loader.js"></script></body></html>'), false)
  for (const path of ['/palermo/tv/', '/palermo/join/', '/palermo/tv/index.html']) assert.equal(isDoor(path), true, path)
  for (const path of ['/palermo/play/', '/palermo/demo/', '/tv/', '/join/']) assert.equal(isDoor(path), false, path)
})

test('its framework, as the templates name it: a plain address, or Unity\'s own buildUrl + "/name"', () => {
  assert.equal(unityFramework(PAGE), 'Build/web.framework.js')
  const unitys = '<script>var buildUrl = "../unity/Build"; var config = { frameworkUrl: buildUrl + "/web.framework.js.br" }; createUnityInstance(canvas, config);</script>'
  assert.equal(unityFramework(unitys), '../unity/Build/web.framework.js.br')
})

test('the game alone, with the shared bar, its analytics, no source maps and the short legal line, passes', () => {
  assert.deepEqual(problems(), [])
})

test('play-alone: a page that scrolls, an About panel or no About link fails', () => {
  const scrolls = problems(PAGE.replace(' overflow: hidden;', ''))
  assert.deepEqual(rules(scrolls), ['play-alone'], scrolls.join('\n'))
  assert.match(scrolls[0][1], /scrolls: give html and body overflow: hidden/)
  const panel = problems(PAGE.replace('<footer>', '<main id="about"><h1>The party game</h1></main><footer>').replace('<a href="/palermo/about/">About</a>', ''))
  assert.deepEqual(rules(panel), ['play-alone'], panel.join('\n'))
  assert.ok(panel.some(([, m]) => m.includes('#about')) && panel.some(([, m]) => m.includes("doesn't link its About page")), panel.join('\n'))
})

test('a TV or join page: kept out of search, and it needs no About link', () => {
  const door = PAGE.replace('<a href="/palermo/about/">About</a>', '')
  assert.deepEqual(problems(door, { path: '/palermo/tv/' }).map(([rule]) => rule), ['noindex'])
  assert.deepEqual(problems(door.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n    <meta name="robots" content="noindex">'), { path: '/palermo/join/' }), [])
  assert.deepEqual(rules(problems(door)), ['play-alone'], 'a play page still needs it')
})

test('legal-footer: the company\'s numbers, or no "© <year> VGraphics", fail wherever the page is', () => {
  const full = problems(PAGE.replace('&copy; 2026 VGraphics', '© 2026 VGRAPHICS SINGLE MEMBER P.C. · G.E.MI. no. 181823306000 · VAT no. EL802736373'), { path: '/palermo/unity/' })
  assert.deepEqual(rules(full), ['legal-footer'], full.join('\n'))
  assert.deepEqual(rules(problems(PAGE.replace('&copy; 2026 VGraphics', ''))), ['legal-footer'])
})

test('no-select: a page that doesn\'t load /assets/no-select.js fails', () => {
  const found = problems(PAGE.replace('<script src="/assets/no-select.js" defer></script>', ''))
  assert.deepEqual(rules(found), ['no-select'])
  assert.match(found[0][1], /developer tools' keys/)
})

test('analytics: no Google Analytics, no error reports, or no framework to read fails', () => {
  assert.deepEqual(rules(problems(PAGE, { framework: FRAMEWORK.replace('googletagmanager.com', 'example.com') })), ['analytics'])
  for (const gone of ['"exception"', 'unhandledrejection', 'addEventListener("error"']) {
    const found = problems(PAGE, { framework: FRAMEWORK.replace(gone, '"x"') })
    assert.deepEqual(found.map(([rule]) => rule), ['analytics'], gone)
    assert.match(found[0][1], /reports no errors/)
  }
  assert.match(problems(PAGE, { framework: null })[0][1], /its framework Build\/web\.framework\.js is missing/)
  assert.match(problems(PAGE.replace('frameworkUrl: "Build/web.framework.js",', ''))[0][1], /names no framework/)
  // What the page itself sends counts too.
  const inPage = PAGE.replace('var bar =', 'window.addEventListener("error", r); addEventListener("unhandledrejection", r); function r() { gtag("event", "exception", {}) } var bar =')
  assert.deepEqual(problems(inPage, { framework: FRAMEWORK.split('\n')[4] }), [])
})

test('loading-bar: the shared bar\'s stylesheet, script and start are needed, and a bar of its own fails', () => {
  for (const gone of ['<link rel="stylesheet" href="/assets/startup/loading-bar.css">', '<script src="/assets/startup/loading-bar.js"></script>', 'var bar = VGLoadingBar(document.querySelector("#loader-bar"), { colour: "#B3122E" });']) {
    assert.deepEqual(rules(problems(PAGE.replace(gone, ''))), ['loading-bar'], gone)
  }
  const own = problems(PAGE.replace('#loader-bar {', '.bar-groove { overflow: hidden; } #loader-bar {').replace('class="vg-bar">', 'class="vg-bar"><div class="bar-track"></div>')
    .replace('var bar =', 'function loadingBar(root) {} var bar ='))
  assert.deepEqual(rules(own), ['loading-bar'])
  assert.match(own[0][1], /draws a loading bar of its own \(\.bar-groove, \.bar-track, loadingBar\(\)\)/)
  // Words about the bar in comments are not a bar.
  assert.deepEqual(problems(PAGE.replace('<canvas', '<!-- once the .bar-fill and its loadingBar() --><canvas').replace('#loader-bar {', '/* the .bar-groove is the shared one\'s */ #loader-bar {')), [])
})

test('source-maps: a .map file, debug symbols or a sourceMappingURL fail', () => {
  assert.deepEqual(rules(problems(PAGE, { files: [...FILES, 'palermo/play/Build/web.framework.js.map'] })), ['source-maps'])
  assert.deepEqual(rules(problems(PAGE, { files: [...FILES, 'palermo/play/Build/web.symbols.json.br'] })), ['source-maps'])
  assert.deepEqual(rules(problems(PAGE.replace('codeUrl:', 'symbolsUrl: "Build/web.symbols.json", codeUrl:'))), ['source-maps'])
  const mapped = problems(PAGE, { texts: { '/palermo/play/Build/web.loader.js': 'function f(){}\n//# sourceMappingURL=web.loader.js.map' } })
  assert.deepEqual(mapped, [['source-maps', 'palermo/play/Build/web.loader.js points to a source map (sourceMappingURL): build it without one']])
})

test('Exitwise\'s play page as it is served keeps every rule but the shared bar, which its template moves onto next', () => {
  const dir = new URL('../../exitwise/play/', import.meta.url)
  const html = readFileSync(new URL('index.html', dir), 'utf8')
  assert.equal(isUnityPage(html), true)
  const files = readdirSync(dir, { recursive: true }).map((f) => `exitwise/play/${f.replace(/\\/g, '/')}`).filter((f) => statSync(new URL(`../../${f}`, import.meta.url)).isFile())
  const text = (ref) => {
    const url = new URL(ref.startsWith('/') ? `../..${ref}` : ref, ref.startsWith('/') ? import.meta.url : dir)
    if (!existsSync(url)) return null
    const bytes = readFileSync(url)
    return /\.unityweb$/.test(ref) ? brotliDecompressSync(bytes).toString('utf8') : bytes.toString('utf8')
  }
  const found = unityPageProblems(html, '/exitwise/play/', { text, files })
  assert.deepEqual(found.filter(([rule]) => rule !== 'loading-bar'), [])
})
