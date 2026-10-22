// The storybook block of the product pages (markup: tools/build-pages.mjs; the text version's look: storybook.css). The
// page holds the first chapter's lines and the chapter list as text; this swaps in the game's own HTML reader (the
// web game's StreamingAssets/Storybook/reader, loaded before this), opened at the chapter list with the visitor's
// progress: what the web game on this site wrote as it saved (localStorage, data-progress), or else nothing won, so
// the prologue and the first world's opening are open and every other chapter waits locked with "Play to unlock". The
// music cues play only after the reader's music button (data-audio). Without the reader the text version stays.
(() => {
  const mount = document.querySelector(".storybook[data-book]");
  const reader = window.ExitwiseStorybook;
  if (!mount || !reader) return;
  const base = mount.dataset.book;
  let progress = { levelsWon: 0, read: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(mount.dataset.progress) || "null");
    if (saved && typeof saved.levelsWon === "number") progress = { levelsWon: saved.levelsWon, read: Array.isArray(saved.read) ? saved.read : [] };
  } catch (e) {
    // Private browsing may refuse storage: the visitor reads as a new player.
  }
  fetch(base + "/storybook.json")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.status))))
    .then((book) => {
      mount.textContent = "";
      reader.open({
        book,
        base,
        panelExt: "jpg",
        mode: "book",
        progress,
        overlay: false,
        mount,
        playUrl: mount.dataset.play,
        audio: mount.dataset.audio ? { base: mount.dataset.audio } : null,
      });
    })
    .catch(() => {});
})();
