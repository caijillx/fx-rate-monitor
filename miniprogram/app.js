const store = require('./services/store')

App({
  onLaunch() {
    store.bootstrap()
  },
  globalData: {
    productName: '汇率哨兵',
    dashboardUrl: 'https://caijillx.github.io/fx-rate-monitor/'
  }
})
