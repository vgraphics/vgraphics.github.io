// Makes every screenshot gallery on the page interactive ([data-gallery] sections from tools/gallery.mjs).
// The stage: drag, swipe or use the buttons; the phone in front opens the lightbox, which zooms (tap, pinch, wheel)
// and pages (swipe, arrow keys). No dependencies.
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
      {
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
      if (i !== this.i) return this.show(i)
      Box.open(this, i, document.activeElement)
    }

    step(d) { this.show((this.i + d + this.n) % this.n) }

    show(i, quiet) {
      if (i === this.i) return
      this.i = i
      this.slides.forEach((s, k) => s.classList.toggle('is-current', k === i))
      this.root.style.setProperty('--accent', this.shots[i].accent)
      this.onShow?.(i)
      if (!quiet) this.live.textContent = `Screenshot ${i + 1} of ${this.n}: ${this.shots[i].line}`
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
      // Every caption, stacked in one cell (see .g-now): the box keeps the longest one's height.
      const items = slides.map((s) => {
        const item = h('div', { class: 'g-now-item' }, [...s.querySelector('.g-cap').children].map((c) => c.cloneNode(true)))
        item.querySelector('.g-line')?.classList.add('g-lettered')
        return item
      })
      const now = h('div', { class: 'g-now' }, items)
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
        items.forEach((item, k) => {
          item.classList.toggle('is-on', k === i)
          item.inert = k !== i
        })
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
