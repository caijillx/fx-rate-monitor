const seed = require('../../data/rates')
const store = require('../../services/store')
const utils = require('../../utils/rate-utils')

Page({
  data: {
    pairs: [], active: {}, activeKey: 'GBP_CNY', member: {}, countdown: '--:--:--',
    source: seed.source, updatedAt: '2026-08-06 14:17'
  },
  onLoad() {
    const pairs = Object.values(seed.pairs).map(utils.summarize)
    this.setData({ pairs, active: pairs[0] })
    this.updateCountdown()
    this.timer = setInterval(() => this.updateCountdown(), 1000)
  },
  onShow() { this.setData({ member: store.getMembership() }) },
  onReady() { this.drawChart() },
  onUnload() { clearInterval(this.timer) },
  updateCountdown() {
    const now = new Date()
    this.setData({ countdown: utils.countdownText(now, utils.nextRun(now)) })
  },
  selectPair(event) {
    const key = event.currentTarget.dataset.key
    const active = this.data.pairs.find(item => item.key === key)
    if (!active) return
    this.setData({ activeKey: key, active }, () => this.drawChart())
  },
  drawChart() {
    const query = wx.createSelectorQuery().in(this)
    query.select('#rateChart').fields({ node: true, size: true }).exec(result => {
      if (!result[0]) return
      const canvas = result[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2
      const width = result[0].width
      const height = result[0].height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      const values = this.data.active.history
      const min = Math.min(...values), max = Math.max(...values), span = max - min || 1
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = 'rgba(190,219,202,.10)'
      ctx.lineWidth = 1
      ;[20, height / 2, height - 20].forEach(y => { ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(width - 8, y); ctx.stroke() })
      const points = values.map((value, index) => ({
        x: 8 + index * (width - 16) / (values.length - 1),
        y: 20 + (max - value) * (height - 40) / span
      }))
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(185,248,79,.25)')
      gradient.addColorStop(1, 'rgba(185,248,79,0)')
      ctx.beginPath(); ctx.moveTo(points[0].x, height - 20)
      points.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.lineTo(points[points.length - 1].x, height - 20); ctx.closePath(); ctx.fillStyle = gradient; ctx.fill()
      ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
      ctx.strokeStyle = '#b9f84f'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke()
      const end = points[points.length - 1]
      ctx.beginPath(); ctx.arc(end.x, end.y, 4, 0, Math.PI * 2); ctx.fillStyle = '#b9f84f'; ctx.fill()
    })
  },
  goAlerts() { wx.switchTab({ url: '/pages/alerts/index' }) },
  goMembership() { wx.switchTab({ url: '/pages/membership/index' }) }
})
