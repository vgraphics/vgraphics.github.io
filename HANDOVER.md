# Handover: Speedometer pages for George's four Plus picks (9 Nov 2026)

Branch `feature/speedo-plus-picks-site` (from site main @ cae0f882). Brief: the Speedometer coordinator's
`brief-speedo-plus-build.md`, Section C, site part. App halves: Games `feature/speedo-gift-trials` (Section C, the
gift, the free month, three free days per style), `feature/speedo-plus-first` (Section A, Plus first and "See it on my
home screen") and `feature/speedo-plus-trial` (Section B, the yearly saving and Play's 7-day free trial).

This file is for the coordinator. The site is a public repo: leave HANDOVER.md out of the merge into main (or delete it
in the merge), as with the earlier site handovers.

## Commits

See `git log cae0f882..feature/speedo-plus-picks-site`: one commit with the sources, then this file.

## What changed (sources only; nothing generated was edited or rebuilt)

George's picks, word for word: 1 "Yes, both" (Plus main button and the real yearly %), 2 "Yes, all three" (the gift
from the 10 trial styles, existing gifts kept; the free Plus month at sign-in; trials capped at 3 per style), 3 "Yes,
7 days" (Play's free trial for new customers), 4 "Yes" ("See it on my home screen").

- `speedometer-wallpaper/page.json` (the landing page):
  - the JSON-LD app description adds Plus's prices and the 7 days free for new subscribers;
  - the Styles chapter's intro is shorter. Under the style tiles there is a new `features` block with five items:
    - Speedometer Plus: €0.99 a month, or €9.99 a year to save 15%;
    - 7 days free to start: the price after it, that it renews until cancelled, the first charge's date shown first,
      and cancelling in Google Play under Subscriptions;
    - See it on my home screen;
    - A free day, three times: the 10 trial styles by name, and the video is explained before it plays;
    - Gifts for signing in: one of those ten to keep, and the free month that starts by itself, in George's copy:
      "Every style is yours for 30 days. No card, nothing to cancel.";
  - HUD chapter, the "Free" card: Glass has no 24 h trial (only the ten do), so the card now says "Pulse and Vector
    during their 24-hour trial too".
- `speedometer-wallpaper/faq.json`, from which build-pages writes the FAQ and its FAQPage JSON-LD:
  - "Which styles are free?" gives Plus's prices;
  - new "Can I try a style on my phone before I buy it?": See it on my home screen, and the 24 h trials, three per
    style;
  - new "Is there a free trial of Speedometer Plus?": 7 days for new subscribers on monthly and yearly, the price after
    it, renews until you cancel, the first charge's date shown before, and cancelling in Google Play under
    Subscriptions or from Settings;
  - "Do I need an account?" names the two sign-in gifts;
  - 14 questions become 16. `feature/speedo-hud-film-tip-site` (unmerged) adds one more, so 17 once both are in.
    Both branches edit faq.json in different places (theirs the HUD answer and a question after it; mine "Which styles
    are free?" and the two new questions after it, then "Do I need an account?"), so git should merge them. Check
    the order afterwards.
- `speedometer-wallpaper/about/page.json`, in its own words, not the landing page's:
  - the "Free to start" card mentions the borrowed days;
  - the "On your phone" intro mentions See it on my home screen and the sign-in gifts;
  - the "premium style before I buy it?" answer mentions See it on my home screen.
- `speedometer-wallpaper/play/page.json` (the try page): the `unlock` line gives Plus's prices and the 7 days free.
- `speedometer-wallpaper/wiki/wiki.json`:
  - Styles screen: the 7-day trial terms, and a new line for See it on my home screen, Try for 24 h (three times per
    style, the ten by name) and the sign-in gift and free month;
  - Future: "Try for 24 h lends it to you for a day after a short video, three times."
- `speedometer-wallpaper/styles/styles.json`:
  - every paid style's page words add Plus and See it on my home screen;
  - the ten trial styles get `"trial": true` and the new words `paidTrial`: the 24 h trial three times, and that it
    can be the sign-in gift;
  - `tools/make-style-pages.mjs` picks `words.paidTrial` for a style with `"trial": true`. That is a one-line change,
    and every other product keeps `words.paid`.
- `speedometer-wallpaper/privacy/source.html` is the policy as committed on Games `feature/speedo-gift-trials` (@
  a768b106, `docs/speedometer-privacy-policy.html`), copied byte for byte. It adds:
  - the free days counted per design;
  - the gift as one of the 10;
  - the free month of Plus starting by itself;
  - three trials per design.
  It also brings in Games' newer text that the site copy lacked: the Plus forever paragraph and VHub's Plus record.
  Last updated 09.11.2026. Once the Games branch is in Games main, `node tools/sync-documents.mjs` (no arguments)
  should report the copy as the same as main.

Prices are the catalog's with VAT in the euro area (Games `SpeedometerWallpaper/docs/monetisation/play-catalog.json`:
Plus 0.99 a month, 9.99 a year). "Save 15%" is 1 - 9.99 / (12 × 0.99) = 15.9%, rounded down as the app's sheet does
(Section B). The cancel words follow Section B's sheet: "in Google Play under Subscriptions, or tap Speedometer Plus
in Settings".

Not changed:
- `changelog.json` (What's new): the Deployer writes it on each release;
- `play/app/strings*.tsv`: the Deployer's Speedometer web build. It still has the old "A free month of every layout,
  when layouts open" until the next Speedometer web release;
- Pro, Pro forever and Plus forever aren't on the landing page or in the FAQ. They weren't before either, and they
  aren't part of this brief;
- there are no Greek Speedometer pages, and every page stays in one language.

## Commands to run (coordinator), in this order

```
node tools/make-style-pages.mjs                  # rewrites styles/*/page.json and the landing tiles (it rewrites page.json as JSON.stringify writes it)
node tools/build-pages.mjs speedometer-wallpaper # landing, About, try page, privacy, style pages
node tools/build-wiki.mjs speedometer-wallpaper  # Styles screen and Future entries
node tools/check-site.mjs
```

No page was added or moved, so `node tools/build-sitemap.mjs` is needed only if check-site asks for it.

## What to test

- check-site green. It guards the style pages and tiles (make-style-pages), the stepper (no new chapter: the new
  block sits inside Styles), one picture per page (no new pictures), and the FAQ's FAQPage data.
- vgraphics.gr/speedometer-wallpaper/ at 1920, 1366, 2560 and phone width:
  - Styles: the five new cards under the tiles have equal heights and no inner scroll;
  - Questions and answers: the two new questions open and close with the usual animation, one at a time.
- A trial style's page (e.g. /styles/carbon/) shows the paidTrial card; a no-trial style's page (e.g. /styles/glass/)
  shows the paid card, without a free day or a gift.
- /about/, the try page's unlock line, the wiki's Styles screen and Future pages, and privacy.html (09.11.2026).
- After the deploy, run Google's Rich Results test on the landing page (16 questions, or 17 with the HUD film branch).

## Release order

1. Wait until the app release with all four picks is in production. The pages describe See it on my home screen, the
   three free days, the gift from the ten, the free month that starts by itself, and Play's 7-day trial: that needs
   Section B's offers created by the Deployer's `speedometer-catalog` and the app that uses them. The Speedometer
   backend rules (Games `speedometer-backend`) go with or after that release.
2. Then merge this branch, without HANDOVER.md, and deploy the site as usual.
3. If one of the picks is held back, take its words out before merging:
   - Section A held: "See it on my home screen" in page.json, faq.json, about/page.json, wiki.json and styles.json;
   - Section B held: the 7-day lines in page.json, faq.json, play/page.json and wiki.json;
   - this Games branch held: the gift, free month and three-day lines, and the privacy copy.
