// The signed-in VHub player's little picture in the header's VHub link, between its violet dot and the word (George, 23 Oct
// 2026: "if im logged in show litttle avatar at left of VHub and at right of purple dod"), on every page with the
// company header. The static pages load nothing from Firebase: VHub's web app (/hub/) keeps a small marker in this
// site's localStorage while someone is signed in, { v: 1, name, pic } with the picture as a data: URL, and removes it
// on sign-out. Without the marker the link stays as it is. The hub's hub/src/me-marker.ts writes it; keep the two in step.
(function () {
  var KEY = 'vhub.me'

  function read() {
    try {
      var me = JSON.parse(localStorage.getItem(KEY) || 'null')
      if (!me || me.v !== 1 || typeof me.pic !== 'string' || typeof me.name !== 'string') return null
      // Only an image held in the marker itself: nothing is fetched from another site.
      return /^data:image\/(svg\+xml|jpeg|png|webp)[;,]/.test(me.pic) ? me : null
    } catch (e) {
      return null
    }
  }

  function drop(e) {
    var pic = e.currentTarget
    var a = pic.parentNode
    if (!a) return
    a.removeChild(pic)
    a.classList.remove('has-me')
  }

  function show() {
    var me = read()
    var links = document.querySelectorAll('.site-nav a.n-hub')
    for (var i = 0; i < links.length; i++) {
      var a = links[i]
      var pic = a.querySelector('.n-me')
      if (!me) {
        if (pic) a.removeChild(pic)
        a.classList.remove('has-me')
        a.removeAttribute('title')
        continue
      }
      if (!pic) {
        pic = document.createElement('img')
        pic.className = 'n-me'
        pic.alt = ''
        pic.width = 22
        pic.height = 22
        pic.decoding = 'async'
        // A picture the browser can't draw (an old marker, a bad file) leaves the link as it was, never a broken icon.
        pic.addEventListener('error', drop)
        a.insertBefore(pic, a.firstChild)
      }
      if (pic.getAttribute('src') !== me.pic) pic.setAttribute('src', me.pic)
      a.classList.add('has-me')
      a.setAttribute('title', 'Signed in to VHub as ' + me.name)
    }
  }

  show()
  // Signing in or out in another tab, or in the hub on this page.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === null) show()
  })
  window.addEventListener('vhub-me', show)
})()
