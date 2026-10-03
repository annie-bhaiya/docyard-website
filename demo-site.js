// Only allow the embedded app's small, explicit message protocol.
const mobile = matchMedia('(max-width: 767px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const frame = document.querySelector('#app-demo');
const panel = document.querySelector('#tour-panel');
const caption = document.querySelector('#tour-caption');
const status = document.querySelector('#demo-status');
const play = document.querySelector('#play-tour');
const tabs = [...document.querySelectorAll('[data-screen]')];
const previewViewport = document.querySelector('.app-frame-viewport');
const compactMode = () => mobile.matches && !panel.classList.contains('expanded');
function syncPreviewSize() {
  panel.style.setProperty('--preview-scale', String(previewViewport.clientWidth / 390));
  frame.inert = compactMode();
  frame.tabIndex = compactMode() ? -1 : 0;
  frame.setAttribute('aria-hidden', String(compactMode()));
}
new ResizeObserver(syncPreviewSize).observe(previewViewport);
mobile.addEventListener('change', syncPreviewSize);
let ready = false;
let playing = false;
let selected = 'vault';
let theme = 'dark';
try { theme = localStorage.getItem('docyard-site-theme') === 'light' ? 'light' : 'dark'; } catch {}
const send = (type, payload = {}) => frame.contentWindow?.postMessage({ channel: 'docyard-site', type, ...payload }, location.origin);
function setPlaying(value) { playing = value; play.textContent = value ? 'Ⅱ Stop tour' : '▶ Watch it work'; play.setAttribute('aria-pressed', String(value)); }
function pause() { send('pause'); if (playing) status.textContent = 'Tour paused · explore or replay'; setPlaying(false); }
function setTheme(value) {
  theme = value; document.documentElement.dataset.theme = theme;
  document.querySelector('#theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  document.querySelector('#theme-toggle').textContent = theme === 'dark' ? '☼' : '☾';
  try { localStorage.setItem('docyard-site-theme', theme); } catch {}
  if (ready) send('theme', { theme });
}
setTheme(theme);
document.querySelector('#theme-toggle').addEventListener('click', () => setTheme(theme === 'dark' ? 'light' : 'dark'));
function markTab(name, focus = false) {
  selected = name;
  panel.setAttribute('aria-labelledby', `tab-${name}`);
  tabs.forEach(tab => { const active = tab.dataset.screen === name; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && focus) tab.focus({ preventScroll: true }); });
}
function selectScreen(name, focus = false) {
  pause(); markTab(name, focus); if (ready) send('navigate', { screen: name });
  caption.textContent = { vault: 'Make yourself at home. Search, open a document, or create a folder.', editor: 'Try the actual editing controls. Sample changes create a new copy in your vault.', health: 'Compare the fictional records. The sample PAN card has a name mismatch.' }[name];
}
function loadDemo() {
  ready = false; pause(); play.disabled = true;
  status.textContent = 'Loading your sample workspace…';
  frame.src = `demo/index.html?device=${mobile.matches ? 'mobile' : 'desktop'}`;
  document.querySelectorAll('.device-label').forEach(el => { el.textContent = mobile.matches ? 'THE MOBILE EXPERIENCE' : 'THE DESKTOP EXPERIENCE'; });
}
loadDemo(); mobile.addEventListener('change', loadDemo);
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.channel !== 'docyard-demo') return;
  const data = event.data;
  if (data.type === 'ready' && !ready) { ready = true; play.disabled = false; status.textContent = compactMode() ? 'Live preview · expand to explore' : 'Live · click anywhere to explore'; send('theme', { theme }); send('navigate', { screen: selected }); }
  if (data.type === 'route') markTab(data.screen);
  if (data.type === 'interaction') { setPlaying(false); status.textContent = 'You’re in control · explore freely'; }
  if (data.type === 'step') { caption.textContent = data.text; document.querySelectorAll('.tour-progress span').forEach((el, i) => el.classList.toggle('active', i <= data.index)); }
  if (data.type === 'complete') { setPlaying(false); status.textContent = 'Your turn · try the sample vault'; }
  if (data.type === 'tour-unavailable') { setPlaying(false); status.textContent = 'Reset the sample vault to replay the tour'; caption.textContent = 'This sample has changed. Reset the vault above to restore the guided tour’s documents.'; }
  if (data.type === 'escape' && panel.classList.contains('expanded')) expand(false);
});
play.addEventListener('click', () => {
  if (playing) { pause(); status.textContent = 'You’re in control · explore freely'; return; }
  if (reduced.matches) { selectScreen('vault'); caption.textContent = 'Motion is reduced. Explore the vault, studio, and health check using the tabs above.'; return; }
  // Bring the app into view even when the play button sits at the viewport's bottom.
  panel.scrollIntoView({ block: 'center', behavior: 'instant' });
  setPlaying(true); status.textContent = compactMode() ? 'A little tour · expand to take over' : 'Guided tour · touch the app to take over'; send('play');
});
document.querySelector('#reset-demo').addEventListener('click', () => { selected = 'vault'; loadDemo(); caption.textContent = 'A fresh sample vault. Everything is ready to try again.'; document.querySelectorAll('.tour-progress span').forEach(el => el.classList.remove('active')); });
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScreen(tab.dataset.screen));
  tab.addEventListener('keydown', event => {
    const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return; event.preventDefault(); selectScreen(tabs[next].dataset.screen, true);
  });
});
document.querySelectorAll('[data-open-screen]').forEach(link => link.addEventListener('click', () => selectScreen(link.dataset.openScreen)));
let previousFocus;
let savedScroll = 0;
let savedBodyTop = '';
const placeholder = document.createElement('div');
placeholder.hidden = true;
placeholder.setAttribute('aria-hidden', 'true');
panel.before(placeholder);
const inertElements = [];
function expand(value) {
  if (panel.classList.contains('expanded') === value) return;
  pause();
  const before = panel.getBoundingClientRect();
  if (value) {
    savedScroll = scrollY; savedBodyTop = document.body.style.top;
    placeholder.style.height = `${before.height}px`; placeholder.hidden = false;
    document.body.style.top = `-${savedScroll}px`;
  }
  panel.classList.toggle('expanded', value); document.body.classList.toggle('demo-expanded', value);
  syncPreviewSize();
  document.querySelector('#expand-demo').setAttribute('aria-expanded', String(value));
  if (value) {
    previousFocus = document.activeElement;
    for (let node = panel; node.parentElement && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) if (sibling !== node && !sibling.inert) { sibling.inert = true; inertElements.push(sibling); }
    }
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
    document.querySelector('#exit-demo').focus();
    status.textContent = 'You’re in control · explore freely';
    if (!reduced.matches) panel.animate([{opacity:.25,transform:'translateY(18px) scale(.98)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});
  } else {
    inertElements.splice(0).forEach(el => { el.inert = false; }); panel.setAttribute('role', 'tabpanel'); panel.removeAttribute('aria-modal');
    placeholder.hidden = true; document.body.style.top = savedBodyTop;
    window.scrollTo({ top: savedScroll, behavior: 'instant' }); previousFocus?.focus({ preventScroll: true });
    status.textContent = compactMode() ? 'Live preview · expand to explore' : 'Live · click anywhere to explore';
    if (!reduced.matches) panel.animate([{opacity:.45},{opacity:1}],{duration:240});
  }
}
document.querySelector('#expand-demo').addEventListener('click', () => expand(true));
document.querySelector('#preview-shield').addEventListener('click', () => expand(true));
document.querySelector('#expanded-reset').addEventListener('click', () => { selected = 'vault'; loadDemo(); });
document.querySelector('#exit-demo').addEventListener('click', () => expand(false));
document.addEventListener('keydown', event => {
  if (!panel.classList.contains('expanded')) return;
  if (event.key === 'Escape') expand(false);
  if (event.key === 'Tab' && !event.shiftKey && document.activeElement === document.querySelector('#exit-demo')) { event.preventDefault(); frame.focus(); }
});
new IntersectionObserver(([entry]) => {
  const bounds = panel.getBoundingClientRect();
  if (!entry.isIntersecting && playing && (bounds.bottom <= 0 || bounds.top >= innerHeight)) pause();
}, { threshold: 0 }).observe(panel);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
reduced.addEventListener('change', () => { if (reduced.matches) pause(); });
