// Unity WebGL pages: a product's screens that its Unity build draws in the browser. Exitwise's /exitwise/play/ is one;
// Palermo Noir's /palermo/play/, /join/, /tv/ and /demo/ become four (George, 30 Oct 2026: "Unity and browser must use
// unity too. We dont want to have 2 code bases."; the palermo repo's
// docs/superpowers/specs/2026-10-30-palermo-one-codebase-design.md). Each comes from its game's WebGL template in the
// game's repo, and the Deployer copies it here with its build. check-site knows one by Unity's own call,
// createUnityInstance(), wherever it is served, and holds every one to the same rules, all from here, each from
// D:\Projects\Mine\CLAUDE.md:
// - play-alone ("Play and try pages are the product alone"): nothing to scroll (a <style> gives html or body
//   overflow: hidden), and, as every play page (tools/lib/play-pages.mjs), no About panel or button to one, no website
//   footer under it, and its About page linked in its bar. A TV or join page needs no About link.
// - legal-footer ("Company details on the website only"): "© <year> VGraphics" and none of the company's numbers
//   (tools/lib/legal.mjs), wherever it is.
// - no-select ("No text selection and no right-click"; "Shipped code is protected"): it loads /assets/no-select.js,
//   which also blocks the developer tools' keys and prints the console warning.
// - analytics ("Firebase Crashlytics + Analytics in every game and app"; on the web "the closest available equivalent"):
//   the page or the game's framework (its .jslib bridges, as Exitwise's ArrowPuzzleAnalytics.jslib) loads Google
//   Analytics (gtag.js) and reports errors: it hooks the window's error and unhandledrejection events and sends GA4
//   "exception" events.
// - loading-bar ("Start-up": "web and Unity loaders show the squishy, chubby loading bar"): the shared one,
//   /assets/startup/loading-bar.css and .js started with VGLoadingBar(), and no bar of its own.
// - source-maps ("Shipped code is protected": "web code ships minified with no source maps"): no .map file and no
//   Unity debug symbols in its folders, no symbolsUrl, and no sourceMappingURL in the page or a script beside it.
// - noindex: a TV or join page is kept out of search, as every door is.
import { legalProblems } from './legal.mjs'
import { playPageProblems } from './play-pages.mjs'

const strip = (html) => html.replace(/<!--[\s\S]*?-->/g, '')
// The page's own scripts, the ones without a src.
const inline = (html) => [...strip(html).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attrs]) => !/\ssrc=/i.test(attrs) && !/type="application\/(?:ld\+)?json"/i.test(attrs)).map((m) => m[2]).join('\n')

export const isUnityPage = (html) => /\bcreateUnityInstance\s*\(/.test(inline(html))

// A product's TV or join page: /<product>/tv/ or /<product>/join/, or a page in those folders.
export const isDoor = (path) => /^\/[^/]+\/(tv|join)\//.test(path)

// The address a page's scripts give `key`, as Unity's templates write it: key: "Build/x" or key = "Build/x" (Exitwise's),
// or key: buildUrl + "/x" with var buildUrl = "Build" (Unity's own template). null when it can't tell.
function urlOf(js, key) {
  const m = js.match(new RegExp(`\\b${key}\\s*[:=]\\s*(?:([A-Za-z_$][\\w$]*)\\s*\\+\\s*)?(["'])([^"']*)\\2`))
  if (!m) return null
  if (!m[1]) return m[3]
  const base = js.match(new RegExp(`\\b${m[1]}\\s*=\\s*(["'])([^"']*)\\1`))
  return base ? base[2] + m[3] : null
}

// The game's framework, Unity's code and the game's .jslib bridges, as the page names it (relative to the page or from
// the site's root): where its analytics and error reports are.
export const unityFramework = (html) => urlOf(inline(html), 'frameworkUrl')

const NO_SELECT = /<script\b[^>]*\ssrc="\/assets\/no-select\.js"[^>]*><\/script>|<script src="\/assets\/menu\.js" defer><\/script>/
const BAR_CSS = /<link rel="stylesheet" href="\/assets\/startup\/loading-bar\.css">/
const BAR_JS = /<script\b[^>]*\ssrc="\/assets\/startup\/loading-bar\.js"[^>]*><\/script>/
// The bar's parts as classes (.bar-groove, class="bar-track"), not the --vg-bar-* properties that set the shared one's look.
const BAR_PARTS = /(?<![\w-])bar-(track|groove|fill|head|tip|hop|jelly|spark|shadow)\b/g
const GTAG = /googletagmanager\.com\/gtag\/js/
const EXCEPTION = /\bgtag\(\s*["']event["']\s*,\s*["']exception["']/
const ON_ERROR = /addEventListener\(\s*["']error["']|\bonerror\s*=/
const SCRIPT = /\.js(?:\.(?:gz|br|unityweb))?$/i

// What is wrong with a Unity page: html, its markup; path, its address (/<product>/play/); text(ref), the text of a
// file the page names (relative to it, or from the site's root), unpacked, or null when there is none; files, the
// site's files in the page's folder and its build's (as "exitwise/play/Build/x.loader.js"). A list of [rule, message],
// none when it keeps every rule.
export function unityPageProblems(html, path, { text = () => null, files = [] } = {}) {
  const out = []
  const add = (rule, message) => out.push([rule, message])
  const slug = path.split('/')[1]
  const door = isDoor(path)
  const markup = strip(html)
  const css = [...markup.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, '')).join('\n')
  const js = inline(html)

  for (const m of playPageProblems(html, slug, { about: !door })) add('play-alone', m)
  const locked = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .some(([, selectors, body]) => selectors.split(',').some((s) => /^(?:html|body)$/i.test(s.trim())) && /(?:^|[;\s])overflow\s*:\s*(?:hidden|clip)\b/.test(body))
  if (!locked) add('play-alone', 'scrolls: give html and body overflow: hidden in its <style>, so the product fills the window with nothing to scroll ("When we play we play. No scroll needed.")')

  for (const m of legalProblems(path, html, true)) add('legal-footer', m)

  if (!NO_SELECT.test(markup)) {
    add('no-select', 'lets its text be selected, opens the right-click menu and the developer tools\' keys, and shows no console warning: load <script src="/assets/no-select.js" defer></script>')
  }

  const framework = unityFramework(html)
  const frameworkText = framework ? text(framework) : null
  if (!framework) add('analytics', "names no framework (createUnityInstance's frameworkUrl), where the game's analytics and error reports are")
  else if (frameworkText === null) add('analytics', `its framework ${framework} is missing`)
  else {
    const code = `${js}\n${frameworkText}`
    if (!GTAG.test(code)) add('analytics', "loads no Google Analytics (gtag.js), neither the page nor the game's framework: the game's events go to its GA4 web stream, after consent (Exitwise: ArrowPuzzleAnalytics.jslib)")
    if (!EXCEPTION.test(code) || !ON_ERROR.test(code) || !/unhandledrejection/.test(code)) {
      add('analytics', "reports no errors: hook the window's error and unhandledrejection events and send them as GA4 \"exception\" events, the web's Crashlytics (Exitwise: ArrowPuzzleAnalytics.jslib)")
    }
  }

  if (!BAR_CSS.test(markup)) add('loading-bar', 'does not link the shared squishy loading bar\'s look: <link rel="stylesheet" href="/assets/startup/loading-bar.css">')
  if (!BAR_JS.test(markup)) add('loading-bar', 'does not load the shared squishy loading bar: <script src="/assets/startup/loading-bar.js"></script>')
  if (!/\bVGLoadingBar\s*\(/.test(js)) add('loading-bar', "never starts the shared bar: VGLoadingBar(element, { colour, tip, onStep, onFull }), shown Unity's progress")
  const rest = markup.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  const own = new Set([...`${css}\n${rest}`.matchAll(BAR_PARTS)].map((m) => `.bar-${m[1]}`))
  if (/\bfunction\s+loadingBar\b/.test(js)) own.add('loadingBar()')
  if (own.size) {
    add('loading-bar', `draws a loading bar of its own (${[...own].join(', ')}): the shared one draws it, in the product's colour (VGLoadingBar's colour, or --vg-bar-fill) and its look from the --vg-bar-* properties`)
  }

  for (const f of files) {
    if (/\.map$/i.test(f)) add('source-maps', `ships ${f}, a source map: the web's code ships minified, with no source maps`)
    else if (/\.symbols\.json\b/i.test(f)) add('source-maps', `ships ${f}, the build's debug symbols: build the release without them`)
  }
  if (/\bsymbolsUrl\b/.test(js)) add('source-maps', "names the build's debug symbols (createUnityInstance's symbolsUrl): build the release without them")
  if (/sourceMappingURL=/.test(markup)) add('source-maps', 'points to a source map (sourceMappingURL)')
  for (const f of files.filter((f) => SCRIPT.test(f))) {
    if (/sourceMappingURL=/.test(text(`/${f}`) ?? '')) add('source-maps', `${f} points to a source map (sourceMappingURL): build it without one`)
  }

  if (door && !/<meta name="robots" content="[^"]*noindex/i.test(markup)) {
    add('noindex', 'is a TV or join page, which search engines must not list: add <meta name="robots" content="noindex">')
  }
  return out
}
