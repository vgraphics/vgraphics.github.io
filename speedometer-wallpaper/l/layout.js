// A market layout's page, where the app's share link lands: https://vgraphics.gr/speedometer-wallpaper/l/?c=<CODE>
// (the web market design §4.3). The layout drawn live by the app's own engine in a phone, in the style it was made
// with, and in any other at a tap; who made it, its stars and uses, its screens and widgets; Try it in your browser,
// Google Play (carrying the code, so the app opens the layout after the install) and, on Android, Open in the app; the
// code with Copy link; and a report form that needs no account. On an Android phone with the app the link opens the
// app itself (an App Link); when it opens here, the page asks Chrome for the app once, and Chrome comes back with
// &app=none when it isn't installed.
(function () {
  "use strict";
  const page = document.querySelector(".mk-page");
  if (!page || !window.SpeedoMarket) return;
  const M = window.SpeedoMarket;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const code = M.codeIn(params.get("c") || "");
  const isAndroid = /Android/i.test(navigator.userAgent);
  let layout = null;
  let app = null;
  let shownStyle = "";

  const done = (state) => page.setAttribute("data-state", state);

  if (!code) {
    $("layout-found").hidden = true;
    $("layout-nocode").hidden = false;
    done("ready");
    return;
  }
  $("layout-code").textContent = code;
  if (isAndroid && params.get("app") !== "none") location.href = M.appIntent(code);

  // One part of the stats line; market.css puts the " · " between the parts.
  const part = (words) => {
    const span = document.createElement("span");
    span.textContent = words;
    return span;
  };

  // The phone's screen takes the layout's own frame: a tall phone, a Fold opened, a tablet on its side.
  function frame() {
    const landscape = layout.frame.orientation === "landscape";
    $("layout-phone").setAttribute("data-orientation", landscape ? "landscape" : "portrait");
    $("layout-screen").style.setProperty("--frame", landscape ? `${layout.frame.aspect} / 1` : `1 / ${layout.frame.aspect}`);
  }

  // Where the engine can't run, or the layout can't be drawn: its style's picture, said for what it is.
  async function stillInstead(reason) {
    const img = document.createElement("img");
    img.alt = "";
    $("layout-screen").replaceChildren(img);
    $("layout-styles").hidden = true;
    await M.fallback(img, layout.madeWith, reason);
  }

  function pressStyle(id) {
    shownStyle = id;
    $("layout-styles").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-style") === id)));
    $("layout-try").href = `/speedometer-wallpaper/play/#layout=${code}&style=${encodeURIComponent(id)}`;
  }

  // One chip per style; a paid style shows its price, and draws in full, as on the try page.
  async function styleChips() {
    const [all, c] = await Promise.all([M.styles(), M.config()]);
    const chips = $("layout-styles");
    chips.replaceChildren(...all.list.map((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-style", s.id);
      b.disabled = true;
      b.append(s.name);
      if (!s.free && c.prices.premium) {
        const price = document.createElement("small");
        price.textContent = c.prices.premium;
        b.append(price);
      }
      return b;
    }));
    pressStyle(layout.madeWith);
    chips.addEventListener("click", (event) => {
      const b = event.target.closest("button[data-style]");
      if (!b || !app) return;
      const id = b.getAttribute("data-style");
      app.show(id);
      pressStyle(id);
      M.event("layout_style_preview", { style: id, code });
    });
  }

  // The live layout: the engine loads when the page is quiet, with no start-up (the design's builder check, answer 4).
  async function live() {
    const c = await M.config();
    const src = c.engine + "vgtry.js";
    await new Promise((resolve, reject) => {
      if (window.VGTry) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject({ reason: "missing" });
      document.head.appendChild(script);
    });
    if (!window.VGTry.isSupported()) throw { reason: "unsupported" };
    app = await window.VGTry.start({
      host: $("layout-screen"),
      base: c.engine,
      look: `style=${layout.madeWith}&layout=${code}`,
      layouts: [{ code, data: layout.data }],
    });
    if (!app.values().shared) throw { reason: "broken" };
    $("layout-styles").querySelectorAll("button").forEach((b) => { b.disabled = false; });
  }

  async function show() {
    $("layout-name").textContent = layout.name;
    document.title = `${layout.name}: a Speedometer layout`;
    const people = await M.profiles([layout.creatorUid]);
    const by = M.byline(people.get(layout.creatorUid));
    by.prepend("by ");
    $("layout-by").replaceChildren(by);
    const meta = $("layout-meta");
    meta.replaceChildren(M.stars(layout), part(M.usesText(layout.uses)));
    if (layout.createdAt) meta.append(part(`Shared on ${M.date(layout.createdAt)}`));
    const all = await M.styles();
    $("layout-made").textContent = `Made with ${M.styleIn(all, layout.madeWith).name} · works with all ${all.list.length} styles`;
    // The cards' own tags: the screens with their icons, the widgets as plain pills (Now Playing in its own).
    $("layout-shapes").replaceChildren(...layout.shapes.filter((s) => M.SHAPES[s]).map((s) => M.tag(M.SHAPES[s], s)));
    $("layout-widgets").replaceChildren(...layout.widgetKinds.filter((k) => M.WIDGETS[k]).map((k) => M.tag(M.WIDGETS[k], k)));
    $("layout-get").href = await M.playUrl(code, "layout_page");
    if (isAndroid) {
      $("layout-open").href = M.appIntent(code);
      $("layout-open").hidden = false;
    }
    if (M.wasReported(code)) $("layout-report-open").hidden = true;
    frame();
    await styleChips();
    done("ready");
    if (location.hash === "#report" && !M.wasReported(code)) openReport();
    const begin = () => live().catch((failure) => stillInstead(failure && failure.reason ? failure.reason : "failed"));
    if (window.requestIdleCallback) window.requestIdleCallback(begin, { timeout: 1500 });
    else setTimeout(begin, 100);
  }

  async function load() {
    $("layout-failed").hidden = true;
    try {
      layout = await M.byCode(code);
    } catch (failure) {
      $("layout-failed").hidden = false;
      done("ready");
      M.error(`layout ${code}: ${failure && failure.message ? failure.message : failure}`);
      return;
    }
    if (!layout) {
      $("layout-found").hidden = true;
      $("layout-missing").hidden = false;
      done("ready");
      return;
    }
    await show();
  }

  // ---------- Copy link, the store and the app ----------

  $("layout-copy").addEventListener("click", () => {
    const link = `https://vgraphics.gr/speedometer-wallpaper/l/?c=${code}`;
    const copied = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(link) : Promise.reject(new Error("no clipboard"));
    copied.then(() => { $("layout-copied").textContent = "Link copied"; }, () => { $("layout-copied").textContent = link; });
    M.event("share", { method: "link", content_type: "layout", item_id: code });
  });
  $("layout-try").addEventListener("click", () => M.event("layout_try", { code, style: shownStyle }));
  $("layout-get").addEventListener("click", () => M.event("layout_install_click", { code }));
  $("layout-open").addEventListener("click", () => M.event("layout_open_app", { code }));
  $("layout-retry").addEventListener("click", load);

  // ---------- Reporting ----------

  const form = $("layout-report");
  const message = $("layout-message");
  function openReport() {
    form.hidden = false;
    $("layout-report-open").hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    const first = form.querySelector("input[name=reason]");
    if (first) first.focus({ preventScroll: true });
  }
  $("layout-report-open").addEventListener("click", openReport);
  $("layout-report-cancel").addEventListener("click", () => {
    form.hidden = true;
    $("layout-report-open").hidden = false;
  });
  message.addEventListener("input", () => { $("layout-counter").textContent = `${message.value.length} / 500`; });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const reason = (form.querySelector("input[name=reason]:checked") || {}).value;
    if (!reason || !layout) return;
    const send = form.querySelector("button[type=submit]");
    send.disabled = true;
    $("layout-report-failed").hidden = true;
    try {
      await M.report(layout, reason, message.value.trim());
      form.hidden = true;
      $("layout-thanks").hidden = false;
    } catch (failure) {
      $("layout-report-failed").hidden = false;
      M.error(`report ${code}: ${failure && failure.message ? failure.message : failure}`);
    } finally {
      send.disabled = false;
    }
  });

  load();
  M.event("market_view", { page: "layout" });
})();
