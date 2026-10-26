// The header's menu on phones (George, 23 Oct 2026: "At mobile the vgraphics.gr toolbar does not fit. It must be a
// burger menu."): a button at the header's right opens the menu as a panel under it. The stylesheets decide where the
// button shows: assets/vgraphics.css below 768px, where the company header's full row no longer fits, and
// assets/product.css below 561px. This file opens and closes the panel: the button again, Escape, a tap outside it or
// one of its links closes it. While it is open, Tab stays in the button and the panel, the rest of the page is inert,
// and closing gives focus back to the button.
// The company header gets its button here, so its markup stays the copy tools/check-site.mjs compares on every company
// page (the hub's pages, which the VHub repo writes, too). The product header has its own (tools/lib/partials.mjs).
// A panel taller than a short screen scrolls, with a fading bottom edge while more lies below; and since every page
// with a header runs this file, it loads the shared fading edges (fade-edges.js) for the page's other boxes too, the
// chapter stepper (stepper.js), which shows on a page with two chapters or more, and, on a page with questions and
// answers, faq.js, which opens and closes them with an animation, one at a time.
(() => {
  const nav = document.querySelector(".site-head .site-nav");
  if (nav && !document.querySelector(".site-head .menu-toggle")) {
    nav.id ||= "site-menu";
    const button = document.createElement("button");
    button.className = "menu-toggle";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", nav.id);
    button.innerHTML = '<span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span>';
    nav.before(button);
  }

  for (const button of document.querySelectorAll(".menu-toggle")) {
    const head = button.closest("header");
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    panel.classList.add("fade-edges");
    let open = false;
    let behind = [];

    const set = (on, refocus) => {
      if (on === open) return;
      open = on;
      button.setAttribute("aria-expanded", on);
      head.classList.toggle("menu-open", on);
      // The page behind the panel, out of reach of Tab and screen readers while it is open.
      if (on) behind = [...document.body.children].filter((el) => !el.contains(head) && !el.inert);
      behind.forEach((el) => (el.inert = on));
      if (!on && refocus) button.focus();
    };

    button.addEventListener("click", () => set(!open, false));
    // A link closes the panel and goes on: to #contact the footer is no longer inert by then.
    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) set(false, false);
    });
    document.addEventListener("click", (e) => {
      if (open && !panel.contains(e.target) && !button.contains(e.target)) set(false, true);
    });
    document.addEventListener("keydown", (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        set(false, true);
      } else if (e.key === "Tab") {
        const stops = [button, ...panel.querySelectorAll("a[href]")].filter((el) => el.offsetWidth);
        const first = stops[0];
        const last = stops[stops.length - 1];
        const at = document.activeElement;
        if (!stops.includes(at) || at === (e.shiftKey ? first : last)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    });
    // The screen grows past the phone layout (the button is gone), or the page is left with the panel open.
    addEventListener("resize", () => {
      if (open && !button.offsetWidth) set(false, false);
    });
    addEventListener("pagehide", () => set(false, false));
  }

  import("/assets/fade-edges.js").catch(() => {});
  import("/assets/stepper.js").catch(() => {});
  if (document.querySelector(".faq")) import("/assets/faq.js").catch(() => {});
})();
