// Replate marketing site main script
// - Dynamically sets Donor and Business links based on current domain
// - Animates plates saved counter
// - Updates footer year

(function () {
  function baseDomain() {
    // Remove leading www. if present
    return window.location.hostname.replace(/^www\./, '');
  }

  function updateLinks() {
    const domain = baseDomain();
    const donorBase = `https://donor.${domain}`;
    const businessBase = `https://business.${domain}`;

    document.querySelectorAll('.dynamic-donor-link').forEach((a) => {
      const path = a.getAttribute('href') || '/';
      a.setAttribute('href', donorBase + (path.startsWith('/') ? path : `/${path}`));
    });

    document.querySelectorAll('.dynamic-business-link').forEach((a) => {
      const path = a.getAttribute('href') || '/';
      a.setAttribute('href', businessBase + (path.startsWith('/') ? path : `/${path}`));
    });
  }

  function animateCounter(el, start, end, durationMs) {
    if (!el) return;
    const startTs = performance.now();
    const formatter = new Intl.NumberFormat(undefined);
    function step(now) {
      const t = Math.min(1, (now - startTs) / durationMs);
      const value = Math.floor(start + (end - start) * (t * (2 - t))); // easeOut
      el.textContent = formatter.format(value);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounter() {
    const el = document.getElementById('platesCounter');
    if (!el) return;
    const start = Number(el.dataset.start || '0');
    const target = Number(el.dataset.target || start + 1000);
    animateCounter(el, start, target, 2200);
  }

  function setYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function init() {
    updateLinks();
    initCounter();
    setYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
