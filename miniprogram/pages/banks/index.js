const dataset = require('../../data/bank-rates')
const utils = require('../../utils/bank-rate-utils')

Page({
  data: {
    currencies: dataset.currencies,
    currencyCode: 'GBP',
    currency: dataset.currencies[0],
    quoteType: 'spotSell',
    cnyAmount: '50000',
    rows: [], best: null, savingText: '--', availableCount: 0,
    demo: dataset.demo, quotedAt: dataset.quotedAt
  },
  onLoad() { this.refreshRanking() },
  selectCurrency(event) {
    const currencyCode = event.currentTarget.dataset.code
    const currency = dataset.currencies.find(item => item.code === currencyCode)
    if (!currency) return
    this.setData({ currencyCode, currency }, () => this.refreshRanking())
  },
  selectQuoteType(event) {
    this.setData({ quoteType: event.currentTarget.dataset.type }, () => this.refreshRanking())
  },
  updateAmount(event) {
    this.setData({ cnyAmount: event.detail.value }, () => this.refreshRanking())
  },
  refreshRanking() {
    const result = utils.rankBanks(
      dataset.banks, this.data.currency, this.data.quoteType, this.data.cnyAmount
    )
    this.setData(result)
  },
  copySource(event) {
    const row = this.data.rows.find(item => item.id === event.currentTarget.dataset.id)
    if (!row) return
    wx.setClipboardData({ data: row.sourceUrl })
  }
})
