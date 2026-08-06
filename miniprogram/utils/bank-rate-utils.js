function normalizeRate(value, sourceUnit) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return null
  return number / (Number(sourceUnit) || 1)
}

function rankBanks(banks, currency, quoteType, cnyAmount) {
  const amount = Math.max(0, Number(cnyAmount) || 0)
  const ranked = banks.map(bank => {
    const rawQuote = bank.quotes[currency.code]
    const normalized = rawQuote ? normalizeRate(rawQuote[quoteType], rawQuote.unit) : null
    return {
      id: bank.id,
      name: bank.name,
      shortName: bank.shortName,
      sourceUrl: bank.sourceUrl,
      available: normalized !== null,
      rate: normalized,
      rateText: normalized === null ? '--' : (normalized * currency.displayUnit).toFixed(currency.decimals),
      foreignAmount: normalized === null ? 0 : amount / normalized,
      foreignAmountText: normalized === null ? '--' : (amount / normalized).toFixed(currency.amountDecimals),
      quotedAt: rawQuote && rawQuote.quotedAt ? rawQuote.quotedAt : '--'
    }
  }).sort((a, b) => {
    if (!a.available) return 1
    if (!b.available) return -1
    return a.rate - b.rate
  })

  const available = ranked.filter(item => item.available)
  const best = available[0]
  ranked.forEach((item, index) => {
    item.rank = item.available ? index + 1 : '--'
    item.isBest = Boolean(best && item.id === best.id)
    item.diffText = item.available && best
      ? `+${Math.max(0, best.foreignAmount - item.foreignAmount).toFixed(currency.amountDecimals)}`
      : '--'
  })
  const worst = available[available.length - 1]
  return {
    rows: ranked,
    best,
    savingText: best && worst
      ? Math.max(0, best.foreignAmount - worst.foreignAmount).toFixed(currency.amountDecimals)
      : '--',
    availableCount: available.length
  }
}

module.exports = { normalizeRate, rankBanks }
