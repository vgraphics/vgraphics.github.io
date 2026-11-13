// tools/check-live.mjs, how it judges a redirect chain, without the network: every old or alternative address is one
// 301 to its page, but http://www., whose first hop Hostinger's edge makes before .htaccess (decided 13 Nov 2026).
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allowedChains, chainVerdict, walk } from '../check-live.mjs'

const bare = 'https://vgraphics.gr/exitwise/wiki/auto-play/'
const httpBare = 'http://vgraphics.gr/exitwise/wiki/auto-play/'
const httpsWww = 'https://www.vgraphics.gr/exitwise/wiki/auto-play/'
const httpWww = 'http://www.vgraphics.gr/exitwise/wiki/auto-play/'

const moved = (location) => ({ status: 301, location })
const page = { status: 200, location: '' }

/** A fake site: each address answers what the map says, and anything else a 404. */
const site = (answers) => {
  const asked = []
  const get = async (url) => (asked.push(url), answers[url] ?? { status: 404, location: '' })
  return { get, asked }
}

/** check-live's own path for one address: walk as far as the longest allowed chain allows, then judge. */
const judge = async (from, to, answers) => {
  const most = Math.max(...allowedChains(from, to).map((c) => c.length))
  return chainVerdict(from, to, await walk(from, most, site(answers).get))
}

test('only http://www. may take the edge hop: http://, https://www. and the old addresses stay one 301', () => {
  assert.deepEqual(allowedChains(httpWww, bare), [[bare], [httpsWww, bare]])
  assert.deepEqual(allowedChains('http://WWW.vgraphics.gr/', 'https://vgraphics.gr/'), [['https://vgraphics.gr/'], ['https://www.vgraphics.gr/', 'https://vgraphics.gr/']])
  assert.deepEqual(allowedChains(httpBare, bare), [[bare]])
  assert.deepEqual(allowedChains(httpsWww, bare), [[bare]])
  assert.deepEqual(allowedChains('https://vgraphics.gr/index.php/contact/', 'https://vgraphics.gr/#contact'), [['https://vgraphics.gr/#contact']])
})

test('http://www. passes on the chain Hostinger makes: http://www. -> 301 https://www. -> 301 the bare address', async () => {
  const v = await judge(httpWww, bare, { [httpWww]: moved(httpsWww), [httpsWww]: moved(bare), [bare]: page })
  assert.equal(v.ok, true, v.result)
  assert.match(v.result, /Hostinger's edge/)
  // The home page too.
  const home = await judge('http://www.vgraphics.gr/', 'https://vgraphics.gr/', {
    'http://www.vgraphics.gr/': moved('https://www.vgraphics.gr/'),
    'https://www.vgraphics.gr/': moved('https://vgraphics.gr/'),
    'https://vgraphics.gr/': page,
  })
  assert.equal(home.ok, true, home.result)
})

test('http://www. in one 301 still passes (if Hostinger ever stops its edge hop)', async () => {
  const v = await judge(httpWww, bare, { [httpWww]: moved(bare), [bare]: page })
  assert.equal(v.ok, true, v.result)
  assert.equal(v.result, `301 -> ${bare}`)
})

test('http:// and https://www. must be exactly one 301: the same two-hop chain fails for them', async () => {
  const http = await judge(httpBare, bare, { [httpBare]: moved(httpsWww), [httpsWww]: moved(bare), [bare]: page })
  assert.equal(http.ok, false)
  assert.match(http.result, /2 hops, want one 301 to /)
  const www = await judge(httpsWww, bare, { [httpsWww]: moved(`${bare}?x`), [`${bare}?x`]: moved(bare), [bare]: page })
  assert.equal(www.ok, false)
  assert.match(www.result, /2 hops/)
  // And their one 301 passes.
  assert.equal((await judge(httpBare, bare, { [httpBare]: moved(bare), [bare]: page })).ok, true)
  assert.equal((await judge(httpsWww, bare, { [httpsWww]: moved(bare), [bare]: page })).ok, true)
})

test('a third hop fails, and the walk stops there instead of following a loop', async () => {
  const loop = 'https://vgraphics.gr/exitwise/wiki/auto-play'
  const { get, asked } = site({ [httpWww]: moved(httpsWww), [httpsWww]: moved(bare), [bare]: moved(loop), [loop]: moved(bare) })
  const v = chainVerdict(httpWww, bare, await walk(httpWww, 2, get))
  assert.equal(v.ok, false)
  assert.match(v.result, /3 hops/)
  assert.deepEqual(asked, [httpWww, httpsWww, bare])
})

test('the edge hop is only accepted to exactly https://www.<same path>, and then exactly to the bare address', async () => {
  // First hop somewhere else: http:// on the bare domain, then https.
  const viaHttp = await judge(httpWww, bare, { [httpWww]: moved(httpBare), [httpBare]: moved(bare), [bare]: page })
  assert.equal(viaHttp.ok, false)
  // First hop to another path.
  const other = 'https://www.vgraphics.gr/'
  const viaOther = await judge(httpWww, bare, { [httpWww]: moved(other), [other]: moved(bare), [bare]: page })
  assert.equal(viaOther.ok, false)
  // Second hop to another page.
  const wrong = 'https://vgraphics.gr/'
  const toWrong = await judge(httpWww, bare, { [httpWww]: moved(httpsWww), [httpsWww]: moved(wrong), [wrong]: page })
  assert.equal(toWrong.ok, false)
  assert.match(toWrong.result, /want one 301 to .* or 301 -> https:\/\/www\./)
})

test('every hop must be a 301: a 302 fails, even as the edge hop', async () => {
  const edge302 = await judge(httpWww, bare, { [httpWww]: { status: 302, location: httpsWww }, [httpsWww]: moved(bare), [bare]: page })
  assert.equal(edge302.ok, false)
  assert.match(edge302.result, /^302 -> /)
  const second302 = await judge(httpWww, bare, { [httpWww]: moved(httpsWww), [httpsWww]: { status: 302, location: bare }, [bare]: page })
  assert.equal(second302.ok, false)
  assert.match(second302.result, /then 302 -> /)
})

test('no redirect at all, or a chain that ends on something other than a page, fails', async () => {
  const none = await judge(httpBare, bare, { [httpBare]: page })
  assert.equal(none.ok, false)
  assert.match(none.result, /^200, want one 301 to /)
  const gone = await judge(httpWww, bare, { [httpWww]: moved(httpsWww), [httpsWww]: moved(bare), [bare]: { status: 404, location: '' } })
  assert.equal(gone.ok, false)
  assert.match(gone.result, /which answers 404$/)
})

test('an old address is one 301 to its page: a relative Location is read against it, and the #fragment is never sent', async () => {
  const from = 'https://vgraphics.gr/index.php/contact/'
  const { get, asked } = site({ [from]: moved('/#contact'), 'https://vgraphics.gr/': page })
  const v = chainVerdict(from, 'https://vgraphics.gr/#contact', await walk(from, 1, get))
  assert.equal(v.ok, true, v.result)
  assert.deepEqual(asked, [from, 'https://vgraphics.gr/'])
})
