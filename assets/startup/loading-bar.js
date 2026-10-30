// The squishy, chubby loading bar every VGraphics web loader shows while its product downloads (D:\Projects\Mine\
// CLAUDE.md, "Start-up": "While it loads, web and Unity loaders show the squishy, chubby loading bar (the model:
// Exitwise's web loader)"), as one piece every Unity WebGL template loads from the site (George, 30 Oct 2026, on Palermo
// Noir in Unity: "We dont want to have 2 code bases."). It is Exitwise's web loader's bar, moved here from its WebGL
// template (the Games repo, ArrowPuzzle/Assets/WebGLTemplates/Portfolio): a pill on a darker lip with a groove, and in
// the groove a fat bar in the product's colour that grows to the right, the product's mark at its head. check-site
// holds every Unity page to it (tools/lib/unity-pages.mjs); README "The shared loading bar".
//
//   <link rel="stylesheet" href="/assets/startup/loading-bar.css">
//   <div id="loader-bar" class="vg-bar"></div>
//   <script src="/assets/startup/loading-bar.js"></script>
//   var bar = VGLoadingBar(element, { colour, tip, label, onStep, onFull })
//     element        where the bar goes; the script draws its parts in it
//     colour         the product's colour, the bar's body and head (else the stylesheet's --vg-bar-fill)
//     tip            the product's mark at the head: 'arrow' (Exitwise); any other, the round knob, never another
//                    product's mark
//     label          what screen readers call it ('Loading')
//     onStep(shown)  as the bar passes each whole percent (0 to 1, and 1 once full): for a "Loading N%" line
//     onFull()       full and its hop over: the product is starting (the bar nudges and shines meanwhile)
//   bar.show(0 to 1)        the download: the bar never shows more, and never goes back
//   bar.pace(from, until)   the welcome art's clock (performance.now() ms): it also fills no faster than from where it
//                           is at `from` to full at `until`; pace(Infinity, Infinity) holds it where it is (under the
//                           VGraphics intro)
//   bar.whenSettled(then)   full now, then() once its hop has ended
//   bar.stop()              halts it where it is (the product couldn't start)
// Its look is the stylesheet's --vg-bar-* properties (loading-bar.css).
(function () {
  'use strict';

  var made = 0;
  // The head: the product's own mark, facing right, in its colours (loading-bar.css). The face is what stretches.
  var TIPS = {
    // Exitwise's: the fat arrowhead its bar grows into, its lip, its face, and the gloss that carries on from the body's.
    arrow: function (gloss) {
      return '<svg viewBox="0 0 110 150" aria-hidden="true">' +
        '<defs><linearGradient id="' + gloss + '" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.6" />' +
        '<stop offset="1" stop-color="#fff" stop-opacity="0.3" /></linearGradient></defs>' +
        '<polygon class="edge" points="18,34 92,83 18,132" stroke-width="36" stroke-linejoin="round" />' +
        '<polygon class="face" points="18,18 92,67 18,116" stroke-width="36" stroke-linejoin="round" />' +
        '<path d="M0 41H56A14 14 0 0 1 56 69H0Z" fill="url(#' + gloss + ')" />' +
        '</svg>';
    },
    // Every other product's, until it has its own: a round knob in its colour.
    round: function () {
      return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle class="edge" cx="50" cy="56" r="42" />' +
        '<circle class="face" cx="50" cy="48" r="42" />' +
        '<ellipse cx="44" cy="28" rx="22" ry="9" fill="#fff" fill-opacity="0.45" />' +
        '</svg>';
    }
  };

  function VGLoadingBar(root, options) {
    options = options || {};
    var onStep = options.onStep || function () {};
    var onFull = options.onFull || function () {};
    var tipName = TIPS.hasOwnProperty(options.tip) ? options.tip : 'round';
    if (root.classList) root.classList.add('vg-bar');
    if (options.colour) root.style.setProperty('--vg-bar-fill', options.colour);
    root.setAttribute('role', 'progressbar');
    root.setAttribute('aria-label', options.label || 'Loading');
    root.setAttribute('aria-valuemin', '0');
    root.setAttribute('aria-valuemax', '100');
    root.setAttribute('aria-valuenow', '0');
    root.innerHTML = '<div class="bar-shadow"></div>' +
      '<div class="bar-hop"><div class="bar-jelly">' +
      '<div class="bar-track"><div class="bar-groove"><div class="bar-fill"></div></div></div>' +
      '<div class="bar-head"><div class="bar-tip tip-' + tipName + '">' + TIPS[tipName]('vg-bar-gloss-' + (++made)) + '</div></div>' +
      '</div></div>';

    // Unity's download, never shown ahead of it and never going back. While a pace is set it also fills no faster than
    // the clock across the welcome art's 2 s, the curve phones use (Exitwise's BootFlow.Pace), so it starts empty and is
    // full just as the product may come in. The bar glides by CSS transitions planned ahead, its head stretching with its
    // speed; at each quarter it gulps (a squish, the bar's wobble a beat later, two sparkles), and full it pops a burst
    // of sparkles and the bar hops. All of that is planned ahead too, as animations of transforms and opacity, which the
    // compositor runs while the page's own thread is busy starting the product; only the count needs that thread.
    var part = function (name) { return root.querySelector('.bar-' + name); };
    var fill = part('fill'), head = part('head'), tip = part('tip'), jelly = part('jelly'), hop = part('hop'), shadow = part('shadow');
    var face = tip.querySelector('svg');
    // Reduced motion keeps the glide and leaves out the stretch, squash, wobble, sparkles and hop (the CSS drops the
    // nudge). Without linear() easing the bar goes straight from stop to stop.
    var lively = typeof tip.animate === 'function' &&
      !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var curved = !!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)'));
    var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
    var UP = 'cubic-bezier(0.61, 1, 0.88, 1)', DOWN = 'cubic-bezier(0.12, 0, 0.39, 0)'; // sine out, sine in
    var easeOut = function (x) { x = Math.min(1, Math.max(0, x)); return 1 - (1 - x) * (1 - x) * (1 - x); };
    var smooth = function (x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    var download = 0, base = 0, from = -Infinity, until = -Infinity, stopped = false;
    // The welcome's clock: half steady, half smoothstep, from base at `from` to full at `until`.
    var paced = function (t) {
      if (t < from) return base;
      if (t >= until) return 1;
      var u = (t - from) / (until - from);
      return base + (1 - base) * (0.5 * u + 0.5 * smooth(u));
    };
    // The bar's way as planned: from a at ta to b at tb, along way(0 to 1).
    var a = 0, b = 0, ta = 0, tb = 0, way = function (u) { return u; };
    var at = function (t) { return t >= tb ? b : t <= ta ? a : a + (b - a) * way((t - ta) / (tb - ta)); };
    var effects = [], stretch = null, settled = Infinity, settling = [], idle = false, percent = -1, ticking = false;
    var place = function (shown) { return 'translateX(calc(' + (1 - shown).toFixed(4) + ' * (var(--lead) - 100%)))'; };
    // A damped wobble as 600 ms of keyframes: out to amount, back past still, smaller each time, then still.
    var wobble = function (amount, frame) {
      var frames = [];
      for (var i = 0; i <= 24; i++) {
        var t = i * 25;
        frames.push({ transform: frame(i < 24 ? amount * Math.exp(-t / 150) * Math.sin(t / 44.6) / 0.66 : 0) });
      }
      return frames;
    };
    var later = function (element, frames, timing) {
      var effect = { at: now() + (timing.delay || 0), run: element.animate(frames, timing) };
      effects.push(effect);
      return effect;
    };
    // The sparkles: flat candy stars, in two colours in turn with an outline (--vg-bar-spark, --vg-bar-spark-alt,
    // --vg-bar-ink), flung off the head. Each is [angle from the bar's way in degrees (up is negative), reach, size],
    // in bar heights (the spark's em).
    var sparks = [];
    for (var i = 0; i < 16; i++) {
      var spark = document.createElement('div');
      spark.className = 'bar-spark' + (i % 2 ? ' alt' : '');
      spark.setAttribute('aria-hidden', 'true');
      spark.innerHTML = '<svg viewBox="0 0 40 40"><path d="M20 1.8Q25.1 14.9 38.2 20Q25.1 25.1 20 38.2Q14.9 25.1 1.8 20Q14.9 14.9 20 1.8Z" ' +
        'stroke-width="3.6" stroke-linejoin="round" /></svg>';
      root.appendChild(spark);
      sparks.push({ el: spark, spin: i % 2 ? -90 : 90, busy: 0 });
    }
    var QUARTER = [[-40, 0.9, 0.42], [-105, 0.75, 0.34]];
    var FULL = [[-165, 1.05, 0.4], [-120, 1.3, 0.5], [-75, 1.2, 0.44], [-30, 1.25, 0.5], [5, 1.1, 0.38], [35, 0.9, 0.34]];
    var fling = function (delay, shown, spec) {
      // One that is neither flying nor waiting to (16 is more than a plan ever needs at once).
      var free = sparks.filter(function (one) { return one.busy <= now(); })[0];
      if (!free) return;
      var el = free.el, spin = free.spin;
      el.style.left = 'calc(var(--pad) + var(--lead) + (100% - 2 * var(--pad) - var(--lead)) * ' + shown.toFixed(4) + ')';
      var angle = spec[0] * Math.PI / 180, size = spec[2] / 0.5, frames = [];
      // Pops past its size in the first 30 %, flies out spinning a quarter turn, shrinks away and fades at the end.
      for (var k = 0; k <= 12; k++) {
        var u = k / 12, out = easeOut(u) * spec[1];
        var grow = u < 0.3 ? 1.15 * easeOut(u / 0.3) : 1.15 * (1 - smooth((u - 0.3) / 0.7));
        frames.push({
          opacity: u < 0.75 ? 1 : (1 - u) / 0.25,
          transform: 'translate(' + (Math.cos(angle) * out).toFixed(3) + 'em, ' + (Math.sin(angle) * out).toFixed(3) + 'em) rotate(' +
            (spin * u).toFixed(1) + 'deg) scale(' + (grow * size).toFixed(3) + ')'
        });
      }
      free.busy = now() + delay + 520;
      later(el, frames, { duration: 520, delay: delay }).spark = free;
    };
    // A gulp `delay` ms from now with the bar at `shown`: the head squishes, the bar wobbles a beat later (not when
    // full: it hops then), the sparkles fly.
    var gulp = function (delay, shown, amount, flung) {
      later(tip, wobble(amount, function (q) { return 'scale(' + (1 + q) + ', ' + (1 - 0.7 * q) + ')'; }), { duration: 600, delay: delay });
      if (shown < 1) later(jelly, wobble(amount, function (q) { return 'scale(' + (1 + 0.06 * q) + ', ' + (1 - 0.3 * q) + ')'; }), { duration: 600, delay: delay + 40 });
      flung.forEach(function (spec) { fling(delay, shown, spec); });
    };
    // Full: the bar crouches, hops and lands with a squash, its shadow shrinking under it while it is up.
    var bounce = function (delay) {
      later(hop, [
        { offset: 0, transform: 'translateY(0) scale(1, 1)', easing: UP },
        { offset: 0.16, transform: 'translateY(0) scale(1.04, 0.84)', easing: UP },
        { offset: 0.44, transform: 'translateY(-40%) scale(0.97, 1.08)', easing: DOWN },
        { offset: 0.64, transform: 'translateY(0) scale(1.05, 0.86)', easing: UP },
        { offset: 0.8, transform: 'translateY(-10%) scale(0.99, 1.03)', easing: DOWN },
        { offset: 0.92, transform: 'translateY(0) scale(1.01, 0.98)' },
        { offset: 1, transform: 'translateY(0) scale(1, 1)' }
      ], { duration: 620, delay: delay });
      later(shadow, [
        { offset: 0, transform: 'scale(1, 1)', opacity: 1, easing: UP },
        { offset: 0.16, transform: 'scale(1.05, 1)', opacity: 1, easing: UP },
        { offset: 0.44, transform: 'scale(0.8, 0.8)', opacity: 0.5, easing: DOWN },
        { offset: 0.64, transform: 'scale(1.06, 1)', opacity: 1, easing: UP },
        { offset: 0.8, transform: 'scale(0.95, 0.95)', opacity: 0.85, easing: DOWN },
        { offset: 1, transform: 'scale(1, 1)', opacity: 1 }
      ], { duration: 620, delay: delay });
    };
    // The count, on the page's thread: onStep as the bar passes each whole percent, then 1.
    var tick = function () {
      if (stopped) {
        ticking = false;
        return;
      }
      var t = now(), shown = at(t), whole = Math.floor(shown * 100 + 1e-6);
      if (whole !== percent) {
        percent = whole;
        root.setAttribute('aria-valuenow', String(whole));
        onStep(whole >= 100 ? 1 : shown);
      }
      if (t < tb) requestAnimationFrame(tick);
      else ticking = false;
    };
    var settle = function () {
      if (stopped || now() < settled - 1) return;
      if (!idle) {
        idle = true;
        if (root.classList) root.classList.add('starting');
        onFull();
      }
      settling.splice(0).forEach(function (then) { then(); });
    };
    // From where the bar is now to where it may go (the download, and full only once the pace allows): along the pace,
    // after a quick catch-up if the pace has run on ahead of it while it waited for the download.
    var plan = function () {
      if (stopped) return;
      var t = now(), shown = at(t), goal = Math.min(download, from === Infinity ? base : 1);
      if (goal <= shown + 1e-4) return;
      var catchUp = paced(t) > shown + 1e-3 ? 450 : 0;
      var go = function (t2) {
        var w = catchUp ? easeOut((t2 - t) / catchUp) : 1;
        return shown + (Math.max(shown, Math.min(goal, paced(t2))) - shown) * w;
      };
      // When the way first reaches `share` (it only ever grows), found by halving.
      var reach = function (share, end) {
        var lo = t, hi = end;
        for (var n = 0; n < 32; n++) {
          var mid = (lo + hi) / 2;
          if (go(mid) < share) lo = mid;
          else hi = mid;
        }
        return hi;
      };
      var end = Math.max(t + catchUp, paced(t) >= goal ? t : reach(goal, Math.max(until, t + catchUp)));
      var ms = Math.max(1, end - t), steps = Math.max(2, Math.min(60, Math.round(ms / 40))), points = [];
      a = shown;
      b = goal;
      ta = t;
      tb = t + ms;
      way = curved ? function (u) { return (go(t + u * ms) - shown) / (goal - shown); } : function (u) { return u; };
      for (var n = 0; n <= steps; n++) points.push(way(n / steps).toFixed(4));
      [fill, head].forEach(function (element) {
        element.style.transition = 'transform ' + Math.round(ms) + 'ms ' + (curved ? 'linear(' + points.join(', ') + ')' : 'linear');
        element.style.transform = place(goal);
      });
      // What the last plan had still to come gives way to this one's.
      effects.forEach(function (effect) {
        if (effect.at <= t) return;
        effect.run.cancel();
        if (effect.spark) effect.spark.busy = 0;
      });
      effects = [];
      if (lively) {
        // The head stretches with the speed (bars a second), and settles back as the bar stops.
        var frames = [];
        for (var n2 = 0; n2 <= steps; n2++) {
          var t2 = t + ms * n2 / steps, speed = (at(t2 + 8) - at(t2 - 8)) / 16 * 1000, k = Math.min(0.3, 0.2 * Math.max(0, speed));
          frames.push({ offset: (ms * n2 / steps) / (ms + 120), transform: 'scale(' + (1 + k).toFixed(3) + ', ' + (1 - 0.5 * k).toFixed(3) + ')' });
        }
        frames.push({ offset: 1, transform: 'scale(1, 1)' });
        if (stretch) stretch.cancel();
        stretch = face.animate(frames, ms + 120);
        [0.25, 0.5, 0.75].forEach(function (quarter) {
          if (shown < quarter && goal >= quarter) gulp(reach(quarter, tb) - t, quarter, 0.12, QUARTER);
        });
        if (goal >= 1) {
          gulp(ms, 1, 0.3, FULL);
          bounce(ms + 150);
        }
      }
      if (goal >= 1) {
        settled = tb + (lively ? 770 : 0);
        setTimeout(settle, settled - t);
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    };
    var show = function (value) {
      if (value <= download) return;
      download = Math.min(1, value);
      plan();
    };
    return {
      show: show,
      pace: function (start, full) {
        var t = now();
        base = at(t);
        from = Math.max(start, t);
        until = full;
        plan();
      },
      whenSettled: function (then) {
        show(1);
        settling.push(then);
        if (now() >= settled) settle();
      },
      stop: function () {
        var t = now();
        stopped = true;
        a = b = at(t);
        ta = tb = t;
        [fill, head].forEach(function (element) {
          element.style.transition = 'none';
          element.style.transform = place(b);
        });
        effects.forEach(function (effect) { effect.run.cancel(); });
        if (stretch) stretch.cancel();
        if (root.classList) root.classList.remove('starting');
      }
    };
  }

  window.VGLoadingBar = VGLoadingBar;
}());
