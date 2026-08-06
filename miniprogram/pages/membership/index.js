const store = require('../../services/store')

const plans = [
  { id: 'month', name: '月度会员', caption: '随时手动续费', price: '9.9', days: 30 },
  { id: 'year', name: '年度会员', caption: '相当于每月 ¥5.75', price: '69', days: 365, recommended: true }
]

Page({
  data: {
    member: {}, plans, selected: 'year', selectedPlan: plans[1],
    benefits: [
      { title: '每日 4 次监控', text: '覆盖主要交易时段' },
      { title: '最多 10 条提醒', text: '低点、目标价与多币种组合' },
      { title: '90 日历史趋势', text: '判断当前价位所处分位' },
      { title: '微信订阅提醒', text: '命中条件后及时通知' }
    ]
  },
  onShow() { this.setData({ member: store.getMembership() }) },
  selectPlan(event) {
    const selected = event.currentTarget.dataset.id
    this.setData({ selected, selectedPlan: plans.find(item => item.id === selected) })
  },
  mockPay() {
    const plan = this.data.selectedPlan
    wx.showModal({
      title: 'MVP 模拟支付',
      content: `模拟购买${plan.name}，金额 ¥${plan.price}。本次不会产生真实扣款。`,
      confirmText: '模拟支付',
      success: result => {
        if (!result.confirm) return
        const expired = new Date(); expired.setDate(expired.getDate() + plan.days)
        const member = { active: true, plan: plan.name, expiredAt: `${expired.getFullYear()}-${String(expired.getMonth() + 1).padStart(2, '0')}-${String(expired.getDate()).padStart(2, '0')}` }
        store.saveMembership(member); this.setData({ member }); wx.showToast({ title: '会员开通成功' })
      }
    })
  }
})
