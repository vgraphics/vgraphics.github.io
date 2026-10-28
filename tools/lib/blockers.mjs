// Would an ad, cookie-notice or privacy blocker drop one of our own files? (George, 27 Oct 2026: "Demo still not
// loading. Stays at 5% of loading."): Palermo's demo shipped a script named consent-banner-<hash>.js, Fanboy's
// cookie-notice list blocks every address with "/consent-banner-" in it, and with that one file missing the demo never
// started for anyone running Brave, AdGuard or uBlock's annoyance filters. check-site tests every file GitHub Pages
// serves against the rules in tools/blocker-rules.txt, a copy of the lists' rules that could ever hit vgraphics.gr's
// own addresses, refreshed by node tools/update-blocker-rules.mjs.
//
// The rules are Adblock Plus network filters, read as uBlock Origin reads them: a pattern with * (anything), ^ (a
// separator: anything but a letter, a digit or _-.%, or the end) and | anchors, or a /regular expression/; @@ for an
// exception; $options after the pattern. A rule counts for a file when its options allow a first-party request of
// that file's kind from a vgraphics.gr page. Cosmetic rules (##, #@#, #?#, #$#, ##+js) never block a file.

/**
 * Options that leave a rule blocking our first-party files. Any other option (third-party only, a page or a popup, a
 * header or a parameter it rewrites, a rule it cancels) makes it a rule that never drops one of them.
 */
const PLAIN = new Set(['important', 'match-case', '1p', 'first-party', '~third-party', '~3p', 'strict1p', 'all', 'redirect',
  'empty', 'mp4', 'rewrite'])

/** Request kinds, by the names the options use. */
const KINDS = { script: 'script', stylesheet: 'stylesheet', css: 'stylesheet', image: 'image', media: 'media', font: 'font',
  xmlhttprequest: 'xhr', xhr: 'xhr', object: 'object', subdocument: 'subdocument', frame: 'subdocument', ping: 'ping',
  websocket: 'websocket', other: 'other' }

/** The kind of request that loads a file, by its extension; null for a page or a file no page loads as a resource. */
export function kindOf(path) {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase()
  if (ext === 'js' || ext === 'mjs') return 'script'
  if (ext === 'css') return 'stylesheet'
  if (/^(png|jpe?g|webp|avif|gif|svg|ico)$/.test(ext)) return 'image'
  if (/^(mp3|mp4|m4a|ogg|oga|webm|wav)$/.test(ext)) return 'media'
  if (/^(woff2?|ttf|otf)$/.test(ext)) return 'font'
  if (ext === 'json' || ext === 'wasm' || ext === 'data' || ext === 'br' || ext === 'gz') return 'xhr'
  return null
}

/** Does `host` fall under one of the domains of a domain=, from=, to= or denyallow= list ("a.com|~b.com")? */
const under = (host, domain) => host === domain || host.endsWith('.' + domain)

/** A domain list's verdict for `host`: true when the rule applies there. */
function domainsAllow(list, host) {
  const domains = list.split('|').filter(Boolean)
  if (domains.some((d) => d.startsWith('~') && under(host, d.slice(1)))) return false
  const positive = domains.filter((d) => !d.startsWith('~'))
  return positive.length === 0 || positive.some((d) => under(host, d))
}

/** A file name's end, which a site name never has. */
const FILE = /\.(m?js|css|gif|png|jpe?g|webp|avif|svg|ico|mp[34]|m4a|webm|ogg|json|wasm|woff2?|ttf|otf|php|html?|swf|txt|xml|aspx?|cgi|data)$/i

/** A site-name pattern (with * wildcards) as a regular expression to try on our host name. */
const hostLike = (pattern, start) =>
  new RegExp(start + pattern.replace(/[.+?${}()[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'), 'i')

/** An ABP pattern as a regular expression. */
function patternRegex(pattern, matchCase) {
  let p = pattern
  let start = ''
  let end = ''
  if (p.startsWith('||')) {
    start = '^[a-z][a-z0-9+.-]*://(?:[^/?#]*\\.)?'
    p = p.slice(2)
  } else if (p.startsWith('|')) {
    start = '^'
    p = p.slice(1)
  }
  if (p.endsWith('|')) {
    end = '$'
    p = p.slice(0, -1)
  }
  const body = p
    .replace(/[.+?${}()[\]\\|]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\^/g, '(?:[^\\w.%-]|$)')
  return new RegExp(start + body + end, matchCase ? '' : 'i')
}

/** The longest plain run of a pattern, which a URL must contain for the rule to match it: a quick first test. */
function tokenOf(pattern) {
  const runs = pattern.replace(/^\|\|?|\|$/g, '').toLowerCase().split(/[*^|]/)
  return runs.reduce((best, run) => (run.length > best.length ? run : best), '')
}

/**
 * Reads blocker-rules.txt (one rule a line; "! source" lines name the list the rules after them come from) into the
 * rules that can block a first-party file on `host`: { block, allow }, each a list of { text, list, kinds, test(url) }.
 */
export function readRules(text, host = 'vgraphics.gr') {
  const block = []
  const allow = []
  let list = ''
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('! source ')) list = line.slice('! source '.length).replace(/\s+https?:\/\/\S+$/, '')
    if (!line || line.startsWith('!') || line.startsWith('[') || /#[@?$%]?#|#\+js/.test(line)) continue
    const exception = line.startsWith('@@')
    let pattern = exception ? line.slice(2) : line
    let options = []
    // Options follow the last $, but for a regular expression with none, whose own $ may come before its closing slash.
    const at = pattern.length > 2 && pattern.startsWith('/') && pattern.endsWith('/') ? -1 : pattern.lastIndexOf('$')
    if (at > 0) {
      options = pattern.slice(at + 1).split(',').map((o) => o.trim()).filter(Boolean)
      pattern = pattern.slice(0, at)
    }
    let kinds = null
    let notKinds = null
    let matchCase = false
    let skip = false
    for (const option of options) {
      const [name, value = ''] = option.split('=')
      const bare = name.replace(/^~/, '')
      if (name === 'match-case') matchCase = true
      else if (name === 'domain' || name === 'from' || name === 'to') skip ||= !domainsAllow(value, host)
      else if (name === 'denyallow') skip ||= value.split('|').some((d) => under(host, d))
      else if (KINDS[bare]) {
        if (name.startsWith('~')) (notKinds ??= new Set()).add(KINDS[bare])
        else (kinds ??= new Set()).add(KINDS[bare])
      } else if (!PLAIN.has(name)) skip = true
    }
    if (skip || !pattern || pattern === '*') continue
    // A rule pinned to another site's address (||ads.example.com^, |https://cdn-*.example.net/) never reaches ours, nor
    // does a bare site name, as AdGuard's lists write them (email.example.it$image, -s2s.example.net^). A bare file name
    // (banner.gif, ads.js) is no site name.
    const pinned = /^\|\|([^/^|$]*)|^\|[a-z][a-z0-9+.-]*:\/\/([^/^|$]*)/i.exec(pattern)
    const named = pinned?.[1] ?? pinned?.[2] ?? ''
    if (named.includes('.') && !hostLike(named, '^(?:[^/]*\\.)?').test(host)) continue
    const bare = pattern.replace(/\^?\|?$/, '')
    if (!pinned && /^[\w*.-]+\.[a-z]{2,}$/i.test(bare) && !FILE.test(bare) && !hostLike(bare, '').test(host)) continue
    const isRegex = pattern.length > 2 && pattern.startsWith('/') && pattern.endsWith('/')
    let regex
    try {
      regex = isRegex ? new RegExp(pattern.slice(1, -1), matchCase ? '' : 'i') : patternRegex(pattern, matchCase)
    } catch {
      continue
    }
    const token = isRegex ? '' : tokenOf(pattern)
    const rule = {
      text: line,
      list,
      token,
      allows: (kind) => (!kinds || kinds.has(kind)) && !notKinds?.has(kind),
      // `lower` is the address in lower case: the plain run is looked for first, as it's far quicker than the pattern.
      test: (url, lower = url.toLowerCase()) => lower.includes(token) && regex.test(url),
    }
    ;(exception ? allow : block).push(rule)
  }
  return { block, allow }
}

/** The rule that blocks this file on our site, or null: `path` is the file's path in the site, "palermo/game/x.js". */
export function blockedBy(path, rules, host = 'vgraphics.gr') {
  const kind = kindOf(path)
  if (!kind) return null
  const url = `https://${host}/${encodeURI(path)}`
  const lower = url.toLowerCase()
  const hit = candidates(rules.block, lower).find((r) => r.allows(kind) && r.test(url, lower))
  if (!hit || candidates(rules.allow, lower).some((r) => r.allows(kind) && r.test(url, lower))) return null
  return hit
}

/**
 * The rules an address could meet, in their order: those whose plain run starts with three letters found in it, and
 * those with a shorter run. Thousands of files against ten thousand rules take a moment this way, not ten seconds.
 */
const indexes = new WeakMap()
function candidates(list, lower) {
  let index = indexes.get(list)
  if (!index) {
    index = { always: [], by: new Map() }
    list.forEach((rule, order) => {
      if (rule.token.length < 3) index.always.push(order)
      else if (index.by.has(rule.token.slice(0, 3))) index.by.get(rule.token.slice(0, 3)).push(order)
      else index.by.set(rule.token.slice(0, 3), [order])
    })
    indexes.set(list, index)
  }
  const orders = new Set(index.always)
  for (let i = 0; i + 3 <= lower.length; i++) for (const order of index.by.get(lower.slice(i, i + 3)) ?? []) orders.add(order)
  return [...orders].sort((a, b) => a - b).map((order) => list[order])
}
