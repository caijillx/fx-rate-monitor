# 汇率哨兵 Demo

一个可以直接部署到 GitHub Pages 的人民币汇率监控 Demo：

- 监控 `GBP/CNY`、`USD/CNY`；
- 北京时间每天 `08:00 / 12:00 / 16:00 / 20:00` 自动运行；
- 达到此前 7 日或 30 日最低点时通过 SMTP 发送邮件；
- 同一币种、窗口和低点只提醒一次；
- GitHub Pages 展示 30 日趋势与下一次查询倒计时。

## 本地预览

```bash
python3 -m unittest discover -s tests -v
python3 -m http.server 8000 --directory public
```

访问 <http://localhost:8000>。仓库自带演示数据；执行监控脚本后会替换为真实参考汇率：

```bash
python3 scripts/monitor.py
```

## GitHub 部署

1. 创建一个 GitHub 仓库，将本目录内容推送到 `main`。
2. 在仓库 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。
3. 在 **Settings → Secrets and variables → Actions** 中配置：

| Secret | 说明 |
|---|---|
| `SMTP_HOST` | SMTP 地址，例如 `smtp.gmail.com` |
| `SMTP_PORT` | SSL 通常为 `465`，STARTTLS 通常为 `587` |
| `SMTP_USER` | 发件账号 |
| `SMTP_PASSWORD` | SMTP 密码或应用专用密码 |
| `MAIL_FROM` | 发件地址，可与账号相同 |
| `MAIL_TO` | 收件地址 |

4. 在 **Actions** 页面手动运行一次 `Monitor FX rates and deploy dashboard`。

## 数据口径

Demo 使用 [Frankfurter v2](https://frankfurter.dev/) 的机构参考汇率，公开接口无需密钥。它属于日级参考数据；工作流每天运行四次，但新报价取决于数据机构的发布时间。若需要盘中小时级报价，可保留界面和告警逻辑，只替换 `scripts/monitor.py` 中的数据提供方。

最低价比较不包含当前报价：当前价小于或等于此前窗口最低值时触发。30 日低点已经包含 7 日低点，因此只生成更强的 30 日提醒。

