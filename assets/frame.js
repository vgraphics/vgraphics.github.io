// The frame block (tools/lib/frames.mjs): a product's build, served by a repo of its own, framed full screen on the
// product's page from the same origin. The frame loads the block's address (the build and its route) with this page's
// own query and hash, so a room code from a QR or a shared link reaches the game; it loads nothing before this runs, so
// the build never starts twice. Once loaded it takes the keys, so a TV remote or a keyboard plays without a click.
(() => {
  for (const frame of document.querySelectorAll("iframe.frame[data-src]")) {
    const to = new URL(frame.dataset.src, location.href);
    new URLSearchParams(location.search).forEach((value, key) => {
      if (key !== "route") to.searchParams.append(key, value);
    });
    to.hash = location.hash;
    frame.addEventListener("load", () => {
      if (frame.contentWindow) frame.contentWindow.focus();
    }, { once: true });
    frame.src = to.pathname + to.search + to.hash;
  }
})();
