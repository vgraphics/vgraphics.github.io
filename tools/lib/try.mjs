// The "try" block (tools/build-pages.mjs): a product's web version, live on its page (George, 22 Oct 2026: "I must be
// able to run the app in the web and see how it works online"). One shape for every product: the phone with the live
// screen, its tools (rotate, home screen icons, full screen) and the panel (styles, settings, real speed, the store
// call), which assets/try/try.js builds from the engine's own catalog, so nothing is listed here by hand. The start-up
// (assets/startup/) plays in the phone's screen. The engine's files come from the Deployer (speedometer-web writes
// <engine>), never by hand. On a screen (page.json "screen": the try page, the app alone with nothing to scroll) the
// phone fills the window's height and the panel scrolls in its own box beside it, or under it on phones, its edges
// fading (assets/fade-edges.js); on a page that scrolls (a style's page) the panel goes with the page.
//
// page.json: { "type": "try", "product", "engine", "store", "referrer", "measurementId", "prices", "qr", "startup",
//   "style", "labels" }
//   product        the engine's name for analytics and the visitor's saved look ("speedometer")
//   engine         the folder of the engine's files, ending in "/" (vgtry.js, the wasm, art/, fonts/, styles/)
//   store          the Google Play link; referrer, the install referrer it carries (step 6: the app opens on the style)
//   measurementId  the product's Google Analytics web stream ("G-…"), or null: no statistics and no question
//   prices         { premium }: what a premium style costs (the engine knows only which are free)
//   qr             { src, alt }: a QR code of the store link, for desktop visitors (tools/make-qr.py)
//   startup        { art: { tall, wide }, tip, minMs }: the welcome art (as src-<width>.webp), the product's mark at the
//                  loading bar's head (assets/startup/startup.js, TIPS: "dial", "arrow"; none, a round knob) and the
//                  art's least time on screen; false leaves the start-up out: the product starts only on its try page
//                  (George, 26 Oct 2026: "Try page only"), and a page that shows it as a preview (a style's page) draws
//                  it at once
//   style          one style's page (speedometer-wallpaper/styles/<style>/): the phone opens on that style, and the
//                  panel has no list of styles and no previous and next; its layouts and settings stay
//   layouts        a script that reads the product's shared layouts by code (window.VGTryLayouts.resolve, Speedometer's
//                  market/market.js): a link #layout=<CODE>&style=<id> opens on that market layout, the panel says
//                  whose it is, and the store links carry the code (the web market design §5.2)
//   appLinks       { look, layout }: the app's own links (App Links on Android) to the look on show, look with {style}
//                  and {layout}, and to a market layout, layout with {code}. With them the panel has "Show QR for this
//                  look" beside "Copy a link to this look" (George, 3 Nov 2026: "another button show qr for this style
//                  which will be the deeplink to that style in the app"): the link as a QR code to scan with a phone,
//                  made in the page (assets/try/qr.js), in a sheet that opens and closes as every menu does
//   labels         { screen, gauge, gps, get, getNote, unlock }: the page's words that name the product's things
//   hud            Speedometer's HUD mode (Games SpeedometerWallpaper/docs/hud-mode/design.md §9), or left out:
//                  { label, note, brightness, exit, flip, styles: [ids], layouts: [{ id, name }], view }. A HUD mode
//                  button and its layouts in the panel; the phone's screen then fills the window, flipped for the
//                  windscreen, with the visitor's real GPS speed where the browser shares it. Tap once for Exit and
//                  Flip; Esc leaves. While one of the styles is on show, an Original | HUD switch beside it turns the
//                  phone between the wallpaper and that style's HUD look, back and forth (George, 4 Nov 2026: "Yes,
//                  try page and app"); view: { label, original, hud } are its words ("Original", "HUD" left out).
//                  A link to the page with #hud (or #style=<id>&hud) opens it in HUD mode's look, with invite
//                  { title, text, gps, demo }: a card under the phone whose two buttons start HUD mode with the
//                  visitor's real speed or the demo drive's; demo: the pill that marks the demo drive's speed in HUD
//                  mode; end { title, text }: the card with the store's badge once HUD mode is left (George, 10 Nov
//                  2026, "site-try-hud-link": KEEP).
import { esc } from './partials.mjs'

const ICON = {
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 12a9 9 0 0 1 4-7.4M21 12a9 9 0 0 1-4 7.4"/><path d="M3 8v4h4M21 16v-4h-4"/></svg>',
  apps: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  gps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  hud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 18.5L6 5.5h12l2.5 13z"/><path d="M8.8 14.2a3.6 3.6 0 1 1 6.4 0"/><path d="M12 13.2l1.6-2"/></svg>',
  qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2"/><path d="M14 14h2.6v2.6M20.5 14v.01M14 20.5h.01M17.6 17.6h2.9v2.9h-2.9z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
}

// HUD mode's parts (the hud option): its button and layouts in the panel, and the layer over the phone's screen. Each
// brings its own line break, so a page without HUD mode gets no blank lines. The button is a pill of the quick row's
// shape (George, 4 Nov 2026, asked whether the yellow HUD mode button should become a pill like the others: "Yes, make
// it a pill"): the same outlined .try-tool as Copy a link and Show QR, so only Use my real speed is filled.
const hudButton = (hud) => (hud
  ? `
              <button class="try-tool try-hud" type="button" data-action="hud">${ICON.hud}<span>${esc(hud.label)}</span></button>`
  : '')
// Original | HUD: a radio pair of the quick row's pill shape, hidden until one of the HUD styles is on show (try.js).
const hudView = (hud) => {
  if (!hud) return ''
  const words = { label: 'Show this style as', original: 'Original', hud: 'HUD', ...hud.view }
  return `
              <div class="try-view" role="radiogroup" aria-label="${esc(words.label)}" data-view="original" hidden><button type="button" role="radio" aria-checked="true" tabindex="0" data-hud-view="original">${esc(words.original)}</button><button type="button" role="radio" aria-checked="false" tabindex="-1" data-hud-view="hud">${esc(words.hud)}</button></div>`
}
const hudNote = (hud) => (hud
  ? `
            <p class="try-note try-hud-note">${esc(hud.note)}</p>`
  : '')
// The Layouts menu (George, 4 Nov 2026: "layouts menu must show first built in layouts and their huds somehow ... and
// then the marketplace"; "The 4 pills below HUD MODE are confusing"): the style's own layouts, then its HUD layouts
// (only while a HUD style is on show; picking one shows that HUD look through Original | HUD), then the market's most
// used layouts of the style, tried in the phone, and the market's link. try.js fills and shows each set.
// The Layouts menu's group of the layouts VHub ships; the app's picker calls it the same (screen__style__layouts__group_ready).
const READY_TITLE = 'Ready-made'
const layoutSets = (b, level) => {
  const title = (text, icon = '') => `<h${level} class="try-set-title">${icon}${esc(text)}</h${level}>`
  const hud = b.hud
    ? `
                <div class="try-layout-set try-layout-hud" hidden>${title(`${b.hud.view?.hud ?? 'HUD'} layouts`, ICON.hud)}<div class="try-hud-layouts try-chips" role="radiogroup" aria-label="${esc(b.hud.view?.hud ?? 'HUD')} layouts">${b.hud.layouts.map((layout) => `<button class="try-chip" type="button" role="radio" aria-checked="false" data-hud-layout="${esc(layout.id)}">${esc(layout.name)}</button>`).join('')}</div></div>`
    : ''
  const market = b.layouts
    ? `
                <div class="try-layout-set try-layout-market" hidden>${title('From the layout market')}<div class="try-chips"></div>${b.market ? `<a class="try-market-more" href="${esc(b.market)}">See the layout market</a>` : ''}</div>`
    : ''
  const ready = b.layouts
    ? `
                <div class="try-layout-set try-layout-ready" hidden>${title(READY_TITLE)}<div class="try-chips"></div></div>`
    : ''
  return `
                <div class="try-layout-set try-layout-builtin">${title('Built in')}<div class="try-chips"></div></div>${ready}${hud}${market}`
}
const hudLayer = (hud) => (hud
  ? `
                <div class="try-hud-layer" hidden>
                  <p class="try-hud-tip" hidden>${esc(hud.brightness)}</p>${hud.demo ? `
                  <span class="try-hud-demo" hidden>${esc(hud.demo)}</span>` : ''}
                  <div class="try-hud-controls" hidden>
                    <button type="button" class="try-hud-exit" data-hud="exit">${esc(hud.exit)}</button>
                    <button type="button" class="try-hud-flip" data-hud="flip">${esc(hud.flip)}</button>
                  </div>
                </div>`
  : '')

// The cards a link straight into HUD mode brings (#hud, George's pick "site-try-hud-link", 10 Nov 2026): under the
// phone, the invite to start it (a tap, since a browser goes full screen only on one), and after it the store's badge.
// Each opens and closes as every expandable does (try.js reveal()).
const hudCards = (hud, store) => [
  hud?.invite && `
            <div class="try-hud-card try-hud-invite" role="region" aria-labelledby="try-hud-invite-title" hidden><div class="try-hud-card-body">
              <p class="try-hud-card-title" id="try-hud-invite-title">${esc(hud.invite.title)}</p>
              <p>${esc(hud.invite.text)}</p>
              <div class="try-hud-card-acts"><button class="try-tool try-hud-go" type="button" data-hud-go="gps">${ICON.gps}<span>${esc(hud.invite.gps)}</span></button><button class="try-tool" type="button" data-hud-go="demo">${ICON.hud}<span>${esc(hud.invite.demo)}</span></button></div>
            </div></div>`,
  hud?.end && `
            <div class="try-hud-card try-hud-end" role="region" aria-labelledby="try-hud-end-title" hidden><div class="try-hud-card-body">
              <button class="try-hud-card-close" type="button" aria-label="Close">${ICON.close}</button>
              <p class="try-hud-card-title" id="try-hud-end-title">${esc(hud.end.title)}</p>
              <p>${esc(hud.end.text)}</p>
              <a class="gp" href="${esc(store)}" data-where="hud"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250" loading="lazy"></a>
            </div></div>`,
].filter(Boolean).join('')

// Home screen icons over the wallpaper, as the app's style page shows them: plain shapes, no other app's marks. The
// search bar and the dock only: a row above them sat on the gauge (George, 4 Nov 2026: "For home screen icons remove
// top line of icons").
const HOME_ICONS = `<div class="try-icons" hidden aria-hidden="true">
                  <div class="try-icons-search"></div>
                  <div class="try-icons-dock">${'<i></i>'.repeat(4)}</div>
                </div>`

const tool = (action, icon, label, extra = '') => `<button class="try-tool" type="button" data-action="${action}"${extra}>${ICON[icon]}<span>${label}</span></button>`

export function tryBlock(b, page) {
  const l = b.labels ?? {}
  const config = {
    product: b.product,
    name: page.site.name,
    engine: b.engine,
    store: b.store ?? page.stores?.googlePlay,
    referrer: b.referrer ?? null,
    measurementId: b.measurementId ?? null,
    prices: b.prices ?? {},
    gpsLabel: l.gps ?? 'Use my real speed',
    startup: b.startup === false ? false : { base: '/assets/startup/', minMs: 2000, ...b.startup },
    ...(b.style ? { style: b.style } : {}),
    ...(b.layouts ? { layouts: b.layouts } : {}),
    ...(b.hud ? { hud: { styles: b.hud.styles, layouts: b.hud.layouts.map((layout) => layout.id) } } : {}),
    ...(b.appLinks ? { appLinks: b.appLinks } : {}),
  }
  const json = JSON.stringify(config).replace(/</g, '\\u003c')
  const badge = `<a class="gp try-play" href="${esc(config.store)}" data-where="panel"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250" loading="lazy"></a>`
  const step = (action, label, icon) => (config.style ? '' : `<button class="try-step" type="button" data-action="${action}" aria-label="${label}">${ICON[icon]}</button>`)
  // A style's own page shows that style's layouts alone; the try page lists every style, its layouts under the list.
  const styles = config.style
    ? `<section class="try-group try-layouts" hidden aria-labelledby="try-layouts-title">
              <h3 id="try-layouts-title">Layouts</h3>${layoutSets(b, 4)}
            </section>`
    : `<section class="try-group" aria-labelledby="try-styles-title">
              <h3 id="try-styles-title">Styles</h3>
              <ul class="try-styles"></ul>
              <div class="try-layouts" hidden><h4>Layouts</h4>${layoutSets(b, 5)}
              </div>
              ${l.unlock ? `<p class="try-unlock">${l.unlock}</p>` : ''}
            </section>`
  return `<div class="try" data-state="idle">
          <script type="application/json" class="try-config">${json}</script>
          <div class="try-stage">
            <div class="try-device" data-orientation="portrait">
              <div class="try-screen" role="img" aria-label="${esc(l.screen ?? `${page.site.name}, live`)}">
                ${HOME_ICONS}
                <div class="try-busy" hidden><span></span></div>${hudLayer(b.hud)}
              </div>
            </div>${hudCards(b.hud, config.store)}
            <div class="try-tools">
              ${tool('rotate', 'rotate', 'Rotate')}
              ${tool('icons', 'apps', 'Home screen icons', ' aria-pressed="false"')}
              ${tool('fullscreen', 'full', 'Full screen', ' hidden')}
            </div>
          </div>
          <div class="try-panel${page.screen ? ' fade-edges' : ''}">
            <div class="try-now">
              ${[step('prev', 'The style before', 'prev'), '<div class="try-now-name"><b class="try-style-name">Starting…</b><span class="try-style-price"></span></div>', step('next', 'The next style', 'next')].filter(Boolean).join('\n              ')}
            </div>
            ${config.layouts ? '<p class="try-shared" hidden></p>\n            ' : ''}<p class="try-hint">${l.gauge ?? 'Tap the big gauge to switch what it shows, as on your phone.'}</p>
            <div class="try-quick">
              <button class="try-tool try-gps" type="button" data-action="gps" aria-pressed="false">${ICON.gps}<span>${esc(config.gpsLabel)}</span></button>
              <button class="try-tool" type="button" data-action="share">${ICON.share}<span>Copy a link to this look</span></button>${config.appLinks ? `
              <button class="try-tool" type="button" data-action="qr" aria-haspopup="dialog">${ICON.qr}<span>Show QR for this look</span></button>` : ''}${hudView(b.hud)}${hudButton(b.hud)}
            </div>${hudNote(b.hud)}
            <p class="try-note" data-note="gps" hidden></p>
            <p class="try-note" data-note="share" hidden aria-live="polite"></p>
            ${styles}
            <section class="try-group" aria-labelledby="try-settings-title">
              <h3 id="try-settings-title">Settings</h3>
              <div class="try-settings"></div>
            </section>
            <section class="try-group try-get" aria-labelledby="try-get-title">
              <h3 id="try-get-title">${l.get ?? 'Set it as your wallpaper'}</h3>
              <p>${l.getNote ?? 'A browser can’t set your wallpaper. Get the app on Google Play and pick this style there.'}</p>
              <div class="try-get-row">
                ${badge}
                ${b.qr ? `<figure class="try-qr"><img src="${esc(b.qr.src)}" alt="${esc(b.qr.alt)}" width="132" height="132" loading="lazy"><figcaption>Scan with your phone</figcaption></figure>` : ''}
              </div>
            </section>
            ${config.measurementId ? `<label class="try-setting try-statistics">
              <span>Usage statistics<small>Counted with Google Analytics</small></span>
              <input class="switch" type="checkbox" role="switch">
            </label>` : ''}
          </div>
          <div class="try-fallback" hidden>
            <p class="try-fallback-text"></p>
            <a class="gp" href="${esc(config.store)}" data-where="fallback"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250" loading="lazy"></a>
          </div>
          <noscript><p class="try-noscript">The live demo needs JavaScript. You can still get the app on <a href="${esc(config.store)}">Google Play</a>.</p></noscript>${config.appLinks ? `
          <dialog class="try-look" aria-labelledby="try-look-title" aria-describedby="try-look-note">
            <div class="try-look-shade"></div>
            <div class="try-look-sheet">
              <button class="try-look-close" type="button" aria-label="Close">${ICON.close}</button>
              <p class="try-look-eyebrow">Open this look in the app</p>
              <h3 class="try-look-name" id="try-look-title">${esc(page.site.name)}</h3>
              <p class="try-look-layout"></p>
              <div class="try-look-code" role="img" aria-label="${esc(`A QR code that opens this look in ${page.site.name}`)}"></div>
              <p class="try-look-note" id="try-look-note">Point your phone’s camera at it: the app opens on this look. Without the app, the link offers Google Play.</p>
            </div>
          </dialog>` : ''}${config.measurementId ? `
          <div class="try-consent" role="dialog" aria-labelledby="try-consent-title" hidden>
            <h3 id="try-consent-title">Help improve ${esc(page.site.name)}?</h3>
            <p>May we count how the demo is used (which styles you look at, how fast it loads, any errors), with Google Analytics? Nothing is counted until you say yes. <a href="/privacy/">Privacy</a></p>
            <div class="try-consent-buttons"><button type="button" data-answer="denied">No, thanks</button><button class="allow" type="button" data-answer="granted">Yes</button></div>
          </div>` : ''}
        </div>`
}
