// This page is readable without JavaScript; interactions progressively enhance it.
const mobile = matchMedia('(max-width: 767px)');
const updateDevice = () => document.querySelectorAll('.device-label').forEach(el => { el.textContent = mobile.matches ? 'THE MOBILE EXPERIENCE' : 'THE DESKTOP EXPERIENCE'; });
mobile.addEventListener('change', updateDevice);
updateDevice();

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const panel = document.querySelector('#tour-panel');
const picture = document.querySelector('#tour-picture');
const screenImage = document.querySelector('#tour-image');
const caption = document.querySelector('#tour-caption');
const tabs = [...document.querySelectorAll('[data-screen]')];
const screens = {
  vault: { caption: 'A home for every document. Search, organize, and pick up where you left off.', alt: 'Docyard vault showing organized sample documents and folders' },
  editor: { caption: 'A few thoughtful tools. Preview, resize, compress, and prepare your documents.', alt: 'Docyard document studio showing a sample preview and editing tools' },
  health: { caption: 'The details in one place. Compare your records and spot what needs a closer look.', alt: 'Docyard health check showing the consistency of fictional sample records' },
};
let selection = 0;
async function selectScreen(name, focus = false) {
  if (!screens[name]) return;
  const current = ++selection;
  const image = new Image();
  image.src = `assets/screenshots/${name}-${mobile.matches ? 'mobile' : 'desktop'}.jpg`;
  panel.setAttribute('aria-busy', 'true');
  try { await image.decode(); }
  catch { if (current === selection) { caption.textContent = 'The screenshot could not load. Please try the tab again.'; panel.removeAttribute('aria-busy'); } return; }
  if (current !== selection) return;
  picture.querySelector('source').srcset = `assets/screenshots/${name}-mobile.jpg`;
  screenImage.src = `assets/screenshots/${name}-desktop.jpg`;
  screenImage.alt = screens[name].alt;
  caption.textContent = screens[name].caption;
  panel.setAttribute('aria-labelledby', `tab-${name}`);
  panel.removeAttribute('aria-busy');
  tabs.forEach(tab => {
    const active = tab.dataset.screen === name;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus({ preventScroll: true });
  });
  if (!reduced.matches) screenImage.animate([{ opacity: .3, transform: 'scale(1.015)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 340, easing: 'cubic-bezier(.16,1,.3,1)' });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScreen(tab.dataset.screen));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectScreen(tabs[next].dataset.screen, true);
  });
});
document.querySelectorAll('[data-open-screen]').forEach(link => link.addEventListener('click', () => selectScreen(link.dataset.openScreen)));

// Native animations use only opacity and transforms. Content is never hidden by default.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!reduced.matches) entry.target.animate(
      [{ opacity: .12, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)', delay: Number(entry.target.dataset.delay || 0) },
    );
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
if (!reduced.matches) document.querySelectorAll('.hero-in').forEach((element, index) => element.animate(
  [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
  { duration: 900, delay: index * 110, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
));

const tilt = document.querySelector('[data-tilt]');
let tiltFrame = 0;
let bounds;
tilt.addEventListener('pointerenter', () => { bounds = tilt.getBoundingClientRect(); });
tilt.addEventListener('pointermove', event => {
  if (reduced.matches || !finePointer.matches || !bounds) return;
  cancelAnimationFrame(tiltFrame);
  const x = (event.clientX - bounds.left) / bounds.width - .5;
  const y = (event.clientY - bounds.top) / bounds.height - .5;
  tiltFrame = requestAnimationFrame(() => { tilt.style.transform = `rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`; });
});
const resetTilt = () => { cancelAnimationFrame(tiltFrame); tilt.style.transform = ''; };
tilt.addEventListener('pointerleave', resetTilt);
window.addEventListener('resize', resetTilt, { passive: true });

let scrollFrame = 0;
const progress = document.querySelector('.reading-progress');
const updateProgress = () => {
  scrollFrame = 0;
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
};
window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress); }, { passive: true });
window.addEventListener('resize', updateProgress, { passive: true });
updateProgress();

// Stop ambient motion when off screen, in background tabs, or reduced motion is requested.
const orbit = document.querySelector('.hero-orbit span');
let orbitVisible = true;
const updateMotion = () => {
  orbit.style.animationPlayState = orbitVisible && !document.hidden && !reduced.matches ? 'running' : 'paused';
  if (reduced.matches) { document.getAnimations().forEach(animation => { if (animation.effect?.target !== orbit) animation.finish(); }); resetTilt(); }
};
new IntersectionObserver(([entry]) => { orbitVisible = entry.isIntersecting; updateMotion(); }).observe(document.querySelector('.hero'));
document.addEventListener('visibilitychange', updateMotion);
reduced.addEventListener('change', updateMotion);
updateMotion();
