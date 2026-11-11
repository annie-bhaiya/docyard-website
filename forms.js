const formsConfig = window.DOCYARD_FORMS;
const forms = [...document.querySelectorAll('form[data-kind]')];
if (formsConfig?.turnstileSiteKey) {
  window.docyardCaptchaReady = () => forms.forEach(form => {
    form.dataset.widget = window.turnstile.render(form.querySelector('.captcha'), {
      sitekey: formsConfig.turnstileSiteKey, action: form.dataset.kind, size: 'flexible',
    });
  });
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=docyardCaptchaReady&render=explicit';
  script.async = true;
  document.head.append(script);
}
forms.forEach(form => form.addEventListener('submit', async event => {
  event.preventDefault();
  if (form.dataset.busy === 'true' || !form.reportValidity()) return;
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type=submit]');
  const label = button.textContent;
  const fields = new FormData(form);
  const token = fields.get('cf-turnstile-response') || '';
  if (formsConfig?.turnstileSiteKey && !token) {
    status.dataset.state = 'error'; status.textContent = 'Complete the security check, then try again.'; return;
  }
  form.dataset.busy = 'true'; form.setAttribute('aria-busy', 'true'); button.disabled = true;
  button.textContent = 'Sending…'; status.textContent = ''; status.dataset.state = '';
  try {
    if (!formsConfig?.endpoint) throw new Error('The form is unavailable. Please email contact@docyard.live.');
    const response = await fetch(formsConfig.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ kind: form.dataset.kind, email: fields.get('email'), name: fields.get('name') || '', message: fields.get('message') || '', consent: fields.get('consent') === 'on', website: fields.get('website') || '', token }),
    });
    if (!response.ok) {
      status.dataset.state = 'error';
      status.textContent = response.status === 429
        ? 'Too many attempts. Please try again in an hour, or email contact@docyard.live.'
        : response.status === 400
          ? 'Check your details and security check, then try again.'
          : 'We could not send this. Please try again or email contact@docyard.live.';
      return;
    }
    form.reset(); status.dataset.state = 'success';
    status.textContent = form.dataset.kind === 'signup' ? "You're on the list. We'll email you when there's news about alpha access." : "Your message has been received. We'll reply to the email you provided.";
  } catch (error) {
    status.dataset.state = 'error';
    status.textContent = error.name === 'TimeoutError' || error.name === 'TypeError'
      ? 'Connection interrupted. Your details are still here; please try again.'
      : 'The form is unavailable. Please try again or email contact@docyard.live.';
  } finally {
    form.dataset.busy = 'false'; form.removeAttribute('aria-busy'); button.disabled = false; button.textContent = label;
    if (form.dataset.widget) window.turnstile?.reset(form.dataset.widget);
  }
}));
