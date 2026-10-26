// Small, consistent stroke icons; controls retain accessible text labels.
const sitePaths = {
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/>',
  sliders: '<path d="M4 7h8m4 0h4M4 17h3m4 0h9"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  'shield-check': '<path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7Z"/><path d="m8 12 3 3 5-6"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  monitor: '<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  pause: '<path d="M8 5v14m8-14v14"/>',
};
function siteIcon(name) { return `<svg class="site-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${sitePaths[name] || ''}</svg>`; }
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = siteIcon(el.dataset.icon); });
const siteReduced = matchMedia('(prefers-reduced-motion: reduce)');
// A single restrained entrance; content is always visible before enhancement.
if (!siteReduced.matches) document.querySelector('.hero-copy')?.animate(
  [{ opacity: .65, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
  { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' },
);
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
