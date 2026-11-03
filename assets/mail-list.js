// The sign-ups for news by email (tools/lib/mail-list.mjs writes the forms: the footer's, the closing card's and the row
// that ends What's new; assets/menu.js loads this file on a page that has one). Pressing Sign up sends the typed address
// and the form's topic to VHub's `email` function, as a callable call over plain fetch, so the page loads no SDK; VHub
// then mails the confirmation link (double opt-in), and nothing more comes until it is used. Nothing is sent before the
// press. The robots' field and the time since the page opened go with it, as VHub's checks want.
// After the press (George kept "after the press" on the mail review page, 3 Nov 2026: "Keep as designed"; before, 31
// Oct: "I added my email to news letter but only a text small confirmation showing. Fix it."): the form gives way,
// animated, to one centred card in the page's own colours, the same component as VHub's /hub/email/ draws (VIEWS):
// - inbox: a typed address always gets it, on the list or not, so the page never tells who is: an envelope, "Check your
//   inbox", the topic asked for, "Send again" counting down VHub's 10 minutes, and "Change address";
// - signed (VHub's answer for an address a sign-in verified): a check that draws itself, the topics, "Manage topics"
//   (/hub/email/) and one next step (Play Exitwise, Try Speedometer, See our games); already: the same for a verified
//   sign-in already on the list, its check still; unsub, after Unsubscribe: "Sign up again" and the next step;
// - limit, failed ("Try again") and expired (an old link: "Send a new link"): a card in the error colour.
// An invalid address and the age rule are said under the field, with a mark, the field marked and focused. Every card
// is announced to screen readers; under reduced motion everything only fades. English, or Greek on a page whose
// language is Greek.
(() => {
  const ENDPOINT = "https://europe-west1-vgraphics-vhub.cloudfunctions.net/email";
  /** VHub mails a new confirmation link at most every 10 minutes: "Send again" counts them down. */
  const AGAIN_MS = 10 * 60 * 1000;
  /** Where a reader on the list picks their topics: VHub's own page. */
  const MANAGE = "/hub/email/";

  const WORDS = {
    en: {
      sending: "Signing up…",
      inbox: "Check your inbox",
      inboxLine: "We sent a link to {email}. Tap it to finish signing up.",
      asked: "You asked for",
      again: "Send again",
      againIn: "Send again in {time}",
      againDone: "Asked again. A new link comes at most every 10 minutes; check your spam folder too.",
      change: "Change address",
      inboxNote: "Nothing yet? Look in spam, or send it again in a few minutes.",
      signed: "You're signed up",
      signedLine: "News comes to {email}. One email a month at most.",
      topics: "Your topics",
      manage: "Manage topics",
      already: "You're already signed up",
      alreadyLine: "{topic} news already comes to {email}.",
      unsub: "You're unsubscribed",
      unsubLine: "We won't send you news any more. Answers to your tickets still come.",
      signUpAgain: "Sign up again",
      limit: "Too many sign-ups right now",
      limitLine: "Lots of sign-ups came from here in the last hour. Try again in an hour.",
      failed: "It didn't go through",
      failedLine: "Check your connection and try again.",
      retry: "Try again",
      expired: "This link has expired",
      expiredLine: "It's too old or was already used. We can send a new one to {email}.",
      resend: "Send a new link",
      invalid: "That doesn't look like an email address. Check it and try again.",
      age: "This news is for people aged 16 and over.",
      playExitwise: "Play Exitwise",
      trySpeedometer: "Try Speedometer",
      seeGames: "See our games",
    },
    el: {
      sending: "Εγγραφή…",
      inbox: "Έλεγξε τα εισερχόμενά σου",
      inboxLine: "Στείλαμε έναν σύνδεσμο στο {email}. Πάτησέ τον για να ολοκληρωθεί η εγγραφή.",
      asked: "Ζήτησες",
      again: "Στείλ' τον ξανά",
      againIn: "Ξανά σε {time}",
      againDone: "Ζητήθηκε ξανά. Νέος σύνδεσμος έρχεται το πολύ κάθε 10 λεπτά· δες και τα ανεπιθύμητα.",
      change: "Αλλαγή διεύθυνσης",
      inboxNote: "Δεν ήρθε ακόμα; Δες στα ανεπιθύμητα ή στείλ' τον ξανά σε λίγα λεπτά.",
      signed: "Η εγγραφή σου ολοκληρώθηκε",
      signedLine: "Τα νέα έρχονται στο {email}. Ένα email τον μήνα, το πολύ.",
      topics: "Τα θέματά σου",
      manage: "Διαχείριση θεμάτων",
      already: "Η εγγραφή σου ισχύει ήδη",
      alreadyLine: "Τα νέα {topic} έρχονται ήδη στο {email}.",
      unsub: "Η διαγραφή σου έγινε",
      unsubLine: "Δεν θα σου στέλνουμε πια νέα. Οι απαντήσεις στα αιτήματά σου θα έρχονται κανονικά.",
      signUpAgain: "Εγγραφή ξανά",
      limit: "Πάρα πολλές εγγραφές αυτή τη στιγμή",
      limitLine: "Ήρθαν πολλές εγγραφές από εδώ την τελευταία ώρα. Δοκίμασε ξανά σε μία ώρα.",
      failed: "Δεν ολοκληρώθηκε",
      failedLine: "Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.",
      retry: "Δοκίμασε ξανά",
      expired: "Ο σύνδεσμος έληξε",
      expiredLine: "Είναι παλιός ή έχει ήδη χρησιμοποιηθεί. Μπορούμε να στείλουμε καινούργιο στο {email}.",
      resend: "Στείλε νέο σύνδεσμο",
      invalid: "Αυτό δεν μοιάζει με διεύθυνση email. Έλεγξέ τη και δοκίμασε ξανά.",
      age: "Τα νέα είναι για άτομα 16 ετών και άνω.",
      playExitwise: "Παίξε Exitwise",
      trySpeedometer: "Δοκίμασε το Speedometer",
      seeGames: "Δες τα παιχνίδια μας",
    },
  };

  /** The topics a form can ask for (its data-topic): the name on its chip, the name in a Greek line, its icon. */
  const TOPICS = {
    exitwise: { name: "Exitwise", el: "του Exitwise", icon: "/img/mail/exitwise-icon@2x.png" },
    speedometer: { name: "Speedometer", el: "του Speedometer", icon: "/img/mail/speedometer-icon@2x.png" },
    vgraphics: { name: "VGraphics", el: "της VGraphics", icon: "/img/mail/vgraphics-tile@2x.png" },
  };
  /** The one next step once signed up, by topic: its words and where it goes. */
  const NEXT = {
    exitwise: { words: "playExitwise", href: "/exitwise/play/" },
    speedometer: { words: "trySpeedometer", href: "/speedometer-wallpaper/play/" },
    vgraphics: { words: "seeGames", href: "/games/" },
  };

  /**
   * The card of each state: its tone (play: the mark filled in the play colour; quiet: a tint of it; error: a tint of
   * the error colour), its mark, the words of its title and line, the label over its topic chips, its actions (as
   * underlined words), its note, whether the next step follows, and its main button. The site's forms reach inbox,
   * signed, limit and failed; already, unsub and expired are VHub's /hub/email/, which draws the same card.
   */
  const VIEWS = {
    inbox: { tone: "quiet", mark: "mail", title: "inbox", line: "inboxLine", chips: "asked", actions: ["again", "change"], note: "inboxNote" },
    signed: { tone: "play", mark: "check", title: "signed", line: "signedLine", chips: "topics", actions: ["manage"], next: true },
    already: { tone: "quiet", mark: "check", title: "already", line: "alreadyLine", chips: "topics", actions: ["manage"], next: true },
    unsub: { tone: "quiet", mark: "wave", title: "unsub", line: "unsubLine", actions: ["signUpAgain"], next: true },
    limit: { tone: "error", mark: "bang", title: "limit", line: "limitLine", actions: [] },
    failed: { tone: "error", mark: "bang", title: "failed", line: "failedLine", actions: ["retry"] },
    expired: { tone: "error", mark: "bang", title: "expired", line: "expiredLine", actions: [], main: "resend" },
  };

  /** The page's words: Greek on a Greek page, English everywhere else. */
  const wordsFor = (lang) => (/^el\b/i.test(lang ?? "") ? WORDS.el : WORDS.en);
  /** A line with its {placeholders} filled in. */
  const say = (text, values = {}) => text.replace(/\{(\w+)\}/g, (all, key) => values[key] ?? all);
  /** What is left of a wait, as "Send again" counts it: "9:52". */
  const clock = (ms) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  /**
   * What VHub's answer to a sign-up means: a card ({ card: its state }) or an error under the field ({ field }).
   * Anything unexpected (no answer, a new result) is a failure, never nothing.
   */
  function outcome(result) {
    if (result === "pending") return { card: "inbox" };
    if (result === "confirmed") return { card: "signed" };
    if (result === "limit") return { card: "limit" };
    if (result === "invalid" || result === "age") return { field: result };
    return { card: "failed" };
  }

  // For the tests (tools/test/mail-list.test.mjs), which run this file without a page.
  globalThis.VGMailList = { WORDS, TOPICS, NEXT, VIEWS, wordsFor, say, clock, outcome };
  if (typeof document === "undefined") return;

  const greek = /^el\b/i.test(document.documentElement.lang);
  const w = wordsFor(document.documentElement.lang);
  const opened = Date.now();
  const calm = matchMedia("(prefers-reduced-motion: reduce)");
  const svg = (body, box = 40, width = 3.2) =>
    `<svg viewBox="0 0 ${box} ${box}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  const MARKS = {
    mail: svg('<rect x="7" y="10" width="26" height="20" rx="4"/><path d="M8.5 12.5L20 21l11.5-8.5"/>'),
    check: svg('<path class="draw" d="M11 20.5l6.5 6.5L29.5 14"/>', 40, 4.5),
    wave: svg('<rect x="8" y="11" width="24" height="18" rx="4"/><path d="M9.5 13.5L20 21l10.5-7.5"/><path d="M15 34h10"/>'),
    bang: svg('<path d="M20 11v12"/><path d="M20 29.5v.5"/>', 40, 4.5),
  };
  const FIELD_MARK = svg('<circle cx="10" cy="10" r="8"/><path d="M10 5.8v5"/><path d="M10 14v.2"/>', 20, 2.2);
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5.6v12.8a1.1 1.1 0 0 0 1.7.93l10-6.4a1.1 1.1 0 0 0 0-1.86l-10-6.4A1.1 1.1 0 0 0 8 5.6z"/></svg>';

  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
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
          lang: greek ? "el" : "en",
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
    const topic = TOPICS[form.dataset.topic] ?? TOPICS.vgraphics;
    const next = NEXT[form.dataset.topic] ?? NEXT.vgraphics;
    let card = null;
    let againAt = 0;
    let ticking = 0;
    const stopTicking = () => {
      clearInterval(ticking);
      ticking = 0;
    };

    const showError = (kind) => {
      const mark = make("span", "mail-list-said-mark");
      mark.innerHTML = FIELD_MARK;
      said.replaceChildren(mark, make("span", "", w[kind]));
      said.classList.add("is-error");
      said.setAttribute("role", "alert");
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", said.id || (said.id = `${input.id}-said`));
      input.focus();
      void enter(said);
    };
    const clearError = () => {
      said.replaceChildren();
      said.classList.remove("is-error");
      said.setAttribute("role", "status");
      input.removeAttribute("aria-invalid");
    };
    input.addEventListener("input", () => said.classList.contains("is-error") && clearError());

    /** "Send again": its words count VHub's wait down (hidden from screen readers, which hear "Send again" once). */
    function againButton(email, note) {
      const again = make("button");
      again.type = "button";
      again.setAttribute("aria-label", w.again);
      const shown = make("span");
      shown.setAttribute("aria-hidden", "true");
      again.append(shown);
      const tick = () => {
        const left = againAt - Date.now();
        again.disabled = left > 0;
        shown.textContent = left > 0 ? say(w.againIn, { time: clock(left) }) : w.again;
        if (left <= 0) stopTicking();
      };
      const count = () => {
        stopTicking();
        ticking = setInterval(tick, 1000);
        tick();
      };
      again.addEventListener("click", async () => {
        againAt = Date.now() + AGAIN_MS;
        count();
        // VHub sends the new link only if the last one is 10 minutes old; it answers "pending" either way.
        const result = await send(form, email).catch(() => null);
        const ok = result === "pending" || result === "confirmed";
        note.textContent = ok ? w.againDone : w.failedLine;
        if (!ok) {
          againAt = 0;
          tick();
        }
      });
      count();
      return again;
    }

    /** One of a card's actions, as underlined words. */
    function action(kind, email, note) {
      if (kind === "manage") {
        const link = make("a", "", w.manage);
        link.href = MANAGE;
        return link;
      }
      if (kind === "again") return againButton(email, note);
      const act = make("button", "", w[kind]);
      act.type = "button";
      act.addEventListener("click", () => void (kind === "change" ? showForm(email) : attempt(email, act)));
      return act;
    }

    /** The card of a state, for the address it is about. Its buttons are the form's own kind: .play-cta, or .btn. */
    function stateCard(kind, email) {
      const v = VIEWS[kind];
      const node = make("div", `mail-state is-${kind}${v.tone === "play" ? "" : " is-quiet"}${v.tone === "error" ? " is-error" : ""}`);
      node.setAttribute("role", v.tone === "error" ? "alert" : "status");
      node.tabIndex = -1;
      const mark = make("span", "mail-state-mark");
      mark.innerHTML = MARKS[v.mark];
      const line = make("p", "mail-state-line");
      w[v.line].split("{email}").forEach((piece, i) => {
        if (i) line.append(make("b", "", email));
        line.append(say(piece, { topic: greek ? topic.el : topic.name }));
      });
      node.append(mark, make("p", "mail-state-title", w[v.title]), line);
      if (v.chips) {
        const icon = make("img");
        icon.src = topic.icon;
        icon.alt = "";
        icon.width = 24;
        icon.height = 24;
        const chip = make("span", "mail-chip");
        chip.append(icon, topic.name);
        const chips = make("span", "mail-state-chips");
        chips.append(chip);
        const box = make("div", "mail-state-topics");
        box.append(make("span", "mail-state-topics-label", w[v.chips]), chips);
        node.append(box);
      }
      const note = make("p", "mail-state-note", v.note ? w[v.note] : "");
      note.setAttribute("aria-live", "polite");
      if (v.actions.length) {
        const actions = make("p", "mail-state-actions");
        actions.append(...v.actions.map((a) => action(a, email, note)));
        node.append(actions);
      }
      node.append(note);
      if (v.main) {
        const main = make("button", `${button.className} mail-state-main`, w[v.main]);
        main.type = "button";
        main.addEventListener("click", () => void attempt(email, main));
        node.append(main);
      }
      if (v.next) {
        const go = make("a", `${button.className} mail-state-next`);
        go.href = next.href;
        // The play triangle for a product's own next step, not for "See our games".
        if (button.classList.contains("play-cta") && next !== NEXT.vgraphics) go.innerHTML = PLAY;
        go.append(make("span", "", w[next.words]));
        node.append(go);
      }
      return node;
    }

    /** The card in the form's place (or in the last card's). */
    async function showCard(kind, email) {
      stopTicking();
      const fresh = stateCard(kind, email);
      if (card) {
        await leave(card);
        card.remove();
      } else {
        await Promise.all(fields.map((f) => leave(f)));
        form.classList.add("is-done");
        input.value = "";
      }
      card = fresh;
      form.append(card);
      card.focus({ preventScroll: true });
      await enter(card);
    }

    /** Back to the form, the address kept, to change it. */
    async function showForm(email) {
      if (!card) return;
      stopTicking();
      await leave(card);
      card.remove();
      card = null;
      form.classList.remove("is-done");
      input.value = email;
      fields.forEach((f) => void comeBack(f));
      input.focus();
      input.select();
    }

    /** Signs the address up and shows VHub's answer: a card, or the field again with what is wrong under it. */
    async function attempt(email, trigger = button) {
      trigger.disabled = true;
      let o;
      try {
        o = outcome(await send(form, email));
      } catch {
        o = { card: "failed" };
      }
      trigger.disabled = false;
      if (o.card === "inbox") againAt = Date.now() + AGAIN_MS;
      if (o.field) {
        await showForm(email);
        showError(o.field);
      } else {
        await showCard(o.card, email);
      }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !input.checkValidity()) return showError("invalid");
      clearError();
      const label = button.textContent;
      button.textContent = w.sending;
      try {
        await attempt(email);
      } finally {
        button.textContent = label;
      }
    });
  }
})();
