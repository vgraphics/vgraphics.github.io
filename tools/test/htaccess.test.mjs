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
