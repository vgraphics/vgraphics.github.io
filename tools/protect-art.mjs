// Writes our rights into the site's pictures and songs before they are published (README "Rights in the files"):
//   node tools/protect-art.mjs                      the art not on the live site yet: the rights mark
//   node tools/protect-art.mjs --sign               ...and Content Credentials, signed as VGraphics
//   node tools/protect-art.mjs [--sign] <path>...   those files or folders (a masters repo's too)
//   node tools/protect-art.mjs --all [--sign]       every picture and song of ours on the site
//   node tools/protect-art.mjs --check [<path>...]  only lists what is missing, and exits 1 if anything is
// The rights mark goes in first: signing seals the file, so the mark can't be added to a signed file afterwards.
// The certificate and key stay in the Deployer's private secrets (lib/credentials.mjs SIGNER), never in this public
// repo; a test signer ("test": true) signs only files outside it. c2patool comes from its GitHub release, checked against
// the hash below, into the Deployer's state folder (C2PATOOL=<c2patool.exe> to use another).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AUDIO, hasCredentials, hasRightsMark, isOurArt, madeWith, manifest, MARKABLE, newArt, PICTURE, readArt, SIGNER, signer, withRightsMark } from './lib/credentials.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// The release's own SHA-256, as GitHub records it for the asset (gh api repos/contentauth/c2patool/releases/tags/v…).
const C2PATOOL = {
  version: '0.28.4',
  url: 'https://github.com/contentauth/c2patool/releases/download/v0.28.4/v0.28.4-x86_64-pc-windows-msvc.zip',
  sha256: '00e5bcfef95fcf913cc3d67825d7d50ea1eb1180c7fdbef746c9ce3b65e272f1',
}

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const paths = args.filter((a) => !a.startsWith('--'))
const inSite = (abs) => {
  const rel = relative(root, abs)
  return !rel.startsWith('..') && !isAbsolute(rel)
}

function expand(path) {
  const abs = resolve(path)
  if (statSync(abs).isDirectory()) return readdirSync(abs, { recursive: true }).map((f) => join(abs, f)).filter((f) => statSync(f).isFile())
  return [abs]
}
// A site file is ours to mark by lib/credentials.mjs isOurArt; a file elsewhere (a masters repo) whenever it is a
// picture or a song.
const files = paths.length
  ? paths.flatMap(expand).filter((abs) => (inSite(abs) ? isOurArt(relative(root, abs), abs) : PICTURE.test(abs) || AUDIO.test(abs)))
  : flag('--all')
    ? execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean).map((rel) => join(root, rel)).filter((abs) => isOurArt(relative(root, abs), abs))
    : newArt(root).map((rel) => join(root, rel))

const where = (abs) => (inSite(abs) ? relative(root, abs) : abs).split(sep).join('/')

if (flag('--check')) {
  const sign = !!signer() && !signer().test
  const missing = files.filter((abs) => {
    const b = readArt(abs)
    return (MARKABLE.test(abs) && !hasRightsMark(b)) || (sign && !hasCredentials(b))
  })
  for (const abs of missing) console.log(`${where(abs)}: no ${MARKABLE.test(abs) && !hasRightsMark(readArt(abs)) ? 'rights mark' : 'Content Credentials'}`)
  console.log(missing.length ? `${missing.length} of ${files.length} file(s) to protect` : `OK: ${files.length} file(s) protected`)
  process.exit(missing.length ? 1 : 0)
}

// With --sign, the signer is checked before anything is written.
const s = flag('--sign') ? signer() : null
if (flag('--sign')) {
  if (!s) throw new Error(`no signer: put signer.json, the certificate chain and the key in ${dirname(SIGNER)} (README "Rights in the files")`)
  const site = files.find(inSite)
  if (s.test && site) throw new Error(`${where(site)}: the signer in ${SIGNER} is a test one ("test": true); it never signs the site's files`)
}

// 1. The rights mark, in the formats it goes into, unless the file is signed already.
let marked = 0
const sealed = []
for (const abs of files.filter((f) => MARKABLE.test(f))) {
  const b = readArt(abs)
  if (hasRightsMark(b)) continue
  if (hasCredentials(b)) {
    sealed.push(where(abs))
    continue
  }
  writeFileSync(abs, withRightsMark(b, madeWith(where(abs))))
  marked++
}
console.log(`rights mark: ${marked} file(s) marked${sealed.length ? `; ${sealed.length} signed without it (re-make them from their masters to mark them): ${sealed.slice(0, 5).join(', ')}` : ''}`)

// 2. Content Credentials, with --sign.
if (s) {
  const exe = await c2patool()
  const work = mkdtempSync(join(tmpdir(), 'protect-art-'))
  const settings = join(work, 'c2pa.toml')
  // No thumbnail inside the file: it would add about a picture's own size again.
  writeFileSync(settings, '[builder.thumbnail]\nenabled = false\n')
  let signed = 0
  try {
    for (const abs of files) {
      if (hasCredentials(readArt(abs))) continue
      const def = join(work, 'manifest.json')
      writeFileSync(def, JSON.stringify({ alg: s.alg, private_key: s.key, sign_cert: s.cert, ...(s.tsa ? { ta_url: s.tsa } : {}), ...manifest(basename(abs), madeWith(where(abs))) }))
      const out = join(work, `signed-${basename(abs)}`)
      execFileSync(exe, ['--settings', settings, abs, '-m', def, '-o', out, '-f'], { stdio: ['ignore', 'ignore', 'pipe'] })
      if (!hasCredentials(readArt(out))) throw new Error(`${where(abs)}: c2patool wrote no credentials`)
      copyFileSync(out, abs)
      signed++
    }
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
  console.log(`Content Credentials: ${signed} file(s) signed as ${s.name ?? 'VGraphics'}`)
}

// c2patool from its GitHub release, checked against the pinned hash and unpacked into the Deployer's state folder.
async function c2patool() {
  if (process.env.C2PATOOL) return process.env.C2PATOOL
  const dir = `D:/Projects/Deployer/state/tools/c2patool-v${C2PATOOL.version}`
  const exe = join(dir, 'bin', 'c2patool', 'c2patool.exe')
  if (existsSync(exe)) return exe
  if (process.platform !== 'win32') throw new Error('set C2PATOOL to a c2patool for this system (github.com/contentauth/c2pa-rs releases)')
  const zip = Buffer.from(await (await fetch(C2PATOOL.url)).arrayBuffer())
  const got = createHash('sha256').update(zip).digest('hex')
  if (got !== C2PATOOL.sha256) throw new Error(`c2patool download has sha256 ${got}, want ${C2PATOOL.sha256}: not used`)
  mkdirSync(join(dir, 'download'), { recursive: true })
  writeFileSync(join(dir, 'download', 'c2patool.zip'), zip)
  execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -Path '${join(dir, 'download', 'c2patool.zip')}' -DestinationPath '${join(dir, 'bin')}' -Force`])
  return exe
}
