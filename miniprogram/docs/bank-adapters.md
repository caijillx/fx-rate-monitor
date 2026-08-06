# 银行牌价适配器（第一版）

## 覆盖范围

- 银行：中国银行、工商银行、建设银行、农业银行、招商银行、交通银行、兴业银行、民生银行
- 币种：GBP、USD、JPY、KRW、HKD、SGD
- 比价口径：人民币购汇，比较 `spotSell`（现汇卖出价）或 `cashSell`（现钞卖出价），数值越低越优

## 统一结构

所有来源先换算为“1 单位外币需要多少人民币”，展示层再将 JPY、KRW 乘以 100 显示：

```js
{
  spotSell: 6.7634,
  cashSell: 6.7790,
  unit: 1,
  quotedAt: '08-06 14:30'
}
```

缺少公开牌价或采集失败时保留 `null`，前端展示“暂未挂牌”。

## 官方来源

| 银行 | 来源 |
|---|---|
| 中国银行 | https://www.bankofchina.com/sourcedb/whpj/index.html |
| 工商银行 | https://www.icbc.com.cn/column/1438058343219466322.html |
| 建设银行 | https://tool.ccb.com/cn/forex/exchange-quotations.html?tab=0 |
| 农业银行 | https://ewealth.abchina.com/foreignexchange/listprice/ |
| 招商银行 | https://fx.cmbchina.cn/ |
| 交通银行 | https://www.bankcomm.com/BankCommSite/zonghang/cn/newWhpj/foreignExchangeSearch_Cn.html |
| 兴业银行 | https://personalbank.cib.com.cn/pers/main/pubinfo/ifxQuotationQuery |
| 民生银行 | https://www.cmbc.com.cn/sy/xqsj/wh/dgjsh/index.htm |

生产采集器建议由云函数/后端每次定时任务抓取，写入数据库并由小程序 API 读取；不要让小程序端直接请求各银行页面。
