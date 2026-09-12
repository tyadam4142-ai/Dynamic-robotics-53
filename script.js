/**
 * DYNAMIC ROBOTICS 53 (DR53) - CORE LOGIC & CONFIGURATOR ENGINE
 * Target: Vanilla JS (ES6) for static deployment (GitHub Pages / Koder)
 * Author: Adam Bhaimia
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. BOOT INTRO ANIMATION (SESSION BASED)
    // ==========================================
    const bootOverlay = document.getElementById('dr53-boot-loader');
    if (bootOverlay) {
        const hasBooted = sessionStorage.getItem('dr53_booted');
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (hasBooted || prefersReduced) {
            bootOverlay.style.display = 'none';
        } else {
            document.body.classList.add('no-scroll');
            setTimeout(() => {
                bootOverlay.classList.add('fade-out');
                document.body.classList.remove('no-scroll');
                sessionStorage.setItem('dr53_booted', 'true');
                setTimeout(() => {
                    bootOverlay.style.display = 'none';
                }, 600);
            }, 1800); // 1.8 seconds sequence
        }
    }

    // ==========================================
    // 2. STICKY NAVBAR & MOBILE MENU ACCESSIBILITY
    // ==========================================
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (hamburgerBtn && navMenu) {
        function toggleMobileMenu() {
            const isActive = navMenu.classList.toggle('is-active');
            hamburgerBtn.classList.toggle('is-active');
            if (isActive) {
                document.body.classList.add('no-scroll');
            } else {
                document.body.classList.remove('no-scroll');
            }
        }

        hamburgerBtn.addEventListener('click', toggleMobileMenu);

        // Close when clicking nav links
        document.querySelectorAll('.nav-link, .v3-navlinks a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('is-active')) {
                    toggleMobileMenu();
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('is-active')) {
                toggleMobileMenu();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('is-active') && 
                !navMenu.contains(e.target) && 
                !hamburgerBtn.contains(e.target)) {
                toggleMobileMenu();
            }
        });
    }

    // ==========================================
    // 3. WEBSITE BUILDER CONFIGURATOR & CALCULATOR
    // ==========================================
    const pkgRadios = document.querySelectorAll('input[name="pkg"]');
    const addonCheckboxes = document.querySelectorAll('.addon-input');
    const summaryPkgName = document.getElementById('summary-pkg-name');
    const summaryPkgPrice = document.getElementById('summary-pkg-price');
    const summaryAddonsUl = document.getElementById('summary-addons-ul');
    const summaryTotalPrice = document.getElementById('summary-total-price');
    const sendWaEnquiryBtn = document.getElementById('send-wa-enquiry-btn');

    if (summaryTotalPrice) {
        function calculateEstimate() {
            let total = 0;
            let selectedPkgName = "Starter";
            let basePrice = 5300;

            // Pkg calc
            pkgRadios.forEach(radio => {
                if (radio.checked) {
                    basePrice = parseInt(radio.getAttribute('data-price'), 10);
                    selectedPkgName = radio.value.toUpperCase();
                }
            });
            total += basePrice;

            // Addons calc
            const selectedAddons = [];
            addonCheckboxes.forEach(cb => {
                if (cb.checked) {
                    const price = parseInt(cb.getAttribute('data-price'), 10);
                    const name = cb.getAttribute('data-name');
                    total += price;
                    selectedAddons.push({ name, price });
                }
            });

            // Update UI
            if (summaryPkgName) summaryPkgName.textContent = selectedPkgName;
            if (summaryPkgPrice) summaryPkgPrice.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
            
            if (summaryAddonsUl) {
                summaryAddonsUl.innerHTML = '';
                if (selectedAddons.length === 0) {
                    summaryAddonsUl.innerHTML = '<li class="muted-li">None selected</li>';
                } else {
                    selectedAddons.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = `+ ${item.name} (₹${item.price})`;
                        summaryAddonsUl.appendChild(li);
                    });
                }
            }

            summaryTotalPrice.textContent = `₹${total.toLocaleString('en-IN')}`;
            return { total, selectedPkgName, selectedAddons, basePrice };
        }

        // Attach Event Listeners
        pkgRadios.forEach(r => r.addEventListener('change', calculateEstimate));
        addonCheckboxes.forEach(c => c.addEventListener('change', calculateEstimate));

        // Initial Calculation
        calculateEstimate();

        // WHATSAPP ENQUIRER GENERATOR
        if (sendWaEnquiryBtn) {
            sendWaEnquiryBtn.addEventListener('click', () => {
                const data = calculateEstimate();
                const domainOption = document.getElementById('domain-option').value;
                const domainName = document.getElementById('domain-name-input').value.trim() || 'Not specified';
                const notes = document.getElementById('project-notes').value.trim() || 'None';

                let addonText = data.selectedAddons.map(a => `• ${a.name} (₹${a.price})`).join('\n');
                if (!addonText) addonText = 'None';

                const message = `*NEW WEBSITE CONFIGURATION ENQUIRY - DR53*\n\n` +
                    `*Selected Package:* ${data.selectedPkgName} (₹${data.basePrice})\n` +
                    `*Selected Add-ons:*\n${addonText}\n\n` +
                    `*Domain Status:* ${domainOption}\n` +
                    `*Preferred Domain:* ${domainName}\n` +
                    `*Project Notes:* ${notes}\n\n` +
                    `*ESTIMATED TOTAL:* ₹${data.total.toLocaleString('en-IN')}\n\n` +
                    `Hi Adam, I generated this quote on the DR53 website builder. Let's discuss building this.`;

                const waUrl = `https://wa.me/918149916052?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank');
            });
        }
    }

    // ==========================================
    // 4. DOMAIN CHECKER FAKE API PREVENTER
    // ==========================================
    const checkDomainBtn = document.getElementById('check-domain-btn');
    const domainFeedback = document.getElementById('domain-feedback');
    if (checkDomainBtn && domainFeedback) {
        checkDomainBtn.addEventListener('click', () => {
            const val = document.getElementById('domain-name-input').value.trim();
            if (!val) {
                domainFeedback.textContent = "Please enter a domain name first.";
                domainFeedback.style.color = "#F1CA62";
            } else {
                domainFeedback.textContent = `We'll check availability and current renewal pricing for "${val}" when you submit your WhatsApp enquiry.`;
                domainFeedback.style.color = "#00F0FF";
            }
        });
    }

    // ==========================================
    // 5. DOMAIN FAQ ACCORDION
    // ==========================================
    const faqToggleBtn = document.getElementById('faq-domain-toggle');
    const faqContent = document.getElementById('faq-domain-content');
    if (faqToggleBtn && faqContent) {
        faqToggleBtn.addEventListener('click', () => {
            const isOpen = faqContent.classList.toggle('open');
            faqToggleBtn.querySelector('.acc-icon').textContent = isOpen ? '−' : '+';
        });
    }

    // ==========================================
    // 6. GENERAL CONTACT FORM WA GENERATOR
    // ==========================================
    const generalContactForm = document.getElementById('general-contact-form');
    if (generalContactForm) {
        generalContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value.trim();
            const phone = document.getElementById('contact-phone').value.trim();
            const type = document.getElementById('contact-type').value;
            const msg = document.getElementById('contact-msg').value.trim();

            const text = `*NEW GENERAL ENQUIRY - DR53*\n\n` +
                `*Name:* ${name}\n` +
                `*Phone/WhatsApp:* ${phone}\n` +
                `*Domain:* ${type}\n` +
                `*Message Details:*\n${msg}\n\n` +
                `Hi Adam, I reached out via your website contact form.`;

            const waUrl = `https://wa.me/918149916052?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        });
    }

});

/* ================================================================
   DR53 V3 — GLOBAL AI CONCIERGE
   Works with /api/chat when available and falls back to a local
   DR53 knowledge engine, so the chat never just dies on static hosting.
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dr53-ai-v3-window')) return;

  const knowledge = [
    {keys:['what is dr53','what is dynamic robotics','about dr53'], reply:'Dynamic Robotics 53 (DR53) is an engineering initiative founded by Adam Bhaimia in Pune. We focus on robotics, embedded electronics, AI/computer vision and professional business websites.'},
    {keys:['robotics','robot','rover','mechanical'], reply:'DR53 builds practical robotics systems: mobile robots, autonomous concepts, mechanisms, servo systems and sensor-driven prototypes. Check the Projects page for the featured builds.'},
    {keys:['ai','vision','computer vision','object detection'], reply:'DR53 works with camera-based AI, object detection, inspection concepts, OpenCV and edge systems such as Raspberry Pi.'},
    {keys:['electronics','esp32','arduino','sensor','motor'], reply:'DR53 works with ESP32, Arduino, Raspberry Pi, sensors, motors, wireless control, PWM/servo systems and embedded prototypes.'},
    {keys:['glove','gesture'], reply:'The Talking Gesture Glove uses flex sensing, MPU6050 orientation data and an ESP32 to turn hand movement into useful communication commands.'},
    {keys:['hand','robotic hand','pca9685'], reply:'The Servo Articulated Robotic Hand uses PCA9685 PWM control and servo actuation for multi-joint finger movement.'},
    {keys:['trash','rover','cleaning'], reply:'The Trash Collecting Rover is a mobile collection concept combining high-torque drive, suction hardware and solar-assisted power.'},
    {keys:['website','web','design a website','business website'], reply:'DR53 also creates premium, responsive business websites with WhatsApp lead capture, catalogs, portfolios and custom interactive features. Use DESIGN YOUR WEBSITE in the menu for the configurator.'},
    {keys:['achievement','award','biea','agrisort','a-zero'], reply:'A recent DR53 milestone is the AgriSort Innovators / A-Zero project for BIEA 2026: an autonomous zero-handling food supply chain concept using robotics, AI vision, Raspberry Pi 5, sensors and automated logistics.'},
    {keys:['wsc','scholar cup','debate'], reply:'Adam participated with the AgriSort Innovators team in the 2026 World Scholar’s Cup journey, including debate, collaborative writing and Scholar’s Bowl preparation.'},
    {keys:['ftc','first tech challenge','mecanum'], reply:'Adam is building a Java + robotics portfolio for FTC 2026–27, including mecanum-drive control logic and a software/hardware engineering workflow.'},
    {keys:['price','cost','quote','how much'], reply:'For a project quote, the fastest route is WhatsApp. Tell Adam what you want built, your target result and any deadline or budget you already have.'},
    {keys:['contact','whatsapp','adam','hire','start'], reply:'You can contact Adam Bhaimia directly on WhatsApp: +91 8149916052. The project buttons on this site can also prepare a message for you.'}
  ];

  const icon = `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="13" y="18" width="38" height="31" rx="9" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="32" r="3" fill="currentColor"/><circle cx="40" cy="32" r="3" fill="currentColor"/><path d="M23 41c5 4 13 4 18 0M32 18V10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="8" r="3" fill="currentColor"/></svg>`;
  document.body.insertAdjacentHTML('beforeend', `
    <button class="dr53-ai-v3-button" id="dr53-ai-v3-button" aria-label="Open DR53 AI assistant">${icon}</button>
    <section class="dr53-ai-v3-window" id="dr53-ai-v3-window" aria-hidden="true" aria-label="DR53 AI assistant">
      <header class="dr53-ai-v3-head"><div class="dr53-ai-v3-brand"><div class="dr53-ai-v3-mark">DR53</div><div><strong>DR53 CONCIERGE</strong><div class="dr53-ai-v3-status">● SYSTEM ONLINE</div></div></div><button class="dr53-ai-v3-close" id="dr53-ai-v3-close" aria-label="Close">×</button></header>
      <div class="dr53-ai-v3-messages" id="dr53-ai-v3-messages"><div class="dr53-ai-v3-msg bot">Hey — I’m the DR53 project concierge. Ask me about a build, service, website, or how to start a project.</div></div>
      <div class="dr53-ai-v3-suggest" id="dr53-ai-v3-suggest"><button>What does DR53 build?</button><button>Show projects</button><button>How do I start?</button></div>
      <form class="dr53-ai-v3-form" id="dr53-ai-v3-form"><input id="dr53-ai-v3-input" maxlength="900" autocomplete="off" placeholder="Ask about DR53…" required><button aria-label="Send">➤</button></form>
      <div class="dr53-ai-v3-foot">DR53 • PROJECT CONCIERGE • DIRECT WHATSAPP AVAILABLE</div>
    </section>
  `);

  const win=document.getElementById('dr53-ai-v3-window'), btn=document.getElementById('dr53-ai-v3-button'), close=document.getElementById('dr53-ai-v3-close'), form=document.getElementById('dr53-ai-v3-form'), input=document.getElementById('dr53-ai-v3-input'), messages=document.getElementById('dr53-ai-v3-messages'), suggestions=document.getElementById('dr53-ai-v3-suggest');
  const history=[];
  const add=(text,type='bot')=>{const el=document.createElement('div');el.className=`dr53-ai-v3-msg ${type}`;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;};
  const localReply=(q)=>{const s=q.toLowerCase();const hit=knowledge.find(x=>x.keys.some(k=>s.includes(k)));if(hit)return hit.reply;if(/project|build|portfolio/i.test(s))return 'The featured builds are Autonomous Robotics, Talking Gesture Glove, AI & Vision Systems, Electronics Systems, Servo Articulated Robotic Hand and Trash Collecting Rover.';return 'I can help with DR53 projects, robotics, AI vision, electronics, websites, recent milestones, pricing direction and contacting Adam. Try asking “What does DR53 build?” or “How do I start a project?”';};
  const open=()=>{win.classList.add('open');win.setAttribute('aria-hidden','false');setTimeout(()=>input.focus(),180)};
  const shut=()=>{win.classList.remove('open');win.setAttribute('aria-hidden','true')};
  btn.addEventListener('click',()=>win.classList.contains('open')?shut():open());close.addEventListener('click',shut);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
  suggestions.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>send(b.textContent)));

  async function send(raw){
    const q=String(raw||'').trim();if(!q)return;
    add(q,'user');input.value='';suggestions.style.display='none';
    const loading=add('Analyzing…','bot');history.push({role:'user',content:q});
    try{
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-12)}),signal:controller.signal});clearTimeout(timer);
      if(!r.ok)throw new Error('API unavailable');
      const data=await r.json();const reply=typeof data.reply==='string'?data.reply.trim():'';if(!reply)throw new Error('Empty reply');
      loading.remove();add(reply);history.push({role:'assistant',content:reply});
    }catch(e){loading.remove();const reply=localReply(q);add(reply);history.push({role:'assistant',content:reply});}
  }
  form.addEventListener('submit',e=>{e.preventDefault();send(input.value)});

  /* V3 scroll reveal */
  const reveals=document.querySelectorAll('.dr53-v3 .reveal');
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.12});reveals.forEach(x=>io.observe(x));}else reveals.forEach(x=>x.classList.add('visible'));

  /* V3 nav scroll state */
  const nav=document.getElementById('navbar');if(nav){const ns=()=>nav.classList.toggle('scrolled',window.scrollY>20);window.addEventListener('scroll',ns,{passive:true});ns();}

  /* V3 mobile menu */
  const menu=document.getElementById('hamburger-btn'),navMenu=document.getElementById('nav-menu');if(menu&&navMenu){menu.addEventListener('click',()=>navMenu.classList.toggle('is-active'));navMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navMenu.classList.remove('is-active')))}

  /* ambient particles */
  const p=document.getElementById('v3-particles');if(p){const n=window.innerWidth<650?14:28;for(let i=0;i<n;i++){const s=document.createElement('span');s.className='v3-particle';s.style.left=Math.random()*100+'%';s.style.animationDuration=(7+Math.random()*10)+'s';s.style.animationDelay=(-Math.random()*12)+'s';s.style.transform=`scale(${.5+Math.random()})`;p.appendChild(s)}}
});


/* ========================================================================
   DR53 V4 — CINEMATIC INTERACTION ENGINE
   ======================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Shared cinematic loader: fast, premium, and only shown briefly per tab.
  if (!reduce && !sessionStorage.getItem('dr53_v4_booted')) {
    const boot = document.createElement('div');
    boot.className = 'dr53-boot-v4';
    boot.innerHTML = '<div class="dr53-boot-grid"></div><div class="dr53-boot-core"><div class="dr53-boot-mark">DR<span>53</span></div><div class="dr53-boot-label">ENGINEERING SYSTEMS / INITIALIZING</div><div class="dr53-boot-bar"><span></span></div><div class="dr53-boot-status" id="dr53-boot-status">Calibrating interface…</div></div>';
    document.body.prepend(boot);
    const status = boot.querySelector('#dr53-boot-status');
    const phases = ['Calibrating interface…','Loading project systems…','Syncing visual layer…','DR53 SYSTEM READY'];
    phases.forEach((text, i) => setTimeout(() => { if (status) status.textContent = text; }, 360 + i*360));
    setTimeout(() => { boot.classList.add('done'); sessionStorage.setItem('dr53_v4_booted','1'); setTimeout(()=>boot.remove(),900); }, 1900);
  }

  // Scroll progress + top button.
  const progress = document.querySelector('.dr53-scroll-progress span');
  const topBtn = document.createElement('button');
  topBtn.className = 'dr53-top';
  topBtn.type='button'; topBtn.setAttribute('aria-label','Back to top'); topBtn.innerHTML='↑';
  document.body.appendChild(topBtn);
  const onScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, scrollY / max * 100))}%`;
    topBtn.classList.toggle('show', scrollY > 520);
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));

  // Ambient dust.
  if (!reduce && !document.querySelector('.dr53-dust')) {
    const dust = document.createElement('div'); dust.className='dr53-dust'; dust.setAttribute('aria-hidden','true');
    const n = innerWidth < 650 ? 15 : 34;
    for(let i=0;i<n;i++){
      const dot=document.createElement('i');
      dot.style.left=(Math.random()*100)+'%'; dot.style.animationDelay=(-Math.random()*12)+'s';
      dot.style.animationDuration=(8+Math.random()*10)+'s'; dot.style.opacity=(.25+Math.random()*.7).toFixed(2);
      dust.appendChild(dot);
    }
    document.body.appendChild(dust);
  }

  // Custom cursor with inertia.
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const dot=document.createElement('div'), ring=document.createElement('div');
    dot.className='dr53-cursor'; ring.className='dr53-cursor-ring';
    document.body.append(dot, ring);
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener('pointermove', e=>{ mx=e.clientX; my=e.clientY; dot.style.opacity='1'; ring.style.opacity='1'; });
    const tick=()=>{ rx += (mx-rx)*.18; ry += (my-ry)*.18; dot.style.transform=`translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`; ring.style.transform=`translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`; requestAnimationFrame(tick); };
    tick();
    document.querySelectorAll('a,button,input,select,textarea,.v4-tilt').forEach(el=>{
      el.addEventListener('pointerenter',()=>document.body.classList.add('dr53-hover'));
      el.addEventListener('pointerleave',()=>document.body.classList.remove('dr53-hover'));
    });
  }

  // Spotlight + 3D tilt: desktop only, capped for performance.
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.v4-spotlight').forEach(card=>{
      card.addEventListener('pointermove', e=>{
        const r=card.getBoundingClientRect();
        card.style.setProperty('--mx',`${e.clientX-r.left}px`); card.style.setProperty('--my',`${e.clientY-r.top}px`);
      });
    });
    document.querySelectorAll('.v4-tilt').forEach(card=>{
      let raf=0;
      card.addEventListener('pointermove', e=>{
        const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{card.style.transform=`perspective(900px) rotateX(${(-y*4.4).toFixed(2)}deg) rotateY(${(x*5.2).toFixed(2)}deg) translateY(-4px)`;});
      });
      card.addEventListener('pointerleave',()=>{card.style.transform='';});
    });
  }

  // Magnetic buttons: subtle, not annoying.
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.v3-btn,.v3-outline,.v3-wa,.btn-whatsapp,.nav-wa-btn').forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))*.12,y=(e.clientY-(r.top+r.height/2))*.12;el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`});
      el.addEventListener('pointerleave',()=>{el.style.transform='';});
    });
  }

  // Click ripple.
  if (!reduce) addEventListener('pointerdown', e=>{
    if (!e.isPrimary) return;
    const r=document.createElement('span'); r.className='dr53-ripple'; r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px';
    document.body.appendChild(r); setTimeout(()=>r.remove(),700);
  }, {passive:true});

  // Smart image lazy-load upgrade + successful-load class. Broken image paths become visible as a polished fallback.
  document.querySelectorAll('img').forEach(img=>{
    if (!img.loading) img.loading='lazy';
    img.addEventListener('load',()=>img.classList.add('img-ready'),{once:true});
    img.addEventListener('error',()=>{img.classList.add('img-missing'); const wrap=img.parentElement; if(wrap && !wrap.querySelector('.img-fallback')){const f=document.createElement('div');f.className='img-fallback';f.textContent='DR53 / IMAGE';wrap.appendChild(f);}}, {once:true});
  });

  // Reveal observer with stagger for grids.
  const revealItems=[...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el=entry.target, siblings=[...el.parentElement.children].filter(x=>x.classList.contains('reveal'));
      if (siblings.length>1) el.style.transitionDelay=`${Math.min(280,siblings.indexOf(el)*65)}ms`;
      el.classList.add('visible'); obs.unobserve(el);
    }),{threshold:.1,rootMargin:'0px 0px -8% 0px'});
    revealItems.forEach(x=>obs.observe(x));
  } else revealItems.forEach(x=>x.classList.add('visible'));

  // Tiny text scramble for kicker labels when they enter view.
  if (!reduce) document.querySelectorAll('.v3-kicker').forEach(el=>{
    const raw=el.textContent.trim(); if(raw.length>4 && raw.length<42){
      el.addEventListener('mouseenter',()=>{const chars='01/<>#*'; let i=0; const timer=setInterval(()=>{el.dataset.base??=raw; el.childNodes.forEach(n=>{if(n.nodeType===3){n.textContent=n.textContent.split('').map((c,j)=>j<i?c:chars[Math.floor(Math.random()*chars.length)]).join('')}});i++; if(i>raw.length){clearInterval(timer);el.childNodes.forEach(n=>{if(n.nodeType===3)n.textContent=raw})}},20);});
    }
  });
});
