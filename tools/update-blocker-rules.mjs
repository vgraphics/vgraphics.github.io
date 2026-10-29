// Refreshes tools/blocker-rules.txt, check-site's copy of the blockers' rules that could drop a file on vgraphics.gr
// (tools/lib/blockers.mjs): node tools/update-blocker-rules.mjs. It downloads each list below and keeps only the
// network rules that reach our own addresses (no rule pinned to another site, none for third-party requests only, none
// that only hides page parts), so the copy stays small. The lists are the ones Brave, AdGuard and uBlock Origin use
// out of the box or with their annoyance filters on (George's PC, 27 Oct 2026: a cookie-notice list dropped Palermo's
// consent-banner-<hash>.js). Run it now and then, and check-site again after it.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readRules } from './lib/blockers.mjs'

const LISTS = [
  ['EasyList', 'https://easylist.to/easylist/easylist.txt'],
  ['EasyPrivacy', 'https://easylist.to/easylist/easyprivacy.txt'],
  ["EasyList Cookie (Fanboy's Cookie Monster)", 'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt'],
  ["Fanboy's Annoyance", 'https://secure.fanboy.co.nz/fanboy-annoyance.txt'],
  ['uBlock filters', 'https://ublockorigin.github.io/uAssets/filters/filters.txt'],
  ['uBlock filters: Privacy', 'https://ublockorigin.github.io/uAssets/filters/privacy.txt'],
  ['uBlock filters: Cookie notices', 'https://ublockorigin.github.io/uAssets/filters/annoyances-cookies.txt'],
  ['AdGuard Base', 'https://filters.adtidy.org/extension/ublock/filters/2.txt'],
  ['AdGuard Tracking Protection', 'https://filters.adtidy.org/extension/ublock/filters/3.txt'],
  ['AdGuard Cookie Notices', 'https://filters.adtidy.org/extension/ublock/filters/18.txt'],
]

const out = [
  '! The rules of the ad, cookie-notice and privacy blockers\' lists that could drop a file on vgraphics.gr itself, for',
  '! tools/check-site.mjs (tools/lib/blockers.mjs). Written by node tools/update-blocker-rules.mjs on ' + new Date().toISOString().slice(0, 10) + ': run it again',
  '! to refresh, never edit by hand. Each list\'s rules follow its "! source" line. No page loads this file.',
]
let kept = 0
for (const [name, url] of LISTS) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${name}: ${url} answered ${response.status}`)
  const lines = (await response.text()).split(/\r?\n/)
  // A rule with letters outside ASCII can't match our addresses, and keeps the copy plain.
  const ours = [...new Set(lines.map((l) => l.trim()).filter((l) => /^[\x20-\x7e]+$/.test(l)))].filter((line) => {
    const rules = readRules(line)
    return rules.block.length + rules.allow.length > 0
  })
  out.push(`! source ${name} ${url}`)
  for (const line of ours) out.push(line)
  kept += ours.length
  console.log(`${name}: ${ours.length} of ${lines.length} lines`)
}
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'blocker-rules.txt'), out.join('\n') + '\n')
console.log(`tools/blocker-rules.txt: ${kept} rules`)
