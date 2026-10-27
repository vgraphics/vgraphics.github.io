// Brings the documents other repos own into the site and rewrites their pages: each product's privacy policy and
// Exitwise's map rules. A page.json "document" block names its source, from: { repo, path }: the repo is a folder
// beside the site's checkout ("Games", "Games/palermo"; a worktree of the site sits deeper, so a few levels up) and
// path the file in it. The copy is that file as committed on the repo's main (or --ref), unchanged, so a policy is
// edited and merged in its own repo first. Exitwise's policy also comes in with every exitwise-web release (the
// Deployer copies it from the games branch it ships).
// Usage: node tools/sync-documents.mjs                                   which copies differ from their sources
//        node tools/sync-documents.mjs <product> ... [--ref <branch>]    copies them in and rewrites their pages
// Then node tools/check-site.mjs, commit and push, and look at the live page.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { render } from './build-pages.mjs'
import { documents, root } from './lib/product.mjs'

function repo(name) {
  let up = root
  for (let i = 0; i < 5; i++) {
    up = dirname(up)
    if (existsSync(join(up, name, '.git'))) return join(up, name)
  }
  throw new Error(`the ${name} repo was not found beside the site`)
}

const args = process.argv.slice(2)
const at = args.indexOf('--ref')
const ref = at >= 0 ? args.splice(at, 2)[1] : 'main'
for (const d of documents()) {
  if (args.length && !args.includes(d.slug)) continue
  const where = `${d.from.repo} ${ref}:${d.from.path}`
  const file = d.file.replace(/\\/g, '/')
  const source = execFileSync('git', ['-C', repo(d.from.repo), 'show', `${ref}:${d.from.path}`])
  const copy = existsSync(join(root, d.file)) ? readFileSync(join(root, d.file)) : Buffer.alloc(0)
  const lf = (b) => b.toString('utf8').replace(/\r\n/g, '\n')
  if (lf(copy) === lf(source)) {
    console.log(`${file}: same as ${where}`)
  } else if (!args.length) {
    console.log(`${file}: differs from ${where}`)
  } else {
    writeFileSync(join(root, d.file), source)
    const page = render(d.slug, d.sub)
    writeFileSync(join(root, page.file), page.html)
    console.log(`${file}: copied from ${where}; ${page.file.replace(/\\/g, '/')} rewritten`)
  }
}
