const state = { data: null, pair: "GBP_CNY" };

const fmt = (n, digits = 4) => Number(n).toFixed(digits);
const statusText = status => status === "30d_low" ? "30 日新低" : status === "7d_low" ? "7 日新低" : "正常观察";

function renderCards() {
  const grid = document.querySelector("#rate-grid");
  grid.innerHTML = Object.entries(state.data.pairs).map(([key, item]) => `
    <article class="rate-card" style="--glow:${key.startsWith("GBP") ? "#c8ff65" : "#67e8a8"}">
      <div class="card-top">
        <div class="currency">
          <div class="flag">${key.startsWith("GBP") ? "🇬🇧" : "🇺🇸"}</div>
          <div><h2>${item.base} / CNY</h2><small>1 ${item.base} 可兑换人民币</small></div>
        </div>
        <span class="badge ${item.status === "normal" ? "quiet" : ""}">${statusText(item.status)}</span>
      </div>
      <div class="quote"><strong>${fmt(item.current)}</strong><span>CNY</span></div>
      <div class="stats">
        <div class="stat"><small>7 日最低</small><strong>${fmt(item.min_7d)}</strong></div>
        <div class="stat"><small>30 日最低</small><strong>${fmt(item.min_30d)}</strong></div>
      </div>
    </article>`).join("");
}

function renderChart() {
  const item = state.data.pairs[state.pair];
  const points = item.history.slice(-30);
  const width = 900, height = 280, padX = 18, padY = 26;
  const vals = points.map(p => p.rate);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const coords = points.map((p, i) => ({
    x: padX + i * (width - padX * 2) / Math.max(points.length - 1, 1),
    y: padY + (max - p.rate) * (height - padY * 2) / span,
    ...p
  }));
  const line = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${padX},${height-padY} ${line} ${width-padX},${height-padY}`;
  const labels = [0, Math.floor((points.length - 1) / 2), points.length - 1]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(i => `<text class="axis-label" x="${coords[i].x}" y="278" text-anchor="${i === 0 ? "start" : i === points.length-1 ? "end" : "middle"}">${points[i].date.slice(5)}</text>`).join("");
  document.querySelector("#rate-chart").innerHTML = `
    <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8ff65" stop-opacity=".2"/><stop offset="1" stop-color="#c8ff65" stop-opacity="0"/></linearGradient></defs>
    <line class="grid-line" x1="${padX}" y1="${padY}" x2="${width-padX}" y2="${padY}"/>
    <line class="grid-line" x1="${padX}" y1="${height/2}" x2="${width-padX}" y2="${height/2}"/>
    <line class="grid-line" x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}"/>
    <polygon class="area" points="${area}"/><polyline class="line" points="${line}"/>
    <circle class="dot" cx="${coords.at(-1).x}" cy="${coords.at(-1).y}" r="5"/>${labels}`;
  document.querySelector("#chart-summary").innerHTML = `<span>最高 <strong>${fmt(max)}</strong></span><span>最低 <strong>${fmt(min)}</strong></span><span>最新 <strong>${fmt(item.current)}</strong></span>`;
}

function renderMeta() {
  const when = new Date(state.data.generated_at);
  document.querySelector("#updated-at").textContent = `更新于 ${when.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}`;
  document.querySelector("#source-label").textContent = `${state.data.source}${state.data.demo ? " · 演示数据" : ""}`;
}

function updateCountdown() {
  const now = new Date();
  const nowChina = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const hours = [8, 12, 16, 20];
  let next = new Date(nowChina);
  const nextHour = hours.find(h => h > nowChina.getHours() || (h === nowChina.getHours() && nowChina.getMinutes() === 0 && nowChina.getSeconds() === 0));
  if (nextHour === undefined) { next.setDate(next.getDate() + 1); next.setHours(8, 0, 0, 0); }
  else next.setHours(nextHour, 0, 0, 0);
  const ms = Math.max(0, next - nowChina);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor(ms % 3600000 / 60000)).padStart(2, "0");
  const s = String(Math.floor(ms % 60000 / 1000)).padStart(2, "0");
  document.querySelector("#next-run").textContent = `${h}:${m}:${s}`;
}

document.querySelector("#pair-switch").addEventListener("click", e => {
  if (!e.target.dataset.pair) return;
  state.pair = e.target.dataset.pair;
  document.querySelectorAll("#pair-switch button").forEach(b => b.classList.toggle("active", b === e.target));
  renderChart();
});

fetch("data/rates.json", { cache: "no-store" })
  .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
  .then(data => { state.data = data; renderMeta(); renderCards(); renderChart(); })
  .catch(err => document.querySelector("#rate-grid").innerHTML = `<div class="error">汇率数据读取失败：${err.message}</div>`);

updateCountdown();
setInterval(updateCountdown, 1000);

