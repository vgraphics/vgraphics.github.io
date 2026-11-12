// The site's .htaccess on Hostinger (tools/lib/htaccess.mjs): check-site fails when it is missing or lost a rule.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { directives, HTACCESS_RULES, htaccessProblems } from '../lib/htaccess.mjs'
import { IMAGE_EXTENSIONS } from '../lib/image-version.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const site = readFileSync(join(root, '.htaccess'), 'utf8')

test("the site's .htaccess keeps every rule", () => {
  assert.deepEqual(htaccessProblems(site), [])
})

test('a missing file is a problem', () => {
  assert.equal(htaccessProblems(undefined).length, 1)
  assert.match(htaccessProblems(undefined)[0], /^missing/)
})

test('each rule lost is named, and a commented-out rule counts as lost', () => {
  const hsts = 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"'
  assert.deepEqual(htaccessProblems(site.replace(hsts, '')), [`lost HSTS: ${hsts}`])
  assert.deepEqual(htaccessProblems(site.replace(hsts, `# ${hsts}`)), [`lost HSTS: ${hsts}`])
  const tiles = 'Header set Access-Control-Allow-Headers "Range"'
  assert.match(htaccessProblems(site.replace(tiles, ''))[0], /^lost the map tiles' cache and CORS/)
})

test("every Cache-Control says no-transform, or Hostinger's CDN rewrites the files", () => {
  const added = 'Header always set Cache-Control "max-age=60"'
  assert.deepEqual(htaccessProblems(`${site}\n<FilesMatch "\\.png$">\n  ${added}\n</FilesMatch>\n`), [
    `a Cache-Control without no-transform (Hostinger's CDN would re-encode images and minify text): ${added}`,
  ])
  const problems = htaccessProblems(site.replace('"public, max-age=600, no-transform"', '"public, max-age=600"'))
  assert.equal(problems.length, 2)
  assert.match(problems[0], /^lost everything else cached ten minutes/)
  assert.match(problems[1], /^a Cache-Control without no-transform .*: Header set Cache-Control "public, max-age=600"$/)
  // Unsetting one needs no value.
  assert.deepEqual(htaccessProblems(`${site}\nHeader unset Cache-Control\n`), [])
})

test('scripts are typed text/javascript (LiteSpeed would send application/x-javascript)', () => {
  assert.deepEqual(htaccessProblems(site.replace('AddType text/javascript .js .mjs', '')), [
    'lost scripts as text/javascript (LiteSpeed would send application/x-javascript): AddType text/javascript .js .mjs',
  ])
})

// Versioned pictures (tools/lib/image-version.mjs): name.<hash>.ext is served from name.ext, cached for a year.
const pictureRule = directives(site).find((l) => l.startsWith('RewriteRule ') && l.includes('[0-9a-f]{8}'))
const [, rewritePattern, rewriteTo, rewriteFlags] = pictureRule.match(/^RewriteRule (\S+) (\S+) \[(.+)\]$/)

test('a versioned picture address is mapped to its file, and nothing else is', () => {
  const rule = new RegExp(rewritePattern, 'i')
  const map = (path) => (rule.test(path) ? path.replace(rule, rewriteTo) : null)
  assert.equal(map('img/hero.1a2b3c4d.webp'), 'img/hero.webp')
  assert.equal(map('exitwise/img/key-art-tall-480.6bca483c.avif'), 'exitwise/img/key-art-tall-480.avif')
  assert.equal(map('a.b.c/file.name.0123abcd.JPG'), 'a.b.c/file.name.JPG')
  assert.equal(map('favicon.203886c6.ico'), 'favicon.ico')
  for (const plain of ['img/hero.webp', 'img/hero.1a2b3c.webp', 'img/hero.1a2b3c4d5.webp', 'img/hero.1a2b3c4d.webp.txt', 'index.html', 'app.1a2b3c4d.js', 'style.1a2b3c4d.css']) {
    assert.equal(map(plain), null, `${plain} is not a versioned picture`)
  }
  // A file that really has such a name is left alone, and the rewrite marks the request for the year-long Cache-Control.
  assert.ok(directives(site).includes('RewriteCond %{REQUEST_FILENAME} !-f'))
  assert.match(rewriteFlags, /\bE=VERSIONED_IMAGE:1\b/)
})

test("the picture types in .htaccess are the ones the site's versioning writes", () => {
  const typeList = (line) => line.match(/\((avif\|[^)]+)\)/)[1]
  const lines = directives(site).filter((l) => l.includes('[0-9a-f]{8}') && /^(RewriteRule|SetEnvIfNoCase) /.test(l))
  assert.equal(lines.length, 2)
  for (const line of lines) assert.equal(typeList(line), IMAGE_EXTENSIONS)
})

test('only a versioned address is cached for a year: every other long Cache-Control is on a FilesMatch or env= the mark', () => {
  let inside = 0
  const loose = []
  for (const line of directives(site)) {
    if (/^<FilesMatch\b/.test(line)) inside++
    else if (/^<\/FilesMatch>/.test(line)) inside--
    else if (/^Header .*Cache-Control .*max-age=31536000/.test(line) && !inside && !/ env=(REDIRECT_)?VERSIONED_IMAGE$/.test(line)) loose.push(line)
  }
  assert.deepEqual(loose, [], 'a year-long Cache-Control outside a FilesMatch must wait for env=VERSIONED_IMAGE, or every picture would get it')
  const marked = directives(site).filter((l) => / env=/.test(l))
  assert.deepEqual(marked.map((l) => l.match(/ env=(\S+)$/)[1]).sort(), ['REDIRECT_VERSIONED_IMAGE', 'VERSIONED_IMAGE'])
  // The ten minutes that every unversioned picture keeps is still the default, before the marked lines.
  const all = directives(site)
  assert.ok(all.indexOf('Header set Cache-Control "public, max-age=600, no-transform"') < all.findIndex((l) => / env=VERSIONED_IMAGE$/.test(l)))
})

test('losing the versioned-picture rules is named', () => {
  const rewrite = directives(site).find((l) => l.startsWith('RewriteRule ^(.+)'))
  assert.match(htaccessProblems(site.replace(rewrite, ''))[0], /^lost versioned pictures \(name\.<hash>\.ext\) served from name\.ext/)
  const year = 'Header set Cache-Control "public, max-age=31536000, immutable, no-transform" env=VERSIONED_IMAGE'
  assert.match(htaccessProblems(site.replace(year, ''))[0], /^lost versioned pictures cached for a year/)
  assert.match(htaccessProblems(site.replace(/^SetEnvIfNoCase .*$/m, ''))[0], /^lost versioned pictures cached for a year/)
})

test('indentation, CRLF and a byte-order mark make no difference', () => {
  assert.deepEqual(htaccessProblems('﻿' + site.replace(/\n/g, '\r\n').replace(/^/gm, '   ')), [])
  assert.ok(directives(site).length > HTACCESS_RULES.length)
})

// One hop for every address Google keeps (Search Console, 12 Nov 2026): www and http go straight to https://vgraphics.gr,
// and the old WordPress addresses are 301s, before the "no PHP" rule would answer 403.
const redirects = directives(site)
  .map((l) => l.match(/^RewriteRule (\S+) (https:\/\/vgraphics\.gr\/\S*) \[([^\]]*R=301[^\]]*)\]$/))
  .filter(Boolean)
  .map(([, pattern, to]) => ({ rule: new RegExp(pattern), to }))
const firstRedirect = (path) => redirects.find((r) => r.rule.test(path))?.to
const wordpress = HTACCESS_RULES.find((r) => r.what.startsWith('the old WordPress addresses'))

test('the old WordPress addresses and the old key-art addresses go to their pages in one 301', () => {
  assert.equal(firstRedirect('index.php/contact/'), 'https://vgraphics.gr/#contact')
  assert.equal(firstRedirect('index.php/contact'), 'https://vgraphics.gr/#contact')
  assert.equal(firstRedirect('index.php/contact/index.html'), 'https://vgraphics.gr/#contact')
  assert.equal(firstRedirect('index.php/about-2/'), 'https://vgraphics.gr/company/')
  assert.equal(firstRedirect('index.php/about-2/index.html'), 'https://vgraphics.gr/company/')
  for (const old of ['index.php', 'index.php/', 'index.php/category/news/', 'index.php/feed/', 'index.php/2019/05/hello-world/']) {
    assert.equal(firstRedirect(old), 'https://vgraphics.gr/', old)
  }
  assert.equal(firstRedirect('speedometer-wallpaper/img/key-art'), 'https://vgraphics.gr/speedometer-wallpaper/img/key-art-1920.jpg')
  assert.equal(firstRedirect('speedometer-wallpaper/img/key-art-tall'), 'https://vgraphics.gr/speedometer-wallpaper/img/key-art-tall-1080.jpg')
  for (const page of ['', 'exitwise/', 'company/', 'speedometer-wallpaper/img/key-art-1920.jpg', 'exitwise/index.php.txt']) {
    assert.equal(firstRedirect(page), undefined, `${page} is not an old address`)
  }
})

test('the key-art targets are files the site serves', async () => {
  const { existsSync } = await import('node:fs')
  for (const { to } of redirects.filter((r) => /\.jpg$/.test(r.to))) assert.ok(existsSync(join(root, to.replace('https://vgraphics.gr/', ''))), to)
})

test("the old WordPress folder of stand-in pages is gone: the 301s answer for it", async () => {
  const { existsSync } = await import('node:fs')
  assert.ok(!existsSync(join(root, 'index.php')))
})

test('rules out of order are named: www after HTTPS takes two hops, index.php after "no PHP" is a 403', () => {
  const www = 'RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L,NE]'
  const https = 'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L,NE]'
  const swapped = site.replace(www, '@@WWW@@').replace(https, www).replace('@@WWW@@', https)
  assert.deepEqual(htaccessProblems(swapped), ['out of order: www before the HTTPS redirect, or http://www. takes two hops'])
  const wp = wordpress.lines[2]
  assert.ok(site.includes(wp), 'the test names the line .htaccess has')
  const late = site.replace(wp, '').replace("# Unity's pre-compressed files", `${wp}\n# Unity's pre-compressed files`)
  assert.deepEqual(htaccessProblems(late), ['out of order: the old WordPress redirects before the "no PHP" rule, or /index.php answers 403'])
})

test('losing the one-hop www rule or the WordPress redirects is named', () => {
  assert.match(htaccessProblems(site.replace('RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L,NE]', ''))[0], /^lost www to https:\/\/ on the bare domain in one hop/)
  for (const line of wordpress.lines) {
    assert.ok(site.includes(line), `the test names the line .htaccess has: ${line}`)
    assert.match(htaccessProblems(site.replace(line, ''))[0] ?? '', /^lost the old WordPress addresses/)
  }
})

test("the old query is dropped (QSD), so it never lands after the #contact fragment", () => {
  for (const line of wordpress.lines) assert.match(line, /\[[^\]]*\bQSD\b[^\]]*\]$/, line)
})

test('a folder with no page answers 404, and only a folder: files keep being served', () => {
  const all = directives(site)
  const at = all.indexOf('RewriteRule ^ - [R=404,L]')
  assert.deepEqual(all.slice(at - 2, at), ['RewriteCond %{REQUEST_FILENAME} -d', 'RewriteCond %{REQUEST_FILENAME}/index.html !-f'])
})
