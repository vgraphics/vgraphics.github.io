// The signed-in VHub player's little picture in the header's VHub link, between its violet dot and the word (George, 23 Oct
// 2026: "if im logged in show litttle avatar at left of VHub and at right of purple dod"), in the frame their rank shows
// (26 Oct: "It should show with the badge too."), on every page with the company header; a player with a photo always
// shows the photo (27 Oct: "If I have image show it. Dont show avatar."). The static pages don't run VHub: VHub's web app
// (/hub/) keeps a small marker in this site's localStorage while someone is signed in, { v: 1, name, pic, photo?,
// frame? }: photo is their approved photo's own address in VHub's Storage (an <img> loads it, no CORS needed), pic the
// preset of a player without a photo as a data: URL, and frame the art on this site with its opening's place. When
// neither draws, the name's initial shows. It's removed on sign-out. Without the marker the link stays as it is. The
// hub's hub/src/me-marker.ts writes it; keep the two in step.
(function () {
  var KEY = 'vhub.me'
  // How far a frame may reach, in picture diameters, before the picture shrinks to keep it in the header (wings).
  var REACH = 1.6
  // An approved photo's address as the hub writes it: VHub's own bucket (or the local Storage emulator), 96 px.
  var PHOTO = /^(https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/vgraphics-vhub\.firebasestorage\.app|http:\/\/(127\.0\.0\.1|localhost):\d{2,5}\/v0\/b\/[a-z0-9.-]+)\/o\/photos%2F[A-Za-z0-9]{1,128}%2F\d{1,18}%2F96\.jpg\?alt=media$/

  function fraction(n, low, high) {
    return typeof n === 'number' && isFinite(n) && n >= low && n <= high
  }

  // The frame's art: only the hub's own frame images on this site, with a sane opening.
  function frameOf(f) {
    if (!f || typeof f.src !== 'string' || !/^\/hub\/frames\/[a-z]+\.webp$/.test(f.src)) return null
    if (!fraction(f.width, 1, 4096) || !fraction(f.height, 1, 4096)) return null
    if (!fraction(f.cx, 0, 1) || !fraction(f.cy, 0, 1) || !fraction(f.r, 0.05, 0.5)) return null
    return f
  }

  function read() {
    try {
      var me = JSON.parse(localStorage.getItem(KEY) || 'null')
      if (!me || me.v !== 1 || typeof me.name !== 'string') return null
      // A picture held in the marker itself, or the photo at VHub's own address: nothing else is loaded.
      var pic = typeof me.pic === 'string' && /^data:image\/(svg\+xml|jpeg|png|webp)[;,]/.test(me.pic) ? me.pic : null
      var photo = typeof me.photo === 'string' && PHOTO.test(me.photo) ? me.photo : null
      return { name: me.name, pic: pic, photo: photo, frame: frameOf(me.frame) }
    } catch (e) {
      return null
    }
  }

  function initial(name) {
    var first = (name.trim().match(/[\s\S]/u) || ['?'])[0]
    return first.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
  }

  // The photo first, else the preset; the initial only when neither draws.
  function face(me) {
    var src = me.photo || me.pic
    if (src) {
      var img = document.createElement('img')
      img.className = 'n-me-pic'
      img.alt = ''
      img.width = 64
      img.height = 64
      img.decoding = 'async'
      // The photo's address tells Google nothing about the page it's shown on.
      if (src === me.photo) img.referrerPolicy = 'no-referrer'
      img.src = src
      // A picture that won't load (offline, blocked, removed) gives way to the initial, never a broken icon, and never
      // to a preset the player doesn't use.
      img.addEventListener('error', function () {
        img.replaceWith(face({ name: me.name, pic: null, photo: null }))
      })
      return img
    }
    var letter = document.createElement('span')
    letter.className = 'n-me-initial'
    letter.textContent = initial(me.name)
    return letter
  }

  function badge(me) {
    var box = document.createElement('span')
    box.className = 'n-me'
    box.setAttribute('aria-hidden', 'true')
    box.append(face(me))
    var f = me.frame
    if (f) {
      var across = 1 / (2 * f.r)
      var down = (across * f.height) / f.width
      box.classList.add('has-frame')
      box.style.setProperty('--fa', across.toFixed(4))
      box.style.setProperty('--fd', down.toFixed(4))
      box.style.setProperty('--fs', Math.min(1, REACH / Math.max(across, down)).toFixed(4))
      box.style.setProperty('--fx', String(f.cx))
      box.style.setProperty('--fy', String(f.cy))
      var art = document.createElement('img')
      art.className = 'n-me-frame'
      art.alt = ''
      art.width = f.width
      art.height = f.height
      art.decoding = 'async'
      art.src = f.src
      // A frame that won't load leaves the picture alone.
      art.addEventListener('error', function () {
        box.classList.remove('has-frame')
        art.remove()
      })
      box.append(art)
    }
    return box
  }

  function show() {
    var me = read()
    var links = document.querySelectorAll('.site-nav a.n-hub')
    for (var i = 0; i < links.length; i++) {
      var a = links[i]
      var old = a.querySelector('.n-me')
      if (old) a.removeChild(old)
      if (!me) {
        a.classList.remove('has-me')
        a.removeAttribute('title')
        continue
      }
      a.insertBefore(badge(me), a.firstChild)
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
