// Exitwise's boards without VHub's pictures (exitwise/ranking/boards.js; 29 Oct 2026: George's ranking said "Couldn't
// load the ranking" during a deploy, most likely because /assets/vhub-avatars.js didn't come, which then failed the
// whole board): the board loads and names its players while the pictures' script fails, the ranking page draws its
// rows and trophies with plain discs, each later draw asks for the script again, past the cache, and the pictures fill
// in when it comes.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

/** Just enough of an element for boards.js, ranking.js and vhub-avatars.js. */
function element(tag = 'div') {
  const node = {
    tag, id: '', className: '', title: '', hidden: false, disabled: false, tabIndex: 0, src: '',
    style: {}, dataset: {}, attrs: {}, children: [], parent: null, text: '', html: '', removed: false,
    get textContent() { return node.text + node.children.map((c) => c.textContent).join('') },
    set textContent(value) { node.replaceChildren(); node.text = String(value) },
    get innerHTML() { return node.html },
    set innerHTML(value) {
      node.replaceChildren()
      node.html = String(value)
      if (node.html.startsWith('<svg')) node.append(element('svg'))
    },
    get firstElementChild() { return node.children[0] ?? null },
    setAttribute(key, value) { node.attrs[key] = String(value) },
    getAttribute(key) { return node.attrs[key] ?? null },
    removeAttribute(key) { delete node.attrs[key] },
    addEventListener() {},
    focus() {},
    append(...children) {
      for (const c of children) {
        if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c)
        c.parent = node
        node.children.push(c)
      }
    },
    appendChild(c) { node.append(c); return c },
    replaceChildren(...children) {
      for (const c of node.children) c.parent = null
      node.children = []
      node.text = ''
      node.html = ''
      node.append(...children)
    },
    remove() {
      node.removed = true
      if (node.parent) node.parent.children = node.parent.children.filter((x) => x !== node)
      node.parent = null
    },
    querySelector() { return null },
  }
  return node
}

/** Every element under `node` carrying the class. */
const find = (node, name) => node.children.flatMap((c) => [...(c.className.split(' ').includes(name) ? [c] : []), ...find(c, name)])
const until = async (ok, what) => {
  for (let i = 0; i < 400 && !ok(); i++) await new Promise((resolve) => setTimeout(resolve, 5))
  assert.ok(ok(), what)
}

// The page: the ranking's ids, its four tabs, and a head the pictures' script is added to, which only the tests answer.
const ids = new Map()
const byId = (id) => ids.get(id) ?? ids.set(id, Object.assign(element(), { id })).get(id)
const tabs = ['score', 'perfect', 'maps', 'creators'].map((board) => Object.assign(element('button'), { id: `tab-${board}`, className: 'tab', dataset: { board } }))
const asked = []
globalThis.window = globalThis
globalThis.location = { search: '', hostname: 'vgraphics.gr', pathname: '/exitwise/ranking/', hash: '' }
globalThis.history = { replaceState() {} }
globalThis.matchMedia = () => ({ matches: true })
globalThis.addEventListener = () => {}
globalThis.document = {
  createElement: element,
  getElementById: byId,
  querySelectorAll: (selector) => (selector === '.tab' ? tabs : []),
  head: Object.assign(element('head'), { append(script) { asked.push(script) } }),
}

// VHub's Score board: three players, one without a name and one without a preset.
const entry = (uid, fields) => ({ document: { name: `projects/vgraphics-vhub/databases/(default)/documents/leaderboards/exitwise.score/entries/${uid}`, fields } })
const ANSWER = [
  { readTime: '2026-10-29T14:30:00Z' },
  entry('ann00001', { name: { stringValue: 'Ann' }, avatar: { integerValue: '3' }, value: { integerValue: '900' }, tiebreak: { integerValue: '60' } }),
  entry('bobb0002', { avatar: { integerValue: '5' }, value: { integerValue: '700' }, tiebreak: { integerValue: '41' } }),
  entry('cara0003', { name: { stringValue: 'Cara' }, value: { integerValue: '650' }, tiebreak: { integerValue: '40' } }),
]
globalThis.fetch = async (url) => {
  assert.match(url, /\/leaderboards\/exitwise\.score:runQuery\?key=/)
  return { ok: true, json: async () => ANSWER }
}

await import('../../exitwise/ranking/boards.js')
const boards = window.ExitwiseBoards

test('a board loads and names its players when the pictures\' script fails', async () => {
  const loading = boards.loadBoard('score')
  await until(() => asked.length === 1, 'the board asks for the pictures')
  assert.equal(asked[0].src, '/assets/vhub-avatars.js')
  asked[0].onerror()
  const { players } = await loading
  assert.deepEqual(players.map((p) => [p.rank, p.name, p.stats.score]), [[1, 'Ann', 900], [2, null, 700], [3, 'Cara', 650]])
  assert.equal(asked[0].removed, true, 'the failed script leaves the page')
  assert.equal(boards.anonymous(players[1].uid), 'Player BOBB')

  // A picture drawn without them is the page's plain disc, and asks again past the cache.
  const avatar = element('span')
  avatar.append(element('svg'))
  boards.drawAvatar(avatar, players[0])
  assert.equal(avatar.children.length, 0, 'a plain disc')
  assert.equal(asked.length, 2)
  assert.equal(asked[1].src, '/assets/vhub-avatars.js?retry=1')
  asked[1].onerror()
})

test('the ranking draws its rows and trophies with plain discs, then the pictures when they come', async () => {
  await import('../../exitwise/ranking/ranking.js')
  await until(() => asked.length === 3, 'the first board asks for the pictures again')
  assert.equal(asked[2].src, '/assets/vhub-avatars.js?retry=2')
  asked[2].onerror()

  const rows = byId('rows')
  await until(() => rows.children.length === 3 && !rows.children[0].className.includes('skeleton'), 'the rows are drawn')
  assert.equal(byId('state').hidden, true, 'no error state')
  assert.match(byId('updated').textContent, /^Updated/)
  assert.deepEqual(find(rows, 'name').map((n) => n.textContent), ['Ann', 'Player BOBB', 'Cara'])
  const trophies = find(byId('trophies'), 'trophy')
  assert.equal(trophies.length, 3)
  const avatars = [...find(rows, 'avatar'), ...find(byId('trophies'), 'avatar')]
  assert.equal(avatars.length, 6)
  assert.ok(avatars.every((a) => a.children.length === 0), 'plain discs')

  // The draw asked once more; this time the script comes, and every picture fills in.
  assert.equal(asked.length, 4)
  assert.equal(asked[3].src, '/assets/vhub-avatars.js?retry=3')
  await import('../../assets/vhub-avatars.js')
  asked[3].onload()
  await until(() => avatars.every((a) => a.children[0]?.tag === 'svg'), 'the pictures fill in')
  assert.equal(asked[3].removed, false)
})
