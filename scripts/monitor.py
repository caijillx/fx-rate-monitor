#!/usr/bin/env python3
"""Fetch CNY reference rates, detect 7/30-day lows, update dashboard, send email."""

from __future__ import annotations

import json
import os
import smtplib
import ssl
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "public" / "data" / "rates.json"
STATE_FILE = ROOT / "state" / "alerts.json"
API = "https://api.frankfurter.dev/v2/rates"
PAIRS = (("GBP", "CNY"), ("USD", "CNY"))


@dataclass(frozen=True)
class Alert:
    pair: str
    window: int
    rate: float
    previous_low: float
    rate_date: str

    @property
    def fingerprint(self) -> str:
        return f"{self.pair}:{self.window}:{self.rate:.8f}"


def http_json(url: str) -> object:
    request = urllib.request.Request(url, headers={"User-Agent": "fx-rate-monitor-demo/1.0"})
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                return json.load(response)
        except (OSError, TimeoutError) as error:
            last_error = error
            if attempt < 2:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"Rate API request failed after 3 attempts: {last_error}")


def fetch_pair(base: str, quote: str, today: date, fetch: Callable[[str], object] = http_json) -> list[dict]:
    params = urllib.parse.urlencode({"base": base, "quotes": quote, "from": (today - timedelta(days=40)).isoformat(), "to": today.isoformat()})
    payload = fetch(f"{API}?{params}")
    rows = [r for r in payload if r.get("base") == base and r.get("quote") == quote]
    if not rows:
        raise RuntimeError(f"No rates returned for {base}/{quote}")
    return sorted(({"date": r["date"], "rate": float(r["rate"])} for r in rows), key=lambda r: r["date"])


def previous_low(rows: list[dict], latest_date: date, days: int) -> float:
    start = latest_date - timedelta(days=days)
    values = [r["rate"] for r in rows[:-1] if start <= date.fromisoformat(r["date"]) < latest_date]
    if not values:
        raise RuntimeError(f"Insufficient history for {days}-day comparison")
    return min(values)


def analyse_pair(base: str, quote: str, rows: list[dict]) -> tuple[dict, list[Alert]]:
    latest = rows[-1]
    latest_date = date.fromisoformat(latest["date"])
    low7 = previous_low(rows, latest_date, 7)
    low30 = previous_low(rows, latest_date, 30)
    alerts: list[Alert] = []
    if latest["rate"] <= low30:
        alerts.append(Alert(f"{base}/{quote}", 30, latest["rate"], low30, latest["date"]))
        status = "30d_low"
    elif latest["rate"] <= low7:
        alerts.append(Alert(f"{base}/{quote}", 7, latest["rate"], low7, latest["date"]))
        status = "7d_low"
    else:
        status = "normal"
    return {
        "base": base,
        "quote": quote,
        "current": latest["rate"],
        "rate_date": latest["date"],
        "min_7d": min(latest["rate"], low7),
        "min_30d": min(latest["rate"], low30),
        "status": status,
        "history": rows[-30:],
    }, alerts


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {"sent": []}


def save_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def send_email(alerts: list[Alert]) -> None:
    host = os.environ["SMTP_HOST"]
    port = int(os.getenv("SMTP_PORT") or "465")
    user = os.environ["SMTP_USER"]
    password = os.environ["SMTP_PASSWORD"]
    recipient = os.environ["MAIL_TO"]
    sender = os.getenv("MAIL_FROM", user)
    strongest = max(a.window for a in alerts)
    message = EmailMessage()
    message["Subject"] = f"【汇率提醒】人民币兑换机会：触达 {strongest} 日低点"
    message["From"] = sender
    message["To"] = recipient
    lines = ["汇率哨兵发现新的低点：", ""]
    for a in alerts:
        lines += [
            f"{a.pair}：1 {a.pair.split('/')[0]} = {a.rate:.4f} CNY",
            f"触发：{a.window} 日低点（此前最低 {a.previous_low:.4f}）",
            f"报价日期：{a.rate_date}", "",
        ]
    lines.append("此为参考汇率，不含银行点差和手续费。")
    message.set_content("\n".join(lines))
    context = ssl.create_default_context()
    if port == 465:
        with smtplib.SMTP_SSL(host, port, context=context, timeout=20) as smtp:
            smtp.login(user, password)
            smtp.send_message(message)
    else:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            smtp.starttls(context=context)
            smtp.login(user, password)
            smtp.send_message(message)


def main() -> None:
    today = datetime.now(timezone.utc).date()
    pairs: dict[str, dict] = {}
    alerts: list[Alert] = []
    for base, quote in PAIRS:
        result, pair_alerts = analyse_pair(base, quote, fetch_pair(base, quote, today))
        pairs[f"{base}_{quote}"] = result
        alerts.extend(pair_alerts)

    dashboard = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "Frankfurter v2 · institutional reference rates",
        "demo": False,
        "pairs": pairs,
    }
    save_json(DATA_FILE, dashboard)

    state = load_state()
    sent = set(state.get("sent", []))
    fresh = [a for a in alerts if a.fingerprint not in sent]
    if fresh and os.getenv("SEND_EMAIL", "false").lower() == "true":
        send_email(fresh)
        sent.update(a.fingerprint for a in fresh)
    # Bound state size while preserving recent fingerprints.
    state["sent"] = sorted(sent)[-200:]
    state["last_checked_at"] = dashboard["generated_at"]
    save_json(STATE_FILE, state)
    print(f"Updated {DATA_FILE}; new alerts={len(fresh)}; email={'on' if os.getenv('SEND_EMAIL') == 'true' else 'off'}")


if __name__ == "__main__":
    main()
