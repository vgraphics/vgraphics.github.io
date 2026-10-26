/* The Exitwise storybook, the HTML reader, in the Cinema look George picked on 23 Oct 2026: a chapter list ("Continue"
   for the next page not read, then wide chapter cards), then each painting full screen, the camera moving slowly over
   it, its line fading in over a dark band, bars along the top for the chapter's shots; tap or swipe to cut to the next.
   One reader for two places: an overlay over the web game (opened by Plugins/WebGL/ArrowPuzzleStorybook.jslib) and a book
   in the page at vgraphics.gr/exitwise/storybook/. It reads storybook.json, the same file the app's UI Toolkit reader
   reads, and follows the same rules: Core's StoryReel.cs for what shows in what order (reel below), Core's
   StoryCamera.cs for the camera, number for number (camera below), StorybookProgress for what is open. Text is real
   text (Lilita One for titles, Comic Neue Bold for the story lines), never part of the art. Pictures, all beside
   storybook.json: Panels/<panel id>.<ext>, Tall/<panel id>.<ext> (its 9:16 version for upright screens,
   Tools/Storybook/tall_art.py), Backdrops/<panel id>.jpg (blurred), Thumbs/<chapter id>.jpg, Medals/<chapter id>.png,
   reader/knot.png and reader/threads.png (Tools/Storybook/reader_art.py makes these last ones).

   window.ExitwiseStorybook.open(options) -> { close(), setProgress(progress) }
     book       the parsed storybook.json
     base       the folder holding storybook.json and the pictures
     panelExt   "jpg"
     mode       "book": the chapter list, then any open chapter; "pages": these pages, then it closes
     pages      page ids for "pages"
     progress   { levelsWon, read: [page ids], medals: [world numbers whose guardian is freed] }
     overlay    true: over everything, closing removes it; false: the list inside options.mount, chapters full window
     mount      the element an inline book goes in
     playUrl    inline: where a locked chapter's "Play to unlock" goes
     audio      { base }: plays <base>/<cue>.mp3 itself, after the reader's sound button (the site); else onCue (the game)
     onPageShown(id), onPageLeft(id, skipped, seconds), onCue(cue), onClose() */
(function () {
  'use strict';

  var SWIPE_PX = 60;
  var SIDE_TAP = 0.3;
  var DISSOLVE_MS = 700;
  var STILL_MS = 180;
  var DUSK = ['#3a2c60', '#2e545c', '#66343c', '#6e522c', '#28466e', '#4e3462'];
  var SOUND_KEY = 'exitwise.storybook.sound';
  var ICON = {
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/><path class="xsb-slash" d="M4 4l16 16"/></svg>'
  };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function picture(src, cls, alt) {
    var img = new Image();
    img.className = cls;
    img.alt = alt || '';
    img.decoding = 'async';
    img.draggable = false;
    img.src = src;
    return img;
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function storedSound() {
    try { return window.localStorage.getItem(SOUND_KEY) === 'on'; } catch (e) { return false; }
  }

  // ---------- The camera: Core's StoryCamera.cs, number for number ----------

  var CAMERA = { aspect: 4 / 3, tallAspect: 9 / 16, wideMargin: 1.1, tallMargin: 1.06, wideSeconds: 13, tallSeconds: 13 };

  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  function frame(x, y, s) { return { x: x, y: y, s: s }; }
  function upright(width, height) { return width < height; }

  function cameraMove(width, height, from, to, hold, seconds, tall) {
    return {
      width: width,
      height: height,
      tall: tall,
      at: function (t) {
        if (seconds <= 0 || t >= hold + seconds) return to;
        if (t <= hold) return from;
        var k = easeInOutSine(Math.min(1, (t - hold) / seconds));
        return frame(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k, from.s + (to.s - from.s) * k);
      },
      done: function (t) { return t >= hold + seconds; }
    };
  }

  // The painting always fills the screen and drifts. Wide, the painting itself: zoom in, pan, tilt, zoom out, in turn.
  // Upright, its tall 9:16 version (Tall/): up it, then down the next. Still, in the middle, under reduced motion.
  function camera(width, height, shot, still) {
    var tall = upright(width, height);
    var aspect = tall ? CAMERA.tallAspect : CAMERA.aspect;
    var w = Math.max(width, height * aspect) * (tall ? CAMERA.tallMargin : CAMERA.wideMargin), ph = w / aspect;
    var cx = (width - w) / 2, cy = (height - ph) / 2, centred = frame(cx, cy, 1);
    if (still) return cameraMove(w, ph, centred, centred, 0, 0, tall);
    if (tall) {
      var low = frame(cx, height - ph, 1), high = frame(cx, 0, 1);
      return ((shot % 2) + 2) % 2 === 0
        ? cameraMove(w, ph, low, high, 0, CAMERA.tallSeconds, true)
        : cameraMove(w, ph, high, low, 0, CAMERA.tallSeconds, true);
    }
    switch (((shot % 4) + 4) % 4) {
      case 0: return cameraMove(w, ph, centred, frame(cx, cy, 1.08), 0, CAMERA.wideSeconds, false);
      case 1: return cameraMove(w, ph, frame(width - w, cy, 1), frame(0, cy, 1), 0, CAMERA.wideSeconds, false);
      case 2: return cameraMove(w, ph, frame(cx, height - ph, 1), frame(cx, 0, 1), 0, CAMERA.wideSeconds, false);
      default: return cameraMove(w, ph, frame(cx, cy, 1.1), centred, 0, CAMERA.wideSeconds, false);
    }
  }

  // ---------- The reel: Core's StoryReel.cs ----------

  function unlocked(page, won) { return won >= page.unlockLevel; }

  // A chapter: its open panels, the first page still locked ("Free the Volcano to read on"), its end card.
  function chapterShots(chapter, won) {
    var shots = [];
    for (var i = 0; i < chapter.pages.length; i++) {
      var page = chapter.pages[i];
      if (!unlocked(page, won)) {
        shots.push({ kind: 'locked', chapter: chapter, page: page, panel: null });
        break;
      }
      page.panels.forEach(function (panel) { shots.push({ kind: 'panel', chapter: chapter, page: page, panel: panel }); });
    }
    shots.push({ kind: 'end', chapter: chapter, page: null, panel: null });
    return shots;
  }

  // A moment over the map: its panels only; the book closes after the last.
  function momentShots(pages) {
    var shots = [];
    pages.forEach(function (page) {
      page.panels.forEach(function (panel) { shots.push({ kind: 'panel', chapter: page._chapter, page: page, panel: panel }); });
    });
    return shots;
  }

  function open(o) {
    var book = o.book;
    var byId = {};
    book.chapters.forEach(function (chapter) {
      chapter.pages.forEach(function (page) {
        page._chapter = chapter;
        byId[page.id] = page;
      });
    });
    var base = String(o.base || '.').replace(/\/$/, '');
    var ext = o.panelExt || 'jpg';
    var progress = { levelsWon: 0, read: {}, medals: {} };
    var bookMode = o.mode !== 'pages';
    var still = reducedMotion();
    var shots = [];
    var at = 0;
    var filmed = 0;
    var film = null;
    var playing = false;
    var shown = null;
    var shownSince = 0;
    var closed = false;
    var lastFocus = document.activeElement;
    var listScroll = 0;
    var audio = null;
    var soundOn = o.audio ? storedSound() : false;
    var soundButtons = [];
    var cue = null;

    function setProgress(p) {
      progress.levelsWon = (p && p.levelsWon) || 0;
      progress.read = {};
      ((p && p.read) || []).forEach(function (id) { progress.read[id] = true; });
      progress.medals = {};
      ((p && p.medals) || []).forEach(function (world) { progress.medals[world] = true; });
      if (bookMode && !playing && !closed) showList();
    }

    function panelUrl(id) { return base + '/Panels/' + encodeURIComponent(id) + '.' + ext; }
    function tallUrl(id) { return base + '/Tall/' + encodeURIComponent(id) + '.' + ext; }
    function paintingUrl(id, tall) { return tall ? tallUrl(id) : panelUrl(id); }
    function backdropUrl(id) { return base + '/Backdrops/' + encodeURIComponent(id) + '.jpg'; }
    function thumbUrl(chapter) { return base + '/Thumbs/' + encodeURIComponent(chapter.id) + '.jpg'; }
    function medalUrl(chapter) { return base + '/Medals/' + encodeURIComponent(chapter.id) + '.png'; }
    function artUrl(name) { return base + '/reader/' + name; }
    function firstPanel(chapter) { return chapter.pages[0].panels[0].id; }
    function chapterOpen(chapter) { return unlocked(chapter.pages[0], progress.levelsWon); }
    function unread(chapter) {
      return chapter.pages.some(function (page) { return unlocked(page, progress.levelsWon) && !progress.read[page.id]; });
    }
    function nextChapter(chapter) {
      var next = book.chapters[book.chapters.indexOf(chapter) + 1];
      return next && chapterOpen(next) ? next : null;
    }

    // ---------- The frame: the list, and the player over it ----------

    var root = el('div', 'xsb ' + (o.overlay ? 'xsb--overlay' : 'xsb--inline') + (still ? ' xsb--still' : ''));
    root.setAttribute('role', o.overlay ? 'dialog' : 'region');
    if (o.overlay) root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', book.title);
    var list = el('div', 'xsb-list fade-edges');
    root.appendChild(list);
    // Over the game the list scrolls on its own, its edges fading while more chapters lie beyond (storybook.css): the
    // site's shared fading edges, /assets/fade-edges.js, which picks up the class fade-edges. Only on vgraphics.gr,
    // which has it (a page with a header has loaded it already); elsewhere (CrazyGames) the list scrolls without the
    // fade, and nothing asks for a file that isn't there.
    if (o.overlay && /(^|\.)vgraphics\.gr$/.test(location.hostname) && !document.querySelector('script[src="/assets/fade-edges.js"]')) {
      var fades = document.createElement('script');
      fades.type = 'module';
      fades.src = '/assets/fade-edges.js';
      document.head.appendChild(fades);
    }

    // Inline (the site), the pages play over the whole window, in a layer of their own.
    var layer = o.overlay ? root : el('div', 'xsb xsb--layer' + (still ? ' xsb--still' : ''));
    var player = el('div', 'xsb-player');
    player.hidden = true;
    player.tabIndex = -1;
    player.setAttribute('role', 'region');
    var scene = el('div', 'xsb-scene');
    var top = el('div', 'xsb-ptop');
    var segs = el('div', 'xsb-segs');
    var bar = el('div', 'xsb-bar');
    var back = round(ICON.back, '');
    var heading = el('div', 'xsb-heading');
    var eyebrow = el('p', 'xsb-eyebrow');
    var title = el('p', 'xsb-ptitle');
    heading.appendChild(eyebrow);
    heading.appendChild(title);
    bar.appendChild(back);
    bar.appendChild(heading);
    if (o.audio) bar.appendChild(soundButton());
    top.appendChild(segs);
    top.appendChild(bar);
    var cap = el('div', 'xsb-cap');
    var line = el('p', 'xsb-line');
    line.setAttribute('aria-live', 'polite');
    var hint = el('p', 'xsb-hint', 'Tap to continue');
    cap.appendChild(line);
    cap.appendChild(hint);
    var over = el('div', 'xsb-over');
    [scene, top, cap, over].forEach(function (node) { player.appendChild(node); });
    layer.appendChild(player);

    function round(icon, label) {
      var button = el('button', 'xsb-round');
      button.type = 'button';
      button.innerHTML = icon;
      if (label) button.setAttribute('aria-label', label);
      return button;
    }

    function soundButton() {
      var button = round(ICON.sound, '');
      button.classList.add('xsb-sound');
      button.addEventListener('click', function () {
        soundOn = !soundOn;
        try { window.localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch (e) {}
        showSound();
        playCue();
      });
      soundButtons.push(button);
      showSound();
      return button;
    }

    // ---------- The chapter list ----------

    function showList() {
      list.textContent = '';
      soundButtons = soundButtons.filter(function (button) { return player.contains(button); });
      var head = el('div', 'xsb-top');
      if (o.overlay) {
        var close = round(ICON.close, 'Close the storybook');
        close.addEventListener('click', function () { finish(false); });
        head.appendChild(close);
      }
      var names = el('div', 'xsb-heading');
      names.appendChild(el('p', 'xsb-eyebrow', 'Storybook'));
      names.appendChild(el('h2', 'xsb-booktitle', book.title));
      head.appendChild(names);
      if (o.audio) head.appendChild(soundButton());
      list.appendChild(head);

      var next = continueAt();
      if (next) {
        var hero = el('button', 'xsb-hero');
        hero.type = 'button';
        hero.setAttribute('aria-label', 'Continue: ' + next.chapter.label + ', ' + next.chapter.title);
        hero.appendChild(picture(panelUrl(next.shot.panel.id), '', ''));
        hero.appendChild(el('span', 'xsb-hero-fade'));
        var words = el('span', 'xsb-hero-text');
        words.appendChild(el('span', 'xsb-eyebrow', 'Continue · ' + next.chapter.label));
        words.appendChild(el('span', 'xsb-hero-title', next.chapter.title));
        var go = el('span', 'xsb-play');
        go.innerHTML = ICON.play;
        go.appendChild(document.createTextNode('Read on'));
        words.appendChild(go);
        hero.appendChild(words);
        hero.addEventListener('click', function () { play(chapterShots(next.chapter, progress.levelsWon), next.at); });
        list.appendChild(hero);
      }

      list.appendChild(el('p', 'xsb-sec', 'All chapters'));
      var grid = el('div', 'xsb-grid');
      grid.setAttribute('role', 'list');
      book.chapters.forEach(function (chapter, i) { grid.appendChild(card(chapter, i)); });
      list.appendChild(grid);
      if (o.overlay) list.scrollTop = listScroll;
      wantCue(book.menuMusic);
    }

    // The first open chapter with a page not read yet, at that page's first panel (Core's StoryReel.Continue).
    function continueAt() {
      for (var i = 0; i < book.chapters.length; i++) {
        var chapter = book.chapters[i];
        if (!chapterOpen(chapter)) continue;
        var reel = chapterShots(chapter, progress.levelsWon);
        for (var j = 0; j < reel.length; j++) {
          if (reel[j].kind === 'panel' && !progress.read[reel[j].page.id]) return { chapter: chapter, at: j, shot: reel[j] };
        }
      }
      return null;
    }

    function card(chapter, i) {
      if (!chapterOpen(chapter)) {
        var locked = el('div', 'xsb-card xsb-card--locked');
        locked.setAttribute('role', 'listitem');
        locked.setAttribute('aria-label', chapter.label + ', locked. ' + chapter.pages[0].lockedLine);
        locked.appendChild(picture(backdropUrl(firstPanel(chapter)), 'xsb-cover', ''));
        locked.appendChild(el('span', 'xsb-tint'));
        locked.appendChild(picture(artUrl('threads.png'), 'xsb-threads', ''));
        locked.appendChild(picture(artUrl('knot.png'), 'xsb-knot', ''));
        var lockedMeta = el('span', 'xsb-meta');
        lockedMeta.appendChild(el('span', 'xsb-eyebrow', chapter.label));
        lockedMeta.appendChild(el('span', 'xsb-lockline', chapter.pages[0].lockedLine));
        if (o.playUrl) {
          var playLink = el('a', 'xsb-unlock', 'Play to unlock');
          playLink.href = o.playUrl;
          lockedMeta.appendChild(playLink);
        }
        locked.appendChild(lockedMeta);
        return locked;
      }
      var medal = chapter.world > 0 && progress.medals[chapter.world];
      var isNew = unread(chapter);
      var button = el('button', 'xsb-card');
      button.type = 'button';
      button.setAttribute('role', 'listitem');
      button.setAttribute('aria-label', chapter.label + ', ' + chapter.title + (medal ? ', guardian freed' : '') + (isNew ? ', new pages' : ''));
      button.style.background = DUSK[i % DUSK.length];
      var cover = picture(thumbUrl(chapter), 'xsb-cover', '');
      cover.loading = 'lazy';
      cover.onerror = function () { cover.remove(); };
      button.appendChild(cover);
      button.appendChild(el('span', 'xsb-card-fade'));
      var meta = el('span', 'xsb-meta');
      meta.appendChild(el('span', 'xsb-eyebrow', chapter.label));
      meta.appendChild(el('span', 'xsb-card-title', chapter.title));
      button.appendChild(meta);
      if (medal) button.appendChild(picture(medalUrl(chapter), 'xsb-medal', ''));
      if (isNew) button.appendChild(el('span', 'xsb-new', 'New'));
      button.addEventListener('click', function () { play(chapterShots(chapter, progress.levelsWon), 0); });
      return button;
    }

    // ---------- Reading ----------

    function play(reel, start) {
      if (!reel.length) return;
      if (o.overlay && !playing) listScroll = list.scrollTop;
      shots = reel;
      at = start || 0;
      filmed = 0;
      playing = true;
      if (!o.overlay) {
        document.body.appendChild(layer);
        document.documentElement.style.overflow = 'hidden';
      } else list.hidden = true;
      player.hidden = false;
      back.innerHTML = bookMode ? ICON.back : ICON.close;
      back.setAttribute('aria-label', bookMode ? 'Back to the chapters' : 'Skip the story');
      scene.textContent = '';
      showShot();
      player.focus({ preventScroll: true });
    }

    function showShot() {
      var shot = shots[at];
      eyebrow.textContent = shot.chapter.label;
      title.textContent = shot.chapter.title;
      drawBars();
      stopFilm();
      var layerShot = el('div', 'xsb-shot');
      over.textContent = '';
      if (shot.kind === 'panel') {
        var tall = upright(scene.clientWidth, scene.clientHeight);
        var paint = picture(paintingUrl(shot.panel.id, tall), 'xsb-paint', shot.panel.alt);
        paint.onerror = function () {
          // Not painted yet: the panel's description on its world's dusk colour.
          if (!paint.parentNode) return;
          var missing = el('div', 'xsb-missing', shot.panel.alt);
          missing.style.setProperty('--xsb-dusk', DUSK[book.chapters.indexOf(shot.chapter) % DUSK.length]);
          paint.parentNode.replaceChild(missing, paint);
        };
        layerShot.appendChild(paint);
        scene.appendChild(layerShot);
        startFilm(paint, shot.panel.id);
        caption(shot.panel.line);
        if (shot.page !== shown) {
          leavePage(false);
          shown = shot.page;
          shownSince = performance.now();
          progress.read[shown.id] = true;
          if (o.onPageShown) o.onPageShown(shown.id);
          wantCue(shown.music);
        }
        // Ready before the cut: the next painting, in the screen's shape.
        var next = shots[at + 1];
        if (next && next.kind === 'panel') new Image().src = paintingUrl(next.panel.id, tall);
      } else {
        var veiled = shot.kind === 'end' ? (nextChapter(shot.chapter) || shot.chapter) : shot.chapter;
        layerShot.appendChild(picture(backdropUrl(firstPanel(veiled)), 'xsb-backdrop', ''));
        layerShot.appendChild(el('span', 'xsb-tint'));
        if (shot.kind === 'locked') layerShot.appendChild(picture(artUrl(scene.clientWidth < scene.clientHeight ? 'threads-tall.png' : 'threads.png'), 'xsb-threads', ''));
        scene.appendChild(layerShot);
        caption(null);
        over.appendChild(shot.kind === 'locked' ? lockCard(shot) : endCard(shot));
      }
      var earlier = Array.prototype.slice.call(scene.children, 0, -1);
      if (layerShot.animate) layerShot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: still ? STILL_MS : DISSOLVE_MS, easing: 'ease-out' });
      setTimeout(function () { earlier.forEach(function (node) { node.remove(); }); }, (still ? STILL_MS : DISSOLVE_MS) + 20);
    }

    function lockCard(shot) {
      var box = el('div', 'xsb-lock');
      box.appendChild(picture(artUrl('knot.png'), 'xsb-knot-big', ''));
      box.appendChild(el('p', 'xsb-bigline', shot.page.lockedLine));
      box.appendChild(el('p', 'xsb-level', 'Opens after level ' + shot.page.unlockLevel));
      if (o.playUrl) {
        var link = el('a', 'xsb-unlock', 'Play to unlock');
        link.href = o.playUrl;
        box.appendChild(link);
      }
      return box;
    }

    function endCard(shot) {
      var box = el('div', 'xsb-end');
      box.appendChild(el('p', 'xsb-eyebrow', 'The end of'));
      box.appendChild(el('p', 'xsb-bigline', shot.chapter.label + ' · ' + shot.chapter.title));
      var next = nextChapter(shot.chapter);
      if (next) {
        var upnext = el('button', 'xsb-upnext');
        upnext.type = 'button';
        upnext.appendChild(picture(thumbUrl(next), '', ''));
        var words = el('span', 'xsb-uptext');
        words.appendChild(el('span', 'xsb-eyebrow', 'Up next · ' + next.label));
        words.appendChild(el('span', 'xsb-uptitle', next.title));
        upnext.appendChild(words);
        upnext.insertAdjacentHTML('beforeend', ICON.play);
        upnext.addEventListener('click', function () {
          leavePage(false);
          play(chapterShots(next, progress.levelsWon), 0);
        });
        box.appendChild(upnext);
      }
      var all = el('button', 'xsb-ghost', 'All chapters');
      all.type = 'button';
      all.addEventListener('click', function () { toList(false); });
      box.appendChild(all);
      return box;
    }

    function drawBars() {
      var bars = shots.filter(function (shot) { return shot.kind !== 'end'; }).length;
      segs.textContent = '';
      for (var i = 0; i < bars; i++) segs.appendChild(el('span', i < at ? 'xsb-done' : i === at ? 'xsb-now' : ''));
    }

    function caption(text) {
      cap.hidden = text == null;
      if (text == null) return;
      line.textContent = text;
      hint.hidden = at !== 0;
      if (!still && line.animate) {
        line.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
          { duration: 480, delay: 160, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      }
    }

    // ---------- The camera at work ----------

    function startFilm(paint, panel) {
      var move = camera(scene.clientWidth, scene.clientHeight, filmed, still);
      film = { paint: paint, panel: panel, shot: filmed, move: move, start: performance.now(), raf: 0 };
      filmed++;
      size(paint, move);
      place(paint, move.at(0));
      if (!move.done(0)) film.raf = requestAnimationFrame(roll);
    }

    function roll(now) {
      if (!film) return;
      var t = (now - film.start) / 1000;
      place(film.paint, film.move.at(t));
      film.raf = film.move.done(t) ? 0 : requestAnimationFrame(roll);
    }

    function size(paint, move) {
      paint.style.width = move.width + 'px';
      paint.style.height = move.height + 'px';
    }

    function place(paint, f) {
      paint.style.transform = 'translate(' + f.x.toFixed(1) + 'px,' + f.y.toFixed(1) + 'px) scale(' + f.s.toFixed(4) + ')';
    }

    function stopFilm() {
      if (film && film.raf) cancelAnimationFrame(film.raf);
      film = null;
    }

    // A turned phone or a resized window: the same shot's camera for the new shape, as far along as it was, and the
    // painting in that shape (its tall version upright).
    function onResize() {
      if (!film) return;
      var t = (performance.now() - film.start) / 1000;
      var tall = film.move.tall;
      film.move = camera(scene.clientWidth, scene.clientHeight, film.shot, still);
      if (film.move.tall !== tall) film.paint.src = paintingUrl(film.panel, film.move.tall);
      size(film.paint, film.move);
      place(film.paint, film.move.at(t));
      if (!film.raf && !film.move.done(t)) film.raf = requestAnimationFrame(roll);
    }
    window.addEventListener('resize', onResize);

    // ---------- Turning ----------

    function next() {
      if (closed || !playing) return;
      if (at < shots.length - 1) {
        at++;
        showShot();
      } else if (!bookMode) finish(false);
    }

    function prev() {
      if (closed || !playing) return;
      if (at > 0) {
        at--;
        showShot();
      } else if (bookMode) toList(skipping());
    }

    function goBack() {
      if (closed) return;
      if (playing && bookMode) toList(skipping());
      else if (o.overlay) finish(skipping());
    }

    // The page in view is left before its last panel.
    function skipping() {
      var shot = playing ? shots[at] : null;
      return !!(shown && shot && shot.kind === 'panel' && shot.panel !== shown.panels[shown.panels.length - 1]);
    }

    function leavePage(skipped) {
      if (!shown) return;
      var page = shown;
      shown = null;
      if (o.onPageLeft) o.onPageLeft(page.id, skipped, (performance.now() - shownSince) / 1000);
    }

    function stopPlaying() {
      stopFilm();
      playing = false;
      player.hidden = true;
      scene.textContent = '';
      over.textContent = '';
      if (!o.overlay) {
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        document.documentElement.style.overflow = '';
      } else list.hidden = false;
    }

    function toList(skipped) {
      leavePage(skipped);
      stopPlaying();
      showList();
      var first = list.querySelector('button');
      if (first) first.focus({ preventScroll: true });
    }

    // ---------- Music ----------

    function wantCue(id) {
      if (!id || id === cue) return;
      cue = id;
      if (o.onCue) o.onCue(id);
      playCue();
    }

    function playCue() {
      if (!o.audio) return;
      if (!soundOn || !cue) {
        if (audio) audio.pause();
        return;
      }
      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.volume = 0.5;
      }
      if (audio.dataset.cue !== cue) {
        audio.dataset.cue = cue;
        audio.src = String(o.audio.base).replace(/\/$/, '') + '/' + cue + '.mp3';
      }
      // A cue not made yet is simply silent.
      audio.play().catch(function () {});
    }

    function showSound() {
      soundButtons.forEach(function (button) {
        button.classList.toggle('xsb-sound--off', !soundOn);
        button.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
        button.setAttribute('aria-label', soundOn ? 'Music on' : 'Music off');
      });
    }

    // ---------- Input ----------

    back.addEventListener('click', goBack);

    var press = null;
    player.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || (e.target.closest && e.target.closest('button, a'))) return;
      press = { id: e.pointerId, x: e.clientX };
    });
    player.addEventListener('pointercancel', function () { press = null; });
    player.addEventListener('pointerup', function (e) {
      if (!press || press.id !== e.pointerId) return;
      var dx = e.clientX - press.x;
      press = null;
      if (Math.abs(dx) >= SWIPE_PX) {
        if (dx < 0) next();
        else prev();
        return;
      }
      var box = player.getBoundingClientRect();
      if ((e.clientX - box.left) / Math.max(1, box.width) < SIDE_TAP) prev();
      else next();
    });

    function onKey(e) {
      // Over the game every key stays in the book, so the game under it never moves.
      if (o.overlay) e.stopImmediatePropagation();
      else if (!playing && !root.contains(document.activeElement)) return;
      var handled = true;
      if (playing && (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') && !(e.target.closest && e.target.closest('button, a'))) next();
      else if (playing && e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') goBack();
      else handled = false;
      if (handled) e.preventDefault();
    }
    window.addEventListener('keydown', onKey, true);
    if (o.overlay) {
      ['keyup', 'keypress'].forEach(function (type) { window.addEventListener(type, stopKeys, true); });
    }
    function stopKeys(e) { e.stopImmediatePropagation(); }

    function finish(skipped) {
      if (closed) return;
      leavePage(skipped);
      closed = true;
      stopPlaying();
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onResize);
      ['keyup', 'keypress'].forEach(function (type) { window.removeEventListener(type, stopKeys, true); });
      if (audio) audio.pause();
      if (o.overlay) {
        root.classList.add('xsb--leaving');
        setTimeout(function () { if (root.parentNode) root.parentNode.removeChild(root); }, still ? 0 : 200);
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      }
      if (o.onClose) o.onClose();
    }

    // ---------- Start ----------

    // In book mode this draws the chapter list.
    setProgress(o.progress);
    root.tabIndex = -1;
    (o.overlay ? document.body : o.mount).appendChild(root);
    if (bookMode) {
      if (o.overlay) {
        var firstButton = list.querySelector('button');
        if (firstButton) firstButton.focus({ preventScroll: true });
      }
    } else {
      var reel = momentShots((o.pages || []).map(function (id) { return byId[id]; }).filter(Boolean));
      if (!reel.length) {
        finish(false);
        return { close: function () {}, setProgress: function () {} };
      }
      play(reel, 0);
    }

    return {
      close: function () { finish(skipping()); },
      setProgress: setProgress
    };
  }

  window.ExitwiseStorybook = { open: open, version: 2 };
})();
