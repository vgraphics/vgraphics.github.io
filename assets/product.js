// The product pages' shared behaviour (tools/build-pages.mjs loads it where a page needs it).
// Tours: one part open at a time, opened from its button or a numbered spot on the screen. Without JavaScript every
// part stays open.
(() => {
  for (const tour of document.querySelectorAll(".tour")) {
    const parts = [...tour.querySelectorAll(".part > button")];
    const spots = [...tour.querySelectorAll(".spot")];
    const open = (id, scroll) => {
      parts.forEach((b) => {
        const on = b.getAttribute("aria-controls") === id;
        b.setAttribute("aria-expanded", on);
        document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
        if (on && scroll && matchMedia("(max-width: 900px)").matches) b.scrollIntoView({ block: "nearest" });
      });
      spots.forEach((s) => s.setAttribute("aria-expanded", s.getAttribute("aria-controls") === id));
    };
    parts.forEach((b) => b.addEventListener("click", () => open(b.getAttribute("aria-controls"), false)));
    spots.forEach((s) => s.addEventListener("click", () => open(s.getAttribute("aria-controls"), true)));
    open(tour.dataset.open, false);
  }

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

  // A card with a back (cards item "back"; Palermo's role cards): a click grows it to a full-screen view, flying from
  // its place; a click on it there turns it over to its back, and again to its front; a click outside it, Escape or
  // the close button flies it home (no flight with reduced motion). George, 24 Oct 2026.
  const openers = [...document.querySelectorAll(".card")].filter((c) => c.querySelector(":scope > template.card-back"));
  if (openers.length) {
    const view = document.createElement("div");
    view.className = "card-view";
    view.hidden = true;
    view.innerHTML = '<div class="card-view-shade"></div><div class="card-view-fly"><div class="card-view-turn" role="dialog" aria-modal="true" tabindex="-1"><div class="card-face card-front"></div><div class="card-face card-back"></div></div></div><p class="card-view-hint">Tap the card to turn it over. Tap outside it to close.</p><button class="card-view-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    document.body.append(view);
    const fly = view.querySelector(".card-view-fly"), turn = view.querySelector(".card-view-turn"), shade = view.querySelector(".card-view-shade");
    const front = view.querySelector(".card-front"), backFace = view.querySelector(".card-back"), closeBtn = view.querySelector(".card-view-close");
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
      view.hidden = false;
      document.documentElement.classList.add("card-open");
      turn.focus({ preventScroll: true });
      if (calm.matches) return;
      fly.animate([{ transform: flight(card) }, { transform: "none" }], { duration: 460, easing: "cubic-bezier(.2,.8,.2,1)" });
      shade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 460, easing: "ease-out" });
    };
    const close = async () => {
      if (view.hidden) return;
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
    view.addEventListener("click", (e) => { if (!e.target.closest(".card-view-turn")) close(); });
    closeBtn.addEventListener("click", close);
    addEventListener("keydown", (e) => {
      if (view.hidden) return;
      if (e.key === "Escape") close();
      // Keep the keyboard inside the view: the card, its back's link, the close button
      if (e.key === "Tab") {
        const stops = [turn, ...turn.querySelectorAll(".card-back a"), closeBtn];
        const i = stops.indexOf(document.activeElement);
        e.preventDefault();
        stops[(i + (e.shiftKey ? stops.length - 1 : 1)) % stops.length].focus();
      }
    });
  }

  // A quote's recording (build-pages.mjs, quote "audio"): its button plays it and stops it again. It stops the
  // soundtrack while it speaks, and the soundtrack stops it; nothing loads until a button is pressed.
  const voices = [...document.querySelectorAll(".quote-play")];
  if (voices.length) {
    const voice = new Audio();
    let on = null;
    const stop = () => {
      voice.pause();
      on?.setAttribute("aria-pressed", "false");
      on = null;
    };
    voice.addEventListener("ended", stop);
    voice.addEventListener("error", stop);
    for (const b of voices) {
      b.addEventListener("click", () => {
        if (on === b) return stop();
        stop();
        document.querySelectorAll(".ost audio").forEach((a) => a.pause());
        voice.src = b.dataset.voice;
        voice.play().catch(stop);
        on = b;
        b.setAttribute("aria-pressed", "true");
      });
    }
    document.addEventListener("play", (e) => e.target !== voice && stop(), true);
  }

  // The header turns into a frosted bar once the page leaves its very top (assets/product.css, .top.scrolled).
  const top = document.querySelector(".top");
  if (top) {
    const update = () => top.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", update, { passive: true });
    update();
  }
})();
