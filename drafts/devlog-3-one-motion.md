# Draft devlog post 3 of 3 (for George's review; not published)

Goes into `devlog/posts.json` once George approves it. Suggested go-live: Mon 23 Nov 2026, the day before the AdSense
re-review request. Facts from: design canon sections 1 and 2, the changelogs of Speedometer 2.0.14 (4 Nov, Android)
and Exitwise web 1.0.342418ea (5 Nov), the site's `assets/faq.js`.

| Field | Value |
|---|---|
| slug | `one-motion-for-everything-that-opens` |
| product | VGraphics |
| title | One motion for everything that opens |
| description | Every menu, question and panel in our games, apps and this site opens in 260 ms and closes in 200. Why one shared motion, and the two bugs it fixed. |
| image | NEEDED, one no other page shows: a filmstrip of one FAQ row opening on a product page, five frames from 0 to 260 ms, captured in our own Chrome tab. Alt: "Five frames of a question opening on the Exitwise page, from closed to open over 260 milliseconds". |
| links | `/exitwise/` "Exitwise", `/speedometer-wallpaper/` "Speedometer Live Wallpaper", `/hub/` "VHub" |

## Lede

Click a question in the FAQ on any of our product pages and it opens in about a quarter of a second. Open a menu in
Exitwise, a card in Speedometer Live Wallpaper or a panel in VHub, and it moves exactly the same way. That's on
purpose. Since early November, everything that expands or drops down, in every game, app and page we make, follows one
written spec. This post is about the numbers in it, and why we bothered to write them down.

## The numbers

Opening takes 260 milliseconds. Closing takes 200, a little faster, because by the time you close something you've
made up your mind, and the screen shouldn't keep you waiting. Both use the same curve, a strong ease-out
(`cubic-bezier(.2, .8, .2, 1)`): the row covers most of its distance in the first frames and settles gently, so it
feels quick without looking abrupt.

While a row grows, what's inside it fades in over the same 260 ms. The chevron beside it turns half a circle with it,
and on close it turns back the moment the close begins.

## Nothing snaps

The rule we care about most is that nothing appears or disappears in a single frame. The text inside a closing row
stays drawn until the row has shrunk around it, and the row clips what's inside while it moves. Click a row that's
still moving and it turns round from wherever it is, height and fade included, instead of jumping to its end first.

## One open at a time

Lists of questions keep one answer open at a time. Our first version did that by shutting the open answer instantly
when you opened another, and it looked like a glitch: one row animated while the other blinked shut. Now opening a row
runs the other row's own close at the same time, so one shrinks as the other grows.

## The page stays where you left it

The second bug was harder to see. To keep the row you clicked under your pointer, an early version nudged the page's
scroll while the rows changed height. It worked, and it felt wrong: you opened an answer and the page drifted under
you. The spec now says a row never scrolls the page. While rows move, the browser's own scroll anchoring is switched
off on whatever is scrolling, and put back a frame after they stop, so the rows below simply move with the heights.
Exitwise's web version got this fix on 5 November.

## Menus and sheets

Menus keep the same timing. A drop-down grows from its button as it fades in. A sheet on a phone rises from the bottom
of the screen, and a dialog on a wide screen rises from just below its place. Where a platform already animates its
own dialogs both ways, like Android's bottom sheets, we leave them as they are instead of fighting them.

## Less motion, if you ask for it

If your device is set to reduce motion, nothing slides: rows and menus only fade, in 150 ms opening and 100 ms
closing. Screen readers keep a row's open state until its close has finished, so what they announce matches what's on
the screen.

## Why write it down

We build with three very different toolkits: web pages, Unity and Android. Left alone, each would grow its own idea of
"smooth". A spec with numbers in it means each one can be checked against the same thing, and the FAQ on this site is
the reference the others are measured against. Speedometer Live Wallpaper 2.0.14 brought it to the app on 4 November,
and Exitwise's menus and pop-ups followed the next day.
