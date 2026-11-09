# Draft devlog post 1 of 3 (for George's review; not published)

Goes into `devlog/posts.json` once George approves it. Suggested go-live: Tue 10 Nov 2026 (`date` = the day it goes up).
Facts from: Exitwise changelog 1.0.37 (7 Nov 2026, Android and Web), design canon section 13.

| Field | Value |
|---|---|
| slug | `asking-for-a-rating-once` |
| product | Exitwise |
| title | Asking for a rating once, at the right moment |
| description | How Exitwise asks for a rating: the store's own card on your third opening, after a win, once. A few openings later, an offer of help. Nothing more. |
| image | NEEDED, one no other page shows: our own screenshot of the "Need help or have an idea?" dialog over a won level, on the S25+ (`/devlog/img/asking-for-a-rating-once`, 640 and 1280 wide). Alt: "Exitwise on a phone: the Need help or have an idea? dialog with Open a ticket and Not now, over a won level". |
| links | `/exitwise/` "Exitwise", `/exitwise/play/` "Play Exitwise online", `/exitwise/about/` "About Exitwise" |

## Lede

Every game wants ratings, and most players have met one that wants them too much: a pop-up at launch, a "Do you love
us?" question, the same request after every level. Exitwise 1.0.37, out on 7 November, is the first of our games to
ask, and we wrote the rule down before we wrote the code. It fits on one line: ask once, at a good moment, with the
store's own card, and after that offer help instead of asking again.

## What counts as an opening

An opening is a cold start that reaches the game's first screen. Switching to another app and coming back doesn't
count, so answering a message in the middle of a level never moves the count on. The count lives on your device and
nowhere else. It isn't synced to your account, and nothing but the game on that phone reads it.

## The third opening, after a win

On your third opening, Exitwise waits for a good moment, which in a puzzle game means a level won. Never at launch,
never during play, never over an ad. When that moment comes, it calls Google Play's own rating card, the one with the
stars that opens over the game, and nothing else.

There's no question of ours before it. That's partly taste and partly the rules. Google's guidelines for the in-app
review card forbid asking anything before or while it shows, "Do you like the app?" included, and Apple's App Store
guidelines allow only Apple's own prompt. A question that sorts happy players from unhappy ones before showing the
card is exactly what those rules are written to stop, and it would make the ratings tell you less.

The store decides whether its card actually appears, because it keeps its own limit on how often one person sees it.
So we call it once and never retry. If the third opening has no win in it, or another prompt is already waiting, the
game tries on the fourth. After that it never brings it up again.

## Help on the sixth

On the sixth opening (or the seventh, if the sixth is busy) the game asks something else: "Need help or have an
idea?" Open a ticket takes you to our ticket desk, where you can report a bug, ask a question or tell us what you'd
like to see, and then follow the answers. Not now closes it for good.

We ask this one ourselves, because no store has a card for it, and because the answer is worth more to us than a
star. A rating says how someone felt. A ticket says what went wrong or what's missing, and it reaches the person who
can fix it. In the browser there's no store card at all, so the web version of Exitwise makes only the help offer.

## One prompt per opening

Exitwise already has a few questions of its own. After your third win it invites you to sign in, asks for your birth
year if your account needs one, and offers the tutorial. Those always come first. A rating or a help offer that would
land in the same opening waits for the next one, so you never get two prompts back to back.

A unit test walks through openings one to eight and checks all of it: the rating on the third (or the fourth), help
on the sixth (or the seventh), each once, never two in one opening, and nothing while you play.

## Always one tap away

A prompt that shows once is easy to miss, so Settings now has two rows that never go away: Rate us, which opens the
game's store page, and Help & ideas, which opens the ticket desk. The Rate us row can't open the in-app card, because
both stores forbid putting their card behind a button: with the card's own limit, the button would do nothing half
the time.

The same rule applies to every game and app we make, so Speedometer Live Wallpaper and Palermo Noir will ask in the
same way, in the same order.
