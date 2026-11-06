// A product's web version on its page (the template's "try" block, tools/lib/try.mjs): the real app's engine
// (vgtry.js and its files in the block's engine folder, which only the Deployer writes) live in the phone, with the
// product's start-up (assets/startup/) in its screen. The engine loads when the page is quiet, behind the start-up's
// dark launch; the start-up plays when the phone comes into view, so a visitor waits for it alone. The panel is built from the engine's own catalog: its styles with
// their pictures, Free or the price, their layouts, and the app's settings in the app's words. The look shown is kept
// in this browser and can be shared as a link (#style=…). The store links carry the style shown, for the app to open
// on it after the install. A style's own page (config.style) opens on that style and has no list of styles; a page
// without the start-up (config.startup false) draws the wallpaper as soon as the engine is ready. With config.layouts
// (a script that reads the product's shared layouts), a link #layout=<CODE> opens on that layout, and the store links
// carry its code instead of the style. With config.appLinks, "Show QR for this look" shows the app's own link to the
// look on show (an App Link: /look/?style=…&layout=…, or a market layout's /l/?c=…) as a QR code to scan with a phone.
//
// Statistics (Google Analytics 4, the product's web stream) only with a measurement id, and only after the visitor says
// yes: events wait in memory until the answer and are dropped on a no. Events: splash_shown (ms), web_ready (ms, bytes,
// files), style_view, layout_view, setting_change, mode_change, gps_request, gps_result, cta_click (where, style),
// share, qr_show (style, layout), fps_low, web_first_frame (ms from the phone coming into view to the wallpaper
// showing), and exception for the page's and the engine's errors (20 at most). Our own test visits load nothing,
// whatever the answer (George, 31 Oct 2026: "Yes, players first"; Games docs/growth/real-players.md): a page served from this PC (localhost, 127.0.0.1,
// [::1], *.localhost, a file) or a browser a script drives (navigator.webdriver: Playwright, Selenium). The question
// and the switch stay as they are.
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

  // A test visit, not a visitor: why, or '' for a visitor.
  var testVisit = (function () {
    var host = location.hostname.toLowerCase();
    if (location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1' || /\.localhost$/.test(host)) return 'a page served from this PC';
    if (navigator.webdriver) return 'a browser a script drives';
    return '';
  }());

  // Statistics: gtag loads only after a yes, and never for a test visit; before the answer, events wait here and
  // nothing leaves the page.
  var analytics = (function () {
    var id = config.measurementId;
    var loaded = false;
    var off = false;
    var answered = false;
    var waiting = [];
    var errorsLeft = MAX_ERRORS;
    var send = function (name, params) {
      window.gtag('event', name, params);
    };
    var load = function () {
      if (loaded || !id) return;
      if (testVisit) {
        console.log('[try] Statistics off: ' + testVisit + ', not a visitor.');
        return;
      }
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
      if (loaded) { if (!off) send(name, params); }
      else if (!answered && waiting.length < MAX_WAITING) waiting.push([name, params]);
    };
    // Withdrawn after loading: gtag stops storing and sending at once, in place. The page used to reload without it,
    // and the reload put the visitor back lower down, on the next section (George, 4 Nov 2026: "Clicking usage
    // statistics moves me to About Vintage"): the panel above is still empty when the browser restores the scroll.
    // ga-disable stops even the cookieless pings that consent mode sends; a yes again lifts both.
    var pause = function (stop) {
      off = stop;
      window['ga-disable-' + id] = stop;
      window.gtag('consent', 'update', { analytics_storage: stop ? 'denied' : 'granted' });
    };
    return {
      on: !!id,
      answer: function (value) {
        answered = true;
        if (value === 'granted') {
          if (loaded) pause(false);
          else load();
        } else {
          waiting = [];
          if (loaded) pause(true);
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

  // How things come and go here (the design canon, sections 1 and 2): assets/faq.js's menus and boxes, loaded once.
  // Until it is in, or if it can't be, they just show and hide.
  var motion = null;
  var motionReady = import('/assets/faq.js').then(function (m) { motion = m; }, function () { /* they show and hide at once */ });

  // The question, once per browser, when the demo starts; the "Usage statistics" switch at the panel's foot shows the
  // answer and changes it. It rises in from the window's foot and goes back the same way, as a sheet does.
  var consent = $('.try-consent');
  var statistics = $('.try-statistics input');
  // It waits for faq.js to be in (or to have failed), so the rise always runs and the question is never lost.
  var askConsent = function () {
    motionReady.then(function () {
      if (!consent || !consent.hidden) return;
      consent.hidden = false;
      if (motion) motion.showMenu(consent, null, true);
    });
  };
  var decide = function (value) {
    store(CONSENT_KEY, value);
    if (!consent.hidden && motion) motion.hideMenu(consent, null, function () { consent.hidden = true; }, true);
    else consent.hidden = true;
    statistics.checked = value === 'granted';
    analytics.answer(value);
  };
  if (consent) {
    Array.prototype.forEach.call(consent.querySelectorAll('button[data-answer]'), function (button) {
      button.addEventListener('click', function () { decide(button.getAttribute('data-answer')); });
    });
    statistics.addEventListener('change', function () { decide(statistics.checked ? 'granted' : 'denied'); });
    var answer = stored(CONSENT_KEY);
    statistics.checked = answer === 'granted';
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

  // The store link with the style shown, or the market layout shown, for the install referrer (the app opens on it).
  var storeUrl = function (style, code) {
    if (!config.referrer) return config.store;
    var referrer = config.referrer + '&utm_content=' + encodeURIComponent(code ? 'layout_' + code : 'style_' + style);
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
    // An on/off row is a <label>, so a tap on its words flips the switch too.
    var row = document.createElement(setting.type === 'toggle' ? 'label' : 'div');
    row.className = 'try-setting';
    var label = document.createElement('span');
    label.textContent = setting.label;
    row.appendChild(label);
    if (setting.type === 'toggle') {
      // The site's switch (assets/switch.css), never a checkbox.
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'switch';
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

  // The styles that draw HUD mode wear "HUD" with the HUD icon on their card, as in the app's style list (George, 4 Nov
  // 2026: "Mark styles with a pill like in the app that suppot hud").
  var HUD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 18.5L6 5.5h12l2.5 13z"/><path d="M8.8 14.2a3.6 3.6 0 1 1 6.4 0"/><path d="M12 13.2l1.6-2"/></svg>';
  var isHudStyle = function (id) { return !!config.hud && config.hud.styles.indexOf(id) >= 0; };
  var hudPill = function () {
    var pill = document.createElement('span');
    pill.className = 'try-hud-pill';
    pill.innerHTML = HUD_ICON;
    pill.appendChild(document.createTextNode('HUD'));
    return pill;
  };

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
      if (isHudStyle(style.id)) b.appendChild(hudPill());
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

    fillLayouts(style, values);

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

    storeLinks().forEach(function (a) { a.href = storeUrl(style.id, values.shared ? values.layout : ''); });
    var shared = $('.try-shared');
    if (shared) shared.hidden = !values.shared;
    store(LOOK_KEY, app.look());

    var mode = values.values.mode || '';
    if (style.id !== last.style) analytics.event('style_view', { style: style.id, free: style.free });
    else if (values.layout !== last.layout) analytics.event('layout_view', { style: style.id, layout: values.layout });
    if (last.mode && mode && mode !== last.mode) analytics.event('mode_change', { mode: mode, style: style.id });
    last = { style: style.id, layout: values.layout, mode: mode };
  }

  // The Layouts menu (tools/lib/try.mjs layoutSets; George, 4 Nov 2026: "layouts menu must show first built in layouts
  // and their huds somehow ... and then the marketplace"): Built in, the style's own layouts; HUD layouts, while a HUD
  // style is on show, each shown through Original | HUD; From the layout market, the style's most used live layouts,
  // tried in the phone. Only what the phone shows is lit: a built-in or market layout under Original, a HUD layout
  // under HUD (try.css).
  var MARKET_MOST = 4;
  // The Ready-made group (the app's picker group of the same name): the layouts VHub ships, read live from Speedometer's
  // public Firestore index. Only the version out for everyone (`live`), never a candidate or a tester's copy.
  var READY_SHAPE = 'phone';
  var READY_CODE = 'ready-';
  var READY_TIMEOUT_MS = 8000;
  var FIRESTORE_SPEEDOMETER = 'https://firestore.googleapis.com/v1/projects/speedometer-wallpaper/databases/(default)/documents/';
  var readyRows = null;
  var marketRows = {};
  var marketScript = null;

  // Original | HUD, as a tap on the switch would make it (wireHud keeps the state).
  var viewAs = function (shown) {
    if ((root.getAttribute('data-hud-view') === 'hud') === (shown === 'hud')) return;
    var button = root.querySelector('.try-view [data-hud-view="' + shown + '"]');
    if (button) button.click();
  };

  var layoutChip = function (name, by, pressed, key, pick) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = by ? 'try-chip try-market-chip' : 'try-chip';
    chip.textContent = name;
    if (by) {
      var who = document.createElement('small');
      who.textContent = 'by ' + by;
      chip.appendChild(who);
    }
    chip.setAttribute('aria-pressed', String(pressed));
    chip.setAttribute('data-focus', key);
    chip.addEventListener('click', function () {
      viewAs('original');
      pick();
    });
    return chip;
  };

  // A set, and the whole menu, comes and goes as the style changes: it grows in from nothing as it fades in, and shrinks
  // away the same way (assets/faq.js's showBox and hideBox), with the page and the panel never scrolling for it. The
  // first fill, and any before faq.js is in, just shows what there is. A set on its way out keeps its chips until it has
  // gone.
  var layoutsDrawn = false;
  var reveal = function (el, on) {
    if (!el) return;
    if (!layoutsDrawn || !motion) el.hidden = !on;
    else if (on) motion.showBox(el);
    else motion.hideBox(el);
  };

  function fillLayouts(style, values) {
    var layouts = $('.try-layouts');
    if (!layouts) return;
    var focused = layouts.contains(document.activeElement) ? focusKey(document.activeElement) : '';
    var hud = layouts.querySelector('.try-layout-hud');
    var market = layouts.querySelector('.try-layout-market');
    var ready = layouts.querySelector('.try-layout-ready');
    var rows = market ? marketRowsOf(style.id) : [];
    var readies = ready ? readyRowsOf(style.id) : [];
    var showing = style.layouts.length > 1 || isHudStyle(style.id) || rows.length > 0 || readies.length > 0;
    reveal(hud, isHudStyle(style.id));
    reveal(ready, readies.length > 0);
    reveal(market, rows.length > 0);
    reveal(layouts, showing);
    layoutsDrawn = true;

    if (showing) {
      var builtIn = layouts.querySelector('.try-layout-builtin .try-chips');
      builtIn.textContent = '';
      style.layouts.forEach(function (layout) {
        builtIn.appendChild(layoutChip(layout.name, '', layout.id === values.layout, 'layout:' + layout.id, function () {
          app.set('layout', layout.id);
        }));
      });
    }
    if (ready && readies.length) {
      var readyChips = ready.querySelector('.try-chips');
      readyChips.textContent = '';
      readies.forEach(function (row) {
        readyChips.appendChild(layoutChip(row.name, '', !!values.shared && values.layout === row.code, 'ready:' + row.code, function () {
          sharedLine(row);
          showMarketLayout(row, style.id);
        }));
      });
    }
    if (market && rows.length) {
      var chips = market.querySelector('.try-chips');
      chips.textContent = '';
      rows.forEach(function (row) {
        chips.appendChild(layoutChip(row.name, row.by, !!values.shared && values.layout === row.code, 'market:' + row.code, function () {
          sharedLine(row);
          showMarketLayout(row, style.id);
        }));
      });
    }
    if (focused) {
      var again = layouts.querySelector('[data-focus="' + focused.replace(/"/g, '') + '"]');
      if (again) again.focus();
    }
  }

  var firestoreValue = function (v) {
    if (!v) return null;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('booleanValue' in v) return v.booleanValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(firestoreValue);
    if ('mapValue' in v) return firestoreFields(v.mapValue.fields);
    return null;
  };
  var firestoreFields = function (fields) {
    var out = {};
    Object.keys(fields || {}).forEach(function (key) { out[key] = firestoreValue(fields[key]); });
    return out;
  };
  var readFirestore = function (path) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, READY_TIMEOUT_MS);
    return fetch(FIRESTORE_SPEEDOMETER + path, { signal: controller.signal }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (doc) { return firestoreFields(doc.fields); }).finally(function () { clearTimeout(timer); });
  };

  // The ready-made layouts of a style, read once a visit: the live version of every layout the index offers (status
  // live), kept when its styles and shapes fit this phone. Any failed read leaves the built-in copies alone.
  function readyRowsOf(styleId) {
    if (readyRows) return readyRows[styleId] || [];
    readyRows = {};
    readFirestore('shippedLayouts/index').then(function (index) {
      var entries = (index.layouts || []).filter(function (entry) { return entry && entry.status === 'live' && entry.live; });
      entries.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      return Promise.all(entries.map(function (entry) {
        return readFirestore('shippedLayoutVersions/' + encodeURIComponent(entry.live)).then(function (version) {
          var layout = JSON.parse(version.data);
          var names = layout.names || {};
          return { id: entry.id, data: version.data, layout: layout, name: names.en || layout.name || entry.id };
        }).catch(function (failure) {
          analytics.error('ready-made layout ' + entry.id + ': ' + whyOf(failure));
          return null;
        });
      }));
    }).then(function (found) {
      var byStyle = {};
      found.filter(Boolean).forEach(function (item) {
        if (item.layout.shapes && item.layout.shapes.indexOf(READY_SHAPE) < 0) return;
        catalog.styles.forEach(function (style) {
          if (item.layout.styles && item.layout.styles.indexOf(style.id) < 0) return;
          (byStyle[style.id] = byStyle[style.id] || []).push({ code: READY_CODE + item.id, data: item.data, madeWith: style.id, name: item.name });
        });
      });
      readyRows = byStyle;
      if (last.style && (byStyle[last.style] || []).length) fillLayouts(styleOf(last.style), app.values());
    }, function (failure) {
      analytics.error('ready-made layouts: ' + whyOf(failure), failure && failure.stack);
    });
    return [];
  }

  // A style's market layouts, read once a visit: none until they are in (the set shows then), none when the style has
  // none, and none when the market can't be read, which is reported.
  function marketRowsOf(styleId) {
    if (marketRows[styleId]) return marketRows[styleId];
    marketRows[styleId] = [];
    marketScript = marketScript || loadScript(config.layouts, 'VGTryLayouts');
    marketScript.then(function () {
      var market = window.SpeedoMarket;
      return market.byStyle(styleId, MARKET_MOST).then(function (found) {
        return market.profiles(found.map(function (layout) { return layout.creatorUid; })).then(function (people) {
          return found.map(function (layout) {
            var person = people.get(layout.creatorUid);
            return { code: layout.code, data: layout.data, madeWith: layout.madeWith, name: layout.name, by: person ? person.name : '', href: market.layoutUrl(layout.code) };
          });
        });
      });
    }).then(function (found) {
      marketRows[styleId] = found;
      if (found.length && last.style === styleId) fillLayouts(styleOf(styleId), app.values());
    }, function (failure) {
      analytics.error('market layouts of ' + styleId + ': ' + whyOf(failure), failure && failure.stack);
    });
    return marketRows[styleId];
  }

  // A HUD layout picked under Original shows its HUD look (wireHud has set the layout by then).
  function wireLayouts() {
    Array.prototype.forEach.call(root.querySelectorAll('.try-layout-hud [data-hud-layout]'), function (chip) {
      chip.addEventListener('click', function () { viewAs('hud'); });
    });
  }

  // HUD mode (Speedometer docs/hud-mode/design.md §9; George, card 12 A: "A real HUD mode on the try page"): the
  // phone's screen fills the window, flipped for the windscreen, the screen kept on, with the visitor's real GPS speed
  // when they chose it and the demo drive's otherwise. A browser can't raise the brightness, so it asks. Tap once for
  // Exit and Flip, as in the app; Esc or leaving full screen ends it.
  //
  // Original | HUD (George, 4 Nov 2026: "Yes, try page and app"): while one of the HUD styles is on show, the switch
  // turns the phone on its side and draws that style's HUD look in it, read straight (the engine's app.hud, flip
  // "holder"); the layout chips change it there and then. Original puts the wallpaper back as it was, orientation
  // included; so does another style. HUD mode opened from the HUD look comes back to it. Counted as hud_view.
  function wireHud() {
    if (!config.hud) return;
    var layer = $('.try-hud-layer');
    var tip = $('.try-hud-tip');
    var controls = $('.try-hud-controls');
    var chips = root.querySelectorAll('[data-hud-layout]');
    var view = $('.try-view');
    var viewButtons = view ? view.querySelectorAll('[data-hud-view]') : [];
    var PREVIEW_FLIP = 'holder';
    var FLIP_KEY = 'vgtry.' + config.product + '.hudFlip';
    var CONTROLS_MS = 4000;
    var TIP_MS = 6000;
    var BEEP_HZ = 880;
    var BEEP_S = 0.18;
    var layout = config.hud.layouts.indexOf('gauge_arc') >= 0 ? 'gauge_arc' : config.hud.layouts[0];
    var isOn = false;
    var openedAt = 0;
    var wakeLock = null;
    var orientationBefore = 'portrait';
    var orientationLocked = false;
    var hideTimer = 0;
    var tipTimer = 0;
    var sound = null;
    // The HUD look in the phone (Original | HUD on HUD): the style it draws and the orientation to give back.
    var previewStyle = '';
    var orientationBeforePreview = 'portrait';

    var markLayout = function () {
      Array.prototype.forEach.call(chips, function (chip) {
        chip.setAttribute('aria-checked', String(chip.getAttribute('data-hud-layout') === layout));
      });
    };
    var isHudStyle = function (id) { return config.hud.styles.indexOf(id) >= 0; };
    var showPreview = function () {
      app.hud.start({ style: previewStyle, layout: layout, flip: PREVIEW_FLIP });
    };
    var markView = function () {
      if (!view) return;
      var shown = previewStyle ? 'hud' : 'original';
      view.setAttribute('data-view', shown);
      Array.prototype.forEach.call(viewButtons, function (button) {
        var on = button.getAttribute('data-hud-view') === shown;
        button.setAttribute('aria-checked', String(on));
        button.tabIndex = on ? 0 : -1;
      });
    };
    // HUD: the phone turns on its side and draws the style on show's HUD look. Original: the wallpaper, as it was.
    var setView = function (shown) {
      if ((shown === 'hud') === !!previewStyle) return;
      if (shown === 'hud') {
        if (!isHudStyle(last.style)) return;
        previewStyle = last.style;
        orientationBeforePreview = device.getAttribute('data-orientation') || 'portrait';
        device.setAttribute('data-orientation', 'landscape');
        root.setAttribute('data-hud-view', 'hud');
        showPreview();
      } else {
        previewStyle = '';
        root.removeAttribute('data-hud-view');
        app.hud.stop();
        device.setAttribute('data-orientation', orientationBeforePreview);
      }
      markView();
      analytics.event('hud_view', { view: shown, style: last.style, layout: layout });
    };
    // The switch shows while a HUD style is on show; another style puts the wallpaper back.
    var syncView = function () {
      if (previewStyle && last.style !== previewStyle) setView('original');
      if (view) view.hidden = !isHudStyle(last.style);
    };
    // The style on show when it draws HUD mode; Horizon (free in the app) otherwise.
    var style = function () {
      return config.hud.styles.indexOf(last.style) >= 0 ? last.style : config.hud.styles[0];
    };
    var keepAwake = function () {
      if (!navigator.wakeLock || !navigator.wakeLock.request) return;
      navigator.wakeLock.request('screen').then(function (lock) { wakeLock = lock; }, function () {});
    };
    // The lock HUD mode took on the real screen's orientation, given back (leaving full screen drops it too).
    var unlockOrientation = function () {
      if (!orientationLocked) return;
      orientationLocked = false;
      try { window.screen.orientation.unlock(); } catch (e) {}
    };
    var showControls = function () {
      controls.hidden = false;
      void controls.offsetWidth; // from display: none, so the first fade-in still runs
      controls.classList.add('is-shown');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { controls.classList.remove('is-shown'); }, CONTROLS_MS);
    };
    var beep = function () {
      var Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      sound = sound || new Context();
      var tone = sound.createOscillator();
      var gain = sound.createGain();
      tone.frequency.value = BEEP_HZ;
      gain.gain.setValueAtTime(0.2, sound.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sound.currentTime + BEEP_S);
      tone.connect(gain).connect(sound.destination);
      tone.start();
      tone.stop(sound.currentTime + BEEP_S);
    };

    function start() {
      isOn = true;
      openedAt = now();
      root.setAttribute('data-hud', 'on');
      // The phone is turned for the windscreen; stop() turns it back (George, 4 Nov 2026: "Getting to hud mode can not
      // return to original mode.").
      orientationBefore = device.getAttribute('data-orientation') || 'portrait';
      device.setAttribute('data-orientation', 'landscape');
      layer.hidden = false;
      tip.hidden = false;
      clearTimeout(tipTimer);
      tipTimer = setTimeout(function () { tip.hidden = true; }, TIP_MS);
      // From the HUD look (read straight), a fresh start: HUD mode lies as last flipped, or as it starts in the app.
      if (previewStyle) app.hud.stop();
      app.hud.start({ style: style(), layout: layout, flip: stored(FLIP_KEY) || '' });
      if (document.fullscreenEnabled && device.requestFullscreen) {
        device.requestFullscreen().then(function () {
          var orientation = window.screen.orientation;
          if (!orientation || !orientation.lock) return;
          orientation.lock('landscape').then(function () {
            orientationLocked = true;
            if (!isOn) unlockOrientation();
          }, function () {});
        }, function () {});
      }
      keepAwake();
      analytics.event('hud_opened', { source: 'web', style: style(), layout: layout, gps: app.values().source === 'gps' });
    }

    function stop(reason) {
      if (!isOn) return;
      isOn = false;
      root.removeAttribute('data-hud');
      layer.hidden = true;
      controls.classList.remove('is-shown');
      // Opened from the HUD look, it goes back to it; otherwise to the wallpaper.
      if (previewStyle) showPreview();
      else app.hud.stop();
      device.setAttribute('data-orientation', orientationBefore);
      unlockOrientation();
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
      if (wakeLock) wakeLock.release().catch(function () {});
      wakeLock = null;
      analytics.event('hud_closed', { reason: reason, duration_s: Math.round((now() - openedAt) / 1000) });
    }

    markLayout();
    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        layout = chip.getAttribute('data-hud-layout');
        markLayout();
        if (previewStyle) showPreview();
      });
    });
    if (view) {
      Array.prototype.forEach.call(viewButtons, function (button) {
        button.addEventListener('click', function () { setView(button.getAttribute('data-hud-view')); });
      });
      // A radio pair: the arrow keys move the choice, as in any radio group.
      view.addEventListener('keydown', function (event) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(event.key) < 0) return;
        event.preventDefault();
        setView(previewStyle ? 'original' : 'hud');
        var chosen = view.querySelector('[aria-checked="true"]');
        if (chosen) chosen.focus();
      });
      app.on('change', syncView);
      syncView();
    }
    root.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('[data-action="hud"]')) start();
    });
    layer.addEventListener('click', function (event) {
      // Only the buttons: start() puts data-hud="on" on the block itself, which a tap on the bare screen would find.
      var button = event.target.closest && event.target.closest('button[data-hud]');
      if (!button) {
        showControls();
        return;
      }
      if (button.getAttribute('data-hud') === 'exit') {
        stop('exit');
      } else {
        var flip = app.hud.flip();
        store(FLIP_KEY, flip);
        analytics.event('hud_flipped', { to: flip });
        // Flip puts Exit and Flip away, as in the app (George, 4 Nov 2026: "When I am at hud, when I press flip close
        // menu."); a tap on the screen brings them back.
        clearTimeout(hideTimer);
        controls.classList.remove('is-shown');
      }
    });
    document.addEventListener('keydown', function (event) {
      if (isOn && event.key === 'Escape') stop('back');
    });
    document.addEventListener('fullscreenchange', function () {
      if (isOn && !document.fullscreenElement) stop('back');
    });
    // The browser drops the screen's wake lock when the page hides; it comes back with the page.
    document.addEventListener('visibilitychange', function () {
      if (isOn && !document.hidden) keepAwake();
    });
    // Only HUD mode beeps: the HUD look in the page stays quiet.
    app.on('hudwarning', function () { if (isOn) beep(); });
  }

  function wire() {
    catalog = app.catalog();
    if (catalog.api < API_VERSION) analytics.error('catalog api ' + catalog.api + ', the page knows ' + API_VERSION);
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
    wireHud();
    wireLayouts();

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
        copied.then(function () {
          note('share', '');
          showToast('Link copied', lookWords());
        }, function () {
          // No clipboard here: the link (this page with the look after #) goes in the address bar, to copy from there.
          if (history.replaceState) history.replaceState(history.state, '', link);
          showToast('Couldn’t copy the link', 'It’s in the address bar: copy it from there', true);
        });
        analytics.event('share', { method: 'link', content_type: 'look', item_id: last.style });
      } else if (action === 'qr') {
        openLook(button);
      }
    });
  }

  // ---- The look's QR (config.appLinks; George, 3 Nov 2026: "show qr for this style which will be the deeplink to that
  // style in the app"): the app's own link to the look on show, as a QR code made in the page (assets/try/qr.js, loaded
  // the first time). Scanned, it opens the app on that style and layout (an App Link), or a market layout's page; without
  // the app, a page that offers Google Play and this look in the browser. The sheet is a modal dialog, so the keyboard
  // stays in it; Escape, its close button or a tap on the shade closes it. It opens and closes as every menu does
  // (assets/faq.js's showMenu and hideMenu, as a sheet: it rises as it fades in, and goes back a little faster; under
  // reduced motion, a short fade), its shade fading with it. The dialog shuts as its close starts, so the page is live
  // again at once: the sheet goes on falling over it (is-closing, which takes no taps), and the QR button pressed
  // meanwhile turns it round from where it is.
  var QR_SCRIPT = '/assets/try/qr.js';
  var QR_DARK = '#0B0B0C';
  var QR_LIGHT = '#FFFFFF';
  var EASE = 'cubic-bezier(.2, .8, .2, 1)';
  var SHADE = { open: 260, close: 200, fadeIn: 150, fadeOut: 100 };
  var lookBox = $('.try-look');
  var lookFrom = null;
  var marketShown = null;

  // A link template's {name}s filled in.
  var linkOf = function (template, values) {
    return template.replace(/\{(\w+)\}/g, function (m, name) { return encodeURIComponent(values[name] || ''); });
  };
  var lookLink = function (values) {
    if (values.shared && config.appLinks.layout) return linkOf(config.appLinks.layout, { code: values.layout });
    return linkOf(config.appLinks.look, { style: values.style, layout: values.layout });
  };

  function moveLook(on, done) {
    var sheet = lookBox.querySelector('.try-look-sheet');
    var shade = lookBox.querySelector('.try-look-shade');
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Mid-move, it turns round from where it is.
    var moving = shade.getAnimations();
    var from = moving.length ? getComputedStyle(shade).opacity : (on ? 0 : 1);
    moving.forEach(function (a) { a.cancel(); });
    shade.animate({ opacity: [from, on ? 1 : 0] }, {
      duration: still ? (on ? SHADE.fadeIn : SHADE.fadeOut) : (on ? SHADE.open : SHADE.close),
      easing: EASE,
      fill: 'forwards'
    });
    if (!motion) {
      if (done) done();
    } else if (on) {
      motion.showMenu(sheet, lookFrom, true);
    } else {
      motion.hideMenu(sheet, lookFrom, done, true);
    }
  }

  function openLook(button) {
    if (!lookBox || lookBox.open || !app) return;
    var values = app.values();
    var style = styleOf(values.style);
    var link = lookLink(values);
    loadScript(QR_SCRIPT, 'VGQR').then(function () {
      if (lookBox.open) return;
      lookBox.querySelector('.try-look-code').innerHTML = window.VGQR.svg(link, { dark: QR_DARK, light: QR_LIGHT });
      lookBox.querySelector('.try-look-name').textContent = style.name;
      var layout = style.layouts.filter(function (l) { return l.id === values.layout; })[0];
      var words = '';
      if (values.shared) words = marketShown ? marketShown.name + ' by ' + marketShown.by : 'A layout from the layout market';
      else if (layout && style.layouts.length > 1) words = 'Layout: ' + layout.name;
      lookBox.querySelector('.try-look-layout').textContent = words;
      lookFrom = button;
      lookBox.classList.remove('is-closing');
      lookBox.inert = false;
      lookBox.showModal();
      lookBox.querySelector('.try-look-close').focus({ preventScroll: true });
      moveLook(true);
      analytics.event('qr_show', { style: values.style, layout: values.layout });
    }, function (failure) {
      analytics.error('qr: ' + (failure && failure.reason ? failure.reason : whyOf(failure)));
      note('share', 'The QR code couldn’t be made just now. Please reload the page.');
    });
  }

  // ---- "Link copied" as a toast (George, 4 Nov 2026: "The link copied must be improved as ui."): a tick, "Link copied"
  // and what the link opens (the style and its layout, or the market layout and its maker), never the address. It sits
  // at the screen's foot over the statistics question and the try page's bar (assets/try/try.css), takes no tap and no
  // focus, and goes after 3 s; another copy keeps it up. It rises as it fades in and drops a little faster as it goes
  // (a short fade under reduced motion). A screen reader hears it from a polite status line, made before it is needed.
  var TOAST_MS = 3000;
  var TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var BANG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 6.5v7M12 17.5h.01"/></svg>';
  var toastBox = null;
  var toastUp = false;
  var toastTimer = 0;
  var toastTurn = 0;
  var toastSay = document.createElement('p');
  toastSay.className = 'sr-only';
  toastSay.setAttribute('role', 'status');
  document.body.appendChild(toastSay);

  function lookWords() {
    var values = app.values();
    var style = styleOf(values.style);
    if (values.shared) return style.name + ' · ' + (marketShown ? marketShown.name + ' by ' + marketShown.by : 'a market layout');
    var layout = style.layouts.filter(function (l) { return l.id === values.layout; })[0];
    return layout && style.layouts.length > 1 ? style.name + ' · ' + layout.name : style.name;
  }

  // Lifted over whatever shows at the screen's foot.
  function toastLift() {
    var lift = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.try-consent:not([hidden]), .screen-bar'), function (el) {
      var box = el.getBoundingClientRect();
      if (box.height && box.top < window.innerHeight && box.bottom > 0) lift = Math.max(lift, window.innerHeight - box.top);
    });
    return lift;
  }

  function moveToast(on, done) {
    if (!toastBox.animate) {
      if (done) done();
      return;
    }
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Mid-move, it turns round from where it is.
    var moving = toastBox.getAnimations();
    var from = moving.length ? getComputedStyle(toastBox).opacity : (on ? 0 : 1);
    moving.forEach(function (a) { a.cancel(); });
    var frames = still ? { opacity: [from, on ? 1 : 0] }
      : on ? { opacity: [from, 1], transform: ['translateY(12px) scale(0.96)', 'none'] }
      : { opacity: [from, 0], transform: ['none', 'translateY(8px) scale(0.98)'] };
    var move = toastBox.animate(frames, {
      duration: still ? (on ? 120 : 90) : (on ? 220 : 150),
      easing: on ? EASE : 'cubic-bezier(.4, 0, 1, 1)',
      fill: on ? 'none' : 'forwards'
    });
    if (done) move.onfinish = done;
  }

  function showToast(title, detail, warn) {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'try-toast';
      toastBox.hidden = true;
      toastBox.setAttribute('aria-hidden', 'true');
      toastBox.innerHTML = '<span class="try-toast-icon"></span><span class="try-toast-text"><b></b><small></small></span>';
      document.body.appendChild(toastBox);
    }
    var turn = ++toastTurn;
    toastBox.setAttribute('data-tone', warn ? 'warn' : 'ok');
    toastBox.querySelector('.try-toast-icon').innerHTML = warn ? BANG : TICK;
    toastBox.querySelector('b').textContent = title;
    toastBox.querySelector('small').textContent = detail || '';
    toastBox.style.setProperty('--try-toast-lift', toastLift() + 'px');
    // Said afresh each time, so a second copy is heard too.
    toastSay.textContent = '';
    setTimeout(function () { toastSay.textContent = title + (detail ? '. ' + detail : ''); }, 60);
    if (!toastUp) {
      toastUp = true;
      toastBox.hidden = false;
      moveToast(true);
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastUp = false;
      moveToast(false, function () {
        if (turn !== toastTurn) return;
        toastBox.hidden = true;
        toastBox.getAnimations().forEach(function (a) { a.cancel(); });
      });
    }, TOAST_MS);
  }

  function closeLook() {
    if (!lookBox.open) return;
    lookBox.classList.add('is-closing');
    lookBox.inert = true;
    lookBox.close();
    moveLook(false, function () {
      lookBox.classList.remove('is-closing');
      lookBox.inert = false;
      lookBox.querySelector('.try-look-shade').getAnimations().forEach(function (a) { a.cancel(); });
    });
  }

  if (lookBox) {
    lookBox.addEventListener('click', function (event) {
      if (event.target === lookBox || event.target.matches('.try-look-shade') || event.target.closest('.try-look-close')) closeLook();
    });
    // Escape would shut it at once: it closes as the button does.
    lookBox.addEventListener('cancel', function (event) {
      event.preventDefault();
      closeLook();
    });
    // However it shut, the keyboard goes back to the button. Shut by closeLook, it goes on falling (is-closing) and the
    // shade's fade ends with it; shut any other way, the shade's fade ends now.
    lookBox.addEventListener('close', function () {
      if (!lookBox.classList.contains('is-closing')) {
        lookBox.querySelector('.try-look-shade').getAnimations().forEach(function (a) { a.cancel(); });
      }
      if (lookFrom) lookFrom.focus({ preventScroll: true });
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
    }
  });
  var full = root.querySelector('[data-action="fullscreen"]');
  if (full && document.fullscreenEnabled && device.requestFullscreen) full.hidden = false;

  function loadScript(src, global) {
    return new Promise(function (resolve, reject) {
      if (window[global || 'VGTry']) return resolve();
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
    return /(^|&)(style|layout)=/.test(hash) ? ofThisStyle(hash) : '';
  };

  // A market layout's link (#layout=<CODE>&style=<id>, the web market design §5.2): with the block's "layouts" script,
  // the page reads the layout before the engine starts, so it opens on it; the panel says whose it is. A code the
  // market doesn't have any more falls back to the style. A layout the page couldn't read or the engine didn't show is
  // said on the page and reported, never passed over in silence (George, 27 Oct 2026: "Try it in your browser from
  // market layout is not working. It goes to live but default designs and layouts not the market one.").
  var MARKET_CODE = /(^|&)layout=([CDFGHJKMNPQRTVWXY34679]{6})(?=&|$)/;
  var styleIn = function (look) { return (look.match(/(^|&)style=([a-z0-9_]+)(?=&|$)/) || [])[2] || ''; };
  var withoutCode = function (look) { return look.replace(MARKET_CODE, '$1').replace(/^&|&$/g, '').replace(/&&/g, '&'); };
  var whyOf = function (failure) { return failure && failure.message ? failure.message : String(failure); };

  // The market layout a look names, read through the block's script: { code, data, madeWith, name, by, href }, or null.
  function marketLayout(look) {
    var match = look.match(MARKET_CODE);
    if (!match || !config.layouts) return Promise.resolve(null);
    var code = match[2];
    return loadScript(config.layouts, 'VGTryLayouts').then(function () {
      return window.VGTryLayouts.resolve(code);
    }).then(function (found) {
      if (!found) {
        note('share', 'That layout isn’t in the market any more, so here is the style alone.');
        return null;
      }
      return {
        code: code,
        data: found.data,
        madeWith: found.madeWith,
        name: found.name,
        by: found.by,
        href: found.href
      };
    }, function (failure) {
      analytics.error('market layout ' + code + ': ' + whyOf(failure), failure && failure.stack);
      note('share', 'That layout couldn’t be read just now, so here is the style alone. Please reload the page.');
      return null;
    });
  }

  // The panel's line under the style's name: whose layout it is, and its page.
  function sharedLine(layout) {
    marketShown = layout;
    var shared = $('.try-shared');
    if (!shared) return;
    shared.textContent = '';
    shared.appendChild(document.createTextNode(layout.name + ' by ' + layout.by + ' · '));
    var link = document.createElement('a');
    link.href = layout.href;
    link.textContent = 'See it in the layout market';
    shared.appendChild(link);
  }

  // The look to start with and the market layout it names: { look, layouts, layout }.
  function marketLook(look) {
    return marketLayout(look).then(function (layout) {
      if (!layout) return { look: withoutCode(look), layouts: [], layout: null };
      sharedLine(layout);
      var withStyle = styleIn(look) ? look : 'style=' + layout.madeWith + '&' + look;
      return { look: withStyle, layouts: [{ code: layout.code, data: layout.data }], layout: layout };
    });
  }

  // Shows [layout] in [style] on the running engine. The engine was given it at its start; if it isn't showing it, it
  // is given it again here, and if it still can't, the page says so and the reason is reported.
  function showMarketLayout(layout, style) {
    var values = app.values();
    if (values.shared && values.layout === layout.code && (!style || values.style === style)) return;
    if (typeof app.addLayout !== 'function') {
      analytics.error('market layout ' + layout.code + ': this engine has no addLayout (VGTry ' + window.VGTry.version + ')');
      note('share', 'This page needs a newer copy of the demo to draw that layout. Please reload the page.');
      return;
    }
    if (!app.addLayout(layout.code, layout.data)) {
      analytics.error('market layout ' + layout.code + ': the engine could not read it');
      note('share', 'That layout couldn’t be drawn here, so here is the style alone.');
      return;
    }
    app.show(style || layout.madeWith, layout.code);
    if (!app.values().shared) analytics.error('market layout ' + layout.code + ': added, yet not shown');
  }
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
      tip: config.startup.tip,
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
    var first = null;
    loadScript(config.engine + 'vgtry.js').then(function () {
      if (!window.VGTry.isSupported()) throw { reason: 'unsupported' };
      return marketLook(firstLook());
    }).then(function (look) {
      first = look;
      return window.VGTry.start({
        host: screen,
        base: config.engine,
        look: first.look,
        layouts: first.layouts,
        onProgress: function (progress) {
          if (startup) startup.progress(Math.max(creep, Math.min(0.95, 0.6 + progress.files * 0.03)));
        }
      });
    }).then(function (engineApp) {
      clearInterval(creeping);
      mark('ready');
      app = engineApp;
      readyAt = now();
      if (first.layout) showMarketLayout(first.layout, styleIn(first.look));
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

  // A market layout's link opened on a try page that is already showing (a pasted link changes only the address's
  // hash, so the page doesn't load again): the layout is read and shown then.
  window.addEventListener('hashchange', function () {
    if (!app) return;
    var look = ofThisStyle(location.hash.replace(/^#/, ''));
    if (!MARKET_CODE.test(look)) return;
    marketLayout(look).then(function (layout) {
      if (!layout) return;
      sharedLine(layout);
      showMarketLayout(layout, styleIn(look));
    });
  });

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
