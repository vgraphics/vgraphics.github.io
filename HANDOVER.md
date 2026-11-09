# Handover: Speedometer HUD, the double-image FAQ and film tip

Branch `feature/speedo-hud-film-tip-site` (from `main` @ 0f96a95b). Brief: the Speedometer coordinator's
`brief-speedo-hud-film-tip.md`, 9 Nov 2026 (George: "My HUD is showing 2lined on my car so I need a film?"). App half:
Games `feature/speedo-hud-film-tip` @ 8eb94ab2.

## Commits

- `e86f0c99` Speedometer landing: a FAQ answer for the double image in HUD mode (with its FAQPage entry) and the
  film tip in the HUD chapter.

## What changed

- `speedometer-wallpaper/faq.json`: a new question right after the HUD question, "Why do I see a double image in HUD
  mode?": "A windscreen has two glass surfaces, and each one reflects the phone, so your speed shows twice. Stick a
  HUD film on the inside of the windscreen, or set a HUD reflector plate on the dashboard, and you get one sharp
  image." The HUD answer above it lost its last sentence ("A windscreen shows the picture twice … a cheap HUD film on
  the glass fixes that."), which the new answer now covers.
- `speedometer-wallpaper/page.json`, HUD chapter intro: "Seeing a double image? Stick a HUD film on the inside of the
  windscreen." after "It reads best at dusk, at night and on cloudy days."
- `speedometer-wallpaper/index.html`: hand-edited to match what `tools/build-pages.mjs` writes from those two files
  (the new faq-item, the trimmed HUD answer, the intro line, and the new Question in the FAQPage JSON-LD, which
  build-pages makes from the same faq.json). Workers don't run builds, so it wasn't regenerated: **run
  `node tools/build-pages.mjs speedometer-wallpaper` and check that index.html doesn't change**, then check-site.

No brand names or product links. No HUD wiki page exists and the site has no Greek Speedometer pages, so there was
nothing to change there.

**Left out on purpose:** the brief's "lower the brightness at night". HUD mode always runs at full brightness
(design card 6 A, Games `SpeedometerWallpaper/docs/hud-mode/design.md` §1: window brightness 100%; only heat softens it), and there is no
brightness setting, so the sentence would describe something the app can't do. If George wants it, it needs a HUD
brightness setting in the app first; then add a third sentence to the answer.

## What to test

- `node tools/build-pages.mjs speedometer-wallpaper`: index.html unchanged by it.
- `node tools/check-site.mjs`.
- vgraphics.gr/speedometer-wallpaper/ at 1920, 1366, 2560 and phone: the HUD chapter intro reads well; in Questions
  and answers the new question opens and closes with the usual animation, one open at a time.
- The FAQPage JSON-LD has 15 questions (it parsed with the new one); Google's Rich Results test on the live page after
  deploy.

## Release order

Any time, through the Deployer's site deploy. It doesn't wait for the app branch.
