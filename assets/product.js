// The product pages' shared behaviour (tools/build-pages.mjs loads it where a page needs it). Tours open and close
// their parts with assets/faq.js, which animates every expandable.
(() => {
  // The last card stands half in the footer's picture: the footer rises by half the card's height (assets/product.css).
  const card = document.querySelector(".cta-band .panel");
  const foot = document.querySelector(".foot.has-art");
  if (card && foot) new ResizeObserver(() => foot.style.setProperty("--cta-half", card.offsetHeight / 2 + "px")).observe(card);

  // A deck of cards (tools/build-pages.mjs, cards "deck": true): its arrows move it a card at a time, and each arrow
  // hides at its end. Without JavaScript the deck still scrolls by hand and the arrows stay hidden.
  for (const wrap of document.querySelectorAll(".deck-wrap")) {
    const deck = wrap.querySelector(".deck");
    const [prev, next] = wrap.querySelectorAll(".deck-btn");
    const step = () => (deck.querySelector("li")?.offsetWidth ?? 280) + parseFloat(getComputedStyle(deck).columnGap || 0);
    const update = () => {
      prev.hidden = deck.scrollLeft < 4;
      next.hidden = deck.scrollLeft > deck.scrollWidth - deck.clientWidth - 4;
    };
    prev.addEventListener("click", () => deck.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => deck.scrollBy({ left: step(), behavior: "smooth" }));
    deck.addEventListener("scroll", update, { passive: true });
    new ResizeObserver(update).observe(deck);
    update();
  }

  // One recording at a time, for the quotes' buttons and the role cards' voices: a button plays its recording and stops
  // it again, the soundtrack stops while it speaks and stops it in turn, and the button's --played (0 to 1) follows it
  // for a ring. Nothing loads until a button is pressed.
  let voice = null, on = null, tick = 0;
  const hush = () => {
    voice?.pause();
    cancelAnimationFrame(tick);
    on?.setAttribute("aria-pressed", "false");
    on?.style.removeProperty("--played");
    on = null;
  };
  const speak = (b, src) => {
    if (on === b) return hush();
    hush();
    if (!voice) {
      voice = new Audio();
      voice.preload = "none";
      voice.addEventListener("ended", hush);
      voice.addEventListener("error", hush);
      document.addEventListener("play", (e) => e.target !== voice && hush(), true);
    }
    document.querySelectorAll(".ost audio").forEach((a) => a.pause());
    voice.src = src;
    voice.play().catch(() => on === b && hush()); // a play cut short by the next one leaves the next one alone
    on = b;
    b.setAttribute("aria-pressed", "true");
    const follow = () => {
      if (voice.duration) b.style.setProperty("--played", (voice.currentTime / voice.duration).toFixed(3));
      tick = requestAnimationFrame(follow);
    };
    follow();
  };

  // A card with a back (cards item "back"; Palermo's role cards): a click grows it to a full-screen view, flying from
  // its place; a click on it there turns it over to its back, and again to its front; a click outside it, Escape or
  // the close button flies it home (no flight with reduced motion). George, 24 Oct 2026. A card with a recording (cards
  // item "voice") gets a play button under it there, with a ring that fills as it speaks and the line as a caption; it
  // stops when the view closes (George, 26 Oct 2026: "add a play button to listen to his voice").
  const openers = [...document.querySelectorAll(".card")].filter((c) => c.querySelector(":scope > template.card-back"));
  if (openers.length) {
    const view = document.createElement("div");
    view.className = "card-view";
    view.hidden = true;
    view.innerHTML = '<div class="card-view-shade"></div><div class="card-view-fly"><div class="card-view-turn" role="dialog" aria-modal="true" tabindex="-1"><div class="card-face card-front"></div><div class="card-face card-back"></div></div></div><div class="card-view-voice" hidden><button class="quote-play card-view-play" type="button" aria-pressed="false"><svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23"/><circle class="played" cx="24" cy="24" r="23"/></svg><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 5.3v13.4a1.2 1.2 0 0 0 1.8 1l10.4-6.7a1.2 1.2 0 0 0 0-2L10 4.3a1.2 1.2 0 0 0-1.8 1z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="5.6" y="4.6" width="4.6" height="14.8" rx="1.7"/><rect x="13.8" y="4.6" width="4.6" height="14.8" rx="1.7"/></svg></button><p class="card-view-line"><span class="card-view-said"></span><span class="card-view-by"></span></p></div><p class="card-view-hint">Tap the card to turn it over. Tap outside it to close.</p><button class="card-view-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    document.body.append(view);
    const fly = view.querySelector(".card-view-fly"), turn = view.querySelector(".card-view-turn"), shade = view.querySelector(".card-view-shade");
    const front = view.querySelector(".card-front"), backFace = view.querySelector(".card-back"), closeBtn = view.querySelector(".card-view-close");
    const bar = view.querySelector(".card-view-voice"), play = view.querySelector(".card-view-play");
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    let from = null;
    // The transform that puts the view's card exactly over the card on the page
    const flight = (el) => {
      const a = el.getBoundingClientRect(), b = fly.getBoundingClientRect();
      return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width}, ${a.height / b.height})`;
    };
    const open = (card) => {
      from = card;
      const parts = [...card.children].filter((n) => n.tagName !== "TEMPLATE").map((n) => n.cloneNode(true));
      front.replaceChildren(...parts);
      backFace.replaceChildren(card.querySelector("h3").cloneNode(true), card.querySelector(":scope > template.card-back").content.cloneNode(true));
      turn.classList.remove("turned");
      turn.setAttribute("aria-label", card.querySelector("h3").textContent);
      const v = card.dataset;
      bar.hidden = !v.voice;
      view.classList.toggle("has-voice", Boolean(v.voice));
      if (v.voice) {
        bar.querySelector(".card-view-said").textContent = `“${v.voiceLine}”`;
        bar.querySelector(".card-view-by").textContent = v.voiceBy;
        play.setAttribute("aria-label", v.voiceLabel);
      }
      view.hidden = false;
      document.documentElement.classList.add("card-open");
      turn.focus({ preventScroll: true });
      if (calm.matches) return;
      fly.animate([{ transform: flight(card) }, { transform: "none" }], { duration: 460, easing: "cubic-bezier(.2,.8,.2,1)" });
      shade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 460, easing: "ease-out" });
    };
    const close = async () => {
      if (view.hidden) return;
      if (on === play) hush();
      if (!calm.matches && from) {
        shade.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 340, easing: "ease-in", fill: "forwards" });
        turn.classList.remove("turned");
        await fly.animate([{ transform: "none" }, { transform: flight(from) }], { duration: 340, easing: "cubic-bezier(.4,0,.7,.2)" }).finished.catch(() => {});
      }
      view.hidden = true;
      shade.getAnimations().forEach((a) => a.cancel());
      document.documentElement.classList.remove("card-open");
      from?.focus({ preventScroll: true });
    };
    for (const card of openers) {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-haspopup", "dialog");
      card.setAttribute("aria-label", `Open the ${card.querySelector("h3").textContent} card`);
      card.addEventListener("click", () => open(card));
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card); } });
    }
    turn.addEventListener("click", (e) => { if (!e.target.closest("a")) turn.classList.toggle("turned"); });
    turn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turn.classList.toggle("turned"); } });
    view.addEventListener("click", (e) => { if (!e.target.closest(".card-view-turn, .card-view-voice")) close(); });
    play.addEventListener("click", () => speak(play, from.dataset.voice));
    closeBtn.addEventListener("click", close);
    addEventListener("keydown", (e) => {
      if (view.hidden) return;
      if (e.key === "Escape") close();
      // Keep the keyboard inside the view: the card, its back's link, the play button, the close button
      if (e.key === "Tab") {
        const stops = [turn, ...turn.querySelectorAll(".card-back a"), ...(bar.hidden ? [] : [play]), closeBtn];
        const i = stops.indexOf(document.activeElement);
        e.preventDefault();
        stops[(i + (e.shiftKey ? stops.length - 1 : 1)) % stops.length].focus();
      }
    });
  }

  // An album's pictures open large (build-pages.mjs, album): the arrows, the buttons or a swipe move through the
  // album; a click on the picture (or Enter) zooms in where it was clicked, and dragging moves it; Escape, the close
  // button or a click outside closes. The pictures load only when opened. The preview flies out of its tile and back
  // into the one shown when it closes; a picture still loading shows its blurhash, never the one before it (George,
  // 26 Oct 2026: "preview open on previous image until new loads. Also open preview with animation. Use blurhash.").
  const albumItems = document.querySelectorAll(".album-item");
  if (albumItems.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = '<figure class="lb-stage"><div class="lb-frame" tabindex="0"><img alt=""></div><figcaption></figcaption></figure>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Previous picture"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><button class="lb-btn lb-next" type="button" aria-label="Next picture"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><p class="lb-count" aria-live="polite"></p>';
    document.body.append(box);
    const frame = box.querySelector(".lb-frame"), img = frame.querySelector("img"), cap = box.querySelector("figcaption"), count = box.querySelector(".lb-count");
    const [prevBtn, nextBtn, closeBtn] = box.querySelectorAll(".lb-btn");
    const ZOOM = 2.5;
    let items = [], at = 0, zoomed = false, pan = [0, 0], drag = null;
    const place = () => (img.style.transform = zoomed ? `translate(${pan[0]}px, ${pan[1]}px) scale(${ZOOM})` : "");
    const clamp = () => {
      const mx = (img.offsetWidth * (ZOOM - 1)) / 2, my = (img.offsetHeight * (ZOOM - 1)) / 2;
      pan = [Math.max(-mx, Math.min(mx, pan[0])), Math.max(-my, Math.min(my, pan[1]))];
    };
    const zoom = (on, x = 0.5, y = 0.5) => {
      zoomed = on;
      box.classList.toggle("zoomed", on);
      pan = on ? [(0.5 - x) * img.offsetWidth * (ZOOM - 1), (0.5 - y) * img.offsetHeight * (ZOOM - 1)] : [0, 0];
      clamp();
      place();
    };
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const blur = import("/assets/blurhash.js").catch(() => null);
    // The frame: the whole picture, as large as the box allows and no wider than 1600 px
    const fit = () => {
      const b = items[at], cs = getComputedStyle(box);
      const w = +b.dataset.w, h = +b.dataset.h;
      const s = Math.min(Math.min(1600, box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / w, (innerHeight - 170) / h);
      frame.style.width = `${Math.round(w * s)}px`;
      frame.style.height = `${Math.round(h * s)}px`;
    };
    const show = (i) => {
      at = (i + items.length) % items.length;
      const b = items[at];
      zoom(false);
      // The picture before goes at once; this one's blurhash stands in until it has loaded, then it fades in
      img.classList.remove("loaded");
      frame.style.backgroundImage = "";
      blur.then((m) => m && items[at] === b && b.dataset.hash && (frame.style.backgroundImage = `url(${m.url(b.dataset.hash, +b.dataset.w, +b.dataset.h)})`));
      img.width = b.dataset.w;
      img.height = b.dataset.h;
      fit();
      const src = new URL(b.dataset.full, location.href).href;
      if (img.src !== src) img.src = src;
      if (img.complete && img.naturalWidth) img.classList.add("loaded");
      img.alt = b.querySelector("img").alt;
      cap.textContent = b.querySelector("span").textContent;
      count.textContent = `${at + 1} of ${items.length}`;
      box.setAttribute("aria-label", cap.textContent);
      prevBtn.hidden = nextBtn.hidden = items.length < 2;
    };
    img.addEventListener("load", () => img.classList.add("loaded"));
    addEventListener("resize", () => !box.hidden && fit());
    // The flight between a tile and the frame: the tile's picture is a crop of the same picture, so they meet at
    // their widths and centres
    const flight = (tile) => {
      const t = tile.getBoundingClientRect(), f = frame.getBoundingClientRect();
      return `translate(${t.left + t.width / 2 - (f.left + f.width / 2)}px, ${t.top + t.height / 2 - (f.top + f.height / 2)}px) scale(${t.width / f.width})`;
    };
    const chrome = () => [cap, count, prevBtn, nextBtn, closeBtn];
    const close = async () => {
      if (box.hidden || box.classList.contains("closing")) return;
      if (!still.matches) {
        box.classList.add("closing");
        const tile = items[at]?.querySelector("img"), r = tile?.getBoundingClientRect();
        const back = r && r.bottom > 0 && r.top < innerHeight;
        await Promise.all([
          box.animate([{}, { backgroundColor: "transparent", backdropFilter: "blur(0px)" }], { duration: 300, easing: "ease-in" }).finished,
          ...chrome().map((e) => e.animate([{}, { opacity: 0 }], { duration: 160, fill: "forwards" }).finished),
          back ? frame.animate([{ transform: "none" }, { transform: flight(tile) }], { duration: 320, easing: "cubic-bezier(.4,0,.7,.2)" }).finished
            : frame.animate([{}, { opacity: 0, transform: "scale(0.94)" }], { duration: 220, easing: "ease-in" }).finished,
        ].map((p) => p.catch(() => {})));
        box.classList.remove("closing");
        chrome().forEach((e) => e.getAnimations().forEach((a) => a.cancel()));
      }
      box.hidden = true;
      document.documentElement.classList.remove("card-open");
      items[at]?.focus({ preventScroll: true });
    };
    for (const b of albumItems) {
      b.addEventListener("click", () => {
        items = [...b.closest(".album").querySelectorAll(".album-item")];
        box.hidden = false;
        show(items.indexOf(b));
        document.documentElement.classList.add("card-open");
        frame.focus({ preventScroll: true });
        if (still.matches) return;
        box.animate([{ backgroundColor: "transparent", backdropFilter: "blur(0px)" }, {}], { duration: 320, easing: "ease-out" });
        chrome().forEach((e) => e.animate([{ opacity: 0 }, {}], { duration: 320, delay: 140, easing: "ease-out", fill: "backwards" }));
        frame.animate([{ transform: flight(b.querySelector("img")) }, { transform: "none" }], { duration: 440, easing: "cubic-bezier(.2,.8,.2,1)" });
      });
    }
    prevBtn.addEventListener("click", () => show(at - 1));
    nextBtn.addEventListener("click", () => show(at + 1));
    closeBtn.addEventListener("click", close);
    box.addEventListener("click", (e) => e.target === box && close());
    // A click zooms in or out; a drag moves the zoomed picture; a swipe on the whole picture moves through the album
    img.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY, pan: [...pan], moved: false };
      img.setPointerCapture(e.pointerId);
    });
    img.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 5) drag.moved = true;
      if (zoomed && drag.moved) {
        box.classList.add("dragging");
        pan = [drag.pan[0] + dx, drag.pan[1] + dy];
        clamp();
        place();
      }
    });
    img.addEventListener("pointerup", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      box.classList.remove("dragging");
      if (!drag.moved) {
        const r = img.getBoundingClientRect();
        zoom(!zoomed, zoomed ? 0.5 : (e.clientX - r.left) / r.width, zoomed ? 0.5 : (e.clientY - r.top) / r.height);
      } else if (!zoomed && Math.abs(dx) > 50 && items.length > 1) show(at + (dx < 0 ? 1 : -1));
      drag = null;
    });
    img.addEventListener("pointercancel", () => (drag = null, box.classList.remove("dragging")));
    addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && !zoomed) show(at + 1);
      else if (e.key === "ArrowLeft" && !zoomed) show(at - 1);
      else if ((e.key === "Enter" || e.key === " ") && document.activeElement === frame) {
        e.preventDefault();
        zoom(!zoomed);
      } else if (e.key === "Tab") {
        // Keep the keyboard inside: the picture, the arrows, the close button
        const stops = [frame, prevBtn, nextBtn, closeBtn].filter((s) => !s.hidden);
        const i = stops.indexOf(document.activeElement);
        e.preventDefault();
        stops[(i + (e.shiftKey ? stops.length - 1 : 1)) % stops.length].focus();
      }
    });
  }

  // A quote's recording (build-pages.mjs, quote "audio"): its button plays it and stops it again, on the one player above
  for (const b of document.querySelectorAll(".quote-play[data-voice]")) b.addEventListener("click", () => speak(b, b.dataset.voice));

  // A footer scene's weather (tools/lib/partials.mjs, footerScene "weather"): one of its kinds at random on each visit,
  // drifting clouds, rain or leaves on the wind; none with reduced motion.
  const sky = document.querySelector(".foot-weather");
  if (sky && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const kinds = sky.dataset.kinds.split(" ");
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const add = (cls, style) => sky.append(Object.assign(document.createElement("span"), { className: cls, style }));
    if (kind === "clouds") for (let i = 0; i < 3; i++) add("fw-cloud", `top: ${8 + i * 20 + rnd(0, 8)}%; opacity: ${rnd(0.35, 0.7).toFixed(2)}; animation-duration: ${rnd(70, 130)}s; animation-delay: ${-rnd(0, 120)}s`);
    if (kind === "rain") add("fw-rain", "");
    if (kind === "wind") for (let i = 0; i < 7; i++) add("fw-leaf", `top: ${rnd(25, 80)}%; animation-duration: ${rnd(7, 13)}s; animation-delay: ${-rnd(0, 13)}s`);
    sky.dataset.now = kind;
  }

  // The header turns into a frosted bar once the page leaves its very top (assets/product.css, .top.scrolled).
  const top = document.querySelector(".top");
  if (top) {
    const update = () => top.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", update, { passive: true });
    update();
  }
})();
