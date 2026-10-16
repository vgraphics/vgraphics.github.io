# vgraphics.github.io

The VGraphics company website, served by GitHub Pages at **https://vgraphics.gr** (custom domain; DNS at papaki).
The old address https://vgraphics.github.io redirects there. Use **https://vgraphics.gr** as the developer website in
Play Console, App Store Connect and the web game portals. This repo is **public**, so only put public pages here.

| Path | What |
|---|---|
| `index.html` | Home page: the studio, one card per game or app, contact |
| `company/index.html` | Company information / Στοιχεία εταιρείας: the legal details from ΓΕΜΗ, in English and Greek |
| `404.html` | Not-found page |
| `assets/` | The VGraphics look shared by the company pages (`vgraphics.css`) and the self-hosted fonts (OFL) |
| `<product>/index.html` | Each game's or app's landing page in its own look: description, screenshots, store and portal links (they say "Coming soon" until the listings are live). Exitwise's has a small playable board. |
| `<product>/img/`, `<product>/fonts/` | That product's images and self-hosted fonts |
| `<product>/privacy.html` | Each product's privacy policy, e.g. `exitwise/privacy.html`, `speedometer-wallpaper/privacy.html` |
| `exitwise/play/` | The Exitwise WebGL build. Only the Deployer's `exitwise-web` project writes it; `check-site.mjs` skips it. |
| `exitwise/room/` | The page a room invite's QR code opens: opens the game in the room on Android, otherwise shows the code |
| `app-ads.txt` | Shared by every game and app: the lines each ad network (AdMob, LevelPlay, …) asks for. It must stay at the root. |
| `CNAME` | The custom domain, `vgraphics.gr` |
| `tools/check-site.mjs` | The site's content rules (legal footer, links, no trackers, company details, app-ads.txt) |

Rules for every page: the legal footer line (company name, ΓΕΜΗ, ΑΦΜ, link to `/company/`), a canonical URL on
`https://vgraphics.gr/…`, no cookies, analytics or third-party scripts and fonts on the static pages, and no phone
number. **Run `node tools/check-site.mjs` before every push.**

Each policy's source lives in the product's own repo: Exitwise `docs/store/privacy-policy.html`, Speedometer Live
Wallpaper `docs/speedometer-privacy-policy.html`. After you edit a policy there, copy it here unchanged, push, and
check that the live page has updated.
