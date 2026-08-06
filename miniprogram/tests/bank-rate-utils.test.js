const test = require('node:test')
const assert = require('node:assert/strict')
const { normalizeRate, rankBanks } = require('../utils/bank-rate-utils')

const currency = { code: 'JPY', displayUnit: 100, decimals: 4, amountDecimals: 0 }
const banks = [
  { id: 'a', name: 'A', shortName: 'A', sourceUrl: 'a', quotes: { JPY: { spotSell: 4.2, cashSell: 4.3, unit: 100 } } },
  { id: 'b', name: 'B', shortName: 'B', sourceUrl: 'b', quotes: { JPY: { spotSell: 4.1, cashSell: 4.4, unit: 100 } } },
  { id: 'c', name: 'C', shortName: 'C', sourceUrl: 'c', quotes: { JPY: { spotSell: null, cashSell: null, unit: 100 } } }
]

test('normalizes source quote to CNY per one foreign currency', () => {
  assert.equal(normalizeRate(4.2, 100), 0.042)
  assert.equal(normalizeRate(null, 100), null)
})

test('ranks lower bank sell rate first and excludes missing quote', () => {
  const result = rankBanks(banks, currency, 'spotSell', 4100)
  assert.equal(result.rows[0].id, 'b')
  assert.equal(result.rows[0].isBest, true)
  assert.equal(result.rows[0].foreignAmountText, '100000')
  assert.equal(result.rows[2].available, false)
  assert.equal(result.availableCount, 2)
})

test('cash comparison can produce a different winner', () => {
  const result = rankBanks(banks, currency, 'cashSell', 4400)
  assert.equal(result.rows[0].id, 'a')
})
