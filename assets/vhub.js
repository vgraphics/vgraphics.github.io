// The VHub entry on a product's pages (tools/lib/partials.mjs vhubEntry: every closing card, and Palermo Noir's links):
// "Get your VHub name" for everyone, and for a player signed in to VHub on this site, their VHub name and picture,
// linking to their profile (George, 28 Oct 2026: "I am logged in. Shouldnt it show my name and avatar here?").
// The session and the profile come from assets/vhub-session.js; the picture is drawn by assets/vhub-avatars.js. A guest
// without a name keeps "Get your VHub name". menu.js loads this file on a page with an entry.
import { vhubAvatars, vhubProfile, vhubSession } from "/assets/vhub-session.js";

const entries = document.querySelectorAll("[data-vhub]");

(async () => {
  if (!entries.length) return;
  const session = await vhubSession();
  if (!session) return;
  const profile = await vhubProfile(session.uid);
  if (!profile || !profile.name) return;
  // Without the pictures' drawing the entry keeps its face, but still names the player.
  const pictures = await vhubAvatars();
  const player = { uid: session.uid, avatar: profile.avatar, photo: profile.photo };
  for (const a of entries) {
    a.href = "/hub/profile/";
    a.classList.add("signed-in");
    a.setAttribute("aria-label", `${profile.name}: your VHub profile`);
    if (pictures) pictures.draw(a.querySelector(".vhub-face"), player);
    a.querySelector(".vhub-name").textContent = profile.name;
    const note = a.querySelector(".vhub-note");
    if (note) note.textContent = "Your VHub profile";
  }
})();
