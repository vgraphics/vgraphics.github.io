# vgraphics.github.io

The VGraphics company website, served by GitHub Pages at **https://vgraphics.gr** (custom domain; DNS at papaki).
The old address https://vgraphics.github.io redirects there. Use **https://vgraphics.gr** as the developer website in
Play Console, App Store Connect and the web game portals. This repo is **public**, so only put public pages here.

| Path | What |
|---|---|
| `index.html` | Home page: the four menus as four doors, then games, apps, playing together, services and the studio |
| `games/index.html` | Games: Exitwise, and the two party games on the way (no dates): Palermo Noir, with its own page at `/palermo/`, and Quizfall, still in design |
| `apps/index.html` | Apps: Speedometer Live Wallpaper |
| `services/index.html` | Services for clients: what we build, each with the real thing on this site, how we work, contact |
| `multiplayer/index.html` | Multiplayer & community: Exitwise's rooms, live leaderboards (read like the ranking page), profiles, moderation and custom maps; VHub (open now) and the TV party games next |
| `hub/` | VHub, the web app: the VHub repo's `hub/` build. It has `index.html` and one page per route, `assets/` (its scripts and styles), `privacy.html` (VHub's privacy policy) and `deployed.txt` (the commit it came from). Only the Deployer's `vhub-hub` project writes it, after `vhub-backend`. It is an app page (see the rules below). Until its first release it holds only the "coming soon" `index.html`. |
| `company/index.html` | About VGraphics: the studio, what we make and how we work, then the legal details from the General Commercial Registry (G.E.MI.). It is the site's About page (AdSense's review, 27 Oct 2026, looks for one); the footer still calls it "Company information". |
| `devlog/` | The devlog: notes from the studio on how the games and apps are made, one page per post at `devlog/<slug>/`. `devlog/posts.json` holds the posts; `tools/build-devlog.mjs` writes the pages with the home page's header and footer, so run it after adding a post or changing the home page's header or footer, then `build-sitemap`. Only real work goes in a post, no filler. |
| `privacy/index.html` | The site's privacy policy: hosting, the live ranking, the web games' ads and statistics, VHub, and VGraphics Deployer's Google sign-in. Its address, https://vgraphics.gr/privacy/, is on the Deployer's Google OAuth consent screen, so it never moves. Update it and its "Last updated" date whenever the ads, the statistics or the Deployer's Google access change. |
| `terms/index.html` | The site's terms of use (George, 27 Oct 2026: "How can we protect our art and songs so nobody else copies them?"): everything on the site is VGraphics' (or licensed), what visitors may do, no copying, re-uploading, scraping or AI training, our trademarks, how to ask for a licence and how to report a copy (support@vgraphics.gr). Its "Scraping and AI training" chapter (`#ai`) holds the site's text and data mining reservation (EU Directive 2019/790, Article 4(3)), which `robots.txt` and `.well-known/tdmrep.json` state in machine-readable form. Update its "Last updated" date with any change. |
| `404.html` | Not-found page |
| `assets/` | The VGraphics look shared by the company pages (`vgraphics.css`), the self-hosted fonts (OFL), `podium.js` (the live top 3 on the home and services pages), `vhub.js` (the products' VHub entry: "Get your VHub name", or a signed-in player's own VHub name and picture from the hub's session on this site and VHub's public profile) and `img/` (Play badge, Exitwise shots, the party game and VHub illustrations, and `vgraphics-card-1200x630.jpg`, the link preview of the home, services, multiplayer and VHub pages) |
| `<product>/index.html` | Each game's or app's landing page in its own look: description, screenshots, store and portal links (they say "Coming soon" until the listings are live). Exitwise's has a small playable board. |
| `<product>/img/`, `<product>/fonts/` | That product's images and self-hosted fonts |
| `<product>/changelog.json`, `<product>/faq.json` | The landing page's "What's new" (every release players got, which the Deployer adds to) and "Questions and answers" (see "What's new and Questions and answers" below) |
| `<product>/privacy.html` | Each product's privacy policy, e.g. `exitwise/privacy.html`, `speedometer-wallpaper/privacy.html`. Each is made by `tools/build-pages.mjs` from the product's copy of its text in `<product>/privacy/source.html` (Exitwise's `map-rules.html` from `exitwise/map-rules/source.html`), set into the product pages' template. `tools/sync-documents.mjs` brings the copies in from their repos (see "Privacy policies" below) |
| `<product>/<page>/page.json` | A product's other pages, made from the same template as its landing page by `tools/build-pages.mjs`: Exitwise's ranking, room, privacy policy and map rules, and Speedometer's privacy policy. A page's own markup sits beside its page.json (`ranking.html`, `.css`, `.js`) |
| `exitwise/play/` | The Exitwise WebGL build. Only the Deployer's `exitwise-web` project writes it; `check-site.mjs` skips it. |
| `speedometer-wallpaper/play/` | Speedometer's try page: the real app's engine (Kotlin/Wasm and Skia), live in a phone with its styles and settings. The page is the template's (`play/page.json`, the "try" block); the engine's files in `play/app/` come only from the Deployer's `speedometer-web` project, never by hand. `play/img/play-qr.svg` is the store link's QR code (`tools/make-qr.py`). Under the phone, its "About" panel (D:\Projects\Mine\CLAUDE.md, 27 Oct 2026: under every play and try page): the template's sections `about`, `how-to`, `questions` (a FAQ block) and `explore`, about 400 words written for this page alone. |
| `palermo/demo/`, `palermo/play/`, `palermo/tv/`, `palermo/game/` | Palermo Noir's guided demo, its phone and TV pages, and their scripts, art and audio. Only the Deployer's `palermo-web` project writes them (from the palermo repo's `web/`; before the launch, `--pages=demo` ships the demo alone). The demo is a page of its own, held to every rule here (its About panel brings the h1), and private for now: George alone gets it, so it is noindex and out of the sitemap until it opens (see "A private demo" under "Play button"); only a landing page's intro demo (page.json `intro.demo`, e.g. `exitwise/demo/board.html`) is a piece the template sets in. The site's `palermo/page.json` names both buttons: `site.demo` (the demo, the main button until the launch) and `site.play` (the game, "Coming soon" until then; see "Play button") |
| `speedometer/` | The short address `vgraphics.gr/speedometer/`: it forwards at once to the try page (noindex) |
| `index.php/contact/`, `index.php/about-2/` | The old WordPress site's pages, which Google still asked for in October 2026 (Search Console, "Not found (404)"): each forwards at once (noindex, an instant meta refresh, which Google treats as a permanent redirect) to the home page's contact card and studio section. Add another the same way only for an old address people may still reach; anything else may stay 404 |
| `speedometer-wallpaper/styles/` | A page for each of Speedometer's 19 styles at `styles/<style>/`, from the template (a page group: a folder of pages with no `page.json` of its own). `styles/styles.json` holds each style's name, price, words and picture; `tools/make-style-pages.mjs` writes every `styles/<style>/page.json` and the landing page's style tiles from it, so never edit those by hand. Each page shows the style live (the "try" block with `"style"` and `"startup": false`: no start-up, George 26 Oct 2026, "Try page only"), its look, and the next styles. `"published": false` keeps them out of search and the sitemap, and the landing tiles open the try page, until the Play release that has the 19 styles: then set it to `true` and run the generator, build-pages and build-sitemap. Published, `"robots": "noindex"` (for every style, or on one style; a style's `"robots": null` lets it in) keeps the pages out of search and the sitemap while their tiles still open them: they share most of their words, so each waits for a write-up of its own (AdSense's "Low-value content" review, 27 Oct 2026). Wiki entries take the same `"robots": "noindex"` in `wiki.json` for the same reason. |
| `speedometer-wallpaper/l/` | A market layout's page, where the app's share link lands: `/speedometer-wallpaper/l/?c=<CODE>` (the app's `MarketCodes`; noindex), from the template with its piece beside it (`layout.html`, `.css`, `.js`). The layout drawn live by the engine in a phone, in the style it was made with and in any other at a tap; its maker, stars, uses, screens and widgets; Try it in your browser (`/play/#layout=<CODE>&style=<id>`), Google Play with `utm_content=layout_<CODE>` for the app to open the layout after the install, and on Android Open in the app (an https intent; Chrome comes back with `&app=none` without the app, and the page asks once on load); the code with Copy link; and a report form with no account (a `webReports` document that never hides a layout). `#report` opens the form. |
| `speedometer-wallpaper/layouts/`, `creators/`, `market/` | Speedometer's layout market on the site (the web market design, Games `docs/superpowers/specs/2026-10-26-speedometer-web-market-design.md`): the market page (`layouts/`, Popular / New / Top rated, the screens, a name or code search, 20 at a time), creator pages (`creators/?u=<uid>`, noindex: their live layouts, total uses and average stars), the landing's "Layouts made by drivers" chapter (`market-chapter.*`) and the style pages' "Layouts made with" chapter (`styles/made-with.*`, with `styles.json` `"market": true`). All read the market signed out through `market/market.js` (Firestore REST on `speedometer-wallpaper`, VHub's public profiles, `assets/vhub-avatars.js`), which also gives the try page its `#layout=` links. Cards are still frames the try page's engine draws (`VGTry.stills`); without WebAssembly GC they show the style's picture, labelled. The engine's folder, Google Play, prices and the statistics id come from `play/page.json`. `?emulator=127.0.0.1` on localhost reads the emulators. |
| `exitwise/ranking/` | Exitwise's global ranking: the game's four global boards (top 100 each), read live from VHub (`leaderboards/exitwise.*` in the `vgraphics-vhub` Firestore, pictures from its Storage) without signing in. `boards.js` holds the reads and the avatars for this page, the home and services podium (`assets/podium.js`) and the multiplayer page. VHub's `backend/firestore.rules` allow those reads; `?emulator=127.0.0.1` reads VHub's emulators (project `demo-vhub`), `?emulator=127.0.0.1:PORT` a Firestore emulator on that port, on localhost only. |
| `exitwise/room/` | The page a room invite's QR code opens: opens the game in the room on Android, otherwise shows the code |
| `.well-known/assetlinks.json` | Android App Links: lets the Exitwise app open `https://vgraphics.gr/exitwise/room/…` links itself, and Speedometer `https://vgraphics.gr/speedometer-wallpaper/l/…` (its entry has the shared upload key and this PC's debug key; its Play app signing key is still to add from Play Console). It lists the SHA-256 fingerprints of the Play app signing keys (current and previous, from Play Console › App integrity), the upload key and the build PC's debug key. Public fingerprints only. Add another app's entry to the same array. `.nojekyll` makes Pages serve the dot-folder. |
| `app-ads.txt` | Shared by every game and app: the lines each ad network (AdMob, LevelPlay, …) asks for. It must stay at the root. |
| `ads.txt` | The sellers of the ads on vgraphics.gr itself (Google AdSense, for the web games). Apps read `app-ads.txt` instead. It must stay at the root. |
| `assets/web-ads.js` | The ad switch of every web game: see "Ads on the web games" below |
| `assets/startup/` | The start-up the web versions share (George's start-up rule): the dark launch, the VGraphics intro (its films are the games' `brand-intro/` copies), the product's welcome art for at least 2 s and the squishy loading bar, in the product's colours and with the product's own mark at its head (the try block's `startup.tip`: `dial` for Speedometer, `arrow` for Exitwise; without one, a round knob, never another product's mark) |
| `assets/try/` | The try pages' shell (the template's "try" block, `tools/lib/try.mjs`): the phone and its tools, the panel built from the engine's catalog, the share link, the store links with the style shown, and the statistics question |
| `CNAME` | The custom domain, `vgraphics.gr` |
| `sitemap.xml`, `robots.txt` | For search engines: every page to index, and where the sitemap is. `tools/build-sitemap.mjs` writes the sitemap. `robots.txt` also keeps the crawlers that gather pages for AI training out (GPTBot, ClaudeBot, CCBot, Google-Extended and the rest of check-site's `AI_CRAWLERS`), while every search engine may list every page: the terms of use reserve the site from AI training. |
| `.well-known/tdmrep.json` | The same reservation for the whole site in the W3C TDM Reservation Protocol (`"tdm-reservation": 1` on `/*`), which AI and text and data mining tools read |
| `tools/check-site.mjs` | The site's content rules (legal footer with the copyright line and the terms link, the AI-training reservation in robots.txt and tdmrep.json, English only, links, no trackers, company details, structured data, sitemap and robots.txt, app-ads.txt, ads.txt, the ad switch, one header and footer, the phone menu, one-line menu items, the cursors, the chapter stepper, no text selection and the play button on every served page, "What's new" and "Questions and answers" on every landing page, with the answers' animation, the policies' sources, and every picture's stated size matching its file, so none is shown stretched) |
| `tools/protect-art.mjs`, `tools/lib/credentials.mjs` | Write our rights into our pictures and songs before they are published: the rights mark (XMP) and, signed as VGraphics, Content Credentials (see "Rights in the files" below) |
| `tools/build-sitemap.mjs` | Writes `sitemap.xml` from the pages: `node tools/build-sitemap.mjs` after adding, moving or removing a page |
| `tools/build-pages.mjs`, `tools/build-wiki.mjs` | Write every product page from its `page.json` and theme pack, and the wikis from `wiki/wiki.json`, with one header, closing card and footer on every page: run them after changing any of those, the template (`tools/lib/`, `assets/product.css`) or a policy's source |
| `tools/sync-documents.mjs` | Copies the policies (and Exitwise's map rules) in from the repos that own them, unchanged from their `main`, and rewrites their pages: `node tools/sync-documents.mjs <product>` (`--ref <branch>` for another); with no product it says which copies differ from their sources |
| `tools/make-wiki-map-art.py` | Writes the wiki's world tiles, and each entry's own band behind "In the game" (its world's map rows taken in turn, so no band is shown twice), from the game's Recraft level map: `python tools/make-wiki-map-art.py <Games repo>` after the map or the entries change |
| `tools/art_src.py` | Where each product's wiki masters live (the big pictures the served sizes are cut from, and `sources.json`, each one's making, prompt and licence): in its own private repo, never on this public site, which holds only the published pictures. Exitwise's and Speedometer's are in the Games repo's `docs/site-art/<product>/wiki/`, Palermo Noir's in the palermo repo's (`Games/palermo`) `docs/site-art/wiki/`. The wiki tools find the repo beside the site's checkout; `ART_REPO=<a checkout or worktree of it>` uses another. Commit the masters there, the served sizes here. check-site fails any `art-src/` folder on the site. |
| `tools/make-wiki-art.py` | Writes each wiki painting's served sizes (wide up to 3200 px, the 9:16 phone cut; AVIF, WebP, JPEG) and `art.json` from the product's masters (`tools/art_src.py`): `python tools/make-wiki-art.py <product> [slug ...]`. Never larger than the master. `--medals` copies Palermo Noir's medal masters unchanged to `palermo/wiki/img/medals/<slug>-<width>.webp`, which the gallery's lightbox shows. |
| `tools/wiki_text.py` | Real words and numbers over the ones the AI drew in a wiki painting (readable text in art is never AI-drawn): an entry's `"text"` in `sources.json` gives each box to paint out and the words to set in the game's fonts. `make-wiki-art.py` runs it on the master and the tall picture; `python tools/wiki_text.py <product> <slug> <folder>` writes before and after crops (Python with Pillow, numpy, OpenCV and fontTools) |
| `tools/make-wiki-worlds.py` | Makes the Worlds entry's wide master from George's island and its Recraft outpaint, the island crisp in the middle and the new sea shaded to meet it: `python tools/make-wiki-worlds.py`, then `make-wiki-art.py exitwise worlds` |
| `tools/make-wiki-pieces.py` | Writes the small pictures of Exitwise's obstacles and powerups (and the boards' rock, bomb and portal) from the game's art: `python tools/make-wiki-pieces.py <Games repo>` after the game's pack changes |
| `tools/make-key-art.py` | Writes a product's hero pictures (`<product>/img/key-art-wide-*` and `key-art-tall-*`, AVIF, WebP and JPEG) from its key art masters and prints their page.json entries: `python tools/make-key-art.py <product> <wide master> <tall master>`, or `--cut <x>` for a 9:16 cut of the wide one. Never larger than the master. |
| `tools/make-product-card.py` | Draws a product's link-preview card `<product>/img/card-1200x630.jpg` from its key art and approved logo, with one line set in its own font: `python tools/make-product-card.py <product> <key art> <logo PNG> "<line>" [x]` |
| `tools/make-cursors.mjs` | Draws every product's cursors and VGraphics' (see "Cursors" below): `node tools/make-cursors.mjs`, then `node tools/build-pages.mjs` |
| `tools/make-qr.py` | Writes a QR code as a small SVG, made once so the page loads no QR library: `python tools/make-qr.py <link> <out.svg>` (Python with segno) |
| `tools/make-card.py` | Draws the link-preview card `assets/img/vgraphics-card-1200x630.jpg` from the site's fonts, colours and screenshots: `python tools/make-card.py` (Python with Pillow, fontTools and brotli). Run it again after the home headline, the menus or the colours change. |
| `tools/make-style-pages.mjs`, `tools/make-style-cards.py` | Write the style pages' `page.json` and the landing page's style tiles from `<product>/styles/styles.json` (`node tools/make-style-pages.mjs`, then `build-pages` and `build-sitemap`), and each style page's link-preview card, the key art behind the style's name, price and real render (`python tools/make-style-cards.py`, Python with Pillow, fontTools and brotli). check-site fails while either is out of date. |
| `tools/art-prints.py`, `tools/art-once-todo.json` | Fingerprints pictures so check-site can find copies under other names (check-site runs it; Python with Pillow). The list of reuses still waiting for their own picture (see "Every picture once" below). |
| `tools/make-speedometer-renders.py` | Writes `speedometer-wallpaper/img/renders/`: the app's real renders (its screenshot goldens in the Games repo and frames of the Promo demo drive) that the gallery, `/apps/`, the home page and the wiki's medals show, each place its own: `python tools/make-speedometer-renders.py`, then `python tools/make-gallery-images.py speedometer-wallpaper` (Python with Pillow) |

Rules for every page: the legal footer line (the copyright line "© 2026 VGRAPHICS SINGLE MEMBER P.C. All rights
reserved", "G.E.MI. no. 181823306000", "VAT no. EL802736373", links to `/company/`, `/privacy/` and `/terms/`), a canonical URL on `https://vgraphics.gr/…`, no cookies, analytics or third-party scripts
and fonts on the static pages, and no phone number or street address. The contact address is support@vgraphics.gr (an
alias of the info@vgraphics.gr mailbox at Hostinger); George's Gmail address never appears on anything the site serves,
`tools/` and this README included. The site is in English: no Greek letters on its
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
someone is signed in to VHub, it shows their little picture in the header's VHub link (George, 23 Oct 2026), in the
frame of their rank (26 Oct): their photo when they have one (27 Oct: "If I have image show it. Dont show avatar."),
else their preset, and their initial only when neither draws. It reads `vhub.me` from this site's localStorage, which
the hub writes while a player is signed in (their name; `photo`, the approved photo's own address in VHub's Storage,
loaded as a plain image with no referrer; or `pic`, the preset as a `data:` URL; and the frame: one of the hub's own
`/hub/frames/*.webp` with its opening's place) and removes on sign-out. Only those addresses are accepted.

The company pages (home, games, apps, services, multiplayer, hub, company, privacy, terms, 404, and the devlog) share one header (Games,
Apps, Services, VHub, Contact) and one footer. Each menu wears one of the logo's dots: Games sun, Apps coral, Services
sky, VHub violet. The home page's copy is the master: to change the menu or the footer, change it there and paste it
into the other nine pages, then run `node tools/build-devlog.mjs`, which copies it into the devlog. The check fails while any page differs (only `aria-current="page"` on the page's own menu
item may differ). The hub's copy lives in the VHub repo, in `hub/index.html` and `docs/privacy/vhub-privacy.html`.
Change it there too and release `vhub-hub`: until then the check reports every hub page.

On phones every header folds its menu into a button at the right that opens it as a panel (George, 23 Oct 2026: "At
mobile the vgraphics.gr toolbar does not fit. It must be a burger menu."): the company header below 768px, the product
header below 561px and wherever its row would not fit. Menu items keep to one line (George, 26 Oct 2026: "Map rules -
always single line menu items."): every header link is `white-space: nowrap`, the product header keeps its logo (at its
own size) and menu on one row, and `assets/menu.js` measures that row (on load, whenever the header changes size and
when a font arrives): every link and the play button with its words show wherever they fit, drawn closer (`.compact`,
less padding) where only that fits, and elsewhere the menu folds into its visible button (`.folded`) instead of
squeezing, wrapping or hiding a link. Folded, the play button moves out of the panel into the bar beside the button, the
page's main action always in sight, with its words unless a narrow phone has room only for its icon (`.play-icon`).
Measured in Chrome after the fonts load, Exitwise shows its full row from about 1000px, its compact row at 768 and 790,
and folds on phones ("Play online" with its words at 390, its icon at 360); Speedometer full from 790, compact at 768.
A nav entry's `"wide": true` no longer hides it on narrower screens. check-site fails a header rule that lets a link
wrap or hides a product header's link or play label (`display: none`, `visibility: hidden`, a clip), a logo free to
shrink, a bare `.play` rule anywhere (the intro's demo once used one, which made the play button 460px wide and pushed
the menu over), a `<br>` in a header's menu, and the fold missing from menu.js.
`assets/menu.js` opens and closes the panel; it also adds the company header's button, so that
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

## Privacy policies

Each policy's source lives in the product's own repo: Exitwise `docs/store/privacy-policy.html` and Speedometer Live
Wallpaper `docs/speedometer-privacy-policy.html` in the Games repo, Palermo Noir `docs/privacy-policy.html` in its own
(`vgraphics/palermo`, the `Games/palermo` folder). The page.json "document" block of each policy page (and of
Exitwise's map rules, `docs/store/exitwise-map-rules.html`) names that file, `"from": { "repo", "path" }`, and the site
holds a copy of it beside the page.json (`exitwise/privacy/source.html`, `speedometer-wallpaper/privacy/source.html`,
`palermo/privacy/source.html`, `exitwise/map-rules/source.html`). `tools/build-pages.mjs` sets the copy into the
product's template at the page's address (`<product>/privacy.html`), with the shared header, menu and footer.

To change a policy: edit it in its repo and merge it to `main` there, then `node tools/sync-documents.mjs <product>`
here, which copies it in unchanged and rewrites the page; run check-site, push, and check that the live page has
updated. `node tools/sync-documents.mjs` alone says which copies differ from their sources. The Deployer's
`exitwise-web` also copies Exitwise's policy in with every release. A source is the text alone, in one `<main>`: no
header, menu or footer of its own (the template adds them), `<meta name="robots" content="noindex">` and a canonical
link to its page, since GitHub Pages serves it too; check-site checks this, and that each block names its source. VHub's
policy, `docs/privacy/vhub-privacy.html` in the VHub repo, is the exception: each `vhub-hub` release brings it to
`hub/privacy.html` with the hub.

## Chapter stepper

Every page with chapters shows a stepper at the screen's right edge, just left of the scrollbar and centred on its
height (George, 24 Oct 2026: "a stepper that updated during scroll. I can click any bullet. Hovering shows what chapter
it is. One chapter per anchor. This is a generic rule for all games and projects so implement for all."). One bullet
per chapter: the chapter being read fills as the page scrolls, a click scrolls to any chapter, and hovering or
focusing a bullet shows the chapter's name.

- A chapter is what a link in the page's `<main>` points at: a heading's link to itself (`a.anchor`, which the template
  gives every section heading) or a link in a `<nav>` of the page's own ("On this page" in the policies). A page with
  fewer than two shows no stepper. To give a page chapters, give its headings their links, never a stepper by hand.
- `assets/stepper.js` builds it and links `assets/stepper.css`, in the page's own colour (the scrollbar's: `--scrollbar`,
  else the accent). `assets/menu.js` loads it on every page with a header, so the template's pages, the hand-made ones
  and the hub's get it with no line of their own.
- It fades out while the closing card, the footer or a fixed panel (the try page's statistics question, the
  soundtrack's mini-bar) reaches it, and hides on a screen too short for it. Mice and trackpads get the whole stepper;
  touch screens get a slim rail of small dots that only shows where the reader is, with no names and no taps of its own,
  so it never takes a tap meant for the page (touch screens 1320px wide or more get 44px bullets that take taps).
- check-site holds every served page to this: a page with two chapters or more loads `/assets/menu.js`, and each
  chapter points at exactly one element (an id used twice sends the bullet, and the heading's link, to the wrong one).

## No text selection, no right-click

No page lets its text be selected or opens the browser's own menu (George, 26 Oct 2026: "Dont allow text selection and
right clicking in any page. Global rule. Selected highlighted text must have color of app or game."). Pictures and
links can't be dragged off the page, and a long press on a phone opens no menu for them.

- `assets/no-select.js` keeps the menu shut (right-click, and the long press on Android) and stops native drags; it
  links `assets/no-select.css`, which turns selecting off on the whole page, image drags in Safari and Chrome, and the
  long-press callout on iPhones. `assets/menu.js` loads it on every page with a header, so the template's pages, the
  hand-made ones and the hub's get it with no line of their own. A page without a header loads it itself:
  `<script src="/assets/no-select.js" defer></script>` (the Exitwise play page, from the Games repo's
  `WebGLTemplates/Portfolio/index.html`, and the `/speedometer/` forward).
- Text fields people type in (`input`, `textarea`, `[contenteditable]`) are the exception: their words select, and they
  keep their menu, so Paste works. So does an element made to be dragged (`draggable="true"`).
- What a field selects shows in the page's own colour: `--selection`, with its words in `--selection-ink`. A product's
  pack may set both (`selection`, `selection-ink`); otherwise they are its scrollbar's colour (`--scrollbar`, else the
  accent) and its page's (`--page`): Exitwise's deep violet with cream, Speedometer's red with black, Palermo's gold
  with navy. `tools/lib/theme.mjs` holds the pair to 4.5:1. The company pages and the hub (`assets/vgraphics.css`) use
  the page's own dot and the words that go on it.
- The script puts `no-select.css` first in the head, so a page's own rules win at equal weight: the hub, the party kit
  and the Exitwise play page carry their own piece from their repos (the same rules, in their colours), which stays in
  charge there.
- The same piece is a light deterrent against copying (George, 27 Oct 2026): outside text fields, the keys that open
  the developer tools or the page's source do nothing (F12, Ctrl+Shift+I, J and C, Ctrl+U; on a Mac Cmd+Option+I, J, C
  and U), and the developer console shows a large "Stop!" once the page has loaded: the site, its art, music and code
  belong to VGraphics, copying is not allowed, and the terms of use (`/terms/`), in the page's language (English, or
  Greek on a `lang="el"` page). Once a page: the hub's, the party kit's and the Exitwise play page's pieces print the
  same warning under one mark (`Symbol.for("vgraphics.console-warning")`), and the first to run prints it. Nothing
  watches for the tools: the page, and its error reporting, work the same with them open.
- check-site holds every served page to this: it loads `/assets/menu.js` or `/assets/no-select.js` (which must hold the
  keys, the warning's mark and the terms link), and no stylesheet,
  `<style>` or `style=""` sets `user-select: text`, `all`, `auto` or `contain`, except on text fields (a rule whose
  every selector ends on `input`, `textarea` or `[contenteditable]`). A policy's source (the text alone, kept out of
  search) is not a page and is left as it comes from its repo.

## Light and dark

The company pages and the hub have a light and a dark look; the reader picks System, Light or Dark in the hub's Settings
(George, 27 Oct 2026: "At settings allow me to select dark or light theme if we support it"). System, or no choice yet,
follows the device. Product pages have one look each and stay as they are.

- `assets/theme.js` keeps the choice in the browser (localStorage `vg-theme`) and sets it on `<html data-theme>`
  (none for System). Every page on `assets/vgraphics.css` loads it in its head before its stylesheets, without
  `defer`, so the page paints in the right theme from the first frame: `<script src="/assets/theme.js"></script>`.
  The hub's pages carry it from the VHub repo's `hub/index.html`.
- A dark rule answers both: inside `@media (prefers-color-scheme: dark)` its selector starts
  `:root:not([data-theme="light"])`, and a twin outside the media query starts `:root[data-theme="dark"]`.
  `vgraphics.css`'s dark tokens are written so, twice.
- The theme-color metas and a `<picture>`'s sources for one scheme (the logo's) keep their media queries: `theme.js`
  turns them to the chosen theme as the page loads.
- The hub calls `window.vgTheme.set("system" | "light" | "dark")`; other open tabs follow at once. It also keeps the
  choice in the VHub account, and a browser with no choice of its own takes the account's.
- check-site holds every served page to this: a page on `vgraphics.css` loads `theme.js` before its first
  stylesheet, both dark token blocks match, and every dark rule in a stylesheet or a page's `<style>` is scoped as
  above.

## Switches, never checkboxes

Every on/off choice is a switch, never a checkbox (George, 26 Oct 2026: "I hate checkboxes. I always prefer toggles.").
A choice of a few is a segmented control or option cards (the try page's segments and swatches), never a row of
checkboxes.

- `assets/switch.css` is the one switch: `<input type="checkbox" class="switch" role="switch">`, a real checkbox drawn
  as a track and a knob, so Space flips it, Tab reaches it and a `<label>` names it (a tap on the label's words flips it
  too). On is the page's selection colour (the product's scrollbar colour with its page's, unless the pack sets
  `selection`), off is in its muted colour, and a bar (on) or a ring (off) in the track says which without colour. The
  knob slides in 160ms, and jumps with reduced motion. Windows' contrast themes get the system colours.
- A page with a switch links it: `<link rel="stylesheet" href="/assets/switch.css">`. The template adds it to the pages
  with the try panel, whose on/off settings `assets/try/try.js` makes as switches, each in a `<label>` row.
- check-site holds every served page to this: each checkbox in its markup is the switch, each one the site's own
  scripts make gets the `switch` class and role, and a page with either links `switch.css`. The hub, the Exitwise game
  and the Speedometer engine are built in their own repos, with their own switch, held there by their tests.

## Play button

A product that can be played or tried on the site ends its header with that page, drawn as a button (George, 26 Oct
2026: "For all landing pages, when there is a play online/test online, make it a fancy primary button last on the
toolbar buttons."): Exitwise's "Play online" (`/exitwise/play/`), Speedometer's "Try online"
(`/speedometer-wallpaper/play/`).

- The product's page.json names it: `site.play`, `{ "label": "Play online", "href": "/<product>/play/" }`. The header
  (`tools/lib/partials.mjs`) adds it after the menu's links on every page of the product, the wikis too, so it is the
  phone panel's last item as well. A product without `site.play` shows no button.
- `assets/product.css` draws it as the product's eye-catching button in its own colour, never a grey (George, 26 Oct
  2026, on Exitwise's: "Create a better play online button. More purple like the logo stroke."): the colour its
  scrollbar, stepper and selected text wear (`--selection`, else `--scrollbar`, else the accent: Exitwise's deep violet
  #32044F, Speedometer's red, Palermo's gold) with the words that read on it (`--selection-ink`, else the page's). A pill
  lit from above on a deeper edge, a light rim, a glow in a lighter shade of it, the play sign in a disc of its words'
  colour, a sheen now and then, a lift and brighter glow on hover and a press; nothing moves with reduced motion.
  `tools/lib/theme.mjs` fails a pack whose pair reads under 4.5:1 or whose colour is greyish (saturation under 35%).
  It always shows its words, in the row and, folded, in the bar beside the menu button; only a phone too narrow for
  them shows its icon alone there.
- check-site holds every served page to this: a product with a play page (`<product>/play/`) has `site.play`, and
  every product header in its folder ends with that one button, inside its menu, going to that address.
- **A game with a guided demo as well** has two buttons (George, 27 Oct 2026, on Palermo Noir: "Build the demo button.
  Its different from play online. Build both buttons and for play now say Coming soon."): `site.demo`,
  `{ "label": "Try the demo", "href": "/<product>/demo/" }`, beside `site.play`. The main button, the one above, is the
  one that can be played now; the second sits just before it in the menu (it stays in the phone panel when the main one
  moves to the bar), and the landing pages' badges to either address draw the pair, the main one first
  (`tools/lib/partials.mjs` `playButtons`).
  - Before the game opens, `site.play` has `"soon": "Coming soon"`: the demo is the main button, and the game is a
    quiet chip that leads nowhere (`.play-soon` in the menu, `.soon-cta` in the badges: a dashed ring, dimmed words, the
    `soon` words in a small tag). Its badge has no note.
  - **On launch day**, take `soon` out of `site.play` and run `tools/build-pages.mjs <product>` and
    `tools/build-wiki.mjs`: the game becomes the main button everywhere and the demo the second (`.demo-link`,
    `.demo-cta`, ringed in the button's colour). Nothing else changes.
  - check-site holds the pair too: the main button as above (the demo's address while the game is coming soon), the
    second just before it in the menu, and no link to a game that is coming soon.
  - **A private demo** (George, 27 Oct 2026, on Palermo Noir's: "palermo demo must only show if i am logged in with
    garithos account. Else hide it."): `site.demo.private: true`. For everybody else the product has no demo: no
    button, badge or link (the pair is as without `site.demo`, so Palermo shows "Play online · Coming soon" alone),
    What's new leaves out the releases that name the demo or link it (`tools/lib/news.mjs`, the Deployer's entries
    too; the testers get their own What's new with every release, in a private template, George, 28 Oct 2026:
    "Testers see them"), and the words about it in page.json's and faq.json's texts, written `<span data-demo>…</span>`, are left out
    (`demoText`). The template writes the demo's buttons inside `<template class="private">` (`forTesters`), inert for
    everybody, search engines included; `assets/menu.js` loads `assets/private.js` on such a page, which opens them
    for the VHub accounts it lists (George's, Garithos) when that account is signed in to the hub on this site: it
    reads the hub's Firebase session in the origin's IndexedDB, as the Palermo repo's `web/src/demo/gate.ts` does for
    the demo page itself, which shows everybody else a "Coming soon" card and is built noindex. A hide, not a lock: the
    pages are public. check-site holds the public view (the private templates taken out) to the pair, and fails any
    page that links a private demo outside them.
  - **Making it public** is one setting here: take `private` out of `site.demo`, then run `tools/build-pages.mjs
    <product>` and `tools/build-wiki.mjs`; release it with the Palermo repo's own (`web/src/demo/private.ts`,
    `DEMO_TESTERS = null`) through `palermo-web --pages=demo`, then run `tools/build-sitemap.mjs`.

## What's new and Questions and answers

Every product's landing page has a "What's new" chapter and a "Questions and answers" chapter (George, 25 Oct 2026:
"This apply as global rule. All landing pages must have it."). Both are template blocks, so every product gets them the
same way: in its page.json, a section titled "What's new" with a `news` block and one titled "Questions and answers"
with a `faq` block (Exitwise's and Speedometer's sit after the features, just before the closing card). Being sections
with titles, each is a chapter with its heading's link and a bullet on the stepper.

- **What's new** (`tools/lib/news.mjs`) reads `<product>/changelog.json`: `{ "entries": [...] }`, newest first, each
  `{ version, date (YYYY-MM-DD), platforms (["Android", "Web"]), items (plain lines for players), commit }`, `title` (a
  one-line headline; the Deployer's notes give one, and an entry without one uses its first line) and, written by
  hand, `link` (`{ href, label }`, under the lines). Speedometer's entries read as its web market design asks (Games
  `docs/superpowers/specs/2026-10-26-speedometer-web-market-design.md` §7): a headline and at most three short lines,
  one entry per production release, a web-only one only when it changes what visitors can do.
  **The update card** (George, 28 Oct 2026, design A of four on a review page: "Maybe whats new open a new card like
  characters to see whats need there?"): on the page, one compact card with the newest update's date, headline and
  first line, the "See what's new" button and how many updates there are, on a small stack of cards. A click grows it
  into the big card (a modal dialog, `assets/product.js`), flying from its place as the role cards do: every update as
  a row, the newest open, each opening its lines one at a time (`assets/faq.js`), its inside scrolling as one box with
  fading edges and the product's scrollbar. The close button, Escape or a click outside flies it home. Players read
  dates and headlines; the version is small print under an update's lines ("Build 0.1.66bcb235"). An entry whose only
  line is the Deployer's "Improvements and fixes." shows nowhere (it stays in the changelog). Without script the
  browser's own commands (`commandfor`) still open and close the big card. A product not out yet has
  `"entries": []`, and until its first release the newest
  release's card holds its place (George, 26 Oct 2026: "Design the empty view better please."): a calendar emblem in
  the product's colour, a title, a line and an optional link. The block's `empty` is that line, or
  `{ "title": "Coming soon", "text": "…", "link": { "href": "/palermo/play/", "label": "Try it online" } }` (each
  optional: the title defaults to "Coming soon", the line to the default one, and with no link there is none).
- **The Deployer writes the changelog:** every release players get (a Play build that reaches production, a promotion,
  a web build) adds its notes, the same player-facing lines Google Play shows, with the day and where it shipped, then
  runs `tools/build-pages.mjs <product>` and this check, and pushes (`src/projects/siteNews.ts` in the Deployer). A web
  build of the commit a store release came from joins that release's entry. Edit an entry by hand only to fix its
  words, and run `node tools/build-pages.mjs` after.
- **Questions and answers** (`tools/lib/faq.mjs`) reads the block's `items`, or the file its `src` names beside
  page.json (`faq.json`): `[{ "q": "plain words", "a": "trusted HTML, or a list of paragraphs" }]`, 6 to 10 of them.
  Each question opens its answer (details and summary, so it works without script), and the page's head carries them
  as FAQPage structured data.
- **The answers open and close with an animation, one at a time** (George, 26 Oct 2026: "FAQ must open/close with
  animation always. One open at a time."), **and so does every other expandable** (27 Oct 2026: "FAQs and every kind
  of expandable like that must always open/close with animation. Its a general rule."). `assets/faq.js`, which
  `assets/menu.js` loads on every page, takes over the clicks (and Enter and Space) of every details on the page (the
  questions, the updates in What's new's big card, the About panels' questions on the play and try pages) and of a
  tour's buttons and spots: a row grows from its head as what lies under it fades in (260 ms) and closes the same way
  back (200 ms), both easing out, with the chevron turning along; a click mid-way turns it round from where it is. In a
  list of questions and answers, in What's new's list of updates and in a tour, opening one closes any other open one,
  and the head being opened stays where it is on the screen (or in the box it scrolls in) while rows above it close. Under reduced motion it only fades, briefly. The browser keeps
  the open state screen readers announce, find-in-page (a row it opens closes the others in its list) and, without
  script, the plain rows. A new kind of expandable is a details, or gets driven from `faq.js`. Google shows FAQ rich results only for government and health sites since 2023, so the markup is for
  other search engines and assistants; the questions are there for people.
- check-site holds every landing page to this: both sections, with those titles, questions that each have an answer,
  a changelog that is valid JSON with well-formed entries, newest first (a broken one shows as no releases, and the
  check says why), and a news block's `empty` that is a line or `{ title, text, link }`. `[faq-js]`: every served
  page with an expandable (a details, a tour, anything marked `aria-expanded`) loads `/assets/menu.js` (or `faq.js`
  itself), menu.js loads `faq.js` on every page, whatever a page marks `aria-expanded` is a tour's button or spot or
  the header's menu button, and no site script but `faq.js` and `menu.js` opens or closes anything by `aria-expanded`.

## Search engines

- **Titles and descriptions:** each page has its own `<title>` of about 60 characters, the main search words first,
  and a meta description of about 155, with the words people search for (Google's suggestions, 27 Oct 2026): "arrow
  puzzle game", "online", "free", "logic puzzle", "arrow escape" for Exitwise; "mafia party game", "hidden role",
  "mafia game roles and rules" for Palermo Noir (in Greece the game itself is called Palermo); "speedometer live
  wallpaper", "car dashboard", "GPS speedometer" for Speedometer; "app development", "game development", "Greece",
  "Kotlin", "Unity" for the services. A landing page's h1 (for screen readers and search, under the painted logo) is its
  `hero.title`, what the product is in those words. Wiki entries take theirs from their wiki.json's `entryTitles`
  (the first that fits in 60 characters, with the section's `kind`: "Rock (obstacle) · Exitwise arrow puzzle wiki"),
  and a short description ends with its `entryTail`.
- **Link previews:** every page has og:title, og:description, og:image (with its size and alt) and a large Twitter
  card. A wiki entry shows its own painting (its 1280 px JPEG), a wiki index its own when it is one of the paintings.
- **check-site** fails a page search engines may index (no `noindex`) without a meta description, one h1, structured
  data, og:title, og:description, twitter:card, or an og:image that is a file on the site, and two such pages with the
  same title or the same description. The canonical address is checked on every page.
- **Structured data (JSON-LD in each page's `<head>`):** the home page describes VGraphics (Organization: legal name,
  logo, G.E.MI. and VAT numbers, Kalamaria, the Google Play developer page and GitHub) and the WebSite. Exitwise's page
  has a VideoGame, Speedometer's a MobileApplication, the services page a Service for each thing we build, and every
  other page a BreadcrumbList. The wikis get theirs from `tools/build-wiki.mjs`, with each wiki's `metaTitle`,
  `metaDescription` and `product.parent` from its `wiki.json`, and each entry is also an Article about its product (the
  `@id` its landing page gives the game or app). No aggregate ratings anywhere: the only ratings are Google Play's, which
  Google doesn't allow on our own pages. check-site fails on a block that isn't valid JSON. Try a page in Google's Rich
  Results Test after changing its structured data.
- **sitemap.xml:** run `node tools/build-sitemap.mjs` after adding, moving or removing a page, and after pages change.
  It lists every page's canonical URL, except pages marked `noindex` (the 404 and room invite pages), each with its
  `<lastmod>`: the date of the last commit that changed the page, or today while it has uncommitted changes. check-site
  fails while a page is missing or extra, or has no date, but doesn't check the dates (the Deployer's What's new
  rewrites a landing page without the sitemap; it catches up on the next run), and when a listed address is no page,
  is noindex, or isn't its page's own canonical. `robots.txt` points to it.
- **Search Console's 404s that stay:** `/assets/startup/` and `/speedometer-wallpaper/img/key-art-tall` are not links
  but the try page's start-up settings (the start-up's folder, and the key art's name before its width), which Google
  reads as addresses. Nothing belongs there, so they stay 404, which doesn't hurt the site. Same for the hub's
  `/hub/boards/?b=…` under "Alternative page with proper canonical tag": a board picked in the address, whose canonical
  is `/hub/boards/` on purpose.
- **Google Search Console:** the property `https://vgraphics.gr/` (URL prefix) on the VGraphics Google account, verified by the
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

## Rights in the files

Our pictures and songs carry their rights inside the files too (George, 27 Oct 2026: "How can we protect our art and
songs so nobody else copies them?"), as well as the terms of use (`/terms/`):

- **The rights mark:** an XMP packet with the IPTC rights fields: creator VGraphics, "© 2026 VGRAPHICS SINGLE MEMBER P.C.
  All rights reserved.", the terms as the web statement of rights, VGraphics as licensor (support@vgraphics.gr), data
  mining prohibited (PLUS `DMI-PROHIBITED`) and, where we know it, the IPTC digital source type. Google Images shows the
  creator and copyright from it. It goes into JPEG, PNG and WebP without re-encoding a pixel (about 2 KB each), not into
  AVIF or the songs.
- **Content Credentials (C2PA):** a manifest signed as VGraphics with the same rights (`cawg.metadata`), no AI training
  or data mining (`cawg.training-mining`), and for art made with Recraft or Suno, that the tool made the first draft and
  we edited it (`c2pa.actions.v2`: created, trainedAlgorithmicMedia, then edited, humanEdits). Every format: JPEG, PNG,
  WebP, AVIF, M4A and MP3, about 14 KB each (no thumbnail inside). `MADE_WITH` in `tools/lib/credentials.mjs` says which
  art was made with which tool; art not listed there (screenshots, the apps' renders, cards drawn in code, voices) gets
  no such claim.

`node tools/protect-art.mjs` adds the mark to our art that isn't on the live site yet (changed since `origin/main`, or
new), and `--sign` adds the credentials too; give it files or folders (a masters repo's too) to do those instead, or
`--all` for every picture and song of ours; `--check` only lists what is missing. Run it before publishing new art, as
check-site reminds you: it warns (on stderr, without failing) about new art without them. The mark goes in first, since
signing seals the file. Pictures of 256 px or smaller, and what other repos' releases write (`exitwise/play/`,
`speedometer-wallpaper/play/app/`, `hub/`), are left alone.

- **The signer** stays in the Deployer's private secrets, never here: `D:/Projects/Deployer/secrets/c2pa/signer.json`
  (`C2PA_SIGNER` for another) with the certificate chain and key it names. One marked `"test": true` signs only files
  outside this repo. Which certificate to use is George's choice (the Deployer's `secrets/c2pa/README.md`).
- **c2patool** comes from its GitHub release (contentauth/c2patool), checked against the release's SHA-256 pinned in
  `protect-art.mjs`, into the Deployer's `state/tools/` (`C2PATOOL=<c2patool.exe>` for another).
- **The existing art isn't marked or signed yet:** rewriting the 2,900 or so served pictures adds about their size
  (some 560 MB) to this public repo's history each time, so they get one pass, mark and signature together, once George
  has chosen the certificate (`node tools/protect-art.mjs --all --sign`).

## Every picture once

No hero, section or card shows a picture that is shown anywhere else on the site, on another page or the same one
(George, 26 Oct 2026: "Each art must be used only once!! General rule!!"). Each page gets its own picture.

- A picture is all of its files: its sizes and formats, the wide, tall and ultra cuts one `<picture>` holds, and its
  copies under other names. check-site finds those by content: the same bytes, or nearly the same small print. That
  covers a copy at another size or in another format, one trimmed a little at an edge, and a cut of another shape from
  its middle (a cut from its side goes unseen). `tools/art-prints.py` makes the prints (Python with Pillow). check-site
  keeps them in the temp folder, so only new files need Python.
- These don't count: the `<head>` (link previews, preloads), logos, store badges, the soundtrack's cover, QR codes,
  pictures of 256 px or smaller (icons, sprites, game pieces), the start-up's welcome splash on a play page (the WebGL
  template's `#loader-art`: the key art is the welcome splash after the VGraphics intro), and pictures a script shows
  (the try pages' start-up builds its splash that way). A product's footer picture
  and its theme's ornaments are on every page of the product by design, and count as one place each.
- Two kinds of repeat are allowed (George, 26 Oct 2026: "Yes: a wiki card or gallery tile may show the same picture as
  the page it previews. Every page's hero and sections stay unique."):
  - A card that links to a page showing the same picture is that page's preview, like its link preview. Examples are
    the wiki's cards for its entries and the style pages' tiles for each other.
  - A product gallery's tiles may repeat any picture of the same product: the gallery is the product's whole art
    collection (George, 27 Oct 2026: "Add all art (even from wiki and overview) to gallery. Gallery is almost
    empty."). That means the pictures of the template's gallery block: a stage slide's screenshot (`.g-screen`) or a
    picture in its plain row (`.shots.fade-edges`), and an album's tiles (`.album-item`), whose lightbox shows them by
    script. It never covers the gallery page's hero, the gallery's backdrop and pedestals, or any other section. A
    tile showing another product's picture, or the hero of the page it is on, counts like any other place.
    An album can fill itself from a section of the product's wiki (`"from": { "wiki": "<section>" }`, with
    `"medals": true` for the section's medals), so the gallery keeps up with the wiki.
- `tools/art-once-todo.json` lists the reuses found when the rule came in, each with its planned fix. A listed picture
  passes while it stays in the places its entry names. A new place fails. A fixed picture also fails until its entry is
  taken out, so the list only gets shorter. Never add an entry: give the new place its own picture.
