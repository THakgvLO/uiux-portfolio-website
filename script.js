// Tsholi Podile portfolio — interactions

// Live clock in the masthead
function tickClock() {
  const el = document.getElementById('localTime');
  if (!el) return;
  const now = new Date();
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Johannesburg' };
  el.textContent = new Intl.DateTimeFormat('en-GB', opts).format(now) + ' SAST';
}

// Hamburger
function initNav() {
  const burger = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if (!burger || !links) return;
  burger.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    links.classList.toggle('is-open');
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('is-open');
      links.classList.remove('is-open');
    });
  });
}

// Reveal on scroll
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  els.forEach(el => io.observe(el));
}

// Case study toggle (grid <-> full prototype)
function setView(mode) {
  const staticView = document.getElementById('staticScreens');
  const protoView  = document.getElementById('livePrototype');
  const buttons    = document.querySelectorAll('[data-view]');
  if (!staticView || !protoView) return;
  if (mode === 'proto') {
    staticView.classList.add('hidden');
    protoView.classList.add('active');
  } else {
    staticView.classList.remove('hidden');
    protoView.classList.remove('active');
  }
  buttons.forEach(b => b.classList.toggle('active', b.dataset.view === mode));
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  tickClock();
  setInterval(tickClock, 30 * 1000);

  document.querySelectorAll('[data-view]').forEach(b => {
    b.addEventListener('click', () => setView(b.dataset.view));
  });
});
