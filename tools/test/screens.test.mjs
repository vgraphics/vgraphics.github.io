// A product's TV and join pages (tools/lib/screens.mjs; George, 10 Nov 2026: "Palermo tv button is not working", which
// Palermo Noir's old-TV page, /palermo/tv-classic/, answers): one list of folders, DOOR_FOLDERS, that the legal line, the
// Unity and frame pages' TV and join rules, the help-mail rule, check-site's noindex rule and sitemap.xml all follow, so a
// TV page is known to every one of them at once. Then the page as Palermo's palermo-web publishes it, through each rule.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { isProductScreen, legalProblems } from '../lib/legal.mjs'
import { helpMailProblems } from '../lib/mail-list.mjs'
import { DOOR_FOLDERS, doorProblems, inFolders, isDoor } from '../lib/screens.mjs'
import { isDoor as isDoorOfUnityPages } from '../lib/unity-pages.mjs'
import { listed } from '../build-sitemap.mjs'

// Palermo's old-TV page as palermo-web's build writes it (the palermo repo's web/tv-classic/index.html): noindex, its own
// canonical, no Unity, the short legal line in a footer of its own and no sign-up.
const NOINDEX = '<meta name="robots" content="noindex" />'
const classic = (robots = NOINDEX) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${robots}
    <title>Palermo Noir · TV</title>
    <link rel="canonical" href="https://vgraphics.gr/palermo/tv-classic/" />
    <script src="/assets/no-select.js" defer></script>
  </head>
  <body>
    <div id="app"></div>
    <footer id="party-legal" class="party-legal">&copy; 2026 VGraphics</footer>
  </body>
</html>
`

test('the doors are a product\'s TV, old-TV and join folders', () => {
  assert.deepEqual(DOOR_FOLDERS, ['tv', 'tv-classic', 'join'])
})

test('inFolders matches /<product>/<folder>/ and the pages in it, nothing else', () => {
  const inPlay = inFolders(['play'])
  for (const path of ['/exitwise/play/', '/exitwise/play/index.html', '/exitwise/play/Build/x.html']) assert.equal(inPlay(path), true, path)
  // the folder without its slash, a longer name, the company's own address, a deeper folder and another product's page
  for (const path of ['/exitwise/play', '/exitwise/playing/', '/play/', '/exitwise/wiki/play/', '/exitwise/', '/']) assert.equal(inPlay(path), false, path)
})

test('every door folder is a TV or join page to every rule, the company\'s own /tv/ and /join/ none', () => {
  const noSignUp = '<footer class="screen-foot">© 2026 VGraphics</footer>'
  const withSignUp = `<footer class="foot"><a href="/hub/support/">Help</a><form class="mail-list" novalidate></form></footer>`
  for (const folder of DOOR_FOLDERS) {
    for (const path of [`/palermo/${folder}/`, `/palermo/${folder}/index.html`, `/palermo/${folder}/room/`]) {
      assert.equal(isDoor(path), true, `isDoor ${path}`)
      assert.equal(isDoorOfUnityPages(path), true, `unity-pages isDoor ${path}`)
      assert.equal(isProductScreen(path), true, `isProductScreen ${path}`)
      assert.equal(legalProblems(path, `<footer>© 2026 VGraphics</footer>`).length, 0, `legal line ${path}`)
      assert.deepEqual(helpMailProblems(path, `<body><main></main>${noSignUp}</body>`), [], `help-mail ${path}`)
      assert.equal(helpMailProblems(path, `<body><main></main>${withSignUp}</body>`).length, 1, `a sign-up on ${path}`)
      assert.equal(listed(`palermo/${folder}/index.html`, classic('')), false, `sitemap ${path}`)
      assert.equal(doorProblems(path, classic('')).length, 1, `noindex ${path}`)
    }
    for (const path of [`/${folder}/`, `/${folder}/index.html`]) {
      assert.equal(isDoor(path), false, `isDoor ${path}`)
      assert.equal(isProductScreen(path), false, `isProductScreen ${path}`)
      assert.deepEqual(doorProblems(path, classic('')), [], `noindex ${path}`)
    }
  }
})

test('the other screens keep what they had: product screens that are no doors, and the look page still gets the footer rules', () => {
  for (const path of ['/exitwise/play/', '/palermo/demo/', '/palermo/demo/screen.html', '/speedometer-wallpaper/look/']) {
    assert.equal(isProductScreen(path), true, path)
    assert.equal(isDoor(path), false, path)
  }
  // the look page is a product screen but was never in the help-mail rule's list: unchanged
  const withSignUp = `<body><main></main><footer class="foot"><form class="mail-list" novalidate></form></footer></body>`
  assert.deepEqual(helpMailProblems('/speedometer-wallpaper/look/', withSignUp), ['the footer has no Help link to /hub/support/'])
})

test('Palermo\'s old-TV page, /palermo/tv-classic/, as it is published, passes every rule', () => {
  const path = '/palermo/tv-classic/'
  assert.equal(isProductScreen(path), true)
  assert.deepEqual(legalProblems(path, classic()), [])
  assert.deepEqual(helpMailProblems(path, classic()), [])
  assert.deepEqual(doorProblems(path, classic()), [])
})

test('noindex: a TV or join page must say so in its markup; a comment doesn\'t count; other pages are not asked', () => {
  const missing = ['is a TV or join page, which search engines must not list: add <meta name="robots" content="noindex">']
  assert.deepEqual(doorProblems('/palermo/tv-classic/', classic('')), missing)
  assert.deepEqual(doorProblems('/palermo/tv-classic/', classic(`<!-- ${NOINDEX} -->`)), missing)
  assert.deepEqual(doorProblems('/palermo/tv/', classic('')), missing)
  assert.deepEqual(doorProblems('/palermo/join/', classic('')), missing)
  assert.deepEqual(doorProblems('/palermo/tv-classic/', classic('<meta name="robots" content="noindex, nofollow">')), [])
  assert.deepEqual(doorProblems('/palermo/tv-classic/index.html', classic('')), missing)
  for (const path of ['/', '/tv/', '/join/', '/palermo/', '/palermo/play/', '/palermo/demo/', '/exitwise/play/']) assert.deepEqual(doorProblems(path, classic('')), [], path)
})

test('sitemap.xml never lists a TV or join page, noindex or not', () => {
  for (const file of ['palermo/tv-classic/index.html', join('palermo', 'tv-classic', 'index.html'), 'palermo/tv/index.html', 'palermo/join/index.html', join('hub', 'join', 'index.html')]) {
    assert.equal(listed(file, classic()), false, file)
    assert.equal(listed(file, classic('')), false, `${file} without noindex`)
  }
  // Other pages are listed unless they are noindex: the old-TV page's neighbours and the company's own /tv/ and /join/ among them.
  for (const file of ['palermo/index.html', 'palermo/about/index.html', 'palermo/demo/index.html', 'tv/index.html', 'join/index.html', 'palermo/tv-classics/index.html']) {
    assert.equal(listed(file, classic('')), true, file)
    assert.equal(listed(file, classic()), false, `${file} with noindex`)
  }
})
