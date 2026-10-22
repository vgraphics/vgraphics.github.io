// Makes every screenshot gallery on the page interactive ([data-gallery] sections from tools/gallery.mjs).
// Stage: drag, swipe or use the buttons; the phone in front opens the lightbox. Path: one shot at a time, picked
// on the level trail, moving on by itself until someone touches it. Story: the phone follows the captions as the
// page scrolls. The lightbox zooms (tap, pinch, wheel) and pages (swipe, arrow keys). No dependencies.
(() => {
  'use strict'
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
  const h = (tag, attrs = {}, kids = []) => {
    const e = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') e.textContent = v
      else if (k === 'html') e.innerHTML = v
      else e.setAttribute(k, v)
    }
    e.append(...[].concat(kids))
    return e
  }
  // Chunky arrows like the game's own, and the other button pictures.
  const ICON = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><path d="M4 12l6.2-5.6v11.2z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h11" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><path d="M20 12l-6.2-5.6v11.2z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  }
  const button = (cls, icon, label) => h('button', { class: cls, type: 'button', 'aria-label': label, html: ICON[icon] })

  class Gallery {
    constructor(root) {
      this.root = root
      this.layout = root.dataset.gallery
      this.slides = [...root.querySelectorAll('.g-slide')]
      this.n = this.slides.length
      this.i = -1
      this.pics = this.slides.map((s) => s.querySelector('picture'))
      this.shots = this.slides.map((s) => ({
        line: s.querySelector('.g-line')?.textContent ?? '',
        text: s.querySelector('.g-text')?.textContent ?? '',
        tag: s.querySelector('.g-tag b')?.textContent ?? '',
        accent: s.style.getPropertyValue('--accent'),
      }))
      this.live = h('p', { class: 'g-sr', 'aria-live': 'polite' })
      root.append(this.live)
      this.slides.forEach((s, i) => s.querySelector('.g-phone')?.addEventListener('click', () => this.tap(i)))
      root.classList.add('is-ready')
      LAYOUTS[this.layout]?.(this)
      if (this.layout !== 'story') {
        root.addEventListener('keydown', (e) => {
          if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea')) return
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault()
            this.step(e.key === 'ArrowLeft' ? -1 : 1)
          }
        })
      }
      this.show(0, true)
    }

    tap(i) {
      if (this.suppress) return
      if (i !== this.i && this.layout === 'stage') return this.show(i)
      Box.open(this, i, document.activeElement)
    }

    step(d) { this.show((this.i + d + this.n) % this.n) }

    show(i, quiet) {
      if (i === this.i) return
      this.i = i
      this.slides.forEach((s, k) => s.classList.toggle('is-current', k === i))
      this.root.style.setProperty('--accent', this.shots[i].accent)
      this.onShow?.(i)
      // The story's captions are read in place as the page scrolls, so only the other layouts announce the change.
      if (!quiet && this.layout !== 'story') this.live.textContent = `Screenshot ${i + 1} of ${this.n}: ${this.shots[i].line}`
    }

    // The previous, the numbered bubbles and the next, for the stage.
    controls() {
      const prev = button('g-btn', 'prev', 'Previous screenshot')
      const next = button('g-btn', 'next', 'Next screenshot')
      prev.addEventListener('click', () => this.step(-1))
      next.addEventListener('click', () => this.step(1))
      this.dots = this.shots.map((s, i) => {
        const dot = h('button', { class: 'g-dot', type: 'button', style: `--accent: ${s.accent}`, 'aria-label': `Screenshot ${i + 1}: ${s.line}`, text: String(i + 1) })
        dot.addEventListener('click', () => this.show(i))
        return dot
      })
      return h('div', { class: 'g-controls' }, [prev, h('ul', { class: 'g-dots' }, this.dots.map((d) => h('li', {}, d))), next])
    }

    // Horizontal drags and swipes on `area`: onMove(dx) while dragging, onEnd(dx) at the end. A drag swallows the
    // click that would follow it.
    swipe(area, onMove, onEnd) {
      let x0, y0, id, dragging = false
      area.addEventListener('pointerdown', (e) => {
        if (e.button || !e.isPrimary) return
        x0 = e.clientX
        y0 = e.clientY
        id = e.pointerId
        dragging = false
      })
      area.addEventListener('pointermove', (e) => {
        if (e.pointerId !== id) return
        const dx = e.clientX - x0
        if (!dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - y0)) {
          dragging = true
          area.setPointerCapture(id)
          this.root.classList.add('is-dragging')
        }
        if (dragging) onMove?.(dx)
      })
      const end = (e) => {
        if (e.pointerId !== id) return
        id = undefined
        if (!dragging) return
        dragging = false
        this.root.classList.remove('is-dragging')
        this.suppress = true
        setTimeout(() => (this.suppress = false), 0)
        onEnd(e.clientX - x0)
      }
      area.addEventListener('pointerup', end)
      area.addEventListener('pointercancel', end)
    }
  }

  const LAYOUTS = {
    stage(g) {
      const { root, slides, n } = g
      const panel = root.querySelector('.g-panel')
      const track = root.querySelector('.g-track')
      const now = h('div', { class: 'g-now' })
      track.after(now, g.controls())
      let pos = 0
      // Where each phone stands for a (possibly fractional) position: in front, beside it, behind, or gone. The
      // stylesheet says how many may show each side (--reach).
      const place = () => {
        const reach = parseFloat(getComputedStyle(track).getPropertyValue('--reach')) || 3
        slides.forEach((s, k) => {
          let d = (((k - pos) % n) + n) % n
          if (d > n / 2) d -= n
          const a = Math.abs(d)
          const sgn = Math.sign(d)
          const k1 = Math.min(a, 1), k2 = clamp(a - 1, 0, 1), k3 = clamp(a - 2, 0, 1)
          s.style.setProperty('--k', (sgn * (0.86 * k1 + 0.66 * k2 + 0.5 * k3)).toFixed(4))
          s.style.setProperty('--sc', (1 - 0.17 * k1 - 0.13 * k2 - 0.1 * k3).toFixed(4))
          s.style.setProperty('--ry', `${(-sgn * (22 * k1 + 10 * k2)).toFixed(2)}deg`)
          s.style.setProperty('--op', clamp(reach - a, 0, 1).toFixed(3))
          s.style.setProperty('--br', (1 - 0.2 * k1 - 0.14 * k2).toFixed(3))
          s.style.setProperty('--sa', (1 - 0.15 * k1).toFixed(3))
          s.style.setProperty('--z', String(100 - Math.round(a * 10)))
          s.style.visibility = a >= reach ? 'hidden' : ''
        })
      }
      matchMedia('(min-width: 1180px)').addEventListener('change', place)
      g.onShow = (i) => {
        pos = i
        place()
        const cap = slides[i].querySelector('.g-cap')
        now.replaceChildren(...[...cap.children].map((c) => c.cloneNode(true)))
        now.querySelector('.g-line')?.classList.add('g-lettered')
        slides.forEach((s, k) => {
          const phone = s.querySelector('.g-phone')
          if (k === i) phone.removeAttribute('tabindex')
          else phone.setAttribute('tabindex', '-1')
        })
        g.dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)))
      }
      g.swipe(track, (dx) => {
        pos = g.i - dx / (slides[0].offsetWidth * 0.9)
        place()
      }, (dx) => {
        const target = Math.round(g.i - dx / (slides[0].offsetWidth * 0.9))
        const i = ((target % n) + n) % n
        if (i === g.i) { pos = i; place() } else g.show(i)
      })
      let wheel = 0, wheelAt = 0
      track.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
        e.preventDefault()
        if (performance.now() - wheelAt < 380) return
        wheel += e.deltaX
        if (Math.abs(wheel) > 40) {
          g.step(Math.sign(wheel))
          wheel = 0
          wheelAt = performance.now()
        }
      }, { passive: false })
      // The things from the game drift a little with the pointer.
      panel.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || motion.matches) return
        const r = panel.getBoundingClientRect()
        panel.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
        panel.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
      })
    },

    path(g) {
      const { root, slides, n, shots } = g
      const track = root.querySelector('.g-track')
      const DWELL = 6000
      const trail = h('div', { class: 'g-trail' })
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('aria-hidden', 'true')
      const road = document.createElementNS(svg.namespaceURI, 'path')
      const steps = document.createElementNS(svg.namespaceURI, 'path')
      road.setAttribute('class', 'g-road')
      steps.setAttribute('class', 'g-steps')
      svg.append(road, steps)
      trail.append(svg)
      // The trail winds left to right, like the levels on the game's map.
      const spots = shots.map((_, k) => [6 + (k * 88) / (n - 1), 50 + Math.sin(k * 1.15 + 0.5) * 26])
      const nodes = shots.map((s, k) => {
        const level = s.tag.replace(/\D+/g, '') || String(k + 1)
        const node = h('button', {
          class: 'g-node', type: 'button', style: `--accent: ${s.accent}; --nx: ${spots[k][0]}; --ny: ${spots[k][1]}`,
          'aria-label': `${s.tag}: ${s.line}`,
          html: `<svg class="g-ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" pathLength="100"/></svg>`,
        })
        node.append(level)
        node.addEventListener('click', () => { g.show(k); stopFor('chose') })
        return node
      })
      trail.append(...nodes)
      if (root.dataset.hand) trail.append(h('span', { class: 'g-hand', 'aria-hidden': 'true' }, h('img', { src: root.dataset.hand, alt: '' })))
      const hand = trail.querySelector('.g-hand')
      const draw = () => {
        const w = trail.clientWidth, ht = trail.clientHeight
        const p = spots.map(([x, y]) => [(x / 100) * w, (y / 100) * ht])
        let d = `M${p[0][0]} ${p[0][1]}`
        for (let k = 1; k < p.length; k++) {
          const [x0, y0] = p[k - 1], [x1, y1] = p[k], mx = (x0 + x1) / 2
          d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
        }
        road.setAttribute('d', d)
        steps.setAttribute('d', d)
      }
      new ResizeObserver(draw).observe(trail)
      const count = h('span', { class: 'g-count' })
      const prev = button('g-btn', 'prev', 'Previous screenshot')
      const next = button('g-btn', 'next', 'Next screenshot')
      const toggle = button('g-btn', 'pause', 'Pause the slideshow')
      prev.addEventListener('click', () => { g.step(-1); stopFor('chose') })
      next.addEventListener('click', () => { g.step(1); stopFor('chose') })
      toggle.addEventListener('click', () => {
        wanted = !wanted
        sync()
      })
      track.after(trail, h('div', { class: 'g-trail-bar' }, [count, h('div', { class: 'g-pair' }, [prev, toggle, next])]))

      // It moves on by itself every few seconds while the reader wants it to (not when they asked for less motion,
      // paused it or picked a shot themselves), and holds while they point at the big shot, move through it with the
      // keyboard, or look elsewhere.
      let wanted = !motion.matches
      const holds = new Set(['away'])
      let timer
      const sync = () => {
        clearTimeout(timer)
        const running = wanted && holds.size === 0
        root.classList.toggle('is-playing', running)
        toggle.innerHTML = wanted ? ICON.pause : ICON.play
        toggle.setAttribute('aria-label', wanted ? 'Pause the slideshow' : 'Play the slideshow')
        if (running) timer = setTimeout(() => g.step(1), DWELL)
      }
      const stopFor = (why) => {
        if (why === 'chose') wanted = false
        else holds.add(why)
        sync()
      }
      const goFor = (why) => { holds.delete(why); sync() }
      root.style.setProperty('--g-dwell', `${DWELL}ms`)
      track.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && stopFor('hover'))
      track.addEventListener('pointerleave', () => goFor('hover'))
      root.addEventListener('focusin', (e) => e.target.matches(':focus-visible') && stopFor('focus'))
      root.addEventListener('focusout', (e) => !root.contains(e.relatedTarget) && goFor('focus'))
      document.addEventListener('visibilitychange', () => (document.hidden ? stopFor('hidden') : goFor('hidden')))
      new IntersectionObserver(([e]) => (e.isIntersecting ? goFor('away') : stopFor('away')), { threshold: 0.35 }).observe(root)
      g.swipe(track, null, (dx) => {
        if (Math.abs(dx) > 50) g.step(dx < 0 ? 1 : -1)
        stopFor('chose')
      })
      g.onShow = (i) => {
        slides.forEach((s, k) => (s.inert = k !== i))
        nodes.forEach((nd, k) => nd.setAttribute('aria-current', String(k === i)))
        if (hand) {
          hand.style.setProperty('--nx', spots[i][0])
          hand.style.setProperty('--ny', spots[i][1])
        }
        count.textContent = `${i + 1} of ${n}`
        sync()
      }
    },

    story(g) {
      const { root, slides, n } = g
      const panel = root.querySelector('.g-panel')
      const track = root.querySelector('.g-track')
      const box = h('div', { class: 'g-stagebox' })
      const screen = h('span', { class: 'g-screen' })
      const phone = h('button', { class: 'g-phone', type: 'button' }, screen)
      const worlds = slides.map((s) => s.querySelector('.g-world'))
      worlds.forEach((w) => w && box.append(w))
      g.pics.forEach((p) => screen.append(p))
      slides.forEach((s) => s.querySelector('.g-fig > .g-phone')?.remove())
      phone.addEventListener('click', () => Box.open(g, g.i, phone))
      box.append(phone)
      const picks = root.querySelector('.g-backdrop .g-pickups')
      if (picks) box.append(picks)
      box.append(h('span', { class: 'g-meter', 'aria-hidden': 'true' }, h('span')))
      const rail = h('div', { class: 'g-rail', 'aria-hidden': 'true' }, [h('span', { class: 'g-rail-track' }), h('span', { class: 'g-rail-body' })])
      panel.insertBefore(box, track)
      panel.insertBefore(rail, track)

      // The chapter in the reading band is the current one: the middle of the screen beside the phone, or the
      // space under the phone on narrow screens.
      const narrow = matchMedia('(max-width: 899px)')
      let io
      const watch = () => {
        io?.disconnect()
        io = new IntersectionObserver((entries) => {
          for (const e of entries) if (e.isIntersecting) g.show(slides.indexOf(e.target))
        }, { rootMargin: narrow.matches ? '-66% 0px -22% 0px' : '-46% 0px -46% 0px' })
        slides.forEach((s) => io.observe(s))
      }
      watch()
      narrow.addEventListener('change', watch)
      let ticking = false
      const progress = () => {
        ticking = false
        const r = track.getBoundingClientRect()
        const mid = innerHeight * (narrow.matches ? 0.7 : 0.5)
        panel.style.setProperty('--p', clamp((mid - r.top) / r.height, 0, 1).toFixed(4))
      }
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(progress) } }, { passive: true })
      addEventListener('resize', progress)
      progress()
      g.onShow = (i) => {
        worlds.forEach((w, k) => w?.classList.toggle('is-on', k === i))
        g.pics.forEach((p, k) => p.classList.toggle('is-on', k === i))
        phone.setAttribute('aria-label', `Enlarge screenshot ${i + 1} of ${n}: ${g.shots[i].line}`)
      }
    },
  }

  // One lightbox for every gallery on the page.
  const Box = {
    build() {
      const dlg = h('dialog', { class: 'g-box', 'aria-label': 'Screenshot' })
      this.closeBtn = button('g-btn g-box-close', 'close', 'Close')
      this.stage = h('div', { class: 'g-box-stage' })
      this.prev = button('g-btn', 'prev', 'Previous screenshot')
      this.next = button('g-btn', 'next', 'Next screenshot')
      this.cap = h('p', { class: 'g-box-cap', 'aria-live': 'polite' })
      this.hint = h('p', { class: 'g-box-hint', 'aria-hidden': 'true', text: 'Tap to zoom · swipe for more' })
      dlg.append(this.closeBtn, this.stage, h('div', { class: 'g-box-bar' }, [this.prev, this.cap, this.next]))
      this.stage.append(this.hint)
      document.body.append(dlg)
      this.dlg = dlg
      this.closeBtn.addEventListener('click', () => dlg.close())
      this.prev.addEventListener('click', () => this.set(this.i - 1, -1))
      this.next.addEventListener('click', () => this.set(this.i + 1, 1))
      dlg.addEventListener('close', () => {
        document.documentElement.classList.remove('g-lock')
        this.opener?.focus?.({ preventScroll: true })
      })
      dlg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.set(this.i - 1, -1)
        else if (e.key === 'ArrowRight') this.set(this.i + 1, 1)
        else if (e.key === '+' || e.key === '=') this.zoomAt(this.center(), this.scale * 1.5)
        else if (e.key === '-') this.zoomAt(this.center(), this.scale / 1.5)
        else return
        e.preventDefault()
      })
      // A tap on the dark space beside the picture closes it (not the end of a drag that started on the picture).
      let downOnSpace = false
      dlg.addEventListener('pointerdown', (e) => (downOnSpace = e.target === dlg || e.target === this.stage))
      dlg.addEventListener('click', (e) => {
        if (downOnSpace && (e.target === dlg || e.target === this.stage)) dlg.close()
      })
      this.gestures()
    },

    open(g, i, opener) {
      if (!this.dlg) this.build()
      this.g = g
      this.opener = opener
      document.documentElement.classList.add('g-lock')
      this.dlg.showModal()
      this.set(i, 0)
    },

    set(i, dir) {
      const g = this.g
      this.i = (i + g.n) % g.n
      const pic = g.pics[this.i].cloneNode(true)
      pic.classList.remove('is-on')
      const ratio = g.slides[0] ? getComputedStyle(g.root).getPropertyValue('--ratio') || '0.5' : '0.5'
      const sizes = `min(92vw, (100svh - 190px) * ${ratio.trim()})`
      pic.querySelectorAll('source, img').forEach((s) => s.setAttribute('sizes', sizes))
      const img = pic.querySelector('img')
      img.className = 'g-box-img'
      img.loading = 'eager'
      img.draggable = false
      if (dir && !motion.matches) {
        img.classList.add('is-swap')
        img.style.setProperty('--dir', dir)
      }
      this.stage.querySelector('picture')?.remove()
      this.stage.prepend(pic)
      this.img = img
      this.reset()
      const s = g.shots[this.i]
      this.cap.replaceChildren(h('b', { text: s.line }), h('span', { text: `${s.tag} · ${this.i + 1} of ${g.n}` }))
    },

    reset() {
      this.scale = 1
      this.x = this.y = 0
      this.apply()
    },
    apply() {
      if (!this.img) return
      this.img.style.transform = this.scale === 1 ? '' : `translate(${this.x}px, ${this.y}px) scale(${this.scale})`
      this.dlg.classList.toggle('is-zoomed', this.scale > 1)
    },
    center() {
      const r = this.img.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    },
    // Zoom to `scale`, keeping the point under the finger (or the pointer) where it is.
    zoomAt(p, scale) {
      scale = clamp(scale, 1, 3.5)
      if (scale === 1) return this.reset()
      const base = this.base()
      const wx = (p.x - base.left - this.x) / this.scale
      const wy = (p.y - base.top - this.y) / this.scale
      this.x = p.x - base.left - wx * scale
      this.y = p.y - base.top - wy * scale
      this.scale = scale
      this.pan(0, 0)
    },
    // The picture's box before zooming.
    base() {
      const r = this.img.getBoundingClientRect()
      return { left: r.left - this.x, top: r.top - this.y, width: r.width / this.scale, height: r.height / this.scale }
    },
    pan(dx, dy) {
      const b = this.base()
      this.x = clamp(this.x + dx, b.width * (1 - this.scale), 0)
      this.y = clamp(this.y + dy, b.height * (1 - this.scale), 0)
      this.apply()
    },

    gestures() {
      const st = this.stage
      const pts = new Map()
      let x0, y0, lastX, lastY, moved, pinch
      st.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.g-box-img')) return
        st.setPointerCapture(e.pointerId)
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (pts.size === 1) {
          x0 = lastX = e.clientX
          y0 = lastY = e.clientY
          moved = false
        } else if (pts.size === 2) {
          const [a, b] = [...pts.values()]
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: this.scale }
          moved = true
        }
      })
      st.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId)) return
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (pts.size === 2 && pinch) {
          const [a, b] = [...pts.values()]
          this.zoomAt({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, (pinch.s * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d)
          return
        }
        if (Math.hypot(e.clientX - x0, e.clientY - y0) > 8) moved = true
        if (this.scale > 1) this.pan(e.clientX - lastX, e.clientY - lastY)
        else if (moved && !motion.matches) this.img.style.transform = `translateX(${(e.clientX - x0) * 0.6}px)`
        lastX = e.clientX
        lastY = e.clientY
      })
      const up = (e) => {
        if (!pts.delete(e.pointerId)) return
        if (pts.size) return
        pinch = null
        const dx = e.clientX - x0, dy = e.clientY - y0
        if (!moved) return this.scale > 1 ? this.reset() : this.zoomAt({ x: e.clientX, y: e.clientY }, 2.4)
        if (this.scale > 1) return
        if (dx < -60 && Math.abs(dx) > Math.abs(dy)) this.set(this.i + 1, 1)
        else if (dx > 60 && Math.abs(dx) > Math.abs(dy)) this.set(this.i - 1, -1)
        else if (dy > 110) this.dlg.close()
        else this.apply()
      }
      st.addEventListener('pointerup', up)
      st.addEventListener('pointercancel', up)
      st.addEventListener('wheel', (e) => {
        if (!this.img) return
        e.preventDefault()
        this.zoomAt({ x: e.clientX, y: e.clientY }, this.scale * (e.deltaY < 0 ? 1.18 : 1 / 1.18))
      }, { passive: false })
    },
  }

  const start = () => document.querySelectorAll('[data-gallery]').forEach((root) => new Gallery(root))
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
