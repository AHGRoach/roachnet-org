/* ===========================
   landing-script.js
   Scroll progress bar and reveal observer for the
   RoachNet Mission landing page.
   =========================== */

// Scroll progress bar
const progressBar = document.querySelector(".landing-scroll-progress");
const heroSignal = document.querySelector(".why-hero__signal");
const heroSignalCore = document.querySelector(".why-hero__signal-core");
const bottomMark = document.querySelector(".why-bottom-mark");

function syncScrollProgress() {
  if (!progressBar) return;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
  progressBar.style.width = pct.toFixed(2) + "%";
}

function syncHeroScrollMotion() {
  if (!heroSignal) return;

  const rect = heroSignal.getBoundingClientRect();
  const viewport = Math.max(window.innerHeight, 1);
  const offset = ((rect.top + rect.height * 0.45) - viewport * 0.5) / viewport;
  const clamped = Math.max(-1, Math.min(1, offset));

  heroSignal.style.setProperty("--hero-scroll-shift", `${(-clamped * 18).toFixed(2)}px`);

  if (heroSignalCore) {
    heroSignalCore.style.setProperty("--hero-scroll-y", `${(-clamped * 10).toFixed(2)}px`);
  }
}

window.addEventListener("scroll", () => {
  syncScrollProgress();
  syncHeroScrollMotion();
}, { passive: true });
window.addEventListener("resize", syncHeroScrollMotion, { passive: true });
syncScrollProgress();
syncHeroScrollMotion();

function burstGlitch(target) {
  if (!target) return;
  target.classList.remove("is-bursting");
  void target.offsetWidth;
  target.classList.add("is-bursting");
  window.setTimeout(() => target.classList.remove("is-bursting"), 320);
}

if (heroSignal && heroSignalCore) {
  let heroX = 0;
  let heroY = 0;
  let rafId = 0;

  const syncHeroDrift = () => {
    rafId = 0;
    heroSignalCore.style.setProperty("--hero-core-x", `${heroX.toFixed(2)}px`);
    heroSignalCore.style.setProperty("--hero-core-y", `${heroY.toFixed(2)}px`);
    heroSignal.style.setProperty("--hero-rail-shift", `${(heroX * 0.45).toFixed(2)}px`);
  };

  const queueHeroDrift = () => {
    if (!rafId) {
      rafId = window.requestAnimationFrame(syncHeroDrift);
    }
  };

  heroSignal.addEventListener("pointermove", (event) => {
    const rect = heroSignal.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    heroX = x * 6;
    heroY = y * 3;
    queueHeroDrift();
  });

  heroSignal.addEventListener("pointerleave", () => {
    heroX = 0;
    heroY = 0;
    queueHeroDrift();
  });

  const queueBurst = () => {
    burstGlitch(heroSignal);
    if (bottomMark) {
      burstGlitch(bottomMark);
    }
    const nextDelay = 2600 + Math.round(Math.random() * 2800);
    window.setTimeout(queueBurst, nextDelay);
  };

  window.setTimeout(queueBurst, 1400);
}

// Reveal observer for data-reveal elements
const revealTargets = document.querySelectorAll("[data-reveal]");

if (revealTargets.length && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

const navShell = document.querySelector(".site-nav, .rn-nav");

function syncNavShell() {
  if (!navShell) return;
  navShell.classList.toggle("is-scrolled", window.scrollY > 14);
}

window.addEventListener("scroll", syncNavShell, { passive: true });
syncNavShell();

const microTargets = document.querySelectorAll(
  [
    ".cta",
    ".rn-btn",
    ".rn-nav-primary",
    ".rn-nav-ghost",
    ".site-header__action",
    ".app-store-card__action",
    ".app-detail-sheet__primary",
    ".app-detail-sheet__secondary",
    ".app-detail-sheet__close",
    ".feature-card",
    ".support-card",
    ".account-mini-card",
    ".app-store-card",
    ".app-store-featured",
    ".apps-toolbar",
    ".app-detail-sheet",
    ".apps-return-strip",
    ".feature-ledger__row",
    ".apps-hero-ledger__item",
    ".api-route-card",
    ".api-docs-hero__meta article",
    ".brew-card",
    ".ios-card",
  ].join(", ")
);

microTargets.forEach((target) => {
  target.addEventListener("pointermove", (event) => {
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(rect.width, 1)));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(rect.height, 1)));
    target.style.setProperty("--rn-hover-x", `${(x * 100).toFixed(2)}%`);
    target.style.setProperty("--rn-hover-y", `${(y * 100).toFixed(2)}%`);
  });

  target.addEventListener("pointerleave", () => {
    target.style.setProperty("--rn-hover-x", "50%");
    target.style.setProperty("--rn-hover-y", "50%");
  });
});
