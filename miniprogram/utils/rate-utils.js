function formatRate(value) {
  return Number(value).toFixed(4)
}

function minOfWindow(history, size) {
  return Math.min(...history.slice(-size))
}

function summarize(pair) {
  const history = pair.history
  const current = history[history.length - 1]
  const previous7 = history.slice(-8, -1)
  const previous30 = history.slice(0, -1)
  const low7Before = Math.min(...previous7)
  const low30Before = Math.min(...previous30)
  const status = current <= low30Before ? '30d_low' : current <= low7Before ? '7d_low' : 'normal'
  const distance = ((current - low30Before) / low30Before) * 100
  return {
    ...pair,
    current,
    currentText: formatRate(current),
    low7: minOfWindow(history, 7),
    low7Text: formatRate(minOfWindow(history, 7)),
    low30: minOfWindow(history, 30),
    low30Text: formatRate(minOfWindow(history, 30)),
    status,
    statusClass: status === 'normal' ? 'quiet' : 'low',
    statusText: status === '30d_low' ? '30 日新低' : status === '7d_low' ? '7 日新低' : '正常观察',
    distanceText: `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`
  }
}

function nextRun(now = new Date()) {
  const hours = [8, 12, 16, 20]
  const target = new Date(now)
  const hour = hours.find(item => item > now.getHours())
  if (hour === undefined) {
    target.setDate(target.getDate() + 1)
    target.setHours(8, 0, 0, 0)
  } else {
    target.setHours(hour, 0, 0, 0)
  }
  return target
}

function countdownText(now, target) {
  const seconds = Math.max(0, Math.floor((target - now) / 1000))
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

module.exports = { formatRate, minOfWindow, summarize, nextRun, countdownText }
