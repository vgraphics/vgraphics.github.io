# Draft devlog post 2 of 3 (for George's review; not published)

Goes into `devlog/posts.json` once George approves it. Suggested go-live: Tue 17 Nov 2026. **Before it goes up, check the
EU paragraphs:** if Apple has verified the trader status by then, rewrite "Why not in the EU yet" in the past tense and
drop the TestFlight section (and the same note on the Exitwise page goes too).
Facts from: Exitwise iOS changelog 1.0.2 (7 Nov 2026), `exitwise/page.json` (App Store id6830097641, the EU note and
its TestFlight link), the house rules (one Unity project, a Unity-free Core with its own tests, seeded levels).

| Field | Value |
|---|---|
| slug | `exitwise-on-iphone` |
| product | Exitwise |
| title | Exitwise comes to iPhone and iPad |
| description | Exitwise 1.0.2 is out for iPhone and iPad: the same 600 levels, Sign in with Apple and Restore purchases. Why EU players get the beta for now. |
| image | NEEDED, one no other page shows: our own screenshot of Exitwise on an iPhone (a level or the world map), from the TestFlight build. Alt: "Exitwise on an iPhone: …" (describe the shot). |
| links | `/exitwise/` "Exitwise", `https://apps.apple.com/app/id6830097641` "Exitwise on the App Store", `/exitwise/play/` "Play Exitwise online" |

## Lede

On 7 November Exitwise reached the App Store, for iPhone and iPad. It's the very game Android players and browser
players already know, with all 600 levels across its 17 worlds. If you live in the European Union you won't find
it in your App Store just yet, though. This post is about what the iPhone version brings, why Europe is waiting, and
how to play it there in the meantime.

## One game, three places

Exitwise is built once, in Unity, and that one project makes the Android app, the iPhone app and the version that runs
on this site. The rules of the puzzle sit in a part of the code that knows nothing about phones or browsers, with its
own tests, so the iPhone didn't need a port of the game. It needed a new place to run it.

Each level grows from one fixed number, its seed, so level 237 on an iPhone is the same board as level 237 on Android or in a
browser, arrow for arrow. That's what makes a per-level leaderboard fair: everyone on it solved the same puzzle.

## Sign in with Apple

On Apple's devices, the sign-in button is Apple's own. Signing in is optional, and the game plays the same without it. What
it gives you is a free VHub account, which keeps your progress safe and gives you one profile across all of our games.

## Restore purchases

Exitwise is free. If you've bought Remove Ads, that's the kind of purchase that lasts, and Apple asks every app that
sells one to offer a way to get it back on a new device. So Settings has Restore purchases: on a new iPhone or iPad,
tap it, and Remove Ads comes back without paying again.

## Why not in the EU yet

Under the EU's Digital Services Act, an app that sells anything has to say who the trader behind it is, and Apple
checks those details before the app can appear in any EU storefront. Ours are with Apple and still being checked.
Until that's done, Exitwise isn't listed in EU App Stores. An EU visitor to our Exitwise page sees a line under the App
Store badge saying so, so nobody taps through to a page that won't open.

## Playing in the EU meanwhile

There are two ways to play in the EU today. The first is the iPhone beta, through TestFlight, Apple's own app for
testing builds: install TestFlight, open the invite link on our Exitwise page, and the game installs like any other.
It's the real game, not a demo, and if you sign in, your progress stays with your VHub account whichever version you
play.

The second needs nothing at all: Exitwise runs in the browser, on this site, on a phone or a computer. As soon as Apple
finishes its check, the App Store version will open in the EU too, and we'll say so on the Exitwise page.
