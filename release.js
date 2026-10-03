const installTabs = [...document.querySelectorAll('[data-install]')];
const installation = document.querySelector('#installation');
const installCopy = {
  windows: ['Download. Open.', 'Get the portable Windows executable and open it. The desktop interface uses Microsoft Edge WebView2.', 'Portable beta executable · Windows x64'],
  android: ['Download. Install.', 'Get the Android test APK, open it, and follow your device’s installation prompts. Then open Docyard to create your vault.', 'Android 7 or later · Debug-signed test build · Direct install'],
};
function chooseInstall(platform, focus = false) {
  const copy = installCopy[platform];
  document.querySelector('#install-step-title').textContent = copy[0];
  document.querySelector('#install-step-copy').textContent = copy[1];
  document.querySelector('#install-note').textContent = copy[2];
  installation.setAttribute('aria-labelledby', `install-${platform}`);
  installTabs.forEach(tab => {
    const active = tab.dataset.install === platform;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    if (focus && active) tab.focus();
  });
  if (!reduced.matches) installation.querySelector('article').animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});
}
installTabs.forEach((tab,index) => {
  tab.addEventListener('click', () => chooseInstall(tab.dataset.install));
  tab.addEventListener('keydown', event => {
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    chooseInstall(installTabs[event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1-index].dataset.install,true);
  });
});
chooseInstall(mobile.matches ? 'android' : 'windows');

const reportForm = document.querySelector('#feedback-form');
reportForm.addEventListener('submit', async event => {
  event.preventDefault();
  const platform = document.querySelector('#feedback-platform').value;
  const summary = document.querySelector('#feedback-summary').value.trim();
  if (!summary) { document.querySelector('#feedback-summary').focus(); return; }
  const report = `Docyard beta feedback\nPlatform: ${platform}\n\nWhat happened:\n${summary}\n\nSteps to reproduce:\n1. \n2. \n\nWhat I expected:\n\nDevice / OS version:\n\nPlease remove personal details, document contents, and PINs before sharing.`;
  const output = document.querySelector('#feedback-output');
  const result = document.querySelector('#feedback-status');
  output.value = report;
  try {
    await navigator.clipboard.writeText(report);
    output.hidden = true;
    result.textContent = 'Report copied. Paste it wherever you received the beta.';
  } catch {
    output.hidden = false; output.focus(); output.select();
    result.textContent = 'Your report is ready below. Select and copy it to share.';
  }
});

// Ambient illustrations animate only while visible, with no React or frame timers.
const artVisibility = new Map();
const syncArt = () => artVisibility.forEach((visible,el) => { el.style.animationPlayState = visible && !document.hidden && !reduced.matches ? 'running' : 'paused'; });
const artObserver = new IntersectionObserver(entries => { entries.forEach(entry => artVisibility.set(entry.target,entry.isIntersecting)); syncArt(); });
document.querySelectorAll('.case-art').forEach(el => artObserver.observe(el));
document.addEventListener('visibilitychange',syncArt); reduced.addEventListener('change',syncArt);

let journeyVisible = false;
let journeyFrame = 0;
function drawJourney() {
  journeyFrame = 0;
  if (!journeyVisible) return;
  const box = installation.getBoundingClientRect();
  const progress = reduced.matches ? 1 : Math.max(0,Math.min(1,(innerHeight * .88-box.top) / (box.height+innerHeight*.2)));
  installation.style.setProperty('--journey-progress',progress.toFixed(3));
}
new IntersectionObserver(([entry]) => { journeyVisible = entry.isIntersecting; drawJourney(); }).observe(installation);
window.addEventListener('scroll', () => { if(journeyVisible && !journeyFrame) journeyFrame=requestAnimationFrame(drawJourney); },{passive:true});
window.addEventListener('resize',drawJourney,{passive:true}); reduced.addEventListener('change',drawJourney);
