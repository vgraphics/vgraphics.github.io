// The start-up every VGraphics product opens with (D:\Projects\Mine\CLAUDE.md, "Start-up"), as the site's web versions
// share it: a plain dark launch, the VGraphics intro (2.8 s; a tap skips to the welcome art, never past it), then the
// product's welcome art with the squishy loading bar, for at least 2 s and until the product is ready. The intro is the
// one the games' web builds play (the Games repo's docs/brand/splash/INTEGRATION.md; the films are copies of
// ArrowPuzzle/Assets/WebGLTemplates/Portfolio/brand-intro/), the bar Exitwise's web loader's (exitwise/play/), in the
// product's colours (assets/startup/startup.css).
//
//   var startup = VGStartup.mount(host, { art: { tall, wide }, alt, minMs, base, wait })
//     host    the element it fills (a try page's phone screen); it must be positioned
//     art     the welcome art: { tall: { src, widths }, wide: { src, widths } }, as src-<width>.webp files; the tall
//             one when the host is taller than it is wide
//     minMs   how long the welcome art stays at least (2000: George, 22 Oct 2026)
//     base    where the intro films are (/assets/startup/)
//     wait    true: only the dark launch until play(), so the product can load first (a try page loads its engine
//             before the visitor scrolls to it, and plays the start-up when its phone comes into view)
//   startup.play()             starts the intro, when mounted with wait
//   startup.progress(0 to 1)   moves the bar; it never goes back
//   startup.ready()            the product is ready: resolves { shownMs } once the art has had its time and the bar
//                              its hop, as the start-up fades away (shownMs: how long the welcome art was on screen).
//                              Ready during the intro, the intro gives way at once (INTEGRATION.md, "Never delay");
//                              ready before it started, it plays whole, as an app's does.
// Each step leaves a performance mark (vg-startup:play, :art, :done) for timing a page.
//   startup.fail(message)      the product can't start: the bar gives way to the message
(function () {
  'use strict';

  var INTRO_FILMS = [['vgraphics-intro-720.webm', 'video/webm'], ['vgraphics-intro-720.mp4', 'video/mp4']];
  var NO_FRAME_MS = 1000; // no picture by then: skip the intro
  var CAP_MS = 4000; // the intro never runs longer
  var STILL_MS = 1000; // reduced motion: the film's last frame, held
  var FADE_MS = 400;
  var ART_WAIT_MS = 4000;
  var DECODE_WAIT_MS = 300;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
  var mark = function (name) {
    try { performance.mark('vg-startup:' + name); } catch (e) { /* no User Timing: nothing to mark */ }
  };

  var BAR = '<div class="bar-shadow"></div>' +
    '<div class="bar-hop"><div class="bar-jelly">' +
    '<div class="bar-track"><div class="bar-groove"><div class="bar-fill"></div></div></div>' +
    '<div class="bar-head"><div class="bar-tip"><svg viewBox="0 0 110 150" aria-hidden="true">' +
    '<polygon class="edge" points="18,34 92,83 18,132" stroke-width="36" stroke-linejoin="round" />' +
    '<polygon class="face" points="18,18 92,67 18,116" stroke-width="36" stroke-linejoin="round" />' +
    '<path d="M0 41H56A14 14 0 0 1 56 69H0Z" fill="#fff" fill-opacity="0.45" />' +
    '</svg></div></div>' +
    '</div></div>';

  // The loading bar, as Exitwise's web loader runs it: steps that ease in and never go back, each one stretching the
  // arrowhead as it shoots ahead and wobbling the bar; full, the bar hops. Only transforms move, which the compositor
  // keeps smooth while the page's own thread is busy starting the product.
  function loadingBar(root, onStep, onFull) {
    var part = function (name) { return root.querySelector('.bar-' + name); };
    var fill = part('fill'), head = part('head'), tip = part('tip'), jelly = part('jelly'), hop = part('hop'), shadow = part('shadow');
    var lively = typeof tip.animate === 'function' && !reduce;
    var target = 0, shown = 0, last = -1e4, timer = 0, settled = 0, stopped = false;
    var UP = 'cubic-bezier(0.61, 1, 0.88, 1)', DOWN = 'cubic-bezier(0.12, 0, 0.39, 0)';
    var wobble = function (amount, frame) {
      var frames = [];
      for (var i = 0; i <= 24; i++) {
        var t = i * 25;
        frames.push({ transform: frame(i < 24 ? amount * Math.exp(-t / 150) * Math.sin(t / 44.6) / 0.66 : 0) });
      }
      return frames;
    };
    var squish = function (jump, wholeBar) {
      var amount = Math.min(0.3, 0.08 + jump * 0.6);
      tip.animate(wobble(amount, function (q) { return 'scale(' + (1 + q) + ', ' + (1 - 0.7 * q) + ')'; }), 600);
      if (wholeBar) {
        jelly.animate(wobble(amount, function (q) { return 'scale(' + (1 + 0.06 * q) + ', ' + (1 - 0.3 * q) + ')'; }), { duration: 600, delay: 40 });
      }
    };
    var bounce = function () {
      hop.animate([
        { offset: 0, transform: 'translateY(0) scale(1, 1)', easing: UP },
        { offset: 0.16, transform: 'translateY(0) scale(1.04, 0.84)', easing: UP },
        { offset: 0.44, transform: 'translateY(-40%) scale(0.97, 1.08)', easing: DOWN },
        { offset: 0.64, transform: 'translateY(0) scale(1.05, 0.86)', easing: UP },
        { offset: 0.8, transform: 'translateY(-10%) scale(0.99, 1.03)', easing: DOWN },
        { offset: 0.92, transform: 'translateY(0) scale(1.01, 0.98)' },
        { offset: 1, transform: 'translateY(0) scale(1, 1)' }
      ], 620);
      shadow.animate([
        { offset: 0, transform: 'scale(1, 1)', opacity: 1, easing: UP },
        { offset: 0.16, transform: 'scale(1.05, 1)', opacity: 1, easing: UP },
        { offset: 0.44, transform: 'scale(0.8, 0.8)', opacity: 0.5, easing: DOWN },
        { offset: 0.64, transform: 'scale(1.06, 1)', opacity: 1, easing: UP },
        { offset: 0.8, transform: 'scale(0.95, 0.95)', opacity: 0.85, easing: DOWN },
        { offset: 1, transform: 'scale(1, 1)', opacity: 1 }
      ], 620);
    };
    var step = function () {
      clearTimeout(timer);
      if (stopped || target <= shown) return;
      // One gulp at a time: a big one after half a second, a small one after a longer beat, the last one at once.
      var wait = (target < 1 ? (target - shown >= 0.04 ? 500 : 900) : 0) - (now() - last);
      if (wait > 0) {
        timer = setTimeout(step, wait);
        return;
      }
      var jump = target - shown;
      shown = target;
      last = now();
      var at = 'translateX(calc(' + (1 - shown).toFixed(4) + ' * (var(--lead) - 100%)))';
      fill.style.transform = at;
      head.style.transform = at;
      root.setAttribute('aria-valuenow', String(Math.floor(shown * 100)));
      onStep(shown);
      if (lively) squish(jump, shown < 1);
      if (shown < 1) return;
      if (lively) setTimeout(bounce, 150);
      settled = last + (lively ? 770 : 0);
      setTimeout(function () { if (!stopped) onFull(); }, settled - last);
    };
    var show = function (value) {
      if (value <= target) return;
      target = Math.min(1, value);
      step();
    };
    return {
      show: show,
      whenSettled: function (then) {
        show(1);
        setTimeout(then, Math.max(0, settled - now()));
      },
      stop: function () {
        stopped = true;
        clearTimeout(timer);
      }
    };
  }

  function srcset(picture) {
    return picture.widths.map(function (w) { return picture.src + '-' + w + '.webp ' + w + 'w'; }).join(', ');
  }

  function mount(host, options) {
    var minMs = options.minMs != null ? options.minMs : 2000;
    var base = options.base || '/assets/startup/';
    var layer = document.createElement('div');
    layer.className = 'vg-startup';

    // The welcome art: the tall cut in a portrait screen, the wide one in a landscape one, at the screen's size.
    var art = document.createElement('div');
    art.className = 'vg-startup-art';
    art.setAttribute('aria-hidden', 'true');
    var img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    var box = host.getBoundingClientRect();
    var picture = box.width < box.height ? options.art.tall : options.art.wide;
    img.sizes = Math.max(1, Math.round(box.width)) + 'px';
    img.srcset = srcset(picture);
    img.src = picture.src + '-' + picture.widths[picture.widths.length - 1] + '.webp';
    art.appendChild(img);
    layer.appendChild(art);

    var barBox = document.createElement('div');
    barBox.className = 'vg-startup-bar';
    barBox.setAttribute('role', 'progressbar');
    barBox.setAttribute('aria-label', options.label || 'Loading');
    barBox.setAttribute('aria-valuemin', '0');
    barBox.setAttribute('aria-valuemax', '100');
    barBox.setAttribute('aria-valuenow', '0');
    barBox.innerHTML = BAR;
    layer.appendChild(barBox);
    var status = document.createElement('div');
    status.className = 'vg-startup-status';
    status.textContent = 'Loading';
    layer.appendChild(status);

    // The VGraphics intro, muted and inline (the only way browsers autoplay).
    var intro = document.createElement('div');
    intro.className = 'vg-startup-intro';
    intro.setAttribute('aria-hidden', 'true');
    var video = document.createElement('video');
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    video.disablePictureInPicture = true;
    INTRO_FILMS.forEach(function (film) {
      var source = document.createElement('source');
      source.src = base + film[0];
      source.type = film[1];
      video.appendChild(source);
    });
    intro.appendChild(video);
    layer.appendChild(intro);
    host.appendChild(layer);

    var bar = loadingBar(barBox, function (shown) {
      status.textContent = shown < 1 ? 'Loading ' + Math.floor(shown * 100) + '%' : 'Starting';
    }, function () {
      layer.classList.add('starting');
    });

    // The art counts as shown from the moment it is on screen: drawn, and the intro gone.
    var artReady = false;
    var introOver = false;
    var shownAt = 0;
    var onArt = [];
    var shown = function () {
      if (!artReady || !introOver || shownAt) return;
      shownAt = now();
      mark('art');
      layer.classList.add('settle');
      onArt.splice(0).forEach(function (then) { then(); });
    };
    var drawn = function () {
      if (artReady) return;
      layer.classList.add('with-art');
      artReady = true;
      shown();
    };
    // Decoded before it fades in, so it never shows half drawn; but a decode a busy or unpainted page holds back must not
    // hold the start-up: the art fades in over 0.3 s anyway.
    var decode = function () {
      if (img.decode) {
        img.decode().then(drawn, drawn);
        setTimeout(drawn, DECODE_WAIT_MS);
      } else {
        drawn();
      }
    };
    // Without its art the start-up still runs, on the launch colour.
    var noArt = function () {
      if (artReady) return;
      img.remove();
      artReady = true;
      shown();
    };
    if (img.complete && img.naturalWidth) decode();
    else {
      img.addEventListener('load', decode);
      img.addEventListener('error', noArt);
    }

    var playing = false;
    var finishIntro = function (quick) {
      if (introOver) return;
      introOver = true;
      document.removeEventListener('keydown', skip);
      if (quick) intro.classList.add('quick');
      intro.classList.add('gone');
      setTimeout(function () {
        video.pause();
        intro.remove();
        shown();
      }, quick ? 300 : 500);
    };
    var skip = function () { finishIntro(false); };
    var played = false;
    var readyEarly = false;
    var onPlay = [];
    var play = function () {
      if (played) return;
      played = true;
      mark('play');
      if (reduce) {
        video.addEventListener('loadedmetadata', function () { video.currentTime = Math.max(0, video.duration - 0.05); });
        setTimeout(skip, STILL_MS);
      } else {
        video.addEventListener('playing', function () { playing = true; });
        video.addEventListener('ended', skip);
        var started = video.play();
        if (started && started.catch) started.catch(skip);
        setTimeout(function () { if (!playing) skip(); }, NO_FRAME_MS);
        setTimeout(skip, CAP_MS);
      }
      video.addEventListener('error', skip);
      video.lastChild.addEventListener('error', skip);
      intro.addEventListener('pointerdown', function (event) {
        event.stopPropagation();
        skip();
      });
      document.addEventListener('keydown', skip);
      onPlay.splice(0).forEach(function (then) { then(); });
    };
    if (!options.wait) play();

    return {
      play: play,
      progress: function (fraction) {
        bar.show(Math.max(0, Math.min(1, fraction)));
      },
      ready: function () {
        return new Promise(function (resolve) {
          var leave = function () {
            var wait = Math.max(0, shownAt + minMs - now());
            setTimeout(function () {
              bar.whenSettled(function () {
                var shownMs = Math.round(now() - shownAt);
                mark('done');
                layer.classList.add('done');
                setTimeout(function () { layer.remove(); }, FADE_MS);
                resolve({ shownMs: shownMs });
              });
            }, wait);
          };
          var go = function () {
            // Ready while the intro plays: it gives way at once and the art gets its full time. Ready before it began
            // (the product loaded while out of view): the intro plays whole.
            if (!readyEarly) finishIntro(true);
            if (shownAt) leave();
            else {
              onArt.push(leave);
              // Art still on its way this long after the product is ready: the product doesn't wait for it.
              setTimeout(noArt, ART_WAIT_MS);
            }
          };
          if (played) go();
          else {
            readyEarly = true;
            onPlay.push(go);
          }
        });
      },
      fail: function (message) {
        finishIntro(true);
        bar.stop();
        layer.classList.remove('starting');
        layer.classList.add('failed');
        status.textContent = message;
      }
    };
  }

  window.VGStartup = { mount: mount };
}());
