// The page a market layout's share link opens: https://vgraphics.gr/speedometer-wallpaper/l/?c=<CODE> (the app's
// MarketCodes, the web market design's W0). On an Android phone with the app the link opens the app's layout page
// itself (an App Link); when it opens here instead, the intent below asks Chrome for the app, and Chrome comes back
// with &app=none when it isn't installed. Google Play carries the code (utm_content=layout_<CODE>) for the app to open
// the layout after the install. Computers and iPhones get the code, Google Play and the try page. The web market's own
// layout page, with the layout drawn live, replaces this card later (W4).
(function () {
  var PACKAGE = 'com.vgraphics.speedometerwallpaper';
  var STORE = 'https://play.google.com/store/apps/details?id=' + PACKAGE;
  var params = new URLSearchParams(location.search);
  // Share codes are 6 characters from CDFGHJKMNPQRTVWXY34679 (MarketCodes.kt): no vowels, no look-alikes.
  var code = (params.get('c') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  var $ = function (id) { return document.getElementById(id); };
  if (!/^[CDFGHJKMNPQRTVWXY34679]{6}$/.test(code)) {
    $('layout-found').hidden = true;
    $('layout-missing').hidden = false;
    return;
  }
  $('layout-code').textContent = code;
  var referrer = 'utm_source=vgraphics.gr&utm_medium=layout_link&utm_content=layout_' + code;
  $('layout-get').href = STORE + '&referrer=' + encodeURIComponent(referrer);
  if (!/Android/i.test(navigator.userAgent) || params.get('app') === 'none') return;
  var link = location.host + location.pathname + '?c=' + code;
  var fallback = encodeURIComponent(location.protocol + '//' + link + '&app=none');
  var intent = 'intent://' + link + '#Intent;scheme=https;package=' + PACKAGE + ';S.browser_fallback_url=' + fallback + ';end';
  var open = $('layout-open');
  open.href = intent;
  open.hidden = false;
  location.href = intent;
})();
