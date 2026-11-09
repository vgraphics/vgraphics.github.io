# Draft wiki text: four entries, fuller (for George's review; not published)

Each block replaces those keys of the entry in `<product>/wiki/wiki.json`; every other key (`slug`, `icon`, `image`,
`quotes`, `facts`, `related`, `figure`, `artAlt`) stays as it is. For **hints** and **cpu-clock**, also delete the
`"robots": "noindex"` line this branch added: with the fuller text they've earned a place in search. Then run
`node tools/build-wiki.mjs`, `node tools/build-sitemap.mjs` and check-site.

Own words today → with the draft (summary + what + how + notes):
hints 53 → about 190, hearts 81 → about 200, cpu-clock 61 → about 210, seer 70 → about 190.

Facts checked in the code on 9 Nov 2026:
- Exitwise `GameSession.FindHint()`: any free arrow is a safe hint, because removing an arrow never blocks another; a
  hint skips arrows under a shutter or held by the ward and is looked for afresh after each hit.
  `SaveData.StartingHints = 3` (a stock, not per level); `CoinEconomy.HintCost = 30`. `LoseHeart()` is reached only
  from a blocked tap (and a guardian's strike on top of one).
- Speedometer `CpuClockReader` / `CpuClockMath`: every core's `scaling_cur_freq` over its `cpuinfo_max_freq`, summed;
  a core with no current reading counts 0; a top speed under 200 MHz or a current above 105% of the top makes the
  reading unknown (`--`); sampled once a second, smoothed over about 3 seconds (`CPU_SMOOTHING = 0.3`).
- Palermo `assets/audio/script.md`: `pal.night.seer` "The seer shuffles her cards…" plays when the setup has a Seer,
  alive or not; the secret actions open by holding them; "Use what you know, without giving yourself away." The
  Detective's entry: the Henchman, the Kamikaze and (by default) the Hidden Killer pass his check as not a killer.

## Exitwise · Hints (`exitwise/wiki/wiki.json`, slug `hints`)

```json
"summary": "Lights up an arrow that can leave right now.",
"what": [
  "A hint picks out one arrow whose path off the board is clear right now and lights it up. Tap it and it slides away like any free arrow. A hint never points at an arrow hidden under a shutter, and on a guardian level it skips any arrow the guardian's ward is holding back, looking again after every hit, since a hit can move the ward.",
  "Every player starts with 3 free hints. They're a stock you carry from level to level, not 3 per level. Once they're used, a hint costs 30 coins, or, on Android, a short video.",
  "A hint can't lead you astray. In Exitwise, taking an arrow off the board never blocks another one: it can only open paths. So there is no wrong order to clear a board in, and any free arrow is a safe move. The hard part is spotting one, and that's all a hint does. It doesn't solve the level for you; it shows you one way forward."
],
"how": [
  "Hints are allowed on leaderboard runs, unlike powerups and continues, and they don't lower a run's points.",
  "When you're not sure, a hint is cheaper than a guess: a blocked tap costs a heart, and every heart lost takes points off the level's score. A hint costs neither."
]
```

## Exitwise · Hearts (`exitwise/wiki/wiki.json`, slug `hearts`)

```json
"summary": "You have 3. Tapping a blocked arrow costs one.",
"what": [
  "You start every level with 3 hearts. Tapping an arrow that's blocked costs a heart. When you run out, the attempt is over.",
  "Tapping a free arrow never costs anything. Because taking an arrow off the board never blocks another, the order you clear a board in can't trap you: every heart you lose starts with a tap on an arrow that wasn't free yet.",
  "Hearts also decide what a win is worth. Each heart lost takes points off that level's score, and a win without losing one is a perfect clear: it pays 5 extra coins and counts on the Perfect board."
],
"how": [
  "Before you tap, follow the arrow's line to the edge of the board. If anything sits in the way, another arrow, a rock or a gate of another colour, the arrow is blocked.",
  "When you're out of hearts you can continue once with 100 coins for 3 hearts, or, on Android, watch a video for full hearts. Each continue works once per attempt.",
  "Or tap Retry to start the level again with all 3 hearts."
],
"notes": [
  "A run with a continue doesn't go on the leaderboard."
]
```

## Speedometer Live Wallpaper · CPU clock mode (`speedometer-wallpaper/wiki/wiki.json`, slug `cpu-clock`)

```json
"summary": "How fast the processor runs, as a share of its top speed.",
"what": [
  "In CPU clock mode the needle shows how hard your phone's processor is being pushed: how fast its cores are running right now, as a percentage of the fastest they can run.",
  "A phone's processor has several cores, often of different sizes, and each one speeds up and slows down many times a second. The wallpaper reads every core's current speed and its top speed, adds them up, and shows the first total as a share of the second. A core with nothing to report counts as zero, so a phone resting on the home screen reads low, and a game or a big download pushes the needle up.",
  "It takes a reading once a second and smooths it over about three seconds, so the needle sweeps like a real rev counter instead of twitching."
],
"how": [
  "The percentage is about speed, not how busy the processor is. A phone saving battery can run busy cores slowly, so 40% doesn't mean 40% busy.",
  "Some phones don't allow apps to read the CPU clock. On those, the gauge shows -- instead of a number, and it does the same when a phone reports a speed that can't be real, such as a core running faster than its own top speed. Use power or GPS speed instead."
]
```

## Palermo Noir · Seer (`palermo/wiki/wiki.json`, slug `seer`)

```json
"summary": "Once a game, at night, learns one player's exact role.",
"what": [
  "One night of your choice, you look at a player and learn their role, not just their side. Any other night, tap Not tonight.",
  "The look happens on your phone and nowhere else. At night, hold your secret actions to open them, pick a player, and their card turns over for you alone. Because you see the card itself, a look sees through the players who pass the Detective's check as not a killer: the Henchman, the Kamikaze and the Hidden Killer.",
  "One look is all you get, so choose well, and keep it to yourself: the killers will want to know who has it. The narrator still calls the Seer every night, even once she's out of the game, so the TV never tells the town whether she's gone."
],
"how": [
  "An early look can steer the town's first votes; a late one can settle a close final vote. Either way, the hard part comes after: use what you've seen without giving yourself away."
]
```
