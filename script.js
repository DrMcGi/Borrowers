// Smooth scroll + active nav
const navLinks = document.querySelectorAll("header .top-nav a");
const sections = Array.from(navLinks).map(l => document.querySelector(l.getAttribute("href")));
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  navLinks.forEach((link, i) => {
    const s = sections[i]; if (!s) return;
    const inView = s.offsetTop <= y && s.offsetTop + s.offsetHeight > y;
    link.style.color = inView ? "var(--accent1)" : "var(--muted)";
  });
});

// Toast
function toast(msg, type = "info") {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", bottom: "24px", right: "24px", padding: "12px 16px",
    borderRadius: "12px", zIndex: "9999", fontWeight: "700",
    border: "1px solid var(--border)", backdropFilter: "blur(8px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)"
  });
  if (type === "success") { t.style.background = "rgba(16,185,129,0.18)"; t.style.color = "#d1fae5"; }
  else if (type === "warn") { t.style.background = "rgba(245,158,11,0.18)"; t.style.color = "#fde68a"; }
  else { t.style.background = "rgba(255,255,255,0.10)"; t.style.color = "var(--text)"; }
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// Global form handler (prototype)
document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    toast("Submitted (prototype only). No backend connected.", "info");
  });
});

// Vendor terms toggles
document.querySelectorAll("[data-expand]").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-expand");
    const el = document.getElementById(`expand-${id}`);
    if (!el) return;
    el.style.display = el.style.display === "block" ? "none" : "block";
  });
});

// Marketplace -> Trade room passthrough
document.querySelectorAll(".open-trade").forEach(a => {
  a.addEventListener("click", () => {
    const id = a.dataset.listing || "LISTING";
    setTimeout(() => {
      document.getElementById("listing-id").value = id;
      document.getElementById("cp-name").textContent = id.split("-")[0].replace("_", " ");
      toast(`Trade opening for ${id}`, "info");
    }, 300);
  });
});

// Escrow flow
const formOpen = document.getElementById("form-open-trade");
const formPaid = document.getElementById("form-mark-paid");
const formRelease = document.getElementById("form-release");
const steps = document.querySelectorAll(".timeline .step");
function setStepActive(n) { steps.forEach((s, i) => s.classList.toggle("active", i < n)); }
formOpen?.addEventListener("submit", e => {
  e.preventDefault();
  formPaid.classList.remove("disabled");
  setStepActive(1);
  startPaymentCountdown(30 * 60);
  toast("Escrow locked. Awaiting payment.", "success");
});
formPaid?.addEventListener("submit", e => {
  e.preventDefault();
  formRelease.classList.remove("disabled");
  setStepActive(2);
  toast("Payment marked. Ready to release.", "success");
});
formRelease?.addEventListener("submit", e => {
  e.preventDefault();
  const ok = document.getElementById("release-confirm").checked && document.getElementById("release-2fa").value.trim();
  if (!ok) { toast("Confirm checkbox and 2FA required.", "warn"); return; }
  setStepActive(3);
  toast("Funds released. Trade complete.", "success");
});
let countdownTimer;
function startPaymentCountdown(seconds) {
  clearInterval(countdownTimer);
  const label = document.getElementById("payment-window");
  let remain = seconds;
  countdownTimer = setInterval(() => {
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    label.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    if (remain-- <= 0) { clearInterval(countdownTimer); toast("Payment window expired.", "warn"); }
  }, 1000);
}

// Chat
document.getElementById("chat-send")?.addEventListener("click", () => {
  const input = document.getElementById("chat-input");
  const log = document.getElementById("chat-log");
  const text = input.value.trim();
  if (!text) return;
  const msg = document.createElement("div");
  msg.className = "chat-msg";
  msg.textContent = `You: ${text}`;
  log.appendChild(msg);
  input.value = "";
  log.scrollTop = log.scrollHeight;
});

// Wallet: provision + simulate deposit
const walletBody = document.getElementById("wallet-tbody");
walletBody?.addEventListener("click", e => {
  const btn = e.target.closest(".provision"); if (!btn) return;
  const row = btn.closest("tr"); const addressCell = row.querySelector(".address");
  addressCell.textContent = "addr-" + Math.random().toString(36).slice(2, 6) + "-" + Math.random().toString(36).slice(2, 6);
  toast(`Address provisioned for ${btn.dataset.asset}`, "success");
});
document.getElementById("simulate-deposit")?.addEventListener("click", () => {
  const btcCell = document.querySelector('.balance[data-asset="BTC"]'); if (!btcCell) return;
  animateNumber(btcCell, 0.05, 8);
  setStepActive(1);
  toast("0.05 BTC deposited (simulation).", "success");
});
function animateNumber(el, target, decimals = 2, duration = 1200) {
  const start = parseFloat(el.textContent) || 0;
  const startTime = performance.now();
  function frame(now) {
    const p = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = start + (target - start) * eased;
    el.textContent = value.toFixed(decimals);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Sidebar filters
document.getElementById("apply-sb-filters")?.addEventListener("click", () => {
  const a = document.getElementById("sb-asset").value;
  const s = document.getElementById("sb-side").value;
  const p = document.getElementById("sb-pay").value;
  const c = document.getElementById("sb-country").value;
  toast(`Filters applied: ${a} • ${s} • ${p} • ${c}`, "info");
});
document.getElementById("save-sb-filters")?.addEventListener("click", () => {
  toast("Filter saved (prototype).", "success");
});

// Auth toggle
const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");
document.getElementById("show-signup")?.addEventListener("click", () => {
  signupForm.style.display = "block"; signinForm.style.display = "none"; toast("Sign up selected.", "info");
});
document.getElementById("show-signin")?.addEventListener("click", () => {
  signupForm.style.display = "none"; signinForm.style.display = "block"; toast("Sign in selected.", "info");
});

/* ===== Charting (pure Canvas implementation: candlestick + line + drawing tools) ===== */
function createChart({ canvasId, overlayId, type = "candlestick", data, timeframe = "15m" }) {
  const canvas = document.getElementById(canvasId);
  const overlay = document.getElementById(overlayId);
  const ctx = canvas.getContext("2d");
  const octx = overlay.getContext("2d");
  const W = canvas.width, H = canvas.height;

  // Utilities
  const pad = 40;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  // X mapping
  const xCount = data.length;
  const xStep = innerW / Math.max(1, xCount - 1);

  // Y range
  const lows = data.map(d => (type === "candlestick" ? d.l : d.c));
  const highs = data.map(d => (type === "candlestick" ? d.h : d.c));
  const minY = Math.min(...lows) * 0.995;
  const maxY = Math.max(...highs) * 1.005;
  const yScale = innerH / (maxY - minY);
  const yToPx = v => H - pad - (v - minY) * yScale;

  // Clear
  ctx.clearRect(0,0,W,H);
  octx.clearRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (innerH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();

  // Labels
  ctx.fillStyle = "rgba(226,232,240,0.9)";
  ctx.font = "12px Inter, system-ui";
  ctx.textAlign = "left";
  ctx.fillText(`Timeframe: ${timeframe}`, pad + 4, pad - 12);
  ctx.textAlign = "right";
  ctx.fillText(maxY.toFixed(2), W - pad + 32, pad + 8);
  ctx.fillText(((minY + maxY) / 2).toFixed(2), W - pad + 32, H / 2);
  ctx.fillText(minY.toFixed(2), W - pad + 32, H - pad);

  // Draw chart
  if (type === "candlestick") {
    const candleWidth = Math.max(4, xStep * 0.6);
    data.forEach((d, i) => {
      const x = pad + i * xStep;
      const yOpen = yToPx(d.o), yClose = yToPx(d.c), yHigh = yToPx(d.h), yLow = yToPx(d.l);
      const bullish = d.c >= d.o;
      ctx.strokeStyle = bullish ? getCSS("--bull") : getCSS("--bear");
      ctx.fillStyle = bullish ? getCSS("--bull") : getCSS("--bear");

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
      ctx.globalAlpha = 1;
    });
  } else {
    ctx.strokeStyle = getCSS("--accent1");
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = pad + i * xStep;
      const y = yToPx(d.c);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // Helpers
  function getCSS(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  // Drawing tools on overlay
  const toolState = { tool: null, start: null, drawings: [] };
  function setTool(t) { toolState.tool = t; toolState.start = null; }
  function clearDrawings() { toolState.drawings = []; redrawOverlay(); }
  function redrawOverlay() {
    octx.clearRect(0,0,W,H);
    toolState.drawings.forEach(d => {
      octx.save();
      octx.strokeStyle = d.color || "rgba(56,189,248,0.9)";
      octx.fillStyle = d.color || "rgba(56,189,248,0.9)";
      octx.lineWidth = 2;
      if (d.type === "line") {
        octx.beginPath(); octx.moveTo(d.x1, d.y1); octx.lineTo(d.x2, d.y2); octx.stroke();
      } else if (d.type === "hline") {
        octx.beginPath(); octx.moveTo(pad, d.y); octx.lineTo(W - pad, d.y); octx.stroke();
      } else if (d.type === "text") {
        octx.font = "12px Inter, system-ui";
        octx.fillText(d.text || "Note", d.x, d.y);
      }
      octx.restore();
    });
  }

  function onOverlayDown(e) {
    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (!toolState.tool) return;
    if (toolState.tool === "line") {
      toolState.start = { x, y };
    } else if (toolState.tool === "hline") {
      toolState.drawings.push({ type: "hline", y, color: "rgba(129,140,248,0.9)" });
      redrawOverlay();
    } else if (toolState.tool === "text") {
      const text = prompt("Enter annotation text:");
      if (text) {
        toolState.drawings.push({ type: "text", x, y, text, color: "rgba(56,189,248,0.9)" });
        redrawOverlay();
      }
    }
  }
  function onOverlayMove(e) {
    if (!toolState.tool || !toolState.start) return;
    redrawOverlay();
    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    octx.save();
    octx.strokeStyle = "rgba(56,189,248,0.6)";
    octx.lineWidth = 2;
    octx.beginPath(); octx.moveTo(toolState.start.x, toolState.start.y); octx.lineTo(x, y); octx.stroke();
    octx.restore();
  }
  function onOverlayUp(e) {
    if (toolState.tool === "line" && toolState.start) {
      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      toolState.drawings.push({ type: "line", x1: toolState.start.x, y1: toolState.start.y, x2: x, y2: y });
      toolState.start = null;
      redrawOverlay();
    }
  }

  overlay.addEventListener("mousedown", onOverlayDown);
  overlay.addEventListener("mousemove", onOverlayMove);
  overlay.addEventListener("mouseup", onOverlayUp);

  return {
    setTool,
    clearDrawings,
    updateType(newType) { type = newType; createChart({ canvasId, overlayId, type, data, timeframe }); },
    updateData(newData) { data = newData; createChart({ canvasId, overlayId, type, data, timeframe }); },
    updateTimeframe(tf) { timeframe = tf; createChart({ canvasId, overlayId, type, data, timeframe }); }
  };
}

// Generate mock OHLC data
function genOHLC(n = 60, start = 100, volatility = 2) {
  const arr = [];
  let lastClose = start;
  for (let i = 0; i < n; i++) {
    const o = lastClose + (Math.random() - 0.5) * volatility;
    let h = o + Math.random() * volatility * 2;
    let l = o - Math.random() * volatility * 2;
    let c = o + (Math.random() - 0.5) * volatility * 2;
    // Ensure logical bounds
    h = Math.max(h, o, c);
    l = Math.min(l, o, c);
    arr.push({ o, h, l, c });
    lastClose = c;
  }
  return arr;
}

// Market chart init
const marketDataMap = {
  BTC: genOHLC(90, 1065000, 8000),
  ETH: genOHLC(90, 19800, 200),
  USDT: genOHLC(90, 18.95, 0.15)
};
let marketChart = createChart({ canvasId: "marketChart", overlayId: "marketOverlay", type: "candlestick", data: marketDataMap["BTC"], timeframe: "15m" });
document.getElementById("chart-asset").addEventListener("change", e => {
  const asset = e.target.value;
  marketChart.updateData(marketDataMap[asset]);
  toast(`Chart asset: ${asset}`, "info");
});
document.getElementById("chart-type").addEventListener("change", e => {
  marketChart.updateType(e.target.value);
});
document.getElementById("chart-timeframe").addEventListener("change", e => {
  marketChart.updateTimeframe(e.target.value);
});
document.querySelectorAll('.chart-controls [data-tool]').forEach(btn => {
  btn.addEventListener('click', () => marketChart.setTool(btn.getAttribute('data-tool')));
});
document.getElementById("clear-draw").addEventListener("click", () => marketChart.clearDrawings());

// Trade chart init (defaults to USDT until listing selected)
let tradeChart = createChart({ canvasId: "tradeChart", overlayId: "tradeOverlay", type: "candlestick", data: marketDataMap["USDT"], timeframe: "15m" });
document.getElementById("trade-chart-type").addEventListener("change", e => tradeChart.updateType(e.target.value));
document.getElementById("trade-chart-timeframe").addEventListener("change", e => tradeChart.updateTimeframe(e.target.value));
document.querySelectorAll('.chart-controls [data-tool-trade]').forEach(btn => {
  btn.addEventListener('click', () => tradeChart.setTool(btn.getAttribute('data-tool-trade')));
});
document.getElementById("clear-trade-draw").addEventListener("click", () => tradeChart.clearDrawings());

// Sync trade chart asset when opening a trade
document.querySelectorAll(".open-trade").forEach(a => {
  a.addEventListener("click", () => {
    const id = a.dataset.listing || "";
    const asset = id.includes("BTC") ? "BTC" : id.includes("ETH") ? "ETH" : "USDT";
    tradeChart.updateData(marketDataMap[asset]);
  });
});
