// Speedometer's market counts (speedometer-wallpaper/market/market.js stats(); George, 31 Oct 2026: "Shouldnt it just
// count the layouts?", after the landing said 5 layouts while 8 were live): the landing counts the live layouts on the
// server each visit, never from a stored number, with two aggregation queries the market's own indexes serve. A refused
// count fails, so the chapter shows "–".
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'

const NOW = Date.parse('2026-11-02T10:00:00.000Z')
const SPEEDO = 'https://firestore.googleapis.com/v1/projects/speedometer-wallpaper/databases/(default)/documents'
const live = { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'live' } } }

// The market answers each aggregation as Firestore does; `refuse` answers as the rules do when they refuse it.
const asked = []
let refuse = false
const aliases = (body) => body.structuredAggregationQuery.aggregations.map((a) => a.alias)
globalThis.window = globalThis
globalThis.location = { search: '', hostname: 'vgraphics.gr', pathname: '/speedometer-wallpaper/', hash: '' }
globalThis.fetch = async (url, init) => {
  const body = init && init.body ? JSON.parse(init.body) : undefined
  asked.push({ url, body })
  if (refuse) return { ok: false, status: 403, json: async () => ({}) }
  const aggregateFields = aliases(body).includes('live')
    ? { live: { integerValue: '8' }, uses: { integerValue: '72' } }
    : { newThisWeek: { integerValue: '3' } }
  return { ok: true, status: 200, json: async () => [{ result: { aggregateFields }, readTime: '2026-11-02T10:00:00Z' }] }
}

await import('../../speedometer-wallpaper/market/market.js')
const market = window.SpeedoMarket

test('counts the live layouts, those of the last 7 days and their uses on the server, on the tabs\' indexes', async () => {
  asked.length = 0
  assert.deepEqual(await market.stats(NOW), { live: 8, newThisWeek: 3, uses: 72 })
  assert.deepEqual(asked.map((a) => a.url), [`${SPEEDO}:runAggregationQuery`, `${SPEEDO}:runAggregationQuery`])
  const byAlias = (alias) => asked.find((a) => aliases(a.body).includes(alias)).body
  // No limit: every live layout counts. Ordered as the Popular tab, on its (status, uses desc) index.
  assert.deepEqual(byAlias('live'), {
    structuredAggregationQuery: {
      structuredQuery: {
        from: [{ collectionId: 'layouts' }],
        where: { compositeFilter: { op: 'AND', filters: [live] } },
        orderBy: [{ field: { fieldPath: 'uses' }, direction: 'DESCENDING' }],
      },
      aggregations: [{ alias: 'live', count: {} }, { alias: 'uses', sum: { field: { fieldPath: 'uses' } } }],
    },
  })
  // Published in the last 7 days, ordered as the New tab, on its (status, createdAt desc) index.
  assert.deepEqual(byAlias('newThisWeek'), {
    structuredAggregationQuery: {
      structuredQuery: {
        from: [{ collectionId: 'layouts' }],
        where: { compositeFilter: { op: 'AND', filters: [live, { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: '2026-10-26T10:00:00.000Z' } } }] } },
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      },
      aggregations: [{ alias: 'newThisWeek', count: {} }],
    },
  })
})

test('never reads a stored count', async () => {
  asked.length = 0
  await market.stats(NOW)
  assert.ok(asked.every((a) => !a.url.includes('marketStats') && !JSON.stringify(a.body).includes('marketStats')))
})

test('a count the market refuses fails, so the page shows "–" and no number', async () => {
  refuse = true
  try {
    await assert.rejects(market.stats(NOW), /The market refused the count/)
  } finally {
    refuse = false
  }
})
