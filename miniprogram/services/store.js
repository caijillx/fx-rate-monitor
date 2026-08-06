const ALERTS_KEY = 'fx_alerts_v1'
const MEMBER_KEY = 'fx_member_v1'

const defaultAlerts = [
  { id: 'usd-30d', pair: 'USD_CNY', pairText: 'USD / CNY', type: '30d', typeText: '30 日新低', enabled: true }
]

function bootstrap() {
  if (!wx.getStorageSync(ALERTS_KEY)) wx.setStorageSync(ALERTS_KEY, defaultAlerts)
  if (!wx.getStorageSync(MEMBER_KEY)) wx.setStorageSync(MEMBER_KEY, { active: false, plan: '免费版', expiredAt: '' })
}

function getAlerts() { return wx.getStorageSync(ALERTS_KEY) || [] }
function saveAlerts(alerts) { wx.setStorageSync(ALERTS_KEY, alerts) }
function getMembership() { return wx.getStorageSync(MEMBER_KEY) || { active: false, plan: '免费版', expiredAt: '' } }
function saveMembership(member) { wx.setStorageSync(MEMBER_KEY, member) }

module.exports = { bootstrap, getAlerts, saveAlerts, getMembership, saveMembership }
