// Smooth scroll navigation + active highlight
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

// Toast utility
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

// Global prototype form handler
document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    toast("Submitted (prototype only). No backend connected.", "info");
  });
});

// Sidebar vendor terms toggles
document.querySelectorAll("[data-expand]").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-expand");
    const el = document.getElementById(`expand-${id}`);
    if (!el) return;
    const open = el.style.display === "block";
    el.style.display = open ? "none" : "block";
  });
});

// Marketplace -> Trade room listing ID passthrough
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

function setStepActive(n) {
  steps.forEach((s, i) => s.classList.toggle("active", i < n));
}

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

// Payment countdown
let countdownTimer;
function startPaymentCountdown(seconds) {
  clearInterval(countdownTimer);
  const label = document.getElementById("payment-window");
  let remain = seconds;
  countdownTimer = setInterval(() => {
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    label.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    if (remain-- <= 0) {
      clearInterval(countdownTimer);
      toast("Payment window expired.", "warn");
    }
  }, 1000);
}

// Chat prototype
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
  const btn = e.target.closest(".provision");
  if (!btn) return;
  const row = btn.closest("tr");
  const addressCell = row.querySelector(".address");
  addressCell.textContent = "addr-" + Math.random().toString(36).slice(2, 6) + "-" + Math.random().toString(36).slice(2, 6);
  toast(`Address provisioned for ${btn.dataset.asset}`, "success");
});

document.getElementById("simulate-deposit")?.addEventListener("click", () => {
  const btcCell = document.querySelector('.balance[data-asset="BTC"]');
  if (!btcCell) return;
  animateNumber(btcCell, 0.05, 8);
  setStepActive(1);
  toast("0.05 BTC deposited (simulation).", "success");
});

// Number animation utility
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

// Sidebar quick filters "Apply" (prototype)
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

// Auth toggle logic
const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");
document.getElementById("show-signup")?.addEventListener("click", () => {
  signupForm.style.display = "block";
  signinForm.style.display = "none";
  toast("Sign up selected.", "info");
});
document.getElementById("show-signin")?.addEventListener("click", () => {
  signupForm.style.display = "none";
  signinForm.style.display = "block";
  toast("Sign in selected.", "info");
});
