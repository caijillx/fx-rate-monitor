const test = require('node:test')
const assert = require('node:assert/strict')
const { summarize, nextRun, countdownText } = require('../utils/rate-utils')

test('summarize detects a 30-day low', () => {
  const result = summarize({ key: 'USD_CNY', history: [...Array(29).fill(7.1), 7.0] })
  assert.equal(result.status, '30d_low')
  assert.equal(result.currentText, '7.0000')
})

test('summarize keeps normal status above prior lows', () => {
  const result = summarize({ key: 'GBP_CNY', history: [...Array(29).fill(9.0), 9.2] })
  assert.equal(result.status, 'normal')
  assert.equal(result.low30Text, '9.0000')
})

test('next run selects the next configured hour', () => {
  const now = new Date(2026, 7, 6, 13, 30, 0)
  assert.equal(nextRun(now).getHours(), 16)
  assert.equal(countdownText(now, nextRun(now)), '02:30:00')
})
