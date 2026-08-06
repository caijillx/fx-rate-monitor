const store = require('../../services/store')

Page({
  data: { member: {}, alertCount: 0 },
  onShow() { this.setData({ member: store.getMembership(), alertCount: store.getAlerts().length }) },
  goAlerts() { wx.switchTab({ url: '/pages/alerts/index' }) },
  goMembership() { wx.switchTab({ url: '/pages/membership/index' }) },
  copyDashboard() {
    wx.setClipboardData({ data: getApp().globalData.dashboardUrl, success: () => wx.showToast({ title: '链接已复制' }) })
  }
})
