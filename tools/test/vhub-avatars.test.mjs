// VHub players' pictures on the static pages (assets/vhub-avatars.js) in the rank frame they wear: the frame stands on
// the page with nothing behind it (George, 29 Oct 2026, on his Exitwise picture in the bronze frame on a dark disc in a
// white square: "remove that white/black background. It seems bad. Fix it. Fix for all."), so the box's own disc and
// ring give way to it, and the frames' drawings are see-through.
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

/** Just enough of an element for vhub-avatars.js: its inline style, dataset and children. */
function element(tag) {
  const node = {
    tag, style: {}, dataset: {}, children: [], attrs: {},
    get firstElementChild() { return node.children[0] },
    set innerHTML(html) { node.children = [element(html.startsWith('<svg') ? 'svg' : 'span')] },
    append(child) { node.children.push(child) },
    replaceChildren(...children) { node.children = children },
    querySelectorAll(selector) {
      assert.equal(selector, ':scope > img[data-frame-art]')
      return node.children.filter((c) => c.tag === 'img' && 'frameArt' in c.dataset)
        .map((c) => Object.assign(c, { remove: () => { node.children = node.children.filter((x) => x !== c) } }))
    },
  }
  return node
}

globalThis.window = {}
globalThis.location = { search: '', hostname: 'vgraphics.gr' }
globalThis.document = { createElement: element }
globalThis.getComputedStyle = () => ({ position: 'static' })
await import('../../assets/vhub-avatars.js')
const { draw, shownFrame } = window.VHubAvatars

const frameOf = (box) => box.children.find((c) => c.tag === 'img' && 'frameArt' in c.dataset)

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

test('drawn again without a frame, the box is the page’s own again', () => {
  const box = element('span')
  draw(box, { uid: 'george', avatar: 3, photo: null, level: 40, frame: 'bronze' })
  draw(box, { uid: 'eleni', avatar: 5, photo: null })
  assert.equal(box.dataset.framed, undefined)
  for (const key of ['background', 'boxShadow', 'overflow', 'position']) assert.equal(box.style[key], '', key)
  assert.equal(frameOf(box), undefined)
  assert.equal(box.children.length, 1, 'only the picture')
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
