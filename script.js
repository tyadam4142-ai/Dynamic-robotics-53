/**
 * DYNAMIC ROBOTICS 53 (DR53) — SITE ENGINE
 * Vanilla JS, static-hosting safe (GitHub Pages / Netlify / Vercel / Cloudflare Pages).
 * Single navigation implementation. Every module guards for missing DOM nodes.
 * Author: DR53 Engineering (for Adam Bhaimia)
 *
 * Modules:
 *  1. initBoot            — session-based loading transition
 *  2. initBackgroundFx    — grid / glow / particles (perf-aware)
 *  3. initHeaderScroll    — nav background transition on scroll
 *  4. initMobileNav       — ONE mobile menu implementation
 *  5. initSmoothAnchors   — in-page anchor scrolling
 *  6. initReveal          — IntersectionObserver reveal + stagger + title wipe
 *  7. initCounters        — animated number counters
 *  8. initTiltSpotlight   — desktop-only card tilt / parallax / spotlight
 *  9. initMagnetic        — desktop-only magnetic buttons
 * 10. initRipple          — click ripple feedback
 * 11. initCursorFx        — desktop-only cursor glow + ring
 * 12. initScrollProgress  — top progress bar + back-to-top
 * 13. initImages          — lazy load + graceful broken-image fallback
 * 14. initPageTransitions — lightweight fade between internal pages
 * 15. initChatbot         — DR53 CONCIERGE (local knowledge engine)
 * 16. initConfigurator    — software.html estimate calculator
 * 17. initContactForm     — visit.html WhatsApp enquiry generator
 * 18. initFaqAccordion    — shared FAQ accordion
 */
(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var IS_NARROW = window.innerWidth < 900;
  var WA_NUMBER = '918149916052';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ---------------------------------------------------------------------
     1. BOOT LOADER — brief, session-based, skips on repeat + reduced motion
  --------------------------------------------------------------------- */
  function initBoot() {
    var boot = document.getElementById('bootLoader');
    if (!boot) { document.body.classList.add('page-ready'); return; }

    if (REDUCE || sessionStorage.getItem('dr53_booted')) {
      boot.remove();
      document.body.classList.add('page-ready');
      return;
    }
    var statusEl = document.getElementById('bootStatus');
    var phases = ['Calibrating interface…', 'Loading project systems…', 'Syncing visual layer…', 'DR53 SYSTEM READY'];
    requestAnimationFrame(function () { boot.classList.add('is-filling'); });
    phases.forEach(function (text, i) {
      setTimeout(function () { if (statusEl) statusEl.textContent = text; }, 260 + i * 300);
    });
    setTimeout(function () {
      boot.classList.add('is-done');
      document.body.classList.add('page-ready');
      sessionStorage.setItem('dr53_booted', '1');
      setTimeout(function () { boot.remove(); }, 650);
    }, 1500);
  }

  /* ---------------------------------------------------------------------
     2. AMBIENT BACKGROUND FX — capped particle count, cheap CSS animation
  --------------------------------------------------------------------- */
  function initBackgroundFx() {
    var field = document.getElementById('bgParticles');
    if (!field || REDUCE) return;
    var count = IS_NARROW ? 10 : 22;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
      p.style.animationDuration = (10 + Math.random() * 14) + 's';
      p.style.animationDelay = (-Math.random() * 18) + 's';
      frag.appendChild(p);
    }
    field.appendChild(frag);
  }

  /* ---------------------------------------------------------------------
     3. HEADER SCROLL STATE
  --------------------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     4. MOBILE NAVIGATION — the ONLY mobile menu implementation on the site
  --------------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var panel = document.getElementById('mobileNav');
    if (!toggle || !panel) return;

    var scrollY = 0;
    var isOpen = false;

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      scrollY = window.scrollY;
      document.documentElement.classList.add('nav-open');
      document.body.style.position = 'fixed';
      document.body.style.top = (-scrollY) + 'px';
      document.body.style.width = '100%';
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation');
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      document.documentElement.classList.remove('nav-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }

    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isOpen ? closeMenu() : openMenu();
    });

    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu, { passive: true });
    });

    document.addEventListener('click', function (e) {
      if (!isOpen) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 899) closeMenu();
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     5. SMOOTH IN-PAGE ANCHORS
  --------------------------------------------------------------------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* ---------------------------------------------------------------------
     6. SCROLL REVEAL — IntersectionObserver with stagger + title wipe
  --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    var titles = document.querySelectorAll('.title-wrap');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      titles.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (x) {
          return x.hasAttribute('data-reveal');
        });
        if (siblings.length > 1) {
          el.style.transitionDelay = Math.min(320, siblings.indexOf(el) * 70) + 'ms';
        }
        el.classList.add('in-view');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    titles.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     7. NUMBER COUNTERS
  --------------------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    var animate = function (el) {
      var target = parseFloat(el.getAttribute('data-counter'));
      if (REDUCE || !target) { el.textContent = target; return; }
      var start = null, duration = 1200;
      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { counters.forEach(animate); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     8. CARD TILT + PARALLAX + SPOTLIGHT — desktop only, capped
  --------------------------------------------------------------------- */
  function initTiltSpotlight() {
    if (!FINE_POINTER || REDUCE || IS_NARROW) return;

    document.querySelectorAll('[data-spotlight]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var raf = 0;
      var img = card.querySelector('[data-tilt-img]');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform = 'perspective(900px) rotateX(' + (-y * 4.2).toFixed(2) + 'deg) rotateY(' + (x * 5).toFixed(2) + 'deg) translateY(-4px)';
          if (img) img.style.transform = 'scale(1.12) translate(' + (-x * 8).toFixed(1) + 'px,' + (-y * 8).toFixed(1) + 'px)';
        });
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
        if (img) img.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     9. MAGNETIC BUTTONS — desktop only, subtle
  --------------------------------------------------------------------- */
  function initMagnetic() {
    if (!FINE_POINTER || REDUCE || IS_NARROW) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.12;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.12;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------------
     10. CLICK RIPPLE — scoped to interactive elements, not the whole page
  --------------------------------------------------------------------- */
  function initRipple() {
    if (REDUCE) return;
    document.addEventListener('pointerdown', function (e) {
      var target = e.target.closest('.btn, .nav-link, .mobile-link, .project-cta, .chat-chip, .pkg-card, .addon-box');
      if (!target || !e.isPrimary) return;
      var r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(function () { r.remove(); }, 700);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     11. CURSOR GLOW + RING — desktop only
  --------------------------------------------------------------------- */
  function initCursorFx() {
    if (!FINE_POINTER || REDUCE || IS_NARROW) return;
    var glow = document.createElement('div'); glow.className = 'cursor-glow';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(glow, ring);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('has-cursor-fx');
    });
    (function tick() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      glow.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(tick);
    })();
    document.querySelectorAll('a,button,input,select,textarea,[data-tilt]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { document.body.classList.add('cursor-hover'); });
      el.addEventListener('pointerleave', function () { document.body.classList.remove('cursor-hover'); });
    });
  }

  /* ---------------------------------------------------------------------
     12. SCROLL PROGRESS + BACK TO TOP
  --------------------------------------------------------------------- */
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress span');
    var top = document.getElementById('backTop');
    if (!bar && !top) return;
    var onScroll = function () {
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      var pct = Math.min(100, Math.max(0, (scrollY / max) * 100));
      if (bar) bar.style.width = pct + '%';
      if (top) top.classList.toggle('show', scrollY > 520);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (top) top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     13. IMAGE LOADING — lazy + graceful broken-image fallback
  --------------------------------------------------------------------- */
  function initImages() {
    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
    });
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('img-missing');
        var wrap = img.parentElement;
        if (wrap && !wrap.querySelector('.img-fallback')) {
          var f = document.createElement('div');
          f.className = 'img-fallback';
          f.textContent = 'DR53 / IMAGE';
          wrap.style.position = wrap.style.position || 'relative';
          wrap.appendChild(f);
        }
      }, { once: true });
    });
  }

  /* ---------------------------------------------------------------------
     14. LIGHTWEIGHT PAGE TRANSITIONS — always falls through to real nav
  --------------------------------------------------------------------- */
  function initPageTransitions() {
    if (REDUCE) return;
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a');
      if (!a || !a.href || a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page anchor
      if (!/\.html?$/.test(url.pathname) && url.pathname !== '/') return;
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(function () { location.href = a.href; }, 170);
    });
  }

  /* ---------------------------------------------------------------------
     15. DR53 CONCIERGE — local knowledge engine, no backend required
  --------------------------------------------------------------------- */
  function initChatbot() {
    if (document.getElementById('chatWindow')) return;

    var knowledge = [
      { keys: ['what is dr53', 'what is dynamic robotics', 'about dr53', 'who are you'], reply: 'Dynamic Robotics 53 (DR53) is an engineering studio founded by Adam Bhaimia in Pune, India. We build robotics, embedded electronics, AI/computer vision systems, and premium business websites.' },
      { keys: ['robotics', 'robot', 'rover', 'mechanism', 'autonomous'], reply: 'DR53 builds practical robotics: mobile platforms, autonomous rovers, mechanisms, servo systems and sensor-driven prototypes. Featured build: Autonomous Robotics — see the Projects page.' },
      { keys: ['vision', 'computer vision', 'object detection', 'opencv', 'camera'], reply: 'DR53 works with camera-based AI: object detection, smart inspection, OpenCV pipelines and edge computing on Raspberry Pi. See "AI & Vision Systems" on the Projects page.' },
      { keys: ['electronics', 'esp32', 'arduino', 'sensor', 'motor', 'embedded'], reply: 'DR53 works with ESP32, Arduino, Raspberry Pi, sensors, motors, wireless control and PWM/servo systems for embedded prototypes.' },
      { keys: ['glove', 'gesture'], reply: 'The Talking Gesture Glove uses flex sensors + an MPU6050 + ESP32 to turn hand gestures into communication output.' },
      { keys: ['hand', 'robotic hand', 'pca9685', 'finger'], reply: 'The Servo Articulated Robotic Hand uses PCA9685 PWM control and servo actuation for multi-joint finger movement.' },
      { keys: ['trash', 'cleaning', 'solar rover'], reply: 'The Trash Collecting Rover combines high-torque drive, suction hardware and solar-assisted power for autonomous cleanup.' },
      { keys: ['website', 'web', 'design a website', 'business website', 'software'], reply: 'DR53 builds premium, responsive business websites with WhatsApp lead capture, catalogs and custom interactive features. Open "Design Your Website" to get an instant estimate.' },
      { keys: ['price', 'cost', 'quote', 'how much', 'estimate'], reply: 'Website pricing starts around ₹5,300 for a Starter site. Use the Design Your Website page for a live, itemized estimate — or message Adam directly for a robotics/electronics quote.' },
      { keys: ['achievement', 'award', 'biea', 'agrisort', 'a-zero'], reply: 'A recent milestone: the AgriSort Innovators / A-Zero project for BIEA 2026 — an autonomous, zero-handling food supply chain concept using robotics, AI vision, a Raspberry Pi 5 and automated logistics.' },
      { keys: ['wsc', 'scholar', 'debate'], reply: 'Adam competed with the AgriSort Innovators team in the 2026 World Scholar’s Cup journey — debate, collaborative writing and Scholar’s Bowl.' },
      { keys: ['ftc', 'first tech challenge', 'mecanum'], reply: 'Adam is building a Java + robotics portfolio for FTC 2026–27, including mecanum-drive control logic.' },
      { keys: ['contact', 'whatsapp', 'adam', 'hire', 'reach', 'phone', 'email'], reply: 'The fastest way to reach DR53 is WhatsApp: +91 8149916052. Tap the green WhatsApp button anywhere on the site.' },
      { keys: ['start', 'begin', 'how do i start', 'project idea'], reply: 'Easiest path: send Adam a WhatsApp message describing what you want built. For a website, use the Design Your Website configurator first to get a ballpark estimate ready to send.' },
      { keys: ['where', 'location', 'pune', 'lab', 'visit'], reply: 'DR53 is based in Pune, Maharashtra, India. Direct collaboration happens via lab visits or WhatsApp — see the Contact page.' },
      { keys: ['service', 'services', 'what do you offer'], reply: 'DR53 offers Robotics & Mechanisms, Electronics & Embedded Systems, AI & Computer Vision, Automation, Website Design and Custom Engineering — see the Services page for details.' }
    ];

    var fabIcon = '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="6" width="17" height="12" rx="4" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><path d="M12 6V3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="2.6" r="1.1" fill="currentColor"/></svg>';

    document.body.insertAdjacentHTML('beforeend',
      '<button class="chat-fab" id="chatFab" aria-label="Open DR53 Concierge" aria-expanded="false">' + fabIcon + '</button>' +
      '<section class="chat-window" id="chatWindow" aria-hidden="true" aria-label="DR53 Concierge chat">' +
        '<header class="chat-head">' +
          '<div class="chat-head-brand"><div class="chat-mark">DR53</div><div><strong>DR53 Concierge</strong><div class="chat-status">System online</div></div></div>' +
          '<button class="chat-close" id="chatClose" aria-label="Close chat">×</button>' +
        '</header>' +
        '<div class="chat-messages" id="chatMessages">' +
          '<div class="chat-msg bot">Hey — I\'m the DR53 project concierge. Ask about a build, a service, pricing direction, or how to start a project.</div>' +
        '</div>' +
        '<div class="chat-suggest" id="chatSuggest">' +
          '<button class="chat-chip">What does DR53 build?</button>' +
          '<button class="chat-chip">Show me the projects</button>' +
          '<button class="chat-chip">How do I start?</button>' +
          '<button class="chat-chip">Design a website</button>' +
        '</div>' +
        '<form class="chat-form" id="chatForm">' +
          '<textarea class="chat-input" id="chatInput" rows="1" maxlength="600" placeholder="Ask about DR53…" required></textarea>' +
          '<button type="submit" class="chat-send" aria-label="Send message">➤</button>' +
        '</form>' +
        '<div class="chat-foot">DR53 · Project Concierge · WhatsApp for a human reply</div>' +
      '</section>'
    );

    var fab = document.getElementById('chatFab');
    var win = document.getElementById('chatWindow');
    var closeBtn = document.getElementById('chatClose');
    var form = document.getElementById('chatForm');
    var input = document.getElementById('chatInput');
    var messages = document.getElementById('chatMessages');
    var suggest = document.getElementById('chatSuggest');

    var STORE_KEY = 'dr53_chat_history';
    function loadHistory() {
      try {
        var raw = sessionStorage.getItem(STORE_KEY);
        if (!raw) return;
        var hist = JSON.parse(raw);
        hist.forEach(function (m) { addMessage(m.text, m.type, false); });
        if (hist.length) suggest.style.display = 'none';
      } catch (err) { /* ignore malformed storage */ }
    }
    function saveMessage(text, type) {
      try {
        var raw = sessionStorage.getItem(STORE_KEY);
        var hist = raw ? JSON.parse(raw) : [];
        hist.push({ text: text, type: type });
        sessionStorage.setItem(STORE_KEY, JSON.stringify(hist.slice(-30)));
      } catch (err) { /* storage unavailable — chat still works this session */ }
    }

    function addMessage(text, type, persist) {
      var el = document.createElement('div');
      el.className = 'chat-msg ' + type;
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      if (persist !== false) saveMessage(text, type);
      return el;
    }

    function localReply(q) {
      var s = q.toLowerCase();
      var hit = knowledge.find(function (item) { return item.keys.some(function (k) { return s.indexOf(k) !== -1; }); });
      if (hit) return hit.reply;
      if (/project|build|portfolio/.test(s)) return 'The six featured builds are Autonomous Robotics, Talking Gesture Glove, AI & Vision Systems, Electronics Systems, the Servo Articulated Robotic Hand, and the Trash Collecting Rover — all on the Projects page.';
      return 'I can help with DR53 projects, robotics, AI vision, electronics, websites, recent milestones, pricing direction, or contacting Adam. Try "What does DR53 build?" or "How do I start a project?"';
    }

    function openChat() {
      win.classList.add('is-open');
      win.setAttribute('aria-hidden', 'false');
      fab.classList.add('is-open');
      fab.setAttribute('aria-expanded', 'true');
      setTimeout(function () { input.focus(); }, 200);
    }
    function closeChat() {
      win.classList.remove('is-open');
      win.setAttribute('aria-hidden', 'true');
      fab.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
    }

    fab.addEventListener('click', function () { win.classList.contains('is-open') ? closeChat() : openChat(); });
    closeBtn.addEventListener('click', closeChat);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeChat(); });
    suggest.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { send(b.textContent); }); });

    function send(raw) {
      var q = String(raw || '').trim();
      if (!q) return;
      addMessage(q, 'user');
      input.value = '';
      input.style.height = 'auto';
      suggest.style.display = 'none';

      var typing = document.createElement('div');
      typing.className = 'chat-typing';
      typing.innerHTML = '<i></i><i></i><i></i>';
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      var delay = REDUCE ? 60 : 480 + Math.random() * 380;
      setTimeout(function () {
        typing.remove();
        addMessage(localReply(q), 'bot');
      }, delay);
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); }
    });
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(96, input.scrollHeight) + 'px';
    });

    loadHistory();
  }

  /* ---------------------------------------------------------------------
     16. SOFTWARE CONFIGURATOR (software.html only)
  --------------------------------------------------------------------- */
  function initConfigurator() {
    var totalOut = document.getElementById('quoteTotal');
    if (!totalOut) return;

    var pkgRadios = document.querySelectorAll('input[name="pkg"]');
    var addonInputs = document.querySelectorAll('.addon-input');
    var nameOut = document.getElementById('quotePkgName');
    var priceOut = document.getElementById('quotePkgPrice');
    var addonsOut = document.getElementById('quoteAddonsList');
    var sendBtn = document.getElementById('sendQuoteBtn');
    var domainOption = document.getElementById('domainOption');
    var domainInput = document.getElementById('domainName');
    var notesInput = document.getElementById('projectNotes');
    var checkBtn = document.getElementById('checkDomainBtn');
    var domainFeedback = document.getElementById('domainFeedback');
    var steps = document.querySelectorAll('.config-steps i');
    var stepCards = document.querySelectorAll('.config-card');

    function calculate() {
      var total = 0, pkgName = 'Starter', basePrice = 5300;
      pkgRadios.forEach(function (r) {
        if (r.checked) { basePrice = parseInt(r.getAttribute('data-price'), 10); pkgName = r.value.charAt(0).toUpperCase() + r.value.slice(1); }
      });
      total += basePrice;
      var addons = [];
      addonInputs.forEach(function (cb) {
        if (cb.checked) {
          var price = parseInt(cb.getAttribute('data-price'), 10);
          addons.push({ name: cb.getAttribute('data-name'), price: price });
          total += price;
        }
      });
      if (nameOut) nameOut.textContent = pkgName;
      if (priceOut) priceOut.textContent = '₹' + basePrice.toLocaleString('en-IN');
      if (addonsOut) {
        addonsOut.innerHTML = '';
        if (!addons.length) {
          addonsOut.innerHTML = '<li class="muted-li">None selected</li>';
        } else {
          addons.forEach(function (a) {
            var li = document.createElement('li');
            li.textContent = '+ ' + a.name + ' (₹' + a.price.toLocaleString('en-IN') + ')';
            addonsOut.appendChild(li);
          });
        }
      }
      totalOut.textContent = '₹' + total.toLocaleString('en-IN');
      return { total: total, pkgName: pkgName, basePrice: basePrice, addons: addons };
    }

    pkgRadios.forEach(function (r) { r.addEventListener('change', calculate); });
    addonInputs.forEach(function (cb) { cb.addEventListener('change', calculate); });
    calculate();

    if (sendBtn) sendBtn.addEventListener('click', function () {
      var data = calculate();
      var domainStatus = domainOption ? domainOption.value : 'Not specified';
      var domainName = (domainInput && domainInput.value.trim()) || 'Not specified';
      var notes = (notesInput && notesInput.value.trim()) || 'None';
      var addonText = data.addons.map(function (a) { return '• ' + a.name + ' (₹' + a.price + ')'; }).join('\n') || 'None';
      var message = '*NEW WEBSITE ENQUIRY — DR53*\n\n' +
        '*Package:* ' + data.pkgName + ' (₹' + data.basePrice + ')\n' +
        '*Add-ons:*\n' + addonText + '\n\n' +
        '*Domain Status:* ' + domainStatus + '\n' +
        '*Preferred Domain:* ' + domainName + '\n' +
        '*Project Notes:* ' + notes + '\n\n' +
        '*Estimated Total:* ₹' + data.total.toLocaleString('en-IN') + '\n\n' +
        'Hi Adam, I built this quote on the DR53 website configurator. Let\'s discuss building it.';
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message), '_blank');
    });

    if (checkBtn && domainFeedback) checkBtn.addEventListener('click', function () {
      var val = domainInput ? domainInput.value.trim() : '';
      if (!val) {
        domainFeedback.textContent = 'Please enter a domain name first.';
      } else {
        domainFeedback.textContent = 'DR53 will confirm live availability and renewal pricing for "' + val + '" once you send your WhatsApp enquiry.';
      }
    });

    // scroll-spy progress across the three configurator steps
    if (steps.length && stepCards.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var idx = Array.prototype.indexOf.call(stepCards, entry.target);
          if (idx === -1) return;
          if (entry.isIntersecting) {
            steps.forEach(function (s, i) {
              s.classList.toggle('is-active', i === idx);
              s.classList.toggle('is-done', i < idx);
            });
          }
        });
      }, { threshold: 0.5 });
      stepCards.forEach(function (c) { io.observe(c); });
    }
  }

  /* ---------------------------------------------------------------------
     17. CONTACT FORM (visit.html only)
  --------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cName').value.trim();
      var phone = document.getElementById('cPhone').value.trim();
      var type = document.getElementById('cType').value;
      var msg = document.getElementById('cMsg').value.trim();
      var text = '*NEW ENQUIRY — DR53*\n\n' +
        '*Name:* ' + name + '\n' +
        '*Phone/WhatsApp:* ' + phone + '\n' +
        '*Domain:* ' + type + '\n' +
        '*Details:*\n' + msg + '\n\n' +
        'Hi Adam, I reached out via the DR53 website contact form.';
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* ---------------------------------------------------------------------
     18. SHARED FAQ ACCORDION
  --------------------------------------------------------------------- */
  function initFaqAccordion() {
    document.querySelectorAll('.faq-toggle').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = panel.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ---------------------------------------------------------------------
     BOOT EVERYTHING
  --------------------------------------------------------------------- */
  ready(function () {
    initBoot();
    initBackgroundFx();
    initHeaderScroll();
    initMobileNav();
    initSmoothAnchors();
    initReveal();
    initCounters();
    initTiltSpotlight();
    initMagnetic();
    initRipple();
    initCursorFx();
    initScrollProgress();
    initImages();
    initPageTransitions();
    initChatbot();
    initConfigurator();
    initContactForm();
    initFaqAccordion();
  });
})();
