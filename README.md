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
| `multiplayer/index.html` | Multiplayer & community: Exitwise's rooms, live leaderboards (read like the ranking page), profiles, moderation and custom maps; VHub and the TV party games next |
| `hub/index.html` | VHub "coming soon". The VHub web app replaces it at the same address. |
| `company/index.html` | Company information / Στοιχεία εταιρείας: the legal details from ΓΕΜΗ, in English and Greek |
| `404.html` | Not-found page |
| `assets/` | The VGraphics look shared by the company pages (`vgraphics.css`), the self-hosted fonts (OFL), `podium.js` (the live top 3 on the home and services pages) and `img/` (Play badge, Exitwise shots, the party game and VHub illustrations, and `vgraphics-card-1200x630.jpg`, the link preview of the home, services, multiplayer and VHub pages) |
| `<product>/index.html` | Each game's or app's landing page in its own look: description, screenshots, store and portal links (they say "Coming soon" until the listings are live). Exitwise's has a small playable board. |
| `<product>/img/`, `<product>/fonts/` | That product's images and self-hosted fonts |
| `<product>/privacy.html` | Each product's privacy policy, e.g. `exitwise/privacy.html`, `speedometer-wallpaper/privacy.html` |
| `exitwise/play/` | The Exitwise WebGL build. Only the Deployer's `exitwise-web` project writes it; `check-site.mjs` skips it. |
| `exitwise/ranking/` | Exitwise's global ranking: the game's four global boards (top 100 each), read live from the game's Firestore without signing in. The game repo's `docs/firebase/exitwise-firestore.rules` allows exactly those reads; `?emulator=127.0.0.1:PORT` reads a local emulator, on localhost only. |
| `exitwise/room/` | The page a room invite's QR code opens: opens the game in the room on Android, otherwise shows the code |
| `.well-known/assetlinks.json` | Android App Links: lets the Exitwise app open `https://vgraphics.gr/exitwise/room/…` links itself. It lists the SHA-256 fingerprints of the Play app signing keys (current and previous, from Play Console › App integrity), the upload key and the build PC's debug key. Public fingerprints only. Add another app's entry to the same array. `.nojekyll` makes Pages serve the dot-folder. |
| `app-ads.txt` | Shared by every game and app: the lines each ad network (AdMob, LevelPlay, …) asks for. It must stay at the root. |
| `ads.txt` | The sellers of the ads on vgraphics.gr itself (Google AdSense, for the web games). Apps read `app-ads.txt` instead. It must stay at the root. |
| `assets/web-ads.js` | The ad switch of every web game: see "Ads on the web games" below |
| `CNAME` | The custom domain, `vgraphics.gr` |
| `tools/check-site.mjs` | The site's content rules (legal footer, links, no trackers, company details, app-ads.txt, ads.txt, the ad switch, one header and footer) |
| `tools/make-card.py` | Draws the link-preview card `assets/img/vgraphics-card-1200x630.jpg` from the site's fonts, colours and screenshots: `python tools/make-card.py` (Python with Pillow, fontTools and brotli). Run it again after the home headline, the menus or the colours change. |

Rules for every page: the legal footer line (company name, ΓΕΜΗ, ΑΦΜ, link to `/company/`), a canonical URL on
`https://vgraphics.gr/…`, no cookies, analytics or third-party scripts and fonts on the static pages, and no phone
number. **Run `node tools/check-site.mjs` before every push.**

The company pages (home, games, apps, services, multiplayer, hub, company, 404) share one header (Games, Apps,
Services, VHub, Contact) and one footer. Each menu wears one of the logo's dots: Games sun, Apps coral, Services sky,
VHub violet. The home page's copy is the master: to change the menu or the footer, change it there and paste it into
the other seven pages. The check fails while any page differs (only `aria-current="page"` on the page's own menu item
may differ).

Each policy's source lives in the product's own repo: Exitwise `docs/store/privacy-policy.html`, Speedometer Live
Wallpaper `docs/speedometer-privacy-policy.html`. After you edit a policy there, copy it here unchanged, push, and
check that the live page has updated.

## Ads on the web games: one switch

Every web game here takes its ads from **`assets/web-ads.js`**: Exitwise at `/exitwise/play/` today, Παλέρμο Νουάρ and
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
- an entry for every game with a play page (`<game>/play/`).
