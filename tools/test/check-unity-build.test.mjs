// A Unity WebGL build another Pages repo serves (tools/check-unity-build.mjs; the master coordinator, 2 Nov 2026):
// Palermo Noir's at /vg--palermo-play/, which check-site never sees, held to the Unity pages' rules when the Deployer
// publishes it. A framed build (its frame pages carry the About link and the legal line) keeps the rest, and stays out
// of search at its own address; the same page served on the site itself would need its bar.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { unityBuildProblems } from '../check-unity-build.mjs'

// The build's page as a framed WebGL template writes it: the game, the shared bar, no-select, noindex, no bar of its own.
const PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex">
    <link rel="stylesheet" href="/assets/startup/loading-bar.css">
    <script src="/assets/no-select.js" defer></script>
    <style>html, body { margin: 0; height: 100%; overflow: hidden; }</style>
  </head>
  <body>
    <canvas id="unity-canvas"></canvas>
    <div id="loader"><div id="loader-bar" class="vg-bar"></div></div>
    <script src="/assets/startup/loading-bar.js"></script>
    <script src="Build/PalermoNoir.loader.js"></script>
    <script>
      var bar = VGLoadingBar(document.querySelector("#loader-bar"), { colour: "#B3122E" });
      createUnityInstance(document.querySelector("#unity-canvas"), {
        dataUrl: "Build/PalermoNoir.data.unityweb",
        frameworkUrl: "Build/PalermoNoir.framework.js.unityweb",
        codeUrl: "Build/PalermoNoir.wasm.unityweb",
      }, function (progress) { bar.show(progress / 0.9); });
    </script>
  </body>
</html>`
// The framework with the analytics bridge, as Unity leaves it (not packed, so read as it is).
const FRAMEWORK = `window.addEventListener("error", function (e) { report(e.message) });
window.addEventListener("unhandledrejection", function (e) { report(String(e.reason)) });
function report(d) { window.gtag("event", "exception", { description: d, fatal: false }) }
script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;`

function build(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'unity-build-'))
  const all = { 'index.html': PAGE, 'Build/PalermoNoir.loader.js': 'loader', 'Build/PalermoNoir.framework.js.unityweb': FRAMEWORK, ...files }
  for (const [f, text] of Object.entries(all)) {
    if (text === null) continue
    mkdirSync(join(dir, f, '..'), { recursive: true })
    writeFileSync(join(dir, f), text)
  }
  return dir
}
const rules = (found) => [...new Set(found.map(([rule]) => rule))]

test('a framed build at /vg--palermo-play/ and its preview, on the shared pieces, out of search, passes', () => {
  assert.deepEqual(unityBuildProblems(build(), '/vg--palermo-play/'), [])
  assert.deepEqual(unityBuildProblems(build(), '/vg--palermo-play/preview/'), [])
})

test('it fails each rule by name: noindex, source maps, analytics, the loading bar, no-select, scrolling', () => {
  assert.deepEqual(rules(unityBuildProblems(build({ 'index.html': PAGE.replace('<meta name="robots" content="noindex">', '') }), '/vg--palermo-play/')), ['noindex'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'Build/PalermoNoir.loader.js.map': '{}' }), '/vg--palermo-play/')), ['source-maps'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'Build/PalermoNoir.loader.js': 'x\n//# sourceMappingURL=x.map' }), '/vg--palermo-play/')), ['source-maps'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'Build/PalermoNoir.framework.js.unityweb': 'var Module = {};' }), '/vg--palermo-play/')), ['analytics'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'index.html': PAGE.replace('<script src="/assets/startup/loading-bar.js"></script>', '') }), '/vg--palermo-play/')), ['loading-bar'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'index.html': PAGE.replace('<script src="/assets/no-select.js" defer></script>', '') }), '/vg--palermo-play/')), ['no-select'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'index.html': PAGE.replace(' overflow: hidden;', '') }), '/vg--palermo-play/')), ['play-alone'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'index.html': PAGE.replace('<canvas', '<p>VAT no. EL802736373</p><canvas') }), '/vg--palermo-play/')), ['legal-footer'])
})

test('the same page served on the site itself, unframed, needs its bar: the About link and the legal line', () => {
  assert.deepEqual(rules(unityBuildProblems(build(), '/palermo/play/')), ['play-alone', 'legal-footer'])
})

test('no page, or a page that is no Unity page, says so', () => {
  assert.deepEqual(rules(unityBuildProblems(build({ 'index.html': null }), '/vg--palermo-play/')), ['unity'])
  assert.deepEqual(rules(unityBuildProblems(build({ 'index.html': '<html><body></body></html>' }), '/vg--palermo-play/')), ['unity'])
})
