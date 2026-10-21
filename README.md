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
| `assets/` | The VGraphics look shared by the company pages (`vgraphics.css`), the self-hosted fonts (OFL), `podium.js` (the live top 3 on the home and services pages) and `img/` (Play badge, Exitwise shots, the party game and VHub illustrations) |
| `<product>/index.html` | Each game's or app's landing page in its own look: description, screenshots, store and portal links (they say "Coming soon" until the listings are live). Exitwise's has a small playable board. |
| `<product>/img/`, `<product>/fonts/` | That product's images and self-hosted fonts |
| `<product>/privacy.html` | Each product's privacy policy, e.g. `exitwise/privacy.html`, `speedometer-wallpaper/privacy.html` |
| `exitwise/play/` | The Exitwise WebGL build. Only the Deployer's `exitwise-web` project writes it; `check-site.mjs` skips it. |
| `exitwise/ranking/` | Exitwise's global ranking: the game's four global boards (top 100 each), read live from the game's Firestore without signing in. The game repo's `docs/firebase/exitwise-firestore.rules` allows exactly those reads; `?emulator=127.0.0.1:PORT` reads a local emulator, on localhost only. |
| `exitwise/room/` | The page a room invite's QR code opens: opens the game in the room on Android, otherwise shows the code |
| `.well-known/assetlinks.json` | Android App Links: lets the Exitwise app open `https://vgraphics.gr/exitwise/room/…` links itself. It lists the SHA-256 fingerprints of the Play app signing keys (current and previous, from Play Console › App integrity), the upload key and the build PC's debug key. Public fingerprints only. Add another app's entry to the same array. `.nojekyll` makes Pages serve the dot-folder. |
| `app-ads.txt` | Shared by every game and app: the lines each ad network (AdMob, LevelPlay, …) asks for. It must stay at the root. |
| `CNAME` | The custom domain, `vgraphics.gr` |
| `tools/check-site.mjs` | The site's content rules (legal footer, links, no trackers, company details, app-ads.txt, one header and footer) |

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
