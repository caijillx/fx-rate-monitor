const store = require('../../services/store')

Page({
  data: {
    alerts: [], enabledCount: 0, member: {}, pairIndex: 0, typeIndex: 0, target: '',
    pairOptions: [{ label: 'GBP / CNY', value: 'GBP_CNY' }, { label: 'USD / CNY', value: 'USD_CNY' }],
    typeOptions: [{ label: '达到 7 日低点', value: '7d' }, { label: '达到 30 日低点', value: '30d' }, { label: '低于目标汇率', value: 'target' }]
  },
  onShow() { this.refresh() },
  refresh() {
    const alerts = store.getAlerts()
    this.setData({ alerts, member: store.getMembership(), enabledCount: alerts.filter(item => item.enabled).length })
  },
  changePair(event) { this.setData({ pairIndex: Number(event.detail.value) }) },
  changeType(event) { this.setData({ typeIndex: Number(event.detail.value) }) },
  changeTarget(event) { this.setData({ target: event.detail.value }) },
  addAlert() {
    const { member, alerts, pairOptions, typeOptions, pairIndex, typeIndex, target } = this.data
    if (!member.active && alerts.length >= 1) {
      wx.showModal({ title: '免费额度已用完', content: '升级会员可同时设置 10 条提醒。', confirmText: '查看会员', success: r => r.confirm && wx.switchTab({ url: '/pages/membership/index' }) })
      return
    }
    const pair = pairOptions[pairIndex], type = typeOptions[typeIndex]
    if (type.value === 'target' && (!target || Number(target) <= 0)) return wx.showToast({ title: '请输入目标汇率', icon: 'none' })
    const typeText = type.value === 'target' ? `目标价 ≤ ${Number(target).toFixed(4)}` : type.label.replace('达到 ', '')
    const next = [{ id: `${Date.now()}`, pair: pair.value, pairText: pair.label, type: type.value, typeText, target: Number(target) || null, enabled: true }, ...alerts]
    store.saveAlerts(next); this.setData({ target: '' }); this.refresh(); wx.showToast({ title: '提醒已保存' })
  },
  toggleAlert(event) {
    const alerts = this.data.alerts.map(item => item.id === event.currentTarget.dataset.id ? { ...item, enabled: event.detail.value } : item)
    store.saveAlerts(alerts); this.refresh()
  }
})
