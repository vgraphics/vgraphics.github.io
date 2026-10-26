// Each preview picture's blurhash (tools/blurhash.py), by the picture's content: kept in tools/blurhash.json
// ({ sha1 of the file: hash }), so a build runs Python only for pictures it hasn't seen. The pages write it on the
// picture (data-hash) and assets/blurhash.js paints it while the picture loads (George, 26 Oct 2026: "Use blurhash.
// General rules for all pages.").
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './product.mjs'

const CACHE = join(root, 'tools', 'blurhash.json')
let cache = null

// { file: hash } for files given relative to the repo root (a leading / is the site's root, the same place)
export function blurhashes(files) {
  cache ??= existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
  const rel = (f) => f.replace(/^\//, '')
  const sha = new Map(files.map((f) => [f, createHash('sha1').update(readFileSync(join(root, rel(f)))).digest('hex')]))
  const missing = [...new Set(files.filter((f) => !(sha.get(f) in cache)))]
  if (missing.length) {
    const got = JSON.parse(execFileSync('python', [join(root, 'tools', 'blurhash.py')], { cwd: root, input: missing.map(rel).join('\n'), encoding: 'utf8', maxBuffer: 1 << 24 }))
    for (const f of missing) cache[sha.get(f)] = got[rel(f)]
    writeFileSync(CACHE, JSON.stringify(Object.fromEntries(Object.entries(cache).sort()), null, 1) + '\n')
  }
  return Object.fromEntries(files.map((f) => [f, cache[sha.get(f)]]))
}

export const blurhash = (file) => blurhashes([file])[file]
