// The page a friend's challenge opens (the game's ChallengeLink.cs and ChallengePlatform.cs, the card in
// challenge.html): computers and iPhones go straight to the web game with the challenge; Android opens the app on it,
// or offers the web game and Google Play when it isn't installed. The run comes as
// ?challenge=LEVEL.TIME_MS.HEARTS_LOST.LEVEL_SET.BOARD&by=NAME; the game checks it again and builds the board.
(function () {
  var params = new URLSearchParams(location.search);
  var run = (params.get("challenge") || "").split(".");
  if (run.length !== 5 || !run.every(function (part) { return /^\d{1,10}$/.test(part); })) return;
  var level = Number(run[0]);
  var ms = Number(run[1]);
  if (level < 1 || ms < 1) return;
  var seconds = Math.floor(ms / 1000);
  document.getElementById("level").textContent = "Beat their run on level " + level;
  document.getElementById("time").textContent = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  document.getElementById("hearts").textContent = String(Number(run[2]));
  document.getElementById("run").classList.remove("hidden");
  // The web game and the app read the same query. The name goes on only when it could be a player's name
  // (Username.cs); the game drops any it wouldn't allow.
  var by = params.get("by") || "";
  var query = "challenge=" + run.join(".") + (/^[A-Za-z0-9_]{3,16}$/.test(by) ? "&by=" + by : "");
  var game = "/exitwise/play/?" + query;
  var play = document.getElementById("play");
  play.href = game;
  if (!/Android/i.test(navigator.userAgent)) {
    // No app to open here (computers, iPhones): straight into the challenge in the browser. replace() keeps this page
    // out of the history, so Back doesn't come here again.
    location.replace(game);
    return;
  }
  var get = document.getElementById("get");
  get.href = "https://play.google.com/store/apps/details?id=com.vgraphics.exitwise";
  get.textContent = "Get it on Google Play";
  if (params.get("app") === "none") {
    // Back from Chrome below: the game isn't installed, so the browser game comes first.
    play.className = "invite-button primary";
    return;
  }
  // Chrome opens the game on the challenge, or comes back here with &app=none when it isn't installed.
  var fallback = encodeURIComponent(location.origin + location.pathname + "?" + query + "&app=none");
  var intent = "intent://challenge/?" + query + "#Intent;scheme=exitwise;package=com.vgraphics.exitwise;S.browser_fallback_url=" + fallback + ";end";
  var open = document.getElementById("open");
  open.href = intent;
  open.classList.remove("hidden");
  location.href = intent;
})();
