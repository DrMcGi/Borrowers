// ===== Smooth scroll navigation + active highlight =====
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
const sectionMap = Array.from(navLinks).map(l => document.querySelector(l.getAttribute("href")));
window.addEventListener("scroll", () => {
  const fromTop = window.scrollY + 120;
  navLinks.forEach((link, i) => {
    const s = sectionMap[i];
    if (!s) return;
    const inView = s.offsetTop <= fromTop && s.offsetTop + s.offsetHeight > fromTop;
    link.style.color = inView ? "var(--accent1)" : "var(--muted)";
  });
});

// ===== Toast utility =====
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
  setTimeout(() => t.remove(), 2000);
}

// ===== Global prototype form handler =====
document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    toast("Submitted (prototype only). No backend connected.", "info");
  });
});

// ===== Auth toggle logic =====
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

// ===== Wallet: provision address + simulate deposit with animation =====
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
  stepActivate(1);
  toast("0.05 BTC deposited (simulation).", "success");
});

// ===== Number animation utility =====
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

// ===== Marketplace: pass listing ID into escrow form =====
document.querySelectorAll(".open-trade").forEach(a => {
  a.addEventListener("click", () => {
    const id = a.dataset.listing || "LISTING";
    setTimeout(() => {
      document.getElementById("listing-id").value = id;
      toast(`Trade opening for ${id}`, "info");
    }, 300);
  });
});

// ===== Escrow flow: lock -> mark paid -> release with timeline =====
const formOpen = document.getElementById("form-open-trade");
const formPaid = document.getElementById("form-mark-paid");
const formRelease = document.getElementById("form-release");

formOpen?.addEventListener("submit", e => {
  e.preventDefault();
  formPaid.classList.remove("disabled");
  stepActivate(1);
  toast("Escrow locked. Awaiting payment.", "success");
});

formPaid?.addEventListener("submit", e => {
  e.preventDefault();
  formRelease.classList.remove("disabled");
  stepActivate(2);
  toast("Payment marked. Ready to release.", "success");
});

formRelease?.addEventListener("submit", e => {
  e.preventDefault();
  const ok = document.getElementById("release-confirm").checked && document.getElementById("release-2fa").value.trim();
  if (!ok) { toast("Confirm checkbox and 2FA required.", "warn"); return; }
  stepActivate(3);
  toast("Funds released. Trade complete.", "success");
});

// ===== Timeline step activation =====
function stepActivate(n) {
  document.querySelectorAll(".timeline .step").forEach((s, i) => {
    s.classList.toggle("active", i < n);
  });
}