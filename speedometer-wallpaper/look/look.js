// A look's page, where a try page's QR lands without the app: https://vgraphics.gr/speedometer-wallpaper/look/
// ?style=<id>&layout=<id> (assets/try/try.js writes it, from the try block's appLinks; the app's LookLink reads it). On an
// Android phone with the app the link opens the app itself (an App Link), on that style's page with that layout. Here:
// the style as the app draws it, its name, Google Play with the style in the install referrer (the app opens on it after
// the install, as the try page's store links do), and Try it in your browser on that look. On Android the page asks
// Chrome for the app once, as the market's layout page does: a QR scanner may open the link in a browser, and Chrome
// comes back with &app=none when the app isn't there, or is too old to know the link. A style the site doesn't know
// says so and offers the try page and Google Play.
(function () {
  'use strict';

  var page = document.querySelector('.lk');
  if (!page) return;
  var STYLES = '/speedometer-wallpaper/styles/styles.json';
  // The engine's pictures of the styles (the Deployer's speedometer-web writes them), as the try page's list shows them.
  var PICTURES = '/speedometer-wallpaper/play/app/styles/';
  var TRY = '/speedometer-wallpaper/play/';
  var STYLE_PAGE = '/speedometer-wallpaper/styles/';
  var STORE = 'https://play.google.com/store/apps/details?id=com.vgraphics.speedometerwallpaper';
  var REFERRER = 'utm_source=vgraphics.gr&utm_medium=look_qr';
  var PACKAGE = 'com.vgraphics.speedometerwallpaper';
  // The app's ids: lower-case letters, digits and underscores.
  var ID = /^[a-z0-9_]{1,40}$/;
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var styleId = params.get('style') || '';
  var layoutId = params.get('layout') || '';
  var isAndroid = /Android/i.test(navigator.userAgent);

  var done = function () { page.setAttribute('data-state', 'ready'); };
  var missing = function () {
    $('look-found').hidden = true;
    $('look-missing').hidden = false;
    done();
  };
  var storeUrl = function (id) {
    return STORE + '&referrer=' + encodeURIComponent(REFERRER + '&utm_content=style_' + id);
  };
  // This page's own link as an intent for the app's package; without the app, Chrome comes back with &app=none.
  var appIntent = function () {
    var link = location.host + location.pathname + location.search;
    var back = encodeURIComponent(location.protocol + '//' + link + '&app=none');
    return 'intent://' + link + '#Intent;scheme=https;package=' + PACKAGE + ';S.browser_fallback_url=' + back + ';end';
  };

  if (!ID.test(styleId) || !ID.test(layoutId)) {
    missing();
    return;
  }
  if (isAndroid && params.get('app') !== 'none') {
    $('look-open').href = appIntent();
    $('look-open').hidden = false;
    location.href = appIntent();
  }
  $('look-try').href = TRY + '#style=' + styleId + '&layout=' + layoutId;
  $('look-get').href = storeUrl(styleId);

  fetch(STYLES).then(function (response) {
    if (!response.ok) throw new Error(STYLES + ': ' + response.status);
    return response.json();
  }).then(function (data) {
    var style = data.styles.filter(function (s) { return s.id === styleId; })[0];
    if (!style) {
      missing();
      return;
    }
    $('look-name').textContent = style.name;
    $('look-kind').textContent = style.free ? 'A free style' : 'A premium style';
    var picture = $('look-picture');
    picture.alt = 'The ' + style.name + ' style, as the app draws it';
    picture.src = PICTURES + encodeURIComponent(style.image) + '.jpg';
    picture.hidden = false;
    $('look-page').href = STYLE_PAGE + encodeURIComponent(style.slug) + '/';
    $('look-page').textContent = 'More about ' + style.name;
    done();
  }, function () {
    // The list didn't come: the links already carry the look, so the page still works without the name.
    done();
  });
}());
