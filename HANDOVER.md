# Hand-over: Speedometer try page, offer help (design-canon.md §13)

Branch `feature/speedo-rate-help-site`, from the site's main 0f96a95b. Never pushed. Sources only: nothing was built,
so the pages that come from them still need `node tools/build-pages.mjs speedometer-wallpaper` and the wiki's
`tools/build-wiki.mjs` (wiki/settings/ still says "Rate on Google Play") before `node tools/check-site.mjs`. The app's part is Games `feature/speedo-rate-help`.

## What changed
- `tools/lib/try.mjs`: a try block's new `help` key (the ticket desk). With it the panel's Settings get a Help heading
  and a "Help & ideas" row (a link to the ticket desk), and the page gets the help offer sheet, `.try-offer`, beside
  the statistics question.
- `assets/try/try.js`: each page load that gets the demo running counts one opening in localStorage
  (`vgtry.speedometer.opens`, inside try/catch through `stored`/`store`). At opening 6 (else 7), 1.2 s after a style
  or layout the visitor picked, with no HUD mode, full screen, QR sheet or hidden tab, "Need help or have an idea?"
  rises from the corner (faq.js `showMenu`, as the statistics question does), once ever
  (`vgtry.speedometer.help_asked`). An opening that asked the statistics question gets no offer. Events
  `help_prompt_shown` {opening} and `help_prompt_open`. "Open a ticket" goes to `/hub/support/?p=speedometer`. No
  rating on the web.
- `assets/try/try.css`: the offer shares the statistics question's look; the "Help & ideas" row matches the settings.
- `speedometer-wallpaper/play/page.json`: `"help": "/hub/support/?p=speedometer"`. Style pages have no `help`, so no
  offer there.
- `speedometer-wallpaper/faq.json` and `wiki/wiki.json`: Settings › Help is now Help & ideas, Rate us, News by email;
  About no longer lists Rate on Google Play.

## Test
1. Build the pages (above), then run check-site.
2. On the try page in a browser: in the devtools console, `localStorage.setItem('vgtry.speedometer.opens', '5')`, with
   the statistics question already answered. Reload: that is opening 6. Pick another style: the offer rises after
   about 1 s. "Not now" closes it with the same motion, and it never comes back. Clear `vgtry.speedometer.help_asked`,
   set opens to 5 again, then "Open a ticket" opens the ticket desk.
3. Opening 5 or 8, the first look on load, HUD mode and the QR sheet open: no offer. In a fresh browser (the statistics
   question shows) there is no offer in that opening either.
4. Settings › Help › Help & ideas opens the ticket desk; check it at 1920, 1366, 2560 and phone widths.
- `play/app/strings.tsv` (the engine's words) still says "Report a problem or an idea" and "Rate on Google Play". It
  is the Deployer's copy of the app's strings and follows on the next `speedometer-web` run from Games main.
