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
  if (reduced.matches) { document.getAnimations().forEach(animation => { if (animation.effect?.target !== orbit) animation.finish(); }); }
};
new IntersectionObserver(([entry]) => { orbitVisible = entry.isIntersecting; updateMotion(); }).observe(document.querySelector('.hero'));
document.addEventListener('visibilitychange', updateMotion);
reduced.addEventListener('change', updateMotion);
updateMotion();

const workflow = document.querySelector('.workflow');
let workflowVisible = false;
const syncWorkflowMotion = () => workflow.querySelectorAll('.workflow-sheet,.workflow-chip').forEach(el => {
  el.style.animationPlayState = workflowVisible && !document.hidden && !reduced.matches ? 'running' : 'paused';
});
new IntersectionObserver(([entry]) => { workflowVisible = entry.isIntersecting; syncWorkflowMotion(); }).observe(workflow);
document.addEventListener('visibilitychange', syncWorkflowMotion);
reduced.addEventListener('change', syncWorkflowMotion);

