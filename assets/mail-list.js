// The footer's sign-up for news by email (tools/lib/mail-list.mjs writes the form; assets/menu.js loads this file on a
// page that has one). Pressing Sign up sends the typed address and the page's topic to VHub's `email` function, as a
// callable call over plain fetch, so the page loads no SDK; VHub then mails the confirmation link (double opt-in), and
// nothing more comes until it is used. Nothing is sent before the press. The robots' field and the time since the
// page opened go with it, as VHub's checks want.
// What follows is said plainly (George, 31 Oct 2026: "I added my email to news letter but only a text small
// confirmation showing. Fix it."): on success the form gives way, animated, to a card in the product's colours (sun on
// the company's pages) with a check mark, "Almost there", where the link went, "Send again" and "Change address",
// announced to screen readers; an error is a clear box under the field, which is marked and focused. Under reduced
// motion both only fade. English, or Greek on a page whose language is Greek.
(() => {
  const ENDPOINT = "https://europe-west1-vgraphics-vhub.cloudfunctions.net/email";
  /** VHub mails a new confirmation link at most every 10 minutes: "Send again" waits as long. */
  const AGAIN_MS = 10 * 60 * 1000;

  const WORDS = {
    en: {
      sending: "Signing up…",
      almost: "Almost there",
      sent: "We sent a link to {email}. Tap it to confirm.",
      inTitle: "You're signed up",
      inLine: "News comes to {email}. Every email has a one-tap unsubscribe.",
      again: "Didn't get it? Send again",
      againDone: "Asked again. A new link comes at most every 10 minutes; check your spam folder too.",
      change: "Change address",
      invalid: "That doesn't look like an email address. Check it and try again.",
      limit: "Too many sign-ups from here right now. Try again in an hour.",
      age: "This news is for people aged 16 and over.",
      failed: "It didn't go through. Check your connection and try again.",
    },
    el: {
      sending: "Εγγραφή…",
      almost: "Σχεδόν έτοιμο",
      sent: "Στείλαμε έναν σύνδεσμο στο {email}. Πάτησέ τον για επιβεβαίωση.",
      inTitle: "Είσαι μέσα",
      inLine: "Τα νέα έρχονται στο {email}. Κάθε email έχει διαγραφή με ένα πάτημα.",
      again: "Δεν ήρθε; Στείλ' τον ξανά",
      againDone: "Ζητήθηκε ξανά. Νέος σύνδεσμος έρχεται το πολύ κάθε 10 λεπτά· δες και τα ανεπιθύμητα.",
      change: "Αλλαγή διεύθυνσης",
      invalid: "Αυτό δεν μοιάζει με διεύθυνση email. Έλεγξέ τη και δοκίμασε ξανά.",
      limit: "Πολλές εγγραφές από εδώ αυτή τη στιγμή. Δοκίμασε ξανά σε μία ώρα.",
      age: "Τα νέα είναι για άτομα 16 ετών και άνω.",
      failed: "Δεν ολοκληρώθηκε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.",
    },
  };

  /** The page's words: Greek on a Greek page, English everywhere else. */
  const wordsFor = (lang) => (/^el\b/i.test(lang ?? "") ? WORDS.el : WORDS.en);

  /**
   * What VHub's answer means for the form: a card ("pending": the link went; "confirmed": signed up at once) or an
   * error's words. Anything unexpected is a failure.
   */
  function outcome(result, w) {
    if (result === "pending") return { card: true, title: w.almost, line: w.sent };
    if (result === "confirmed") return { card: true, title: w.inTitle, line: w.inLine };
    return { card: false, error: w[result] ?? w.failed };
  }

  // For the tests (tools/test/mail-list.test.mjs), which run this file without a page.
  globalThis.VGMailList = { WORDS, wordsFor, outcome };
  if (typeof document === "undefined") return;

  const w = wordsFor(document.documentElement.lang);
  const opened = Date.now();
  const calm = matchMedia("(prefers-reduced-motion: reduce)");
  const CHECK =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /** Comes in: grows from 96% and fades in (a fade alone under reduced motion). */
  const enter = (node) =>
    node.animate(calm.matches ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: "translateY(6px) scale(0.96)" }, { opacity: 1, transform: "none" }], {
      duration: calm.matches ? 120 : 260,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    }).finished;
  /** Goes out, a little faster than it came, and stays out until it is shown again (comeBack). */
  const leave = (node) =>
    node.animate(calm.matches ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.98)" }], {
      duration: calm.matches ? 100 : 170,
      easing: "ease-in",
      fill: "forwards",
    }).finished.catch(() => {});
  /** Undoes leave's held state, then comes in. */
  const comeBack = (node) => {
    node.getAnimations().forEach((a) => a.cancel());
    return enter(node);
  };

  async function send(form, email) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          op: "signup",
          email,
          topics: [form.dataset.topic],
          lang: /^el\b/i.test(document.documentElement.lang) ? "el" : "en",
          source: { product: form.dataset.product, platform: "web", page: location.pathname },
          wording: form.dataset.wording,
          trap: form.elements.website.value,
          openedAt: opened,
        },
      }),
    });
    return (await response.json())?.result?.result;
  }

  for (const form of document.querySelectorAll("form.mail-list")) {
    const input = form.elements.email;
    const button = form.querySelector("button[type=submit]");
    const said = form.querySelector(".mail-list-said");
    const fields = [...form.children].filter((child) => child !== said);
    let card = null;
    let againAt = 0;

    const showError = (text) => {
      said.textContent = text;
      said.classList.add("is-error");
      said.setAttribute("role", "alert");
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", said.id || (said.id = `${input.id}-said`));
      input.focus();
      void enter(said);
    };
    const clearError = () => {
      said.textContent = "";
      said.classList.remove("is-error");
      said.setAttribute("role", "status");
      input.removeAttribute("aria-invalid");
    };
    input.addEventListener("input", () => said.classList.contains("is-error") && clearError());

    /** The confirmation card in the form's place. */
    async function showCard(o, email) {
      card = document.createElement("div");
      card.className = "mail-list-done";
      card.setAttribute("role", "status");
      card.setAttribute("aria-live", "polite");
      card.tabIndex = -1;
      const mark = document.createElement("span");
      mark.className = "mail-list-check";
      mark.innerHTML = CHECK;
      const title = document.createElement("p");
      title.className = "mail-list-done-title";
      title.textContent = o.title;
      const line = document.createElement("p");
      line.className = "mail-list-done-line";
      const [before, after] = o.line.split("{email}");
      const address = document.createElement("b");
      address.textContent = email;
      line.append(before, address, after ?? "");
      const actions = document.createElement("p");
      actions.className = "mail-list-done-actions";
      const note = document.createElement("p");
      note.className = "mail-list-done-note";
      note.setAttribute("role", "status");
      if (o.title === w.almost) {
        const again = document.createElement("button");
        again.type = "button";
        again.textContent = w.again;
        again.disabled = Date.now() < againAt;
        again.addEventListener("click", async () => {
          again.disabled = true;
          againAt = Date.now() + AGAIN_MS;
          // VHub sends the new link only if the last one is 10 minutes old; it answers "pending" either way.
          const result = await send(form, email).catch(() => null);
          note.textContent = result === "pending" || result === "confirmed" ? w.againDone : w.failed;
          if (result !== "pending" && result !== "confirmed") again.disabled = false;
        });
        actions.append(again);
      }
      const change = document.createElement("button");
      change.type = "button";
      change.textContent = w.change;
      change.addEventListener("click", () => void showForm(email));
      actions.append(change);
      card.append(mark, title, line, actions, note);
      await Promise.all(fields.map((f) => leave(f)));
      form.classList.add("is-done");
      form.append(card);
      card.focus({ preventScroll: true });
      await enter(card);
    }

    /** Back to the form, the address kept, to change it. */
    async function showForm(email) {
      if (!card) return;
      await leave(card);
      card.remove();
      card = null;
      form.classList.remove("is-done");
      input.value = email;
      fields.forEach((f) => void comeBack(f));
      input.focus();
      input.select();
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !input.checkValidity()) return showError(w.invalid);
      clearError();
      button.disabled = true;
      const label = button.textContent;
      button.textContent = w.sending;
      try {
        const o = outcome(await send(form, email), w);
        if (o.card) {
          input.value = "";
          await showCard(o, email);
        } else {
          showError(o.error);
        }
      } catch {
        showError(w.failed);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  }
})();
