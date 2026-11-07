// George's admin page, /admin/ (tools/lib/admin.mjs): a page kept out of search passes as a product's screen with the
// short legal line and no trade marks; one search engines may index or follow fails; sitemap.xml never lists it,
// noindex or not (tools/build-sitemap.mjs).
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { adminProblems, inAdminFolder, isAdminPage } from '../lib/admin.mjs'
import { isProductScreen, legalProblems } from '../lib/legal.mjs'
import { takesMarks } from '../lib/marks.mjs'
import { listed } from '../build-sitemap.mjs'

const NOINDEX = '<meta name="robots" content="noindex, nofollow">'
// The admin app's page as Vite writes it for /admin/, on the site's shared pieces.
const page = (robots = NOINDEX) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin · VGraphics</title>
  ${robots}
  <link rel="canonical" href="https://vgraphics.gr/admin/">
  <link rel="stylesheet" href="/assets/cursors.css">
  <script src="/assets/no-select.js" defer></script>
  <script type="module" crossorigin src="/admin/assets/index-AbC123xy.js"></script>
</head>
<body><div id="app"></div><footer>© 2026 VGraphics</footer></body>
</html>
`

test('the admin page is a product screen, with the short legal line and no trade marks', () => {
  for (const path of ['/admin/', '/admin/index.html']) {
    assert.equal(isAdminPage(path), true, path)
    assert.equal(isProductScreen(path), true, path)
    assert.equal(takesMarks(path), false, path)
  }
  assert.deepEqual(legalProblems('/admin/', page()), [])
  // The website's line, the company's details or no line at all are not a screen's.
  assert.ok(legalProblems('/admin/', page().replace('<footer>© 2026 VGraphics</footer>', '')).length)
  assert.ok(legalProblems('/admin/', page().replace('© 2026 VGraphics', '© 2026 VGraphics · G.E.MI. no. 181823306000')).length)
})

test('an admin page kept out of search passes, and one search engines may index or follow fails', () => {
  assert.deepEqual(adminProblems('/admin/', page()), [])
  assert.deepEqual(adminProblems('/admin/', page('<meta name="robots" content="NOFOLLOW,noindex">')), [])
  const want = ['not kept out of search: the admin page\'s head needs <meta name="robots" content="noindex, nofollow">']
  assert.deepEqual(adminProblems('/admin/', page('<meta name="robots" content="noindex">')), want)
  assert.deepEqual(adminProblems('/admin/', page('<meta name="robots" content="nofollow">')), want)
  assert.deepEqual(adminProblems('/admin/', page('')), want)
  // Other pages are the other rules' (the hub's own pages are indexed).
  assert.deepEqual(adminProblems('/hub/', page('')), [])
  assert.deepEqual(adminProblems('/exitwise/', page('')), [])
})

test('sitemap.xml never lists the admin page, noindex or not', () => {
  for (const file of ['admin/index.html', join('admin', 'index.html'), 'admin/screens/index.html']) {
    assert.equal(inAdminFolder(file), true, file)
    assert.equal(listed(file, page()), false, file)
    assert.equal(listed(file, page('')), false, `${file} without noindex`)
  }
  // Every other page is listed unless it is noindex.
  assert.equal(listed('exitwise/index.html', page('')), true)
  assert.equal(listed('hub/index.html', page('')), true)
  assert.equal(listed('404.html', page('<meta name="robots" content="noindex">')), false)
  for (const file of ['administration/index.html', 'exitwise/admin/index.html', 'hub/admin.html']) assert.equal(inAdminFolder(file), false, file)
})
