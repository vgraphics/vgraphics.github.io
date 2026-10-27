// The layout market's page (the web market design §4.2): the app's tabs (Popular, New, Top rated) and screen filters,
// 20 live layouts a page with "Show 20 more", and a search box where a layout's code opens its page and anything else
// is a name search. Layout of the week leads the Popular tab. The choice rides in the address (?tab=new&shape=phone),
// so a filtered market can be shared and Back works.
(function () {
  "use strict";
  const root = document.querySelector(".mk-browse");
  if (!root || !window.SpeedoMarket) return;
  const M = window.SpeedoMarket;
  const $ = (selector) => root.querySelector(selector);
  const list = $(".mk-grid");
  const more = $('[data-market="more"]');
  const status = $('[data-market="status"]');
  const failed = $('[data-market="failed"]');
  const empty = $('[data-market="empty"]');
  const input = $("#mk-search");
  const PLACEHOLDERS = 8;

  const params = new URLSearchParams(location.search);
  const state = {
    tab: ["popular", "new", "top"].includes(params.get("tab")) ? params.get("tab") : "popular",
    shape: M.SHAPES[params.get("shape")] ? params.get("shape") : "",
    nowPlaying: params.get("np") === "1",
    next: null,
    featured: undefined,
    run: 0,
  };

  function remember() {
    const p = new URLSearchParams();
    if (state.tab !== "popular") p.set("tab", state.tab);
    if (state.shape) p.set("shape", state.shape);
    if (state.nowPlaying) p.set("np", "1");
    const query = p.toString();
    history.replaceState(null, "", location.pathname + (query ? `?${query}` : "") + location.hash);
  }

  function pressed() {
    root.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-tab") === state.tab)));
    root.querySelectorAll("[data-shape]").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-shape") === state.shape)));
    $("[data-now-playing]").setAttribute("aria-pressed", String(state.nowPlaying));
  }

  const say = (words) => {
    status.textContent = words;
    status.hidden = !words;
  };

  // Layout of the week, read once, leads Popular when it fits the screen chosen.
  async function featured() {
    if (state.featured === undefined) {
      try {
        state.featured = await M.featured();
      } catch (e) {
        state.featured = null;
      }
    }
    const f = state.featured;
    if (!f || (state.shape && !f.shapes.includes(state.shape)) || (state.nowPlaying && !f.nowPlaying)) return null;
    return f;
  }

  // The first page of the chosen tab and filters, or the next one (`more`).
  async function load(isMore) {
    const run = ++state.run;
    failed.hidden = true;
    empty.hidden = true;
    more.hidden = true;
    if (!isMore) {
      say("");
      state.next = null;
      M.placeholders(list, PLACEHOLDERS);
    } else {
      more.disabled = true;
    }
    try {
      const top = !isMore && state.tab === "popular" ? await featured() : null;
      const page = await M.list({ tab: state.tab, shape: state.shape || null, nowPlaying: state.nowPlaying, after: state.next });
      if (run !== state.run) return;
      const layouts = (top ? [top] : []).concat(page.layouts.filter((l) => !top || l.id !== top.id));
      const made = await M.cards(layouts, top && top.id);
      if (run !== state.run) return;
      if (isMore) list.append(...made);
      else list.replaceChildren(...made);
      state.next = page.next;
      more.hidden = !page.next;
      if (!list.children.length) {
        empty.hidden = false;
        $('[data-market="all-screens"]').hidden = !state.shape && !state.nowPlaying;
      }
    } catch (failure) {
      if (run !== state.run) return;
      if (!isMore) list.replaceChildren();
      failed.hidden = false;
      M.error(`market: ${failure && failure.message ? failure.message : failure}`);
    } finally {
      more.disabled = false;
    }
  }

  // A code opens its layout's page; a name lists the live layouts whose names start with it.
  async function search(textTyped) {
    const run = ++state.run;
    failed.hidden = true;
    empty.hidden = true;
    more.hidden = true;
    M.placeholders(list, PLACEHOLDERS);
    try {
      const found = await M.search(textTyped);
      if (run !== state.run) return;
      if (found.code) {
        location.href = M.layoutUrl(found.code);
        return;
      }
      list.replaceChildren(...await M.cards(found.layouts));
      say(found.layouts.length
        ? `Layouts whose names start with “${textTyped.trim()}”`
        : `No layout’s name starts with “${textTyped.trim()}”. A layout’s code is 6 letters and digits, such as C4FK7M.`);
    } catch (failure) {
      if (run !== state.run) return;
      list.replaceChildren();
      failed.hidden = false;
      M.error(`search: ${failure && failure.message ? failure.message : failure}`);
    }
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest && event.target.closest("button");
    if (!button || !root.contains(button)) return;
    if (button.hasAttribute("data-tab")) state.tab = button.getAttribute("data-tab");
    else if (button.hasAttribute("data-shape")) state.shape = button.getAttribute("data-shape");
    else if (button.hasAttribute("data-now-playing")) state.nowPlaying = !state.nowPlaying;
    else if (button.getAttribute("data-market") === "all-screens") {
      state.shape = "";
      state.nowPlaying = false;
    } else if (button.getAttribute("data-market") === "more") return load(true);
    else if (button.getAttribute("data-market") === "retry") {
      if (input.value.trim()) return search(input.value);
      return load(false);
    } else return;
    input.value = "";
    pressed();
    remember();
    load(false);
  });

  $('[data-market="search"]').addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim()) search(input.value);
    else load(false);
  });
  // Clearing the box (its own clear button, or deleting the text) brings the tab back.
  input.addEventListener("input", () => {
    if (!input.value.trim() && status.textContent) load(false);
  });

  pressed();
  load(false);
  M.event("market_view", { page: "layouts" });
})();
