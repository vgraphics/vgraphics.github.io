// The footer's sign-up for news by email (tools/lib/mail-list.mjs writes the form; assets/menu.js loads this file on a
// page that has one). Pressing Sign up sends the typed address and the page's topic to VHub's `email` function, as a
// callable call over plain fetch, so the page loads no SDK; VHub then mails the confirmation link (double opt-in), and
// nothing more comes until it is used. Nothing is sent before the press. The robots' field and the time since the
// page opened go with it, as VHub's checks want.
(() => {
  const ENDPOINT = "https://europe-west1-vgraphics-vhub.cloudfunctions.net/email";
  const opened = Date.now();
  const SAYS = {
    pending: "Check your inbox: tap the link in our email to confirm.",
    confirmed: "You're signed up.",
    invalid: "Check the email address.",
    limit: "That's a lot of sign-ups from here. Try again in an hour.",
    age: "The news is for people aged 16 and over.",
  };
  const FAILED = "It didn't send. Check your connection and try again.";

  for (const form of document.querySelectorAll("form.mail-list")) {
    const said = form.querySelector(".mail-list-said");
    const button = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.elements.email.value.trim();
      if (!email || !form.elements.email.checkValidity()) {
        said.textContent = SAYS.invalid;
        form.elements.email.focus();
        return;
      }
      button.disabled = true;
      said.textContent = "";
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              op: "signup",
              email,
              topics: [form.dataset.topic],
              lang: "en",
              source: { product: form.dataset.product, platform: "web", page: location.pathname },
              wording: form.dataset.wording,
              trap: form.elements.website.value,
              openedAt: opened,
            },
          }),
        });
        const result = (await response.json())?.result?.result;
        said.textContent = SAYS[result] ?? FAILED;
        if (result === "pending" || result === "confirmed") form.elements.email.value = "";
      } catch {
        said.textContent = FAILED;
      } finally {
        button.disabled = false;
      }
    });
  }
})();
