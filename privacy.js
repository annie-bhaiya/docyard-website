const toggle = document.querySelector('#theme-toggle');
let theme = 'dark';
try { theme = localStorage.getItem('docyard-site-theme') === 'light' ? 'light' : 'dark'; } catch {}
function apply() {
  document.documentElement.dataset.theme = theme;
  toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111816' : '#f5f6f1';
  try { localStorage.setItem('docyard-site-theme', theme); } catch {}
}
apply();
toggle.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; apply(); });
