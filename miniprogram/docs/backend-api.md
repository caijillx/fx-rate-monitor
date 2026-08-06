# MVP 后端接口约定

小程序当前使用本地演示数据与模拟支付。接入正式后端时保持下面的接口边界，前端页面结构无需重做。

## 行情

`GET /v1/rates?pairs=GBP_CNY,USD_CNY`

返回当前汇率、7/30/90 日最低值和绘图序列。

## 提醒

- `GET /v1/alerts`
- `POST /v1/alerts`
- `PATCH /v1/alerts/{id}`
- `DELETE /v1/alerts/{id}`

服务端依据会员权益校验提醒数量，并负责订阅消息授权记录和发送去重。

## 会员商品

`GET /v1/products`

返回月卡、年卡以及服务端确定的价格。客户端展示价格不得作为下单金额依据。

## 微信支付

1. `POST /v1/orders` 创建内部订单；
2. 后端调用微信支付 API v3 小程序下单；
3. 后端返回 `timeStamp`、`nonceStr`、`package`、`signType`、`paySign`；
4. 小程序调用 `wx.requestPayment`；
5. 微信支付异步通知 `/v1/payments/wechat/notify`；
6. 后端验签、解密通知、核对商户号/金额并以幂等事务开通会员；
7. 小程序查询 `GET /v1/orders/{orderNo}` 获取最终结果。

支付私钥、API v3 Key、AppSecret 只保存在服务端密钥管理系统中。
