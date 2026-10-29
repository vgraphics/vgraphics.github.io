// VHub players' pictures on the static pages (assets/vhub-avatars.js) in the rank frame they wear: the frame stands on
// the page with nothing behind it (George, 29 Oct 2026, on his Exitwise picture in the bronze frame on a dark disc in a
// white square: "remove that white/black background. It seems bad. Fix it. Fix for all."), so the box's own disc and
// ring give way to it, and the frames' drawings are see-through; and the drawing is sized from the avatar, also when
// the page draws it before the avatar is on the page (29 Oct: George's frame many times too big on the ranking).
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

/** Just enough of an element for vhub-avatars.js: its inline style, dataset, parent and children. */
function element(tag) {
  const node = {
    tag, style: {}, dataset: {}, children: [], parent: null,
    get firstElementChild() { return node.children[0] },
    set innerHTML(html) { node.replaceChildren(element(html.startsWith('<svg') ? 'svg' : 'span')) },
    append(...children) {
      for (const c of children) {
        c.parent?.removeChild(c)
        c.parent = node
        node.children.push(c)
      }
    },
    removeChild(c) {
      node.children = node.children.filter((x) => x !== c)
      c.parent = null
    },
    replaceChildren(...children) {
      for (const c of node.children) c.parent = null
      node.children = []
      node.append(...children)
    },
    replaceWith(...nodes) {
      const parent = node.parent
      for (const n of nodes) n.parent?.removeChild(n)
      parent.children.splice(parent.children.indexOf(node), 1, ...nodes)
      for (const n of nodes) n.parent = parent
      node.parent = null
    },
    querySelector(selector) {
      assert.equal(selector, ':scope > [data-frame-box]')
      return node.children.find((c) => 'frameBox' in c.dataset) ?? null
    },
  }
  return node
}

globalThis.window = {}
globalThis.location = { search: '', hostname: 'vgraphics.gr' }
globalThis.document = { createElement: element }
// As a browser answers for an element not on the page yet: no position at all.
globalThis.getComputedStyle = () => ({ position: '' })
await import('../../assets/vhub-avatars.js')
const { draw, shownFrame } = window.VHubAvatars

// The box that places the frame's drawing, and the drawing.
const frameBoxOf = (avatar) => avatar.children.find((c) => 'frameBox' in c.dataset)
const frameOf = (avatar) => frameBoxOf(avatar)?.children.find((c) => c.tag === 'img' && 'frameArt' in c.dataset)

test('a framed picture stands in its frame with nothing of its box behind it', () => {
  // A ranking row's box: a grey disc; the podium's: a white disc in a white ring.
  const box = element('span')
  draw(box, { uid: 'george', avatar: 3, photo: null, level: 40, frame: 'bronze' })
  assert.equal(box.dataset.framed, 'bronze')
  assert.equal(box.style.background, 'transparent', 'no disc')
  assert.equal(box.style.boxShadow, 'none', 'no ring')
  assert.equal(box.style.overflow, 'visible')
  const art = frameOf(box)
  assert.equal(art.src, '/hub/frames/bronze.webp')
  for (const key of ['background', 'backgroundColor', 'boxShadow', 'border']) assert.equal(art.style[key], undefined, key)
})

test('a frame drawn before the avatar is on the page is sized from the avatar', () => {
  // 29 Oct: the ranking, the podium and the other pages draw into a new element and add it to the page after; left
  // unpositioned, Garithos's mythic frame took its size from the ranking's row and the podium's card.
  const avatar = element('span')
  draw(avatar, { uid: 'garithos', avatar: 2, photo: '1792290013766', level: 519, frame: 'mythic' })
  const box = frameBoxOf(avatar)
  assert.ok(box, 'a box of its own places the drawing')
  assert.deepEqual([box.parent, box.style.position, box.style.display, box.style.width, box.style.height],
    [avatar, 'relative', 'block', '100%', '100%'], 'the box fills the avatar and anchors the drawing')
  assert.equal(avatar.children.length, 1)
  const [picture, art] = box.children
  assert.equal(picture.tag, 'img')
  assert.equal(art.style.position, 'absolute')
  // In percent of the avatar's side: 1.5 pictures at most, its opening (mythic's 0.4993, 0.502) on the centre.
  const [left, top, width, height] = ['left', 'top', 'width', 'height'].map((k) => parseFloat(art.style[k]))
  assert.ok(Math.max(width, height) <= 150.01, `${width}% × ${height}%`)
  assert.ok(Math.abs(left + 0.4993 * width - 50) < 0.01, `left ${left}%`)
  assert.ok(Math.abs(top + 0.502 * height - 50) < 0.01, `top ${top}%`)

  // A photo that won't load: the preset, in the same frame, placed the same way.
  picture.onerror()
  assert.equal(avatar.children.length, 1)
  assert.equal(frameBoxOf(avatar).children[0].tag, 'svg')
  assert.ok(frameOf(avatar))
})

test('a tighter reach keeps the frame in less room, and plain() takes it off', () => {
  // The header's avatar: 1.35 pictures at most (assets/account.js HEADER_REACH).
  const avatar = element('span')
  draw(avatar, { uid: 'george', avatar: 3, photo: null, level: 200, frame: 'amethyst' }, 96, 1.35)
  const [width, height] = ['width', 'height'].map((k) => parseFloat(frameOf(avatar).style[k]))
  assert.ok(Math.max(width, height) <= 135.01, `${width}% × ${height}%`)
  window.VHubAvatars.plain(avatar)
  assert.equal(avatar.dataset.framed, undefined)
  assert.equal(frameBoxOf(avatar), undefined)
  assert.equal(avatar.children[0].tag, 'svg', 'the picture stays')
})

test('drawn again without a frame, the box is the page’s own again', () => {
  const box = element('span')
  draw(box, { uid: 'george', avatar: 3, photo: null, level: 40, frame: 'bronze' })
  draw(box, { uid: 'eleni', avatar: 5, photo: null })
  assert.equal(box.dataset.framed, undefined)
  for (const key of ['background', 'boxShadow', 'overflow']) assert.equal(box.style[key], '', key)
  assert.ok(!box.style.position, 'the avatar itself is never repositioned')
  assert.equal(frameBoxOf(box), undefined)
  assert.equal(box.children.length, 1, 'only the picture')
  assert.equal(box.children[0].tag, 'svg')
})

test('a frame the level no longer reaches gives way to the best one it does; an unknown one to none', () => {
  assert.equal(shownFrame('gold', 60), 'gold')
  assert.equal(shownFrame('gold', 35), 'bronze')
  assert.equal(shownFrame('gold', undefined), 'gold')
  assert.equal(shownFrame('wood', 4), null)
  assert.equal(shownFrame('obsidian', 100), null)
  assert.equal(shownFrame('constructor', 100), null)
})

test("every frame's drawing is a WebP with its alpha channel", () => {
  for (const id of ['wood', 'stone', 'iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'sapphire', 'ruby', 'amethyst', 'diamond', 'mythic']) {
    const webp = readFileSync(new URL(`../../hub/frames/${id}.webp`, import.meta.url))
    assert.equal(webp.toString('ascii', 0, 4) + webp.toString('ascii', 8, 16), 'RIFFWEBPVP8X', id)
    // VP8X's alpha flag, and the alpha chunk itself.
    assert.equal(webp[20] & 0x10, 0x10, id)
    assert.ok(webp.includes('ALPH'), id)
  }
})
