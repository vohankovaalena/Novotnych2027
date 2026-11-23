/* Svatební web Marie & Ondřej – skript webu
 * - RSVP formulář přes Web3Forms (https://web3forms.com)
 * - odpočet do svatby
 * - jemné animace při scrollu
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
   * NASTAVENÍ
   * Access key získáte zdarma na https://web3forms.com (zadáte e-mail,
   * na který mají chodit odpovědi). Dokud je zde výchozí text, formulář
   * běží v DEMO režimu: nic neodesílá, jen ukáže poděkování.
   * ------------------------------------------------------------------ */
  const WEB3FORMS_ACCESS_KEY = 'VLOZTE_SEM_WEB3FORMS_ACCESS_KEY';
  const WEDDING_DATE = '2027-05-29T11:30:00+02:00';

  const DEMO = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(WEB3FORMS_ACCESS_KEY);


  /* ---------------- Odpočet ---------------- */
  const target = new Date(WEDDING_DATE).getTime();
  const pad = (n) => String(n).padStart(2, '0');
  const plural = (n, one, few, many) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many);

  document.querySelectorAll('[data-countdown]').forEach((el) => {
    const parts = {
      d: el.querySelector('[data-d]'),
      h: el.querySelector('[data-h]'),
      m: el.querySelector('[data-m]'),
      s: el.querySelector('[data-s]'),
    };
    const labels = {
      d: el.querySelector('[data-d-label]'),
      h: el.querySelector('[data-h-label]'),
      m: el.querySelector('[data-m-label]'),
    };
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      if (parts.d) parts.d.textContent = d;
      if (parts.h) parts.h.textContent = pad(h);
      if (parts.m) parts.m.textContent = pad(m);
      if (parts.s) parts.s.textContent = pad(s);
      if (labels.d) labels.d.textContent = plural(d, 'den', 'dny', 'dní');
      if (labels.h) labels.h.textContent = plural(h, 'hodina', 'hodiny', 'hodin');
      if (labels.m) labels.m.textContent = plural(m, 'minuta', 'minuty', 'minut');
    };
    tick();
    setInterval(tick, 1000);
  });

  /* ---------------- Animace při scrollu ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- RSVP formulář ---------------- */
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const success = document.querySelector('[data-rsvp-success]');
  const errorBox = form.querySelector('[data-rsvp-error]');
  const attendingBlock = form.querySelector('[data-attending]');
  const submitBtn = form.querySelector('[type="submit"]');

  const setAttending = () => {
    const val = (form.querySelector('[name="ucast"]:checked') || {}).value;
    const no = val === 'Bohužel nemůžu';
    if (attendingBlock) {
      attendingBlock.hidden = no;
      attendingBlock.querySelectorAll('input, select, textarea').forEach((el) => (el.disabled = no));
    }
  };
  form.querySelectorAll('[name="ucast"]').forEach((r) => r.addEventListener('change', setAttending));
  setAttending();

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (errorBox) errorBox.hidden = true;
    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    if (fd.get('botcheck')) return; // spam bot

    const name = (fd.get('jmeno') || '').toString().trim();
    const attending = (fd.get('ucast') || '').toString();

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `RSVP: ${name} – ${attending}`,
      from_name: 'Svatební web Marie & Ondřej',
      'Jméno a příjmení': name,
      'Přijde?': attending,
    };
    if (attending !== 'Bohužel nemůžu') {
      payload['Odvoz na obřad (z ubytování)'] = fd.get('odvoz_tam') || 'neuvedeno';
      payload['Odvoz na ubytování (po oslavě)'] = fd.get('odvoz_zpet') || 'neuvedeno';
    }
    payload['Vzkaz'] = (fd.get('vzkaz') || '').toString().trim() || '—';

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    const origLabel = submitBtn.textContent;
    submitBtn.textContent = 'Odesílám…';

    try {
      if (DEMO) {
        console.info('[RSVP demo] Formulář by odeslal:', payload);
        await new Promise((r) => setTimeout(r, 700));
      } else {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || res.statusText);
      }
      showSuccess(attending === 'Bohužel nemůžu');
    } catch (err) {
      console.error(err);
      if (errorBox) {
        errorBox.textContent = 'Jejda, odeslání se nepovedlo. Zkuste to prosím za chvilku znovu, případně nám napište.';
        errorBox.hidden = false;
      }
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.textContent = origLabel;
    }
  });

  function showSuccess(declined) {
    if (!success) return;
    const t = success.querySelector('[data-success-title]');
    const p = success.querySelector('[data-success-text]');
    if (declined) {
      if (t) t.textContent = 'Díky, že jste nám dali vědět.';
      if (p) p.textContent = 'Budete nám chybět – připijeme si i na vás.';
    }
    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();
