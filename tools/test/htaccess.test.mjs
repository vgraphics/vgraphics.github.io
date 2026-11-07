// The site's .htaccess on Hostinger (tools/lib/htaccess.mjs): check-site fails when it is missing or lost a rule.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { directives, HTACCESS_RULES, htaccessProblems } from '../lib/htaccess.mjs'

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

test('indentation, CRLF and a byte-order mark make no difference', () => {
  assert.deepEqual(htaccessProblems('﻿' + site.replace(/\n/g, '\r\n').replace(/^/gm, '   ')), [])
  assert.ok(directives(site).length > HTACCESS_RULES.length)
})
