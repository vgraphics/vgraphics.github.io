// The "try" block (tools/build-pages.mjs): a product's web version, live on its page (George, 22 Oct 2026: "I must be
// able to run the app in the web and see how it works online"). One shape for every product: the phone with the live
// screen, its tools (rotate, home screen icons, full screen) and the panel (styles, settings, real speed, the store
// call), which assets/try/try.js builds from the engine's own catalog, so nothing is listed here by hand. The start-up
// (assets/startup/) plays in the phone's screen. The engine's files come from the Deployer (speedometer-web writes
// <engine>), never by hand.
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
//   labels         { screen, gauge, gps, get, getNote, unlock }: the page's words that name the product's things
import { esc } from './partials.mjs'

const ICON = {
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 12a9 9 0 0 1 4-7.4M21 12a9 9 0 0 1-4 7.4"/><path d="M3 8v4h4M21 16v-4h-4"/></svg>',
  apps: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
  full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  gps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
}

// Home screen icons over the wallpaper, as the app's style page shows them: plain shapes, no other app's marks.
const HOME_ICONS = `<div class="try-icons" hidden aria-hidden="true">
                  <div class="try-icons-row">${'<i></i>'.repeat(4)}</div>
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
  }
  const json = JSON.stringify(config).replace(/</g, '\\u003c')
  const badge = `<a class="gp try-play" href="${esc(config.store)}" data-where="panel"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250" loading="lazy"></a>`
  const step = (action, label, icon) => (config.style ? '' : `<button class="try-step" type="button" data-action="${action}" aria-label="${label}">${ICON[icon]}</button>`)
  // A style's own page shows that style's layouts alone; the try page lists every style, its layouts under the list.
  const styles = config.style
    ? `<section class="try-group try-layouts" hidden aria-labelledby="try-layouts-title">
              <h3 id="try-layouts-title">Layouts</h3>
              <div class="try-chips"></div>
            </section>`
    : `<section class="try-group" aria-labelledby="try-styles-title">
              <h3 id="try-styles-title">Styles</h3>
              <ul class="try-styles"></ul>
              <div class="try-layouts" hidden><h4>Layouts</h4><div class="try-chips"></div></div>
              ${l.unlock ? `<p class="try-unlock">${l.unlock}</p>` : ''}
            </section>`
  return `<div class="try" data-state="idle">
          <script type="application/json" class="try-config">${json}</script>
          <div class="try-stage">
            <div class="try-device" data-orientation="portrait">
              <div class="try-screen" role="img" aria-label="${esc(l.screen ?? `${page.site.name}, live`)}">
                ${HOME_ICONS}
                <div class="try-busy" hidden><span></span></div>
              </div>
            </div>
            <div class="try-tools">
              ${tool('rotate', 'rotate', 'Rotate')}
              ${tool('icons', 'apps', 'Home screen icons', ' aria-pressed="false"')}
              ${tool('fullscreen', 'full', 'Full screen', ' hidden')}
            </div>
          </div>
          <div class="try-panel">
            <div class="try-now">
              ${[step('prev', 'The style before', 'prev'), '<div class="try-now-name"><b class="try-style-name">Starting…</b><span class="try-style-price"></span></div>', step('next', 'The next style', 'next')].filter(Boolean).join('\n              ')}
            </div>
            ${config.layouts ? '<p class="try-shared" hidden></p>\n            ' : ''}<p class="try-hint">${l.gauge ?? 'Tap the big gauge to switch what it shows, as on your phone.'}</p>
            <div class="try-quick">
              <button class="btn try-gps" type="button" data-action="gps" aria-pressed="false">${ICON.gps}<span>${esc(config.gpsLabel)}</span></button>
              <button class="try-tool" type="button" data-action="share">${ICON.share}<span>Copy a link to this look</span></button>
            </div>
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
          <noscript><p class="try-noscript">The live demo needs JavaScript. You can still get the app on <a href="${esc(config.store)}">Google Play</a>.</p></noscript>${config.measurementId ? `
          <div class="try-consent" role="dialog" aria-labelledby="try-consent-title" hidden>
            <h3 id="try-consent-title">Help improve ${esc(page.site.name)}?</h3>
            <p>May we count how the demo is used (which styles you look at, how fast it loads, any errors), with Google Analytics? Nothing is counted until you say yes. <a href="/privacy/">Privacy</a></p>
            <div class="try-consent-buttons"><button type="button" data-answer="denied">No, thanks</button><button class="allow" type="button" data-answer="granted">Yes</button></div>
          </div>` : ''}
        </div>`
}
