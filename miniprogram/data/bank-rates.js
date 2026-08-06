// MVP 样本数据。生产版由服务端适配器从各银行官方牌价页采集并写入同一数据结构。
const QUOTED_AT = '08-06 14:30'

const currencies = [
  { code: 'GBP', name: '英镑', flag: '🇬🇧', displayUnit: 1, unitLabel: '1 GBP', decimals: 4, amountDecimals: 2 },
  { code: 'USD', name: '美元', flag: '🇺🇸', displayUnit: 1, unitLabel: '1 USD', decimals: 4, amountDecimals: 2 },
  { code: 'JPY', name: '日元', flag: '🇯🇵', displayUnit: 100, unitLabel: '100 JPY', decimals: 4, amountDecimals: 0 },
  { code: 'HKD', name: '港币', flag: '🇭🇰', displayUnit: 1, unitLabel: '1 HKD', decimals: 4, amountDecimals: 2 },
  { code: 'SGD', name: '新加坡元', flag: '🇸🇬', displayUnit: 1, unitLabel: '1 SGD', decimals: 4, amountDecimals: 2 }
]

function q(spotSell, cashSell, unit = 1) {
  return { spotSell, cashSell, unit, quotedAt: QUOTED_AT }
}

const banks = [
  { id: 'boc', name: '中国银行', shortName: '中行', sourceUrl: 'https://www.bankofchina.com/sourcedb/whpj/index.html', quotes: {
    GBP: q(9.1287, 9.1287), USD: q(6.7634, 6.7634), JPY: q(4.1432, 4.1432, 100),
    HKD: q(0.8674, 0.8674), SGD: q(5.2698, 5.2698)
  }},
  { id: 'icbc', name: '工商银行', shortName: '工行', sourceUrl: 'https://www.icbc.com.cn/column/1438058343219466322.html', quotes: {
    GBP: q(9.1362, 9.1518), USD: q(6.7619, 6.7762), JPY: q(4.1468, 4.1594, 100),
    HKD: q(0.8669, 0.8721), SGD: q(5.2731, 5.2890)
  }},
  { id: 'ccb', name: '建设银行', shortName: '建行', sourceUrl: 'https://tool.ccb.com/cn/forex/exchange-quotations.html?tab=0', quotes: {
    GBP: q(9.1305, 9.1494), USD: q(6.7651, 6.7805), JPY: q(4.1419, 4.1555, 100),
    HKD: q(0.8678, 0.8732), SGD: q(5.2675, 5.2841)
  }},
  { id: 'abc', name: '农业银行', shortName: '农行', sourceUrl: 'https://ewealth.abchina.com/foreignexchange/listprice/', quotes: {
    GBP: q(9.1416, 9.1580), USD: q(6.7642, 6.7790), JPY: q(4.1491, 4.1617, 100),
    HKD: q(0.8682, 0.8739), SGD: q(5.2764, 5.2922)
  }},
  { id: 'cmb', name: '招商银行', shortName: '招行', sourceUrl: 'https://fx.cmbchina.cn/', quotes: {
    GBP: q(9.1259, 9.1450), USD: q(6.7598, 6.7746), JPY: q(4.1398, 4.1532, 100),
    HKD: q(0.8665, 0.8720), SGD: q(5.2641, 5.2813)
  }},
  { id: 'bocom', name: '交通银行', shortName: '交行', sourceUrl: 'https://www.bankcomm.com/BankCommSite/zonghang/cn/newWhpj/foreignExchangeSearch_Cn.html', quotes: {
    GBP: q(9.1334, 9.1527), USD: q(6.7626, 6.7788), JPY: q(4.1453, 4.1589, 100),
    HKD: q(0.8671, 0.8730), SGD: q(5.2712, 5.2886)
  }},
  { id: 'cib', name: '兴业银行', shortName: '兴业', sourceUrl: 'https://personalbank.cib.com.cn/pers/main/pubinfo/ifxQuotationQuery', quotes: {
    GBP: q(9.1398, 9.1566), USD: q(6.7670, 6.7814), JPY: q(4.1512, 4.1630, 100),
    HKD: q(0.8687, 0.8741), SGD: q(5.2796, 5.2940)
  }},
  { id: 'cmbc', name: '民生银行', shortName: '民生', sourceUrl: 'https://www.cmbc.com.cn/sy/xqsj/wh/dgjsh/index.htm', quotes: {
    GBP: q(9.1349, 9.1531), USD: q(6.7638, 6.7799), JPY: q(4.1476, 4.1608, 100),
    HKD: q(0.8676, 0.8734), SGD: q(5.2748, 5.2911)
  }}
]

module.exports = { demo: true, quotedAt: QUOTED_AT, currencies, banks }
