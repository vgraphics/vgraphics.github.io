# vgraphics.github.io

The VGraphics company website, served by GitHub Pages at **https://vgraphics.gr** (custom domain; DNS at papaki).
The old address https://vgraphics.github.io redirects there. Use **https://vgraphics.gr** as the developer website in
Play Console, App Store Connect and the web game portals. This repo is **public**, so only put public pages here.

| Path | What |
|---|---|
| `index.html` | Home page: the four menus as four doors, then games, apps, playing together, services and the studio |
| `games/index.html` | Games: Exitwise, and the two party games in design (no dates) |
| `apps/index.html` | Apps: Speedometer Live Wallpaper |
| `services/index.html` | Services for clients: what we build, each with the real thing on this site, how we work, contact |
| `multiplayer/index.html` | Multiplayer & community: Exitwise's rooms, live leaderboards (read like the ranking page), profiles, moderation and custom maps; VHub (open now) and the TV party games next |
| `hub/` | VHub, the web app: the VHub repo's `hub/` build. It has `index.html` and one page per route, `assets/` (its scripts and styles), `privacy.html` (VHub's privacy policy) and `deployed.txt` (the commit it came from). Only the Deployer's `vhub-hub` project writes it, after `vhub-backend`. It is an app page (see the rules below). Until its first release it holds only the "coming soon" `index.html`. |
| `company/index.html` | Company information: the legal details from the General Commercial Registry (G.E.MI.) |
| `privacy/index.html` | The site's privacy policy: hosting, the live ranking, the web games' ads and statistics, VHub, and VGraphics Deployer's Google sign-in. Its address, https://vgraphics.gr/privacy/, is on the Deployer's Google OAuth consent screen, so it never moves. Update it and its "Last updated" date whenever the ads, the statistics or the Deployer's Google access change. |
| `404.html` | Not-found page |
| `assets/` | The VGraphics look shared by the company pages (`vgraphics.css`), the self-hosted fonts (OFL), `podium.js` (the live top 3 on the home and services pages) and `img/` (Play badge, Exitwise shots, the party game and VHub illustrations, and `vgraphics-card-1200x630.jpg`, the link preview of the home, services, multiplayer and VHub pages) |
| `<product>/index.html` | Each game's or app's landing page in its own look: description, screenshots, store and portal links (they say "Coming soon" until the listings are live). Exitwise's has a small playable board. |
| `<product>/img/`, `<product>/fonts/` | That product's images and self-hosted fonts |
| `<product>/privacy.html` | Each product's privacy policy, e.g. `exitwise/privacy.html`, `speedometer-wallpaper/privacy.html`. Each is made by `tools/build-pages.mjs` from the product's copy of its text in `<product>/privacy/source.html` (Exitwise's `map-rules.html` from `exitwise/map-rules/source.html`), set into the product pages' template |
| `<product>/<page>/page.json` | A product's other pages, made from the same template as its landing page by `tools/build-pages.mjs`: Exitwise's ranking, room, privacy policy and map rules, and Speedometer's privacy policy. A page's own markup sits beside its page.json (`ranking.html`, `.css`, `.js`) |
| `exitwise/play/` | The Exitwise WebGL build. Only the Deployer's `exitwise-web` project writes it; `check-site.mjs` skips it. |
| `speedometer-wallpaper/play/` | Speedometer's try page: the real app's engine (Kotlin/Wasm and Skia), live in a phone with its styles and settings. The page is the template's (`play/page.json`, the "try" block); the engine's files in `play/app/` come only from the Deployer's `speedometer-web` project, never by hand. `play/img/play-qr.svg` is the store link's QR code (`tools/make-qr.py`). |
| `speedometer/` | The short address `vgraphics.gr/speedometer/`: it forwards at once to the try page (noindex) |
| `exitwise/ranking/` | Exitwise's global ranking: the game's four global boards (top 100 each), read live from VHub (`leaderboards/exitwise.*` in the `vgraphics-vhub` Firestore, pictures from its Storage) without signing in. `boards.js` holds the reads and the avatars for this page, the home and services podium (`assets/podium.js`) and the multiplayer page. VHub's `backend/firestore.rules` allow those reads; `?emulator=127.0.0.1` reads VHub's emulators (project `demo-vhub`), `?emulator=127.0.0.1:PORT` a Firestore emulator on that port, on localhost only. |
| `exitwise/room/` | The page a room invite's QR code opens: opens the game in the room on Android, otherwise shows the code |
| `.well-known/assetlinks.json` | Android App Links: lets the Exitwise app open `https://vgraphics.gr/exitwise/room/…` links itself. It lists the SHA-256 fingerprints of the Play app signing keys (current and previous, from Play Console › App integrity), the upload key and the build PC's debug key. Public fingerprints only. Add another app's entry to the same array. `.nojekyll` makes Pages serve the dot-folder. |
| `app-ads.txt` | Shared by every game and app: the lines each ad network (AdMob, LevelPlay, …) asks for. It must stay at the root. |
| `ads.txt` | The sellers of the ads on vgraphics.gr itself (Google AdSense, for the web games). Apps read `app-ads.txt` instead. It must stay at the root. |
| `assets/web-ads.js` | The ad switch of every web game: see "Ads on the web games" below |
| `assets/startup/` | The start-up the web versions share (George's start-up rule): the dark launch, the VGraphics intro (its films are the games' `brand-intro/` copies), the product's welcome art for at least 2 s and the squishy loading bar, in the product's colours |
| `assets/try/` | The try pages' shell (the template's "try" block, `tools/lib/try.mjs`): the phone and its tools, the panel built from the engine's catalog, the share link, the store links with the style shown, and the statistics question |
| `CNAME` | The custom domain, `vgraphics.gr` |
| `sitemap.xml`, `robots.txt` | For search engines: every page to index, and where the sitemap is. `tools/build-sitemap.mjs` writes the sitemap. |
| `tools/check-site.mjs` | The site's content rules (legal footer, English only, links, no trackers, company details, structured data, sitemap and robots.txt, app-ads.txt, ads.txt, the ad switch, one header and footer, the phone menu and the cursors on every served page, the policies' sources, and every picture's stated size matching its file, so none is shown stretched) |
| `tools/build-sitemap.mjs` | Writes `sitemap.xml` from the pages: `node tools/build-sitemap.mjs` after adding, moving or removing a page |
| `tools/build-pages.mjs`, `tools/build-wiki.mjs` | Write every product page from its `page.json` and theme pack, and the wikis from `wiki/wiki.json`, with one header, closing card and footer on every page: run them after changing any of those, the template (`tools/lib/`, `assets/product.css`) or a policy's source |
| `tools/make-wiki-map-art.py` | Writes the wiki's world tiles and the bands behind "In the game" from the game's Recraft level map: `python tools/make-wiki-map-art.py <Games repo>` after the map changes |
| `tools/make-wiki-art.py` | Writes each wiki painting's served sizes (wide up to 3200 px, the 9:16 phone cut; AVIF, WebP, JPEG) and `art.json` from the masters in `<product>/wiki/art-src/`, whose `sources.json` records each one's making, prompt and licence: `python tools/make-wiki-art.py <product> [slug ...]`. Never larger than the master. |
| `tools/make-wiki-worlds.py` | Makes the Worlds entry's wide master from George's island and its Recraft outpaint, the island crisp in the middle and the new sea shaded to meet it: `python tools/make-wiki-worlds.py`, then `make-wiki-art.py exitwise worlds` |
| `tools/make-wiki-pieces.py` | Writes the small pictures of Exitwise's obstacles and powerups (and the boards' rock, bomb and portal) from the game's art: `python tools/make-wiki-pieces.py <Games repo>` after the game's pack changes |
| `tools/make-cursors.mjs` | Draws every product's cursors and VGraphics' (see "Cursors" below): `node tools/make-cursors.mjs`, then `node tools/build-pages.mjs` |
| `tools/make-qr.py` | Writes a QR code as a small SVG, made once so the page loads no QR library: `python tools/make-qr.py <link> <out.svg>` (Python with segno) |
| `tools/make-card.py` | Draws the link-preview card `assets/img/vgraphics-card-1200x630.jpg` from the site's fonts, colours and screenshots: `python tools/make-card.py` (Python with Pillow, fontTools and brotli). Run it again after the home headline, the menus or the colours change. |

Rules for every page: the legal footer line (company name, "G.E.MI. no. 181823306000", "VAT no. EL802736373", links to
`/company/` and `/privacy/`), a canonical URL on `https://vgraphics.gr/…`, no cookies, analytics or third-party scripts
and fonts on the static pages, and no phone number or street address. The site is in English: no Greek letters on its
pages or in the SVGs they show (the Greek product names belong in the Greek store listings). **Run
`node tools/check-site.mjs` before every push.**

The app pages are the exceptions to "no third-party scripts":

- `exitwise/play/`, the game. `check-site.mjs` skips it.
- `speedometer-wallpaper/play/`, Speedometer's try page, from the template. It loads its engine from `play/app/`, which
  only the Deployer's `speedometer-web` writes, and nothing from another site, except Google Analytics: only once its
  page.json has the product's measurement id (none yet) and only after the visitor says yes, from `assets/try/try.js`,
  so the page's markup still has no gtag. Its location is used in the browser only, after the visitor asks.
- `hub/`, VHub, the web app only the Deployer's `vhub-hub` project writes. Its markup loads nothing from another site.
  Its scripts add Google's sign-in script only after the player clicks to sign in with Google, and they read and write
  the player's account in VHub's Firebase project. `check-site.mjs` checks the hub's pages like every other page. It
  isn't a product landing page, though: its `privacy.html` is VHub's policy, which comes with each release, so it needs
  no `page.json`. Each release also runs `tools/build-sitemap.mjs`, so `sitemap.xml` lists the hub's pages.

Every company page ends with `<script src="/assets/vhub-me.js" defer>` (the hub's pages too, from the VHub repo): when
someone is signed in to VHub, it shows their little picture in the header's VHub link (George, 23 Oct 2026). It only
reads `vhub.me` from this site's localStorage, which the hub writes while a player is signed in (their name and a
small picture as a `data:` URL) and removes on sign-out, so the static pages still load nothing from another site.

The company pages (home, games, apps, services, multiplayer, hub, company, privacy, 404) share one header (Games,
Apps, Services, VHub, Contact) and one footer. Each menu wears one of the logo's dots: Games sun, Apps coral, Services
sky, VHub violet. The home page's copy is the master: to change the menu or the footer, change it there and paste it
into the other eight pages. The check fails while any page differs (only `aria-current="page"` on the page's own menu
item may differ). The hub's copy lives in the VHub repo, in `hub/index.html` and `docs/privacy/vhub-privacy.html`.
Change it there too and release `vhub-hub`: until then the check reports every hub page.

On phones every header folds its menu into a button at the right that opens it as a panel (George, 23 Oct 2026: "At
mobile the vgraphics.gr toolbar does not fit. It must be a burger menu."): the company header below 768px, the product
header below 561px. `assets/menu.js` opens and closes the panel; it also adds the company header's button, so that
header's markup stays the copy above. Every company page loads it in its `<head>` with
`<script src="/assets/menu.js" defer></script>`, and the CSS acts only on pages that do. The hub's pages carry the
same line from the VHub repo's `hub/index.html` and policy page (since VHub 880438d). The product pages' button comes
with their header (`tools/lib/partials.mjs`).

check-site holds every HTML file the site serves to this, whoever writes it (George, 24 Oct 2026: "Find all
instances."): the company and product headers must come with their phone menu, any other header with a menu in it
fails (one made by hand: make the page with the template), and so does a `<nav>` outside `<main>`, the footer and
those headers. A header without a menu (a logo and a language button, as on the party games' doors) passes. Nothing
is exempt: a page another repo writes (the hub, a play page, a policy's source) fails like any other.

## Cursors

Every page shows its product's own cursors (George, 24 Oct 2026: "Can we get custom cursors on each landing page?"):
a pointer, a hand over whatever clicks and a text cursor in text fields, in the product's look. The company pages and
the hub show VGraphics' own. George picked them on https://claude.ai/artifact/4V2PeBPVi1AwabCjnTQsVa.

- A product's three are `<product>/theme/cursor.svg`, `cursor-link.svg` and `cursor-text.svg`: 32 x 32, the click
  point in each svg's `data-hotspot="x y"`. `tools/make-cursors.mjs` draws them in code, VGraphics' too
  (`assets/img/cursor*.svg`). A new product adds its three there; `tools/build-pages.mjs` writes them into its
  `theme.css` as `--cursor`, `--cursor-link` and `--cursor-text`. VGraphics' are set in `assets/vgraphics.css`.
- They are set for mice and trackpads only (`(hover: hover) and (pointer: fine)`), so phones and tablets keep their
  touch behaviour and never load the pictures. A missing or broken picture falls back to the system's cursor.
- `assets/cursors.css` puts them to use, and every page links it. A stylesheet that sets its own cursor uses
  `var(--cursor-link, pointer)` (or `--cursor-text`, `--cursor` with `text`, `default`) in place of the system's.
- check-site holds every served page to this: the link, no bare `cursor: pointer`, `text` or `default`, and click
  points that match the pictures. The hub's copy lives in the VHub repo (`hub/index.html`, its policy page and
  `hub/src/hub.css`), and the Exitwise play page's in the Games repo (`WebGLTemplates/Portfolio/index.html`).

Each policy's source lives in the product's own repo: Exitwise `docs/store/privacy-policy.html`, Speedometer Live
Wallpaper `docs/speedometer-privacy-policy.html`. After you edit a policy there, copy it here unchanged, push, and
check that the live page has updated. Exitwise's policy and map rules go to `exitwise/privacy/source.html` and
`exitwise/map-rules/source.html` (the Deployer's `exitwise-web` copies the policy itself), Speedometer's to
`speedometer-wallpaper/privacy/source.html`; then run `node tools/build-pages.mjs`, which sets them into their pages at
the same addresses. A source is the text alone, in one `<main>`: no header, menu or footer of its own (the template
adds them), `<meta name="robots" content="noindex">` and a canonical link to its page, since GitHub Pages serves it
too; check-site checks this. VHub's policy, `docs/privacy/vhub-privacy.html` in the VHub repo, is the
exception: each `vhub-hub` release brings it to `hub/privacy.html` with the hub.

## Search engines

- **Titles and descriptions:** each page has its own `<title>` of about 60 characters and a meta description of about
  155, with the words people search for: "arrow puzzle game", "logic puzzle", "free puzzle game" for Exitwise,
  "speedometer live wallpaper", "GPS speedometer", "car dashboard" for Speedometer, and "app development Greece",
  "game development", "Kotlin", "Unity" for the services.
- **Structured data (JSON-LD in each page's `<head>`):** the home page describes VGraphics (Organization: legal name,
  logo, G.E.MI. and VAT numbers, Kalamaria, the Google Play developer page and GitHub) and the WebSite. Exitwise's page
  has a VideoGame, Speedometer's a MobileApplication, the services page a Service for each thing we build, and every
  other page a BreadcrumbList. The wikis get theirs from `tools/build-wiki.mjs`, with each wiki's `metaTitle`,
  `metaDescription` and `product.parent` from its `wiki.json`. check-site fails on a block that isn't valid JSON. Try a
  page in Google's Rich Results Test after changing its structured data.
- **sitemap.xml:** run `node tools/build-sitemap.mjs` after adding, moving or removing a page. It lists every page's
  canonical URL, except pages marked `noindex` (the 404 and room invite pages); check-site fails while it's out of
  date. `robots.txt` points to it.
- **Google Search Console:** the property `https://vgraphics.gr/` (URL prefix) on gvergidis90@gmail.com, verified by the
  `google-site-verification` meta tag on the home page. Keep the tag (check-site checks it): without it the site loses
  its verification. The sitemap is submitted there under Sitemaps.

## Ads on the web games: one switch

Every web game here takes its ads from **`assets/web-ads.js`**: Exitwise at `/exitwise/play/` today, Palermo Noir and
Quizfall later. Each game's play page loads the file before it decides about ads, so turning ads on or off is a change
to this file and a push. No game is rebuilt or released for it. A missing file, a value that isn't well formed, or a
game without an entry means no ads in that game.

| Setting | What |
|---|---|
| `client` | The Google AdSense publisher id, `ca-pub-7821189101210154`. It is public anyway: `ads.txt` lists it, and every page with ads shows it. |
| `banners` | The banner under each game (AdSense display ads). `true` once Google has approved vgraphics.gr (AdSense → Sites: "Ready"). |
| `gameAds` | The in-game ads: an interstitial between levels and rewarded videos (H5 Games Ads). `true` only once Google has approved H5 Games Ads, a separate application made after the site's approval. |
| `games.<game>.bannerSlot` | The `data-ad-slot` of that game's AdSense display unit (digits, in quotes), or `null` for no banner in that game |

Today both switches are off, because Google is still reviewing vgraphics.gr. To see where the review stands, run
`npm --prefix D:/Projects/Deployer run cli -- ads-status`, or open the Deployer's Exitwise → Revenue tab.

**The day Google approves vgraphics.gr:**

1. In `assets/web-ads.js`, set `banners: true`.
2. Run `node tools/check-site.mjs`, then commit and push.
3. GitHub Pages caches files for about 10 minutes. After that, open https://vgraphics.gr/exitwise/play/, start a level,
   and check that a banner opens under the game. `ads-status` now says the banners are on.
4. Apply for H5 Games Ads (the games repo's `docs/web-ads-adsense.md`, "The approval day", has the form and the rest).

**The day Google approves H5 Games Ads:** set `gameAds: true`, check, push, and look at a live page again.

To switch ads off, set the switch back to `false` and push. Players get the change within about 10 minutes.

Keep the file plain, as it is: quoted strings, `true`/`false`, `null` and `{ }`. The Deployer reads its text without
running it and refuses anything else (an expression, a function call, a second statement).

**A new web game** gets one entry under `games`, with its own display unit's slot or `null`. Its play page loads the
switch the same way Exitwise's does (the games repo's `docs/web-ads-adsense.md`, "A new web game").

`check-site.mjs` holds the file to these rules:

- the four settings and no others, each well formed;
- nothing switched on without a publisher id;
- that publisher's line in `ads.txt`;
- an entry for every game whose play page (`<game>/play/`) loads the switch. An app's try page loads none and shows no
  ads.
