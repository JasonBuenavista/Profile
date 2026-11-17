const menuButton = document.querySelector('.menu');
const navLinks = document.querySelector('.navlinks');
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navLinks.classList.toggle('open', !isOpen);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navLinks.classList.remove('open');
}));
const navIndicator = document.createElement('span');
navIndicator.className = 'nav-indicator';
navIndicator.setAttribute('aria-hidden', 'true');
navLinks.append(navIndicator);
const sectionLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
const navSections = sectionLinks.map(link => ({ link, section: document.querySelector(link.getAttribute('href')) })).filter(item => item.section);
function updateNavIndicator() {
  const threshold = window.innerHeight * 0.42;
  let current = null;
  navSections.forEach(item => {
    const rect = item.section.getBoundingClientRect();
    if (rect.top <= threshold && rect.bottom > threshold) current = item;
  });
  if (!current) current = navSections.find(item => item.section.getBoundingClientRect().top > threshold) || navSections[navSections.length - 1];
  sectionLinks.forEach(link => link.removeAttribute('aria-current'));
  if (!current) { navIndicator.classList.remove('visible'); return; }
  current.link.setAttribute('aria-current', 'location');
  const isCta = current.link.classList.contains('nav-cta');
  const sideInset = isCta ? 0 : 13;
  navIndicator.style.width = `${current.link.offsetWidth + sideInset * 2}px`;
  navIndicator.style.transform = `translate(${current.link.offsetLeft - sideInset}px, -50%)`;
  navIndicator.classList.add('visible');
}
window.addEventListener('scroll', updateNavIndicator, { passive: true });
window.addEventListener('resize', updateNavIndicator);
updateNavIndicator();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Reusable infinite auto-scroll for a horizontally scrolling element.
   Expects [clones][originals][clones], with `cycle` = width of one set. */
function createLoop(el, speed) {
  const s = { user: prefersReducedMotion.matches, hover: false, touch: false, focus: false, off: false };
  let cycle = 0, pos = 0, raf = 0, last = 0, resume = 0;
  const canRun = () => cycle > 0 && !document.hidden && !Object.values(s).some(Boolean);

  function step(t) {
    if (!raf) return;
    if (last) {
      pos += Math.min(t - last, 50) * speed;       // keep the decimal part ourselves
      if (pos >= cycle * 2) pos -= cycle;
      else if (pos < cycle) pos += cycle;
      el.scrollLeft = pos;
    }
    last = t;
    raf = requestAnimationFrame(step);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; el.classList.remove('autoplay-running'); }
  function sync() {
    if (!canRun()) { stop(); return; }
    if (!raf) {
      pos = el.scrollLeft;
      el.classList.add('autoplay-running');   // disable scroll-snap while drifting
      raf = requestAnimationFrame(step);
    }
  }

  el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { s.hover = true; sync(); } });
  el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { s.hover = false; sync(); } });
  el.addEventListener('focusin', () => { s.focus = true; sync(); });
  el.addEventListener('focusout', () => { s.focus = false; sync(); });
  const hold = () => { clearTimeout(resume); s.touch = true; sync(); };
  const release = () => { clearTimeout(resume); resume = setTimeout(() => { s.touch = false; sync(); }, 1600); };
  el.addEventListener('pointerdown', hold);
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('wheel', () => { hold(); release(); }, { passive: true });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { s.off = !entry.isIntersecting; sync(); }).observe(el);
  }

  // keep the loop seamless when the visitor scrolls by hand
  el.addEventListener('scroll', () => {
    if (!cycle) return;
    if (raf) { if (Math.abs(el.scrollLeft - pos) > 3) pos = el.scrollLeft; return; }
    const x = el.scrollLeft;
    if (x < cycle) el.scrollLeft = x + cycle;
    else if (x >= cycle * 2) el.scrollLeft = x - cycle;
  }, { passive: true });

  return {
    setCycle(c) { cycle = c; if (c) { pos = c; el.scrollLeft = c; } sync(); },
    setUser(v) { s.user = v; sync(); },
    get userPaused() { return s.user; }
  };
}

function enableMouseDrag(el, ignore) {
  let startX = 0, startScroll = 0, active = false;
  el.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || (ignore && e.target.closest(ignore))) return;
    active = true; startX = e.clientX; startScroll = el.scrollLeft;
    el.classList.add('dragging'); el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!active) return;
    e.preventDefault();
    el.scrollLeft = startScroll - (e.clientX - startX);
  });
  const end = () => { active = false; el.classList.remove('dragging'); };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

/* ---------- Skills carousel ---------- */
const skillCarousel = document.querySelector('.skill-carousel');
const skillTrack = document.querySelector('.skill-track');
const skillCards = [...skillTrack.children];
const makeSkillClone = card => { const clone = card.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); return clone; };
skillCards.map(makeSkillClone).reverse().forEach(card => skillTrack.prepend(card));
skillCards.map(makeSkillClone).forEach(card => skillTrack.append(card));

const skillLoop = createLoop(skillCarousel, 0.02);   // ~20px/s, slow
let skillPitch = 0;
function measureSkills() {
  const n = skillCards.length, kids = skillTrack.children;
  skillPitch = kids[1].offsetLeft - kids[0].offsetLeft;
  skillLoop.setCycle(kids[2 * n].offsetLeft - kids[n].offsetLeft);
}
skillCarousel.addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault();
  skillCarousel.scrollBy({ left: e.key === 'ArrowRight' ? skillPitch : -skillPitch, behavior: 'smooth' });
});
enableMouseDrag(skillCarousel);
measureSkills();

/* ---------- Sticky stacking deck ---------- */
const filters = [...document.querySelectorAll('.filter')];
const stackCards = [...document.querySelectorAll('.stack .stack-card')];
const layeredCards = () => stackCards.filter(card => !card.hidden);

let stackTops = [];

function updateStack() {
  const cards = layeredCards();
  cards.forEach((card, index) => {
    const next = cards[index + 1];
    if (!next) { card.style.setProperty('--p', '0'); return; }
    const height = card.getBoundingClientRect().height || 1;
    const nextTop = next.getBoundingClientRect().top;
    const stickyTop = stackTops[index] || 0;
    const progress = Math.min(1, Math.max(0, (stickyTop + height - nextTop) / height));
    card.style.setProperty('--p', progress.toFixed(3));
  });
}

function layoutStack() {
  const cards = layeredCards();
  cards.forEach((card, index) => {
    card.style.setProperty('--i', String(index));
    card.style.zIndex = String(index + 1);
  });
  stackTops = cards.map(card => parseFloat(getComputedStyle(card).top) || 0);
  updateStack();
}

window.addEventListener('scroll', updateStack, { passive: true });

filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  stackCards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
  layoutStack();
}));

layoutStack();

/* ---------- Re-measure on resize / load ---------- */
let resizeTimer = 0;
const remeasure = () => { measureSkills(); layoutStack(); };
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(remeasure, 160); });
window.addEventListener('load', remeasure);

prefersReducedMotion.addEventListener('change', e => {
  skillLoop.setUser(e.matches);
});

/* ---------- Reactive hero & contact backgrounds ---------- */
(() => {
  const sections = [...document.querySelectorAll('.hero, .contact')];
  if (!sections.length) return;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!finePointer.matches || prefersReducedMotion.matches) return;

  sections.forEach(section => {
    section.addEventListener('pointermove', event => {
      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const width = section.clientWidth || 1;
      const height = section.clientHeight || 1;
      section.style.setProperty('--mx', x + 'px');
      section.style.setProperty('--my', y + 'px');
      section.style.setProperty('--px', ((x / width - .5) * 22).toFixed(2) + 'px');
      section.style.setProperty('--py', ((y / height - .5) * 22).toFixed(2) + 'px');
    }, { passive: true });
  });
})();
