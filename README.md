# vgraphics.github.io

The VGraphics developer website, served by GitHub Pages at **https://vgraphics.github.io**. Use this URL as the
developer website in Play Console, App Store Connect and the web game portals. This repo is **public**, so only put
public pages here.

| Path | What |
|---|---|
| `index.html` | Home page: one card per published game |
| `<game>/privacy.html` | Each game's privacy policy, e.g. `exitwise/privacy.html` |
| `app-ads.txt` | Shared by every game: the lines that each game's ad networks (LevelPlay, AdMob, …) ask for. Add it when the first ad account exists. It must stay at the root. |

The source of each policy lives in that game's own repo (for Exitwise, `docs/store/privacy-policy.html` in
`vgraphics/exitwise`). After you edit a policy there, copy it here, push, and check that the live page has
updated.
