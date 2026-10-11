/* 3D Mech Design — renders the site from /content/*.json (edited via /admin) */
(async function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');
  const safeIcon = (c, fb) => (/^[\w\- ]+$/.test(c || '') ? c : fb);
  const safeImg = (u) => (/^(\/|https?:\/\/|images\/)/i.test(u || '') ? u : '');
  const set = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt ?? ''; };

  const load = async (name) => {
    try {
      const r = await fetch('content/' + name + '.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.warn('Could not load content/' + name + '.json', e);
      return null;
    }
  };

  const [site, services, projects, skills, insights, testimonials] = await Promise.all(
    ['site', 'services', 'projects', 'skills', 'insights', 'testimonials'].map(load)
  );

  /* ---------- header / mobile nav ---------- */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const toggle = $('.mobile-toggle'), links = $('.nav-links');
  toggle.addEventListener('click', () => links.classList.toggle('nav-active'));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('nav-active')));

  /* ---------- site settings ---------- */
  if (site) {
    const h = site.hero || {}, a = site.about || {}, c = site.contact || {}, s = site.social || {}, f = site.footer || {};
    document.title = (site.name || '') + (site.tagline ? ' — ' + site.tagline : '');
    const md = document.querySelector('meta[name="description"]');
    if (md && site.description) md.content = site.description;
    set('#siteNameNav', site.name); set('#siteNameFooter', site.name);

    set('#heroBadge', h.badge); set('#heroTitle1', h.title1); set('#heroTitle2', h.title2); set('#heroDesc', h.description);
    [1, 2, 3].forEach((n) => { set('#m' + n + 'v', h['metric' + n + '_value']); set('#m' + n + 'l', h['metric' + n + '_label']); });
    set('#cta1', h.cta1); set('#cta2', h.cta2);
    set('#founderName', a.founder_name); set('#founderTitle', a.founder_title);
    if (safeImg(h.image)) { const i = $('#heroImage'); i.src = h.image; i.alt = a.founder_name || ''; i.hidden = false; $('#heroFallback').hidden = true; }

    set('#aboutBadge', a.badge); set('#aboutTitle', a.title); set('#aboutSubtitle', a.subtitle);
    set('#aboutFounderName', a.founder_name); set('#aboutFounderTitle', a.founder_title);
    $('#aboutStory').innerHTML = String(a.story || '').split(/\n\s*\n/).filter(Boolean).map((p) => '<p>' + esc(p.trim()) + '</p>').join('');
    set('#aboutVision', a.vision); set('#aboutEducation', a.education); set('#aboutLeadership', a.leadership);
    set('#aboutLocation', c.address);
    if (safeImg(a.image)) { const i = $('#aboutImage'); i.src = a.image; i.alt = 'About ' + (site.name || ''); i.hidden = false; }
    set('#insightsSub', 'Technical deep-dives authored by ' + (a.founder_name || 'our team') + '.');

    // contact
    const em = $('#contactEmail'); em.textContent = c.email || ''; em.href = c.email ? 'mailto:' + c.email : '#';
    const wa = String(c.whatsapp || '').replace(/\D/g, '');
    const waLink = wa ? 'https://wa.me/' + wa : '';
    const wl = $('#contactWhatsapp'); wl.textContent = c.phone || ''; if (waLink) wl.href = waLink;
    const wb = $('#whatsappBtn');
    if (waLink) wb.href = waLink + '?text=' + encodeURIComponent("Hi! I'd like to know more about your design consulting services.");
    else wb.hidden = true;
    set('#contactAddress', c.address); set('#contactResponse', c.response_time);

    // footer
    set('#footerAbout', f.about); set('#footerCopyright', f.copyright); set('#year', new Date().getFullYear());
    const socials = [['linkedin', 'fa-brands fa-linkedin', 'LinkedIn'], ['instagram', 'fa-brands fa-instagram', 'Instagram'], ['facebook', 'fa-brands fa-facebook', 'Facebook'], ['youtube', 'fa-brands fa-youtube', 'YouTube'], ['twitter', 'fa-brands fa-x-twitter', 'X'], ['github', 'fa-brands fa-github', 'GitHub']];
    $('#socialLinks').innerHTML = socials.filter(([k]) => safeUrl(s[k])).map(([k, ic, lb]) =>
      `<a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${lb}"><i class="${ic}"></i></a>`).join('');
    $('#footerContact').innerHTML = [
      c.email ? `<li><a href="mailto:${esc(c.email)}"><i class="fa-solid fa-envelope"></i>${esc(c.email)}</a></li>` : '',
      c.phone ? `<li><a href="${waLink || '#'}"><i class="fa-solid fa-phone"></i>${esc(c.phone)}</a></li>` : '',
      c.address ? `<li><span><i class="fa-solid fa-location-dot"></i>${esc(c.address)}</span></li>` : ''
    ].join('');
  }

  /* ---------- marquee ---------- */
  const stack = [['fa-cube', 'SolidWorks'], ['fa-calculator', 'MATLAB'], ['fa-pen-ruler', 'AutoCAD'], ['fa-arrows-spin', 'Fusion 360'], ['fa-microchip', 'LabVIEW'], ['fa-robot', 'Arduino']];
  $('#marquee').innerHTML = [...stack, ...stack].map(([i, n]) => `<div class="marquee-item"><i class="fa-solid ${i}"></i>${n}</div>`).join('');

  /* ---------- services ---------- */
  const svc = ((services && services.items) || []).filter((x) => x.visible !== false);
  $('#servicesGrid').innerHTML = svc.map((x) => `
    <div class="service-card glass-panel">
      <div class="service-icon"><i class="${safeIcon(x.icon, 'fa-solid fa-cube')}"></i></div>
      <h3>${esc(x.title)}</h3><p>${esc(x.description)}</p>
    </div>`).join('');
  $('#footerServices').innerHTML = svc.slice(0, 5).map((x) => `<li><a href="#services">${esc(x.title)}</a></li>`).join('');

  /* ---------- skills ---------- */
  $('#skillsList').innerHTML = ((skills && skills.items) || []).filter((x) => x.visible !== false).map((x) => {
    const pct = Math.max(0, Math.min(100, Number(x.percentage) || 0));
    return `<div class="skill-item">
      <div class="skill-header"><div class="skill-title"><div class="skill-icon"><i class="${safeIcon(x.icon, 'fa-solid fa-cube')}"></i></div>${esc(x.title)}</div><div class="skill-pct">${pct}%</div></div>
      <div class="progress-track"><div class="progress-fill" data-w="${pct}"></div></div></div>`;
  }).join('');

  /* ---------- projects ---------- */
  $('#portfolioGrid').innerHTML = ((projects && projects.items) || []).filter((x) => x.visible !== false).map((p) => {
    const tools = String(p.tools || '').split(',').map((t) => t.trim()).filter(Boolean).join(' · ');
    const media = safeImg(p.image) ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : '<i class="fa-solid fa-gear" aria-hidden="true"></i>';
    return `<article class="portfolio-card glass-panel">
      <div class="port-img-wrap">${media}</div>
      <div class="port-content">
        <div class="port-cat">${esc(p.category)}</div>
        <h3 class="port-title">${esc(p.title)}</h3>
        <p class="port-desc">${esc(p.description)}</p>
        <div class="port-meta"><span class="port-tool">${esc(tools)}</span><a href="#contact">Discuss this project</a></div>
      </div></article>`;
  }).join('');

  /* ---------- insights ---------- */
  const arts = ((insights && insights.items) || []).filter((x) => x.published !== false)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  $('#insightsGrid').innerHTML = arts.map((x) => {
    const d = x.date ? new Date(x.date) : null;
    const ok = d && !isNaN(d);
    return `<article class="article-card">
      <div class="article-date"><span class="date-month">${ok ? d.toLocaleString('en', { month: 'short' }) : ''}</span><span class="date-year">${ok ? d.getFullYear() : ''}</span></div>
      <div class="article-content"><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p><a href="#contact" class="read-more">Request the full paper</a></div></article>`;
  }).join('');
  if (!arts.length) $('#insights').hidden = true;

  /* ---------- testimonials (hidden until you add real ones) ---------- */
  const tl = ((testimonials && testimonials.items) || []).filter((x) => x.visible !== false);
  if (tl.length) {
    $('#testimonials').hidden = false;
    $('#testimonialsGrid').innerHTML = tl.map((t) => {
      const r = Math.max(1, Math.min(5, Number(t.rating) || 5));
      const who = [t.client_title, t.client_company].filter(Boolean).join(', ');
      return `<div class="testimonial-card glass-panel">
        <div class="testimonial-rating" aria-label="${r} out of 5">${'<i class="fa-solid fa-star"></i>'.repeat(r)}</div>
        <blockquote>“${esc(t.content)}”</blockquote>
        <div class="testimonial-author"><div class="testimonial-avatar">${esc((t.client_name || '?').charAt(0).toUpperCase())}</div>
        <div><strong>${esc(t.client_name)}</strong><span>${esc(who)}</span></div></div></div>`;
    }).join('');
  }

  /* ---------- tabs ---------- */
  document.querySelectorAll('.tab-btn').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(b.dataset.target).classList.add('active');
  }));

  /* ---------- gear calculator ---------- */
  const T = $('#calcTeeth'), D = $('#calcDia'), R = $('#calcResult');
  const calc = () => {
    const n = parseFloat(T.value) || 0, d = parseFloat(D.value) || 0;
    R.textContent = d > 0 ? (n / d).toFixed(2) + ' DP' : '—';
  };
  T.addEventListener('input', calc); D.addEventListener('input', calc); calc();

  /* ---------- scroll reveal + skill bars ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('active');
    e.target.querySelectorAll('.progress-fill').forEach((f) => (f.style.width = f.dataset.w + '%'));
    io.unobserve(e.target);
  }), { threshold: 0.12 });
  document.querySelectorAll('section:not(#hero) .container').forEach((el) => { if (!reduce) el.classList.add('reveal'); io.observe(el); });

  /* ---------- active nav link ---------- */
  const navIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) document.querySelectorAll('.nav-link').forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['hero', 'about', 'skills', 'portfolio', 'insights'].forEach((id) => navIO.observe(document.getElementById(id)));

  /* ---------- contact form (Netlify Forms) ---------- */
  const form = $('#contactForm'), box = $('#formAlert');
  const say = (type, msg) => { box.className = 'form-alert ' + type; box.textContent = msg; box.hidden = false; };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!r.ok) throw new Error(r.status);
      say('success', 'Thank you — your inquiry was sent. We will reply within one business day.');
      form.reset();
    } catch (err) {
      const mail = site && site.contact && site.contact.email;
      say('error', 'The message could not be sent.' + (mail ? ' Please email us directly at ' + mail + '.' : ''));
    } finally { btn.disabled = false; }
  });

  /* ---------- particles ---------- */
  const cv = $('#particle-canvas');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let w, h, ps;
    const init = () => {
      w = cv.width = innerWidth; h = cv.height = innerHeight;
      ps = Array.from({ length: 40 }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 1.8 + .4 }));
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(0,180,255,.25)';
      ps.forEach((p) => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); });
      requestAnimationFrame(tick);
    };
    init(); addEventListener('resize', init); tick();
  }
})();
