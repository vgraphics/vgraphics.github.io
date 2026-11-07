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

test('indentation, CRLF and a byte-order mark make no difference', () => {
  assert.deepEqual(htaccessProblems('﻿' + site.replace(/\n/g, '\r\n').replace(/^/gm, '   ')), [])
  assert.ok(directives(site).length > HTACCESS_RULES.length)
})
