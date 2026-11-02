// Holds a Unity WebGL build that another Pages repo serves under vgraphics.gr to the Unity pages' rules
// (tools/lib/unity-pages.mjs), as check-site holds the Unity pages this site serves. check-site never sees such a build,
// so the Deployer runs this on the build's folder before it publishes it (palermo-unity-web's verify, for
// vgraphics/vg--palermo-play; the master coordinator, 2 Nov 2026). A build in a folder of SERVED_ELSEWHERE
// (tools/lib/frames.mjs) is framed: its frame pages' bar holds its About link and legal line, and its own address stays
// out of search.
// Usage: node tools/check-unity-build.mjs <folder> <path>   (path: where it is served, "/vg--palermo-play/")
// Prints each problem as "[rule] message" and exits 1 when there is one.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'
import { SERVED_ELSEWHERE } from './lib/frames.mjs'
import { root } from './lib/product.mjs'
import { isUnityPage, unityPageProblems } from './lib/unity-pages.mjs'

const filesOf = (dir, at = '') =>
  readdirSync(join(dir, at), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesOf(dir, `${at}${e.name}/`) : [`${at}${e.name}`]))

// A file's text, unpacked as Unity packs it (gzip, or brotli in .br and .unityweb), or null when there is none.
function unpacked(file) {
  if (!existsSync(file) || !statSync(file).isFile()) return null
  const bytes = readFileSync(file)
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) return gunzipSync(bytes).toString('utf8')
  if (/\.(br|unityweb)$/i.test(file)) {
    try {
      return brotliDecompressSync(bytes).toString('utf8')
    } catch {}
  }
  return bytes.toString('utf8')
}

// What is wrong with the build in dir, served at path: a list of [rule, message], none when it keeps every rule. The
// page's files are named as the site would serve them ("/vg--palermo-play/Build/…"), the site's own (/assets/…) from
// this checkout.
export function unityBuildProblems(dir, path) {
  const page = join(dir, 'index.html')
  if (!existsSync(page)) return [['unity', `no index.html in ${dir}`]]
  const html = readFileSync(page, 'utf8')
  if (!isUnityPage(html)) return [['unity', 'index.html never calls createUnityInstance(): it is no Unity page']]
  const served = path.replace(/^\/|\/$/g, '')
  const text = (ref) => {
    const clean = decodeURIComponent(ref.replace(/[?#].*$/, ''))
    if (clean.startsWith(`/${served}/`)) return unpacked(join(dir, clean.slice(served.length + 2)))
    return unpacked(clean.startsWith('/') ? join(root, clean) : join(dir, clean))
  }
  const files = filesOf(dir).map((f) => `${served}/${f}`)
  return unityPageProblems(html, path, { text, files, framed: SERVED_ELSEWHERE.includes(served.split('/')[0]) })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [dir, path] = process.argv.slice(2)
  if (!dir || !/^\/.*\/$/.test(path ?? '')) {
    console.error('Usage: node tools/check-unity-build.mjs <folder> <path>, where it is served ("/vg--palermo-play/")')
    process.exit(2)
  }
  const problems = unityBuildProblems(dir, path)
  for (const [rule, message] of problems) console.log(`[${rule}] ${message}`)
  process.exit(problems.length ? 1 : 0)
}
