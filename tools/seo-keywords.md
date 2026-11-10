# Keyword research, 10 Nov 2026

What people type before they find a game or an app like ours, and where each phrase belongs. Free sources only: Google's
public autocomplete (`suggestqueries.google.com`, English), the Google Play search suggestions (`market.android.com/suggest`,
English, US), and Search Console's real queries for vgraphics.gr (read 10 Nov, 18 days of data: 77 impressions, 1 click).
No paid tool was used. Autocomplete shows what is typed, not how often, so the phrases are ordered by how early and how
often they came up, not by volume.

A product's own list lives in its `page.json` (`seo.keywords`, an empty list for now) and the shared pages' lists in
`tools/seo-keywords.json`. check-site holds a landing page's title, description and h1 to one of them, and every other page's
title or description. The phrase is worked into the words a person would read; it is never stuffed (no meta keywords tag).

## Search Console: what already shows up

| Query | Impressions | Position | Meaning |
|---|---|---|---|
| vgraphics | 6 | 4.7 | the brand is found |
| high temp light, high temperature light | 2 + 2 | 39.5, 89.5 | a Speedometer wiki page, far down |
| vushub games | 1 | 1.0 | people misspell VHub |
| colors gate, remove the arrow | 1 + 1 | 26, 43 | Exitwise wiki pages |

The one click was `/palermo/wiki/bulletproof/` (position 2). The wiki's niche pages are the pages that rank today.

## Exitwise (arrow puzzle)

Autocomplete: "arrow puzzle", "arrow puzzle game", "arrow puzzle game online", "arrow puzzle game offline", "arrow puzzle online
free", "arrow puzzle master", "arrow puzzle escape", "arrow escape", "arrow escape puzzle", "arrow escape game online", "arrows
puzzle escape", "tap arrows puzzle". Many carry "earn money", "real or fake", "apk" and "mod": that is a crowded, scam-prone
corner (cash-reward apps); Exitwise promises none of it, and its pages must not use those words.

Suggested keywords for the coordinator: arrow puzzle game; arrow puzzle; arrow escape puzzle; free arrow puzzle game; arrow
puzzle game online; logic puzzle game; offline puzzle game. Put "arrow puzzle game" in the landing title, description and h1,
and "play online" next to it on `/exitwise/play/` (it is the only page that has the game itself). The wiki's mechanics pages
(bomb arrow, colour gate, chain bomb) already earn impressions; question-style titles ("How does the colour gate work in
Exitwise?") and a first sentence that answers it suit them.

## Palermo Noir (mafia party game)

Autocomplete: "mafia party game", "mafia party game rules / roles / online / app / online with friends", "mafia game", "mafia
game app", "mafia game roles", "mafia game online with friends", "mafia game how to play". "Mafia game" without a qualifier
is dominated by the Mafia video games (PS5, PC): the pages need "party game", "with friends", "TV" or "phones" next to it.

Suggested: mafia party game; mafia game with friends; mafia game app; mafia game roles; hidden role party game; party game on
TV with phones. The roles wiki pages (seer, bulletproof, kamikaze, safe house) are where the impressions and the one click
came from: keep them, link them from the landing page, and open each with a short answer ("The seer is the role that…").

## Speedometer Live Wallpaper (the HUD keywords are this product's own job)

Autocomplete: "speedometer live wallpaper", "speedometer wallpaper", "speedometer wallpaper for android", "car speedometer live
wallpaper", "car dashboard live wallpaper", "speedometer clock live wallpaper", "gps speedometer", "gps speedometer app", "gps
speedometer for car / motorcycle", "gps speedometer app without ads", "hud speedometer", "hud speedometer app", "hud speedometer
for car", "digital speedometer".

George's ask: people who search "HUD" must see the app. "hud speedometer" and "hud speedometer app" are real, typed phrases
(also "hud speedometer mod apk" and FiveM game scripts, which are not ours). The app has a real HUD mode (the speed drawn flipped, so the
windscreen reflects it; every style has an Original | HUD switch), so the phrase is honest. Suggested, in this order: speedometer live wallpaper; hud speedometer; hud speedometer app; car hud
speedometer; gps speedometer app; car dashboard live wallpaper; speedometer wallpaper for android. "HUD" belongs in the title
and h1 of the landing page and in the store listing's title or short description; the Play listing is the Speedometer
coordinator's, which this job did not edit.

## Shared pages

| Page | Keywords | Why |
|---|---|---|
| `/` | game studio; app developer; Exitwise; Speedometer Live Wallpaper | the brand search ("vgraphics") already ranks; the title now says what the studio is |
| `/games/` | arrow puzzle; mafia game; party games | one line per game, the autocomplete phrases above |
| `/apps/` | Android apps; Speedometer Live Wallpaper; car dashboard; GPS speedometer | |
| `/services/` | app development; game development; Kotlin; Unity | autocomplete: "app developers greece", "game development thessaloniki", "unity developer greece": local, low-competition. No page says "Thessaloniki" (company details and the town belong on /company/ only), so the local words stay on the company page |
| `/multiplayer/` | multiplayer; party game; play with friends | "jackbox like games" is a large search; the page may answer it as "party games for the TV, played on phones" without naming another product |
| `/company/` | VGraphics; game studio | |
| `/devlog/` | devlog; game development | |

## VHub

Autocomplete finds nothing useful for "one account for all games" (it returns other publishers' account pages), and Search
Console shows "vushub games" as a misspelling. "VHub" is a brand, not a keyword: the hub pages should state "VHub, the one
VGraphics account for Exitwise, Palermo Noir and Speedometer" in the title and keep the product names near it.

## Store listings (not changed here)

The Play and App Store listings are each product's coordinator's. From this research: Speedometer's title, short description
and tags should carry "hud speedometer", "gps speedometer" and "car dashboard live wallpaper"; Exitwise's "arrow puzzle game";
Palermo's "mafia party game". Keep English and Greek listings one language each.

## What this research cannot say

- Volumes: autocomplete and Play suggestions rank by popularity but give no numbers. A paid tool would; none was used and no
  account was opened.
- Greek search: the site is in English by rule, so Greek queries (for example "παιχνίδι puzzle") were not researched.
- Whether "hud speedometer" visitors want a wallpaper: they may want a windscreen-reflection app, which HUD mode is. The
  landing page should say plainly that the app's HUD mode does that, so the visitor sees at once that it fits.
