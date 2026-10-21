// The ad switch of every VGraphics web game on vgraphics.gr: Exitwise at /exitwise/play/ today, Παλέρμο Νουάρ and
// Quizfall later. Each game's play page loads this file before it decides about ads, so turning ads on or off is a change
// here and a push: no game build, no release. A missing file, a value that isn't well formed, or a game without an entry
// means no ads in that game. README.md ("Ads on the web games") says how to switch; tools/check-site.mjs checks the file.
window.VGRAPHICS_WEB_ADS = {
  // The Google AdSense publisher id ("ca-pub-" and 16 digits). Public anyway: ads.txt lists it, and every page with ads
  // shows it.
  client: "ca-pub-7821189101210154",
  // The banner under each game (AdSense display ads). true once Google has approved vgraphics.gr (AdSense → Sites:
  // "Ready").
  banners: false,
  // The in-game ads: an interstitial between levels and rewarded videos (H5 Games Ads). true only once Google has
  // approved the account for H5 Games Ads, a separate application made after the site's approval.
  gameAds: false,
  // One entry per web game, under the name its play page asks for. bannerSlot is the data-ad-slot of the game's AdSense
  // display unit (digits, in quotes), or null for no banner in that game.
  games: {
    exitwise: { bannerSlot: "6387474555" }, // "Exitwise play banner"
    palermo: { bannerSlot: null }, // Παλέρμο Νουάρ
    quizfall: { bannerSlot: null } // Quizfall
  }
};
