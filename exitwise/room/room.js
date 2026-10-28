// The page a room invite opens (the game's RoomLink.cs, the card in room.html): computers and iPhones go straight to
// the web game in the room; Android opens the app in the room, or offers the web game and Google Play when it isn't
// installed.
(function () {
  var params = new URLSearchParams(location.search);
  // Codes have 6 capitals and digits, never I, O, 0 or 1 (RoomCode.cs).
  var code = (params.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) return;
  document.getElementById("code").textContent = code;
  // The browser game joins the room it is opened with (?room=).
  var game = "/exitwise/play/?room=" + code;
  var play = document.getElementById("play");
  play.href = game;
  if (!/Android/i.test(navigator.userAgent)) {
    // No app to open here (computers, iPhones): straight into the room in the browser. replace() keeps this page
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
  // Chrome opens the game in the room, or comes back here with &app=none when it isn't installed.
  var fallback = encodeURIComponent(location.origin + location.pathname + "?code=" + code + "&app=none");
  var intent = "intent://room/" + code + "#Intent;scheme=exitwise;package=com.vgraphics.exitwise;S.browser_fallback_url=" + fallback + ";end";
  var open = document.getElementById("open");
  open.href = intent;
  open.classList.remove("hidden");
  location.href = intent;
})();
