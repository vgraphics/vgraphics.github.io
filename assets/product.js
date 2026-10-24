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

  // The header turns into a frosted bar once the page leaves its very top (assets/product.css, .top.scrolled).
  const top = document.querySelector(".top");
  if (top) {
    const update = () => top.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", update, { passive: true });
    update();
  }
})();
