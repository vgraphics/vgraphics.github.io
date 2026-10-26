// A product's web version on its page (the template's "try" block, tools/lib/try.mjs): the real app's engine
// (vgtry.js and its files in the block's engine folder, which only the Deployer writes) live in the phone, with the
// product's start-up (assets/startup/) in its screen. The engine loads when the page is quiet, behind the start-up's
// dark launch; the start-up plays when the phone comes into view, so a visitor waits for it alone. The panel is built from the engine's own catalog: its styles with
// their pictures, Free or the price, their layouts, and the app's settings in the app's words. The look shown is kept
// in this browser and can be shared as a link (#style=…). The store links carry the style shown, for the app to open
// on it after the install. A style's own page (config.style) opens on that style and has no list of styles; a page
// without the start-up (config.startup false) draws the wallpaper as soon as the engine is ready.
//
// Statistics (Google Analytics 4, the product's web stream) only with a measurement id, and only after the visitor says
// yes: events wait in memory until the answer and are dropped on a no. Events: splash_shown (ms), web_ready (ms, bytes,
// files), style_view, layout_view, setting_change, mode_change, gps_request, gps_result, cta_click (where, style),
// share, fps_low, web_first_frame (ms from the phone coming into view to the wallpaper showing), and exception for the
// page's and the engine's errors (20 at most).
(function () {
  'use strict';

  var root = document.querySelector('.try');
  if (!root) return;
  var config = JSON.parse(root.querySelector('.try-config').textContent);
  var $ = function (selector) { return root.querySelector(selector); };
  var screen = $('.try-screen');
  var device = $('.try-device');
  var LOOK_KEY = 'vgtry.' + config.product + '.look';
  var CONSENT_KEY = config.product + '.analytics';
  var API_VERSION = 1;
  var MAX_ERRORS = 20;
  var MAX_WAITING = 50;
  var FPS_LOW = 24;
  var FPS_SETTLE_MS = 5000;
  var SCROLL_OFFSET = 76;
  var LOCK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>';
  var MESSAGES = {
    missing: 'The live demo isn’t available right now. Please try again later, or get the app on Google Play.',
    unsupported: 'This browser can’t run the live demo yet. It needs a recent Chrome, Edge or Firefox, or Safari 18.2 or later.',
    failed: 'The live demo couldn’t start here. Please reload the page, or get the app on Google Play.'
  };
  var GPS_NOTES = {
    waiting: 'Waiting for your location…',
    on: 'This is your real speed. Watch it only as a passenger.',
    denied: 'Your browser wasn’t allowed your location, so the demo drive goes on.',
    unavailable: 'Your location isn’t available here, so the demo drive goes on.'
  };

  var stored = function (key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  };
  var store = function (key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private windows may refuse; the page works without */ }
  };
  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };

  // Statistics: gtag loads only after a yes; before the answer, events wait here and nothing leaves the page.
  var analytics = (function () {
    var id = config.measurementId;
    var loaded = false;
    var answered = false;
    var waiting = [];
    var errorsLeft = MAX_ERRORS;
    var send = function (name, params) {
      window.gtag('event', name, params);
    };
    var load = function () {
      if (loaded || !id) return;
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('js', new Date());
      window.gtag('config', id);
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(script);
      waiting.splice(0).forEach(function (e) { send(e[0], e[1]); });
    };
    var event = function (name, params) {
      if (!id) return;
      params = params || {};
      if (loaded) send(name, params);
      else if (!answered && waiting.length < MAX_WAITING) waiting.push([name, params]);
    };
    return {
      on: !!id,
      answer: function (value) {
        answered = true;
        if (value === 'granted') load();
        else {
          waiting = [];
          // Withdrawn after loading: gtag stops storing and sending at once, and the page reloads without it, as the
          // web games' pages do.
          if (loaded) {
            window.gtag('consent', 'update', { analytics_storage: 'denied' });
            location.reload();
          }
        }
      },
      event: event,
      // An error as GA4's "exception" event: the message and its first stack frame, 100 characters at most.
      error: function (message, stack) {
        var frame = (stack || '').split('\n').filter(function (line) { return /\bat |@/.test(line); })[0] || '';
        var description = (message + (frame ? ' @ ' + frame.trim() : '')).substring(0, 100);
        console.warn('[try]', description);
        if (errorsLeft <= 0) return;
        errorsLeft--;
        event('exception', { description: description, fatal: false });
      }
    };
  }());

  window.addEventListener('error', function (e) {
    analytics.error(e.message || 'error', e.filename ? 'at ' + e.filename + ':' + e.lineno : '');
  });
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    analytics.error('Unhandled rejection: ' + (reason && reason.message ? reason.message : String(reason)), reason && reason.stack);
  });

  // The question, once per browser, when the demo starts; "Statistics" in the panel asks again.
  var consent = $('.try-consent');
  var askConsent = function () {
    if (consent) consent.hidden = false;
  };
  if (consent) {
    Array.prototype.forEach.call(consent.querySelectorAll('button[data-answer]'), function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-answer');
        store(CONSENT_KEY, value);
        consent.hidden = true;
        analytics.answer(value);
      });
    });
    var answer = stored(CONSENT_KEY);
    if (answer === 'granted' || answer === 'denied') analytics.answer(answer);
  }

  var app = null;
  var catalog = null;
  var last = { style: '', layout: '', mode: '' };
  var gpsAsked = false;
  var fpsReported = false;
  var readyAt = 0;

  var setState = function (state) { root.setAttribute('data-state', state); };
  var styleOf = function (id) { return catalog.styles.filter(function (s) { return s.id === id; })[0] || catalog.styles[0]; };
  var priceOf = function (style) { return config.prices.premium || 'Premium'; };
  var isNarrow = function () { return window.matchMedia && window.matchMedia('(max-width: 900px)').matches; };
  var note = function (which, text) {
    var p = root.querySelector('[data-note="' + which + '"]');
    p.textContent = text || '';
    p.hidden = !text;
  };

  // The store link with the style shown, for the install referrer (the app opens on that style).
  var storeUrl = function (style) {
    if (!config.referrer) return config.store;
    var referrer = config.referrer + '&utm_content=' + encodeURIComponent('style_' + style);
    return config.store + (config.store.indexOf('?') >= 0 ? '&' : '?') + 'referrer=' + encodeURIComponent(referrer);
  };
  var whereOf = function (link) {
    if (link.getAttribute('data-where')) return link.getAttribute('data-where');
    if (link.closest('.key-art')) return 'hero';
    if (link.closest('.cta-band')) return 'card';
    return 'page';
  };
  var storeLinks = function () {
    return Array.prototype.filter.call(document.querySelectorAll('a.gp'), function (a) {
      return a.href.indexOf(config.store) === 0;
    });
  };
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a.gp');
    if (link) analytics.event('cta_click', { where: whereOf(link), style: last.style || '' });
  });

  // ---- Controls, from the catalog's settings (WebCatalog.kt in the engine's repo)
  var focusKey = function (element) { return element && element.getAttribute && element.getAttribute('data-focus'); };
  var changed = function (key, value) {
    app.set(key, value);
    if (key !== 'mode') analytics.event('setting_change', { key: key, value: String(value), style: last.style });
  };

  function control(setting, value) {
    var row = document.createElement('div');
    row.className = 'try-setting';
    var label = document.createElement('span');
    label.textContent = setting.label;
    row.appendChild(label);
    if (setting.type === 'toggle') {
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'try-switch';
      box.setAttribute('role', 'switch');
      box.setAttribute('aria-label', setting.label);
      box.setAttribute('data-focus', setting.key);
      box.checked = value === 'true';
      box.addEventListener('change', function () { changed(setting.key, box.checked); });
      row.appendChild(box);
    } else if (setting.type === 'level') {
      var level = document.createElement('span');
      level.className = 'try-level';
      var range = document.createElement('input');
      range.type = 'range';
      range.min = setting.min;
      range.max = setting.max;
      range.value = value;
      range.setAttribute('aria-label', setting.label);
      range.setAttribute('data-focus', setting.key);
      var shown = document.createElement('output');
      var format = function (n) { return setting.format.replace('%1$d', n).replace('%%', '%'); };
      shown.textContent = format(value);
      range.addEventListener('input', function () { shown.textContent = format(range.value); });
      range.addEventListener('change', function () { changed(setting.key, range.value); });
      level.appendChild(range);
      level.appendChild(shown);
      row.appendChild(level);
    } else {
      var colours = setting.choices.some(function (c) { return c.color; });
      if (colours || setting.choices.length <= 4) {
        var group = document.createElement('span');
        group.className = colours ? 'try-swatches' : 'try-segments';
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', setting.label);
        setting.choices.forEach(function (choice) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-pressed', String(choice.id === value));
          b.setAttribute('data-focus', setting.key + ':' + choice.id);
          if (colours) {
            b.title = choice.label;
            b.setAttribute('aria-label', choice.label);
            b.style.background = choice.color || 'linear-gradient(135deg, #888, #333)';
          } else {
            b.textContent = choice.label;
          }
          b.addEventListener('click', function () { changed(setting.key, choice.id); });
          group.appendChild(b);
        });
        row.appendChild(group);
      } else {
        var select = document.createElement('select');
        select.setAttribute('aria-label', setting.label);
        select.setAttribute('data-focus', setting.key);
        setting.choices.forEach(function (choice) {
          var option = document.createElement('option');
          option.value = choice.id;
          option.textContent = choice.label;
          select.appendChild(option);
        });
        select.value = value;
        select.addEventListener('change', function () { changed(setting.key, select.value); });
        row.appendChild(select);
      }
    }
    return row;
  }

  function buildStyles() {
    var list = $('.try-styles');
    if (!list) return;
    list.textContent = '';
    catalog.styles.forEach(function (style) {
      var item = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-style', style.id);
      var img = document.createElement('img');
      img.alt = '';
      img.width = 240;
      img.height = 520;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = config.engine + style.thumb;
      var name = document.createElement('b');
      name.textContent = style.name;
      var tag = document.createElement('small');
      if (style.free) {
        tag.className = 'free';
        tag.textContent = 'Free';
      } else {
        tag.innerHTML = LOCK;
        tag.appendChild(document.createTextNode(priceOf(style)));
      }
      b.appendChild(img);
      b.appendChild(name);
      b.appendChild(tag);
      b.addEventListener('click', function () { show(style.id); });
      item.appendChild(b);
      list.appendChild(item);
    });
  }

  // On narrow windows the list is under the phone: after a pick, the phone comes back into view.
  function show(id) {
    app.show(id);
    if (isNarrow()) window.scrollTo({ top: window.scrollY + device.getBoundingClientRect().top - SCROLL_OFFSET, behavior: 'smooth' });
  }

  function render() {
    var values = app.values();
    var style = styleOf(values.style);
    $('.try-style-name').textContent = style.name;
    var price = $('.try-style-price');
    price.textContent = '';
    if (style.free) price.textContent = 'Free in the app';
    else {
      price.appendChild(document.createTextNode('Premium · '));
      var b = document.createElement('b');
      b.textContent = priceOf(style);
      price.appendChild(b);
      price.appendChild(document.createTextNode(' on Google Play'));
    }
    Array.prototype.forEach.call(root.querySelectorAll('.try-styles button'), function (b) {
      b.setAttribute('aria-current', String(b.getAttribute('data-style') === style.id));
    });

    var layouts = $('.try-layouts');
    var chips = layouts.querySelector('.try-chips');
    chips.textContent = '';
    layouts.hidden = style.layouts.length < 2;
    style.layouts.forEach(function (layout) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'try-chip';
      chip.textContent = layout.name;
      chip.setAttribute('aria-pressed', String(layout.id === values.layout));
      chip.setAttribute('data-focus', 'layout:' + layout.id);
      chip.addEventListener('click', function () { app.set('layout', layout.id); });
      chips.appendChild(chip);
    });

    // Rebuilt on every change: the control that had the keyboard keeps it.
    var focused = focusKey(document.activeElement);
    var settings = $('.try-settings');
    settings.textContent = '';
    var section = '';
    catalog.settings.concat(style.looks).forEach(function (setting) {
      if (setting.section !== section) {
        section = setting.section;
        var title = document.createElement('h4');
        title.className = 'try-section';
        title.textContent = section;
        settings.appendChild(title);
      }
      settings.appendChild(control(setting, values.values[setting.key]));
    });
    if (focused) {
      var again = root.querySelector('[data-focus="' + focused.replace(/"/g, '') + '"]');
      if (again) again.focus();
    }

    var gps = $('.try-gps');
    var real = values.source === 'gps';
    gps.setAttribute('aria-pressed', String(real));
    gps.querySelector('span').textContent = real ? 'Back to the demo drive' : config.gpsLabel;
    if (!real) note('gps', '');

    storeLinks().forEach(function (a) { a.href = storeUrl(style.id); });
    store(LOOK_KEY, app.look());

    var mode = values.values.mode || '';
    if (style.id !== last.style) analytics.event('style_view', { style: style.id, free: style.free });
    else if (values.layout !== last.layout) analytics.event('layout_view', { style: style.id, layout: values.layout });
    if (last.mode && mode && mode !== last.mode) analytics.event('mode_change', { mode: mode, style: style.id });
    last = { style: style.id, layout: values.layout, mode: mode };
  }

  function wire() {
    catalog = app.catalog();
    if (catalog.api !== API_VERSION) analytics.error('catalog api ' + catalog.api + ', the page knows ' + API_VERSION);
    buildStyles();
    render();
    app.on('change', render);
    app.on('loading', function () { $('.try-busy').hidden = false; });
    app.on('style', function () { $('.try-busy').hidden = true; });
    app.on('error', function (data) {
      $('.try-busy').hidden = true;
      analytics.error('engine: ' + (data.message || 'error'));
    });
    app.on('gps', function (data) {
      note('gps', GPS_NOTES[data.state] || '');
      if (gpsAsked && data.state !== 'waiting') {
        gpsAsked = false;
        analytics.event('gps_result', { state: data.state });
      }
    });
    app.on('fps', function (data) {
      if (fpsReported || now() - readyAt < FPS_SETTLE_MS || !(data.fps < FPS_LOW)) return;
      fpsReported = true;
      analytics.event('fps_low', { fps: data.fps, style: last.style });
    });

    root.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('[data-action]');
      if (!button) return;
      var action = button.getAttribute('data-action');
      var index = catalog.styles.indexOf(styleOf(last.style));
      if (action === 'prev') app.show(catalog.styles[(index - 1 + catalog.styles.length) % catalog.styles.length].id);
      else if (action === 'next') app.show(catalog.styles[(index + 1) % catalog.styles.length].id);
      else if (action === 'gps') {
        var real = app.values().source === 'gps';
        if (!real) {
          gpsAsked = true;
          analytics.event('gps_request', { style: last.style });
        }
        app.source(real ? 'demo' : 'gps');
      } else if (action === 'share') {
        var link = app.shareUrl();
        var copied = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(link) : Promise.reject(new Error('no clipboard'));
        copied.then(function () { note('share', 'Link copied: ' + link); }, function () { note('share', link); });
        analytics.event('share', { method: 'link', content_type: 'look', item_id: last.style });
      }
    });
  }

  // The phone's tools work before the engine starts, too.
  root.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('[data-action]');
    if (!button) return;
    var action = button.getAttribute('data-action');
    if (action === 'rotate') {
      device.setAttribute('data-orientation', device.getAttribute('data-orientation') === 'landscape' ? 'portrait' : 'landscape');
    } else if (action === 'icons') {
      var icons = $('.try-icons');
      icons.hidden = !icons.hidden;
      button.setAttribute('aria-pressed', String(!icons.hidden));
    } else if (action === 'fullscreen') {
      if (document.fullscreenElement) document.exitFullscreen();
      else device.requestFullscreen().catch(function () {});
    } else if (action === 'statistics') {
      askConsent();
    }
  });
  var full = root.querySelector('[data-action="fullscreen"]');
  if (full && document.fullscreenEnabled && device.requestFullscreen) full.hidden = false;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.VGTry) return resolve();
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () { reject({ reason: 'missing' }); };
      document.head.appendChild(script);
    });
  }

  // A share link opens on its look; without one, the last look seen in this browser. A style's own page opens on its
  // style: there a link or a saved look counts only when it is of that style.
  var ofThisStyle = function (look) {
    return !config.style || new RegExp('(^|&)style=' + config.style + '(&|$)').test(look) ? look : '';
  };
  var sharedLook = function () {
    var hash = location.hash.replace(/^#/, '');
    return /(^|&)style=/.test(hash) ? ofThisStyle(hash) : '';
  };
  var firstLook = function () {
    return sharedLook() || ofThisStyle(stored(LOOK_KEY) || '') || (config.style ? 'style=' + config.style : '');
  };

  // The page's timeline, for measuring how long a visitor waits: performance marks (try:load, try:view, try:ready, and
  // the start-up's vg-startup:play, :art, :done), printed as a table with ?timing in the address.
  var mark = function (name) {
    try { performance.mark('try:' + name); } catch (e) { /* no User Timing: nothing to mark */ }
  };
  var timeline = function () {
    if (!/[?&]timing/.test(location.search) || !window.performance || !performance.getEntriesByType) return;
    var marks = performance.getEntriesByType('mark').filter(function (m) { return /^(try|vg-startup):/.test(m.name); });
    var view = marks.filter(function (m) { return m.name === 'try:view'; })[0];
    console.table(marks.map(function (m) {
      return { step: m.name, ms: Math.round(m.startTime), 'after view': view ? Math.round(m.startTime - view.startTime) : '' };
    }));
  };

  // The engine loads as soon as the page is quiet, behind the dark launch, so the visitor who scrolls to the phone waits
  // only for the start-up; the start-up plays when the phone comes into view. Save-Data visitors load it on view.
  var startup = null;
  var prepared = false;
  function prepare() {
    if (prepared) return;
    prepared = true;
    mark('load');
    setState('starting');
    startup = config.startup && window.VGStartup ? window.VGStartup.mount(screen, {
      art: config.startup.art,
      minMs: config.startup.minMs,
      base: config.startup.base,
      label: 'Loading ' + config.name,
      wait: true
    }) : null;
    // The engine's script and Skia's wasm report nothing as they arrive: the bar creeps meanwhile, then follows the
    // engine's own files (fonts, words, the style's art), and fills when the engine is ready.
    var creep = 0;
    var creeping = setInterval(function () {
      creep += (0.6 - creep) * 0.08;
      if (startup) startup.progress(creep);
    }, 400);
    loadScript(config.engine + 'vgtry.js').then(function () {
      if (!window.VGTry.isSupported()) throw { reason: 'unsupported' };
      return window.VGTry.start({
        host: screen,
        base: config.engine,
        look: firstLook(),
        onProgress: function (progress) {
          if (startup) startup.progress(Math.max(creep, Math.min(0.95, 0.6 + progress.files * 0.03)));
        }
      });
    }).then(function (engineApp) {
      clearInterval(creeping);
      mark('ready');
      app = engineApp;
      readyAt = now();
      wire();
      setState('running');
      analytics.event('web_ready', { ms: app.info.ms, bytes: app.info.bytes, files: app.info.files, style: last.style });
      return startup ? startup.ready() : null;
    }).then(function (shown) {
      if (shown) analytics.event('splash_shown', { ms: shown.shownMs });
      var marks = window.performance && performance.getEntriesByName ? performance.getEntriesByName('try:view') : [];
      if (marks.length) analytics.event('web_first_frame', { ms: Math.round(now() - marks[0].startTime) });
      timeline();
    }).catch(function (failure) {
      clearInterval(creeping);
      var reason = failure && failure.reason ? failure.reason : 'failed';
      if (reason === 'failed') analytics.error('start: ' + (failure && failure.message ? failure.message : String(failure)), failure && failure.stack);
      setState('failed');
      $('.try-style-name').textContent = config.name;
      if (startup) startup.fail(MESSAGES[reason]);
      else {
        $('.try-fallback-text').textContent = MESSAGES[reason];
        $('.try-fallback').hidden = false;
      }
      timeline();
    });
  }

  var started = false;
  function begin() {
    if (started) return;
    started = true;
    mark('view');
    prepare();
    if (startup) startup.play();
    if (analytics.on && !stored(CONSENT_KEY)) askConsent();
  }

  var saveData = navigator.connection && navigator.connection.saveData;
  if (!saveData) {
    var quiet = function () {
      if (window.requestIdleCallback) window.requestIdleCallback(prepare, { timeout: 2000 });
      else setTimeout(prepare, 200);
    };
    if (document.readyState === 'complete') quiet();
    else window.addEventListener('load', quiet);
  }

  // The start-up plays when the phone comes into view, at once for a share link.
  if (sharedLook()) {
    window.scrollTo({ top: window.scrollY + device.getBoundingClientRect().top - SCROLL_OFFSET });
    begin();
  } else if (window.IntersectionObserver) {
    var watch = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      watch.disconnect();
      begin();
    }, { threshold: 0.3 });
    watch.observe(screen);
  } else {
    begin();
  }
}());
