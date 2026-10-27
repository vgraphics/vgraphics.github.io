// Our pictures' and songs' rights, written into the files themselves (George, 27 Oct 2026: "How can we protect our art
// and songs so nobody else copies them?"), README "Rights in the files":
// - the rights mark: an XMP packet with the IPTC rights fields (creator, copyright notice, the terms as web statement,
//   the licensor, data mining prohibited) that image search, editors and the Recraft-made masters' tools all read. It
//   goes into JPEG, PNG and WebP without re-encoding a pixel;
// - Content Credentials (C2PA): a manifest signed as VGraphics with the same rights, what the art was made with and
//   that it may not be used for AI training, in every format c2patool signs (AVIF and the songs too).
// tools/protect-art.mjs writes both; check-site warns about new art without them.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { crc32 } from 'node:zlib'
import { imageSize } from './image-size.mjs'

export const OWNER = 'VGRAPHICS SINGLE MEMBER P.C.'
export const NOTICE = `© 2026 ${OWNER} All rights reserved.`
export const TERMS = 'https://vgraphics.gr/terms/'
export const CONTACT = 'support@vgraphics.gr'
const IPTC_SOURCE = 'http://cv.iptc.org/newscodes/digitalsourcetype/'
const DMI_PROHIBITED = 'http://ns.useplus.org/ldf/vocab/DMI-PROHIBITED'

export const PICTURE = /\.(jpe?g|png|webp|avif)$/i
export const AUDIO = /\.(m4a|mp3)$/i
/** The formats the rights mark goes into; AVIF and the songs carry their rights in their Content Credentials only. */
export const MARKABLE = /\.(jpe?g|png|webp)$/i
/**
 * Served files that aren't this repo's to mark: what a release of another repo writes (the Exitwise game, Speedometer's
 * engine, VHub's hub: each gets its credentials where it's built) and other companies' pictures.
 */
const NOT_OURS = [/^exitwise\/play\//, /^speedometer-wallpaper\/play\/app\//, /^hub\//, /^assets\/img\/google-play-badge\./]

/**
 * What made each kind of picture or song: the AI tool its first draft came from, which we then edited by hand (the
 * credentials' c2pa.created by the tool, as trainedAlgorithmicMedia, then c2pa.edited with humanEdits), and the IPTC
 * digital source type of the finished file in its rights mark (art: Recraft drafts edited, outpainted and composited
 * into the final picture; songs: Suno tracks). Paths are the site's, or a masters repo's (docs/site-art/...). Art not
 * listed here (screenshots, the apps' own renders, cards drawn in code, voices) gets no such claim, only its owner and
 * rights.
 */
export const MADE_WITH = [
  [/(^|\/)wiki\/img\/(art|worlds|bands|medals)\//, 'Recraft', 'compositeWithTrainedAlgorithmicMedia'],
  [/(^|\/)site-art\/[^/]+\/wiki\/(painted\/)?[^/]+\.(webp|png|jpe?g)$/, 'Recraft', 'compositeWithTrainedAlgorithmicMedia'],
  [/^[^/]+\/img\/(key-art|cover-|footer|hero-|scene-|ost-backdrop)/, 'Recraft', 'compositeWithTrainedAlgorithmicMedia'],
  [/^palermo\/img\/(roles|cast)\//, 'Recraft', 'compositeWithTrainedAlgorithmicMedia'],
  [/(^|\/)audio\/\d\d-[^/]+\.(m4a|mp3)$/, 'Suno', 'trainedAlgorithmicMedia'],
]
export const madeWith = (path) => {
  const hit = MADE_WITH.find(([match]) => match.test(path.replaceAll('\\', '/')))
  return hit ? { tool: hit[1], source: IPTC_SOURCE + hit[2] } : null
}

/**
 * Whether a site file (its path from the site's root) is our art to mark: a picture larger than 256 px (smaller ones are
 * icons, sprites and game pieces, as for "every picture once") or a song, written by this repo.
 */
export function isOurArt(rel, abs) {
  const path = rel.replaceAll('\\', '/')
  if (NOT_OURS.some((n) => n.test(path))) return false
  if (AUDIO.test(path)) return true
  if (!PICTURE.test(path)) return false
  const size = imageSize(abs)
  return !!size && Math.max(size.width, size.height) > 256
}

/**
 * Our art that isn't on the live site yet: added or changed since the commit main on GitHub has (origin/main, else
 * HEAD), committed or not, and new files git would add. That is what the next push or release publishes.
 */
export function newArt(root) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  let base = 'HEAD'
  try {
    base = git('merge-base', 'HEAD', 'origin/main').trim()
  } catch {}
  const changed = git('diff', '--name-only', '-z', '--diff-filter=AMR', base).split('\0')
  const added = git('ls-files', '--others', '--exclude-standard', '-z').split('\0')
  return [...new Set([...changed, ...added])].filter(Boolean)
    .filter((rel) => existsSync(join(root, rel)) && isOurArt(rel, join(root, rel)))
}

/** VGraphics' C2PA signer, from the Deployer's private secrets (never this public repo): signer.json, or null. */
export const SIGNER = process.env.C2PA_SIGNER ?? 'D:/Projects/Deployer/secrets/c2pa/signer.json'
export function signer() {
  if (!existsSync(SIGNER)) return null
  const s = JSON.parse(readFileSync(SIGNER, 'utf8'))
  const dir = SIGNER.replace(/[\\/][^\\/]*$/, '')
  return { ...s, cert: join(dir, s.cert), key: join(dir, s.key) }
}

const MARK = `xmpRights:WebStatement="${TERMS}"`
/** The file carries our rights mark (in any format: c2patool keeps it when it signs). */
export const hasRightsMark = (buf) => buf.includes(MARK)
/** The file carries Content Credentials: a JUMBF description box whose type is the C2PA manifest store's ("c2pa"). */
export const hasCredentials = (buf) => buf.includes('jumdc2pa')
export const readArt = (abs) => readFileSync(abs)

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The XMP packet: the IPTC Photo Metadata rights fields, and the digital source type when we know it. */
export function rightsXmp(made) {
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
    xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
    xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"
    xmlns:plus="http://ns.useplus.org/ldf/xmp/1.0/"
    xmpRights:Marked="True"
    ${MARK}
    photoshop:Credit="VGraphics"
    plus:DataMining="${DMI_PROHIBITED}"${made ? `
    Iptc4xmpExt:DigitalSourceType="${xml(made.source)}"` : ''}>
   <dc:creator><rdf:Seq><rdf:li>VGraphics</rdf:li></rdf:Seq></dc:creator>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${xml(NOTICE)}</rdf:li></rdf:Alt></dc:rights>
   <xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">No copying, re-uploading or AI training without our written permission: ${TERMS}</rdf:li></rdf:Alt></xmpRights:UsageTerms>
   <Iptc4xmpCore:CreatorContactInfo rdf:parseType="Resource"><Iptc4xmpCore:CiEmailWork>${CONTACT}</Iptc4xmpCore:CiEmailWork><Iptc4xmpCore:CiUrlWork>https://vgraphics.gr/</Iptc4xmpCore:CiUrlWork></Iptc4xmpCore:CreatorContactInfo>
   <plus:CopyrightOwner><rdf:Seq><rdf:li rdf:parseType="Resource"><plus:CopyrightOwnerName>${xml(OWNER)}</plus:CopyrightOwnerName></rdf:li></rdf:Seq></plus:CopyrightOwner>
   <plus:Licensor><rdf:Seq><rdf:li rdf:parseType="Resource"><plus:LicensorName>VGraphics</plus:LicensorName><plus:LicensorEmail>${CONTACT}</plus:LicensorEmail><plus:LicensorURL>${TERMS}#licence</plus:LicensorURL></rdf:li></rdf:Seq></plus:Licensor>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="r"?>`
}

/** The file with the rights mark in place of any XMP it had, or an error for a format it doesn't go into. */
export function withRightsMark(buf, made) {
  const packet = Buffer.from(rightsXmp(made), 'utf8')
  if (buf[0] === 0xff && buf[1] === 0xd8) return jpegWithXmp(buf, packet)
  if (buf.readUInt32BE(0) === 0x89504e47) return pngWithXmp(buf, packet)
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return webpWithXmp(buf, packet)
  throw new Error('not a JPEG, PNG or WebP')
}

const XMP_NS = Buffer.from('http://ns.adobe.com/xap/1.0/\0', 'latin1')

// JPEG: the packet in an APP1 segment after the leading APP0/APP1 (JFIF, Exif) segments; an older XMP APP1 is dropped.
function jpegWithXmp(buf, packet) {
  const app1 = Buffer.alloc(4)
  app1.writeUInt16BE(0xffe1, 0)
  app1.writeUInt16BE(2 + XMP_NS.length + packet.length, 2)
  const segment = Buffer.concat([app1, XMP_NS, packet])
  if (segment.length > 65537) throw new Error('XMP too big for one JPEG segment')
  const kept = [buf.subarray(0, 2)]
  let at = 2
  let insertAt = null
  while (at + 4 <= buf.length && buf[at] === 0xff) {
    const marker = buf[at + 1]
    if (marker === 0xda || marker === 0xd9) break // start of scan: the image data follows
    const length = buf.readUInt16BE(at + 2)
    const seg = buf.subarray(at, at + 2 + length)
    const isXmp = marker === 0xe1 && seg.subarray(4, 4 + XMP_NS.length).equals(XMP_NS)
    if (insertAt === null && !(marker === 0xe0 || marker === 0xe1)) insertAt = kept.length
    if (!isXmp) kept.push(seg)
    at += 2 + length
  }
  kept.splice(insertAt ?? kept.length, 0, segment)
  return Buffer.concat([...kept, buf.subarray(at)])
}

// PNG: an iTXt chunk "XML:com.adobe.xmp" before the image data; an older one is dropped.
function pngWithXmp(buf, packet) {
  const data = Buffer.concat([Buffer.from('XML:com.adobe.xmp\0\0\0\0\0', 'latin1'), packet])
  const chunk = (type, body) => {
    const head = Buffer.alloc(8)
    head.writeUInt32BE(body.length, 0)
    head.write(type, 4, 'latin1')
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0)
    return Buffer.concat([head, body, crc])
  }
  const parts = [buf.subarray(0, 8)]
  let at = 8
  let placed = false
  while (at + 12 <= buf.length) {
    const length = buf.readUInt32BE(at)
    const type = buf.toString('latin1', at + 4, at + 8)
    const whole = buf.subarray(at, at + 12 + length)
    const isXmp = type === 'iTXt' && buf.toString('latin1', at + 8, at + 8 + 18) === 'XML:com.adobe.xmp\0'
    if (!placed && (type === 'IDAT' || type === 'IEND')) {
      parts.push(chunk('iTXt', data))
      placed = true
    }
    if (!isXmp) parts.push(whole)
    at += 12 + length
  }
  return Buffer.concat(parts)
}

// WebP: an "XMP " chunk at the end, flagged in the extended header (VP8X), which a simple (VP8 or VP8L) file gets.
function webpWithXmp(buf, packet) {
  const chunks = []
  for (let at = 12; at + 8 <= buf.length;) {
    const id = buf.toString('latin1', at, at + 4)
    const length = buf.readUInt32LE(at + 4)
    chunks.push({ id, data: buf.subarray(at + 8, at + 8 + length) })
    at += 8 + length + (length & 1)
  }
  const body = chunks.filter((c) => c.id !== 'XMP ')
  let vp8x = body.find((c) => c.id === 'VP8X')
  if (!vp8x) {
    const image = body.find((c) => c.id === 'VP8 ' || c.id === 'VP8L')
    if (!image) throw new Error('WebP without image data')
    let width
    let height
    let alpha = false
    if (image.id === 'VP8 ') {
      width = image.data.readUInt16LE(6) & 0x3fff
      height = image.data.readUInt16LE(8) & 0x3fff
    } else {
      const bits = image.data.readUInt32LE(1)
      width = (bits & 0x3fff) + 1
      height = ((bits >>> 14) & 0x3fff) + 1
      alpha = ((bits >>> 28) & 1) === 1
    }
    const data = Buffer.alloc(10)
    data[0] = alpha ? 0x10 : 0
    data.writeUIntLE(width - 1, 4, 3)
    data.writeUIntLE(height - 1, 7, 3)
    vp8x = { id: 'VP8X', data }
    body.unshift(vp8x)
  } else {
    vp8x.data = Buffer.from(vp8x.data)
  }
  vp8x.data[0] |= 0x04 // XMP metadata present
  body.push({ id: 'XMP ', data: packet })
  const out = body.map(({ id, data }) => {
    const head = Buffer.alloc(8)
    head.write(id, 0, 'latin1')
    head.writeUInt32LE(data.length, 4)
    return Buffer.concat([head, data, data.length & 1 ? Buffer.alloc(1) : Buffer.alloc(0)])
  })
  const riff = Buffer.alloc(12)
  riff.write('RIFF', 0, 'latin1')
  riff.writeUInt32LE(4 + out.reduce((n, b) => n + b.length, 0), 4)
  riff.write('WEBP', 8, 'latin1')
  return Buffer.concat([riff, ...out])
}

/** The C2PA manifest definition c2patool signs (without the signer's fields): the rights, what made it, no AI training. */
export function manifest(title, made) {
  return {
    claim_generator_info: [{ name: 'VGraphics protect-art', version: '1' }],
    title,
    assertions: [
      ...(made ? [{
        label: 'c2pa.actions.v2',
        data: {
          actions: [
            { action: 'c2pa.created', digitalSourceType: `${IPTC_SOURCE}trainedAlgorithmicMedia`, softwareAgent: { name: made.tool } },
            { action: 'c2pa.edited', digitalSourceType: `${IPTC_SOURCE}humanEdits`, description: 'Edited and finished by VGraphics' },
          ],
        },
      }] : []),
      {
        label: 'cawg.metadata',
        data: {
          '@context': { dc: 'http://purl.org/dc/elements/1.1/', xmpRights: 'http://ns.adobe.com/xap/1.0/rights/', photoshop: 'http://ns.adobe.com/photoshop/1.0/', plus: 'http://ns.useplus.org/ldf/xmp/1.0/' },
          'dc:creator': ['VGraphics'],
          'dc:rights': NOTICE,
          'xmpRights:Marked': true,
          'xmpRights:WebStatement': TERMS,
          'photoshop:Credit': 'VGraphics',
          'plus:DataMining': DMI_PROHIBITED,
        },
      },
      {
        label: 'cawg.training-mining',
        data: { entries: Object.fromEntries(['cawg.ai_generative_training', 'cawg.ai_inference', 'cawg.ai_training', 'cawg.data_mining'].map((k) => [k, { use: 'notAllowed' }])) },
      },
    ],
  }
}
