/* ═══════════════════════════════════════════════════════════════
   BMW M5 SHOWCASE — MAIN.JS
   Core interactions: cursor, loader, nav, scroll reveal, counters,
   particles, RPM animation, form validation, colour swatches
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── DOM HELPERS ─────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── LOADER ──────────────────────────────────────────────────
(function initLoader() {
  const loader   = $('#loader');
  const progress = $('.loader-progress');
  if (!loader) return;

  let pct = 0;
  const tick = setInterval(() => {
    const step = Math.random() * 18 + 2;
    pct = Math.min(pct + step, 100);
    progress.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        // trigger hero entrance
        $$('.hero-content > *').forEach((el, i) => {
          el.style.animationDelay = (i * 0.12) + 's';
          el.classList.add('reveal-up', 'in-view');
        });
        spawnParticles();
        startRPMAnimation();
      }, 400);
    }
  }, 60);

  document.body.style.overflow = 'hidden';
})();

// ─── CUSTOM CURSOR ───────────────────────────────────────────
(function initCursor() {
  const cursor   = $('#cursor');
  const follower = $('#cursor-follower');
  if (!cursor) return;

  let mx = 0, my = 0;
  let fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Smooth follower
  function followCursor() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(followCursor);
  }
  followCursor();

  // Hover enlargement
  const hoverEls = 'a, button, .spec-card, .tech-card, .perf-feature, .swatch, input, select, textarea';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
  });
})();

// ─── NAVBAR ──────────────────────────────────────────────────
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-link');
  if (!navbar) return;

  // Scroll class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open', open);
  });

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
    });
  });

  // Active nav link on scroll
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav-link');

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => navObserver.observe(s));
})();

// ─── SMOOTH SCROLL ───────────────────────────────────────────
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ─── SCROLL REVEAL ───────────────────────────────────────────
(function initReveal() {
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // trigger spec bar fills
        if (entry.target.classList.contains('spec-card')) {
          entry.target.classList.add('in-view');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

// ─── ANIMATED COUNTERS ───────────────────────────────────────
(function initCounters() {
  const counters = $$('.counter, .stat-num[data-target]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target  = parseFloat(el.dataset.target);
    const decimal = el.dataset.decimal || '';
    const dur     = 1800;
    const start   = performance.now();

    const update = now => {
      const elapsed = now - start;
      const t       = Math.min(elapsed / dur, 1);
      const val     = Math.round(easeOut(t) * target);

      el.textContent = val.toLocaleString() + decimal;
      if (t < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString() + decimal;
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// ─── PARTICLES ───────────────────────────────────────────────
function spawnParticles() {
  const container = $('#particles-hero');
  if (!container) return;

  const colors = ['#1c6ef3', '#00d4ff', '#4a9eff', 'rgba(255,255,255,0.4)'];

  function createParticle() {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x    = Math.random() * 100;
    const dur  = Math.random() * 6 + 4;
    const delay= Math.random() * 4;
    const color= colors[Math.floor(Math.random() * colors.length)];

    Object.assign(p.style, {
      position:     'absolute',
      left:         x + '%',
      bottom:       '-10px',
      width:        size + 'px',
      height:       size + 'px',
      background:   color,
      borderRadius: '50%',
      boxShadow:    `0 0 ${size * 2}px ${color}`,
      animation:    `particleUp ${dur}s ease-out ${delay}s infinite`,
      pointerEvents:'none',
    });

    container.appendChild(p);
  }

  // Create 40 particles
  for (let i = 0; i < 40; i++) createParticle();
}

// ─── RPM ANIMATION ───────────────────────────────────────────
function startRPMAnimation() {
  const rpmBar     = $('#rpm-bar');
  const rpmFill    = rpmBar ? $('.rpm-fill', rpmBar) : null;
  const rpmNeedle  = $('#rpm-needle');
  const rpmReadout = $('#rpm-readout');
  const rpmGlow    = rpmBar ? $('.rpm-glow', rpmBar) : null;
  if (!rpmFill || !rpmNeedle) return;

  const maxRPM   = 8500;
  const sequence = [
    { rpm: 0,    dur: 1000 },
    { rpm: 2500, dur: 1500 },
    { rpm: 5000, dur: 1000 },
    { rpm: 7800, dur: 800  },
    { rpm: 8400, dur: 500  },
    { rpm: 8500, dur: 300  },
    { rpm: 6000, dur: 700  },
    { rpm: 3000, dur: 1200 },
    { rpm: 1000, dur: 1000 },
    { rpm: 0,    dur: 1500 },
  ];

  let seqIdx = 0;
  let currentRPM = 0;
  let animFrame;

  function animateToRPM(targetRPM, duration) {
    const start    = performance.now();
    const startRPM = currentRPM;
    const easeIO   = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

    cancelAnimationFrame(animFrame);

    function step(now) {
      const t   = Math.min((now - start) / duration, 1);
      currentRPM = startRPM + (targetRPM - startRPM) * easeIO(t);
      const pct  = (currentRPM / maxRPM) * 100;

      rpmFill.style.width    = pct + '%';
      rpmNeedle.style.left   = pct + '%';
      if (rpmGlow) rpmGlow.style.width = pct + '%';
      rpmReadout.textContent = Math.round(currentRPM).toLocaleString() + ' RPM';

      // Red zone colour
      if (currentRPM > 7500) {
        rpmFill.style.boxShadow = '0 0 12px rgba(255,60,60,0.8)';
      } else {
        rpmFill.style.boxShadow = '0 0 8px rgba(28,110,243,0.6)';
      }

      if (t < 1) { animFrame = requestAnimationFrame(step); }
      else {
        // next in sequence
        seqIdx = (seqIdx + 1) % sequence.length;
        const next = sequence[seqIdx];
        setTimeout(() => animateToRPM(next.rpm, next.dur), 200);
      }
    }
    animFrame = requestAnimationFrame(step);
  }

  // Only start when section is visible
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      const next = sequence[seqIdx];
      animateToRPM(next.rpm, next.dur);
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  const perfSection = $('#performance');
  if (perfSection) observer.observe(perfSection);
}

// ─── PERFORMANCE RING ARC ANIMATION ──────────────────────────
(function initRingArc() {
  const arc = $('.ring-arc');
  if (!arc) return;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      arc.classList.add('animate');
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  const perfSection = $('#performance');
  if (perfSection) observer.observe(perfSection);
})();

// ─── SPEC BAR FILLS ──────────────────────────────────────────
(function initSpecBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        // Already handled by CSS .in-view on spec-card, but trigger here too
        bar.classList.add('in-view');
      }
    });
  }, { threshold: 0.2 });

  $$('.spec-card').forEach(card => observer.observe(card));
})();

// ─── TECHNICAL ENGINEERING DEEP-DIVE MODAL ───────────────────
const technicalSpecifications = {
  engine: {
    category: 'POWERTRAIN ENGINEERING',
    title: '4.4L M TwinPower Turbo V8',
    subtitle: 'High-revving Bi-turbo internal combustion architecture with cross-bank exhaust manifolds',
    attributes: [
      { label: 'Displacement', val: '4,395 cc (4.4L)' },
      { label: 'Max Power', val: '627 HP @ 6,000 RPM' },
      { label: 'Peak Torque', val: '750 Nm @ 1,800–5,860 RPM' },
      { label: 'Aspiration', val: 'Twin Scroll Bi-Turbo (Hot-V)' },
      { label: 'Injection Pressure', val: '350 bar High Precision' },
      { label: '0–100 km/h', val: '3.3 Seconds' }
    ],
    overview: `
      <p>The heart of the BMW M5 is a high-performance 4.4-litre V8 engine featuring M TwinPower Turbo technology. Configured in an advanced <strong>"Hot-V" layout</strong>, the twin scroll turbochargers and catalytic converters are situated directly within the 90-degree cylinder bank valley.</p>
      <p>This layout drastically minimizes the exhaust gas path length to the turbine impellers, practically eliminating turbo lag and providing instantaneous throttle response across the powerband.</p>
    `,
    principles: `
      <p><strong>Cross-Bank Exhaust Manifold:</strong> Exhaust gas flows are rhythmically paired across alternating banks to feed the twin-scroll turbine housings with uninterrupted exhaust gas pulse pressure.</p>
      <p><strong>Thermal Management:</strong> A sophisticated indirect charge-air water cooling system combined with dual low-temperature and high-temperature cooling circuits ensures optimal intake air density even under continuous track load.</p>
    `,
    dynamics: `
      <p><strong>Track Endurance:</strong> The lubrication system utilizes a dynamic map-controlled oil pump with an integrated suction stage, guaranteeing oil supply during lateral and longitudinal accelerations exceeding 1.3G.</p>
      <p><strong>Weight Distribution:</strong> Sited low and pushed rearward behind the front axle line, the powertrain contributes significantly to the M5's balanced 52:48 front-to-rear chassis weight distribution.</p>
    `
  },
  braking: {
    category: 'CHASSIS DYNAMICS & RETARDATION',
    title: 'M Carbon Ceramic Braking System',
    subtitle: '6-Piston monobloc fixed calipers with carbon-fiber reinforced silicon carbide composite discs',
    attributes: [
      { label: 'Front Disc Diameter', val: '395 mm (15.6 in)' },
      { label: 'Rear Disc Diameter', val: '380 mm (15.0 in)' },
      { label: 'Front Caliper', val: '6-Piston Fixed Monobloc' },
      { label: 'Weight Reduction', val: '23 kg vs Steel Rotors' },
      { label: 'Operating Thermal Limit', val: 'Up to 1,000° C' },
      { label: 'Actuation', val: 'Integrated Braking By-Wire' }
    ],
    overview: `
      <p>The M Carbon Ceramic brake system delivers exceptional stopping performance, fade resistance, and thermal stability. Carbon fiber reinforced ceramic rotors combine high thermal conductivity with resistance to geometric distortion under high kinetic stress.</p>
      <p>The significant unsprung mass reduction of 23 kilograms directly enhances suspension response, steering feel, and overall vehicle handling agility.</p>
    `,
    principles: `
      <p><strong>Brake-by-Wire Modulation:</strong> An integrated electronic brake module provides pedal feel adaptation across Comfort and Sport drive modes, decoupling mechanical pedal travel from hydraulic line pressure.</p>
      <p><strong>Internal Cooling Vanes:</strong> Directionally curved cooling channels within the rotor core utilize centrifugal air evacuation to dissipate thermal peaks rapidly through the wheel arches.</p>
    `,
    dynamics: `
      <p><strong>Zero Fade Characteristic:</strong> Unlike conventional cast-iron discs that suffer thermal friction coefficient degradation at elevated temperatures, carbon ceramic materials maintain a stable friction coefficient (µ ≈ 0.45) across ambient to red-hot extremes.</p>
      <p><strong>Active Safety Integration:</strong> Dry braking pulses periodically wipe thin moisture films off the rotor surface during rainfall without decelerating the vehicle, ensuring immediate bite.</p>
    `
  },
  suspension: {
    category: 'CHASSIS & DAMPER TECHNOLOGY',
    title: 'Adaptive M Suspension Dynamics',
    subtitle: 'Electronically controlled continuously variable dampers with millisecond road surface analysis',
    attributes: [
      { label: 'Sampling Rate', val: '100 Hz (10 ms cycle)' },
      { label: 'Front Axle', val: 'Double-Wishbone Aluminium' },
      { label: 'Rear Axle', val: 'Five-Link Lightweight Steel' },
      { label: 'Anti-Roll Control', val: 'Dynamic Active Stabilizers' },
      { label: 'Modes', val: 'Comfort / Sport / Sport Plus' },
      { label: 'Chassis Tie-Bars', val: 'CFRP & Aluminium Shearing' }
    ],
    overview: `
      <p>Adaptive M Suspension utilizes continuously adjustable shock absorbers regulated by a dedicated chassis management controller. Sensors continuously calculate wheel acceleration, pitch, roll angle, steering angle, and vehicle speed.</p>
      <p>The double-wishbone front axle ensures optimal camber control through heavy cornering loads, keeping the maximum tire contact patch firmly planted on the road surface.</p>
    `,
    principles: `
      <p><strong>Electromagnetic Proportional Valves:</strong> In each damper, step-less internal electromagnetic valves alter the hydraulic fluid orifice area in fractions of a second, adjusting compression and rebound forces independently.</p>
      <p><strong>Elastokinematic Precision:</strong> Stiff ball joints replace traditional rubber bushings at critical suspension pivot points to ensure uncompromised steering linearity and lateral wheel guidance.</p>
    `,
    dynamics: `
      <p><strong>Dual-Personality Agility:</strong> Provides plush grand-touring compliance over highway expansion joints in Comfort mode, and transforms into race-ready damping with minimal body roll and pitch in Sport Plus.</p>
      <p><strong>Corner Stability:</strong> Active roll stabilization balances lateral body forces during sudden lane changes, mitigating understeer and oversteer tendencies before electronic stability intervention is required.</p>
    `
  },
  aerodynamics: {
    category: 'AERODYNAMIC & THERMAL EFFICIENCY',
    title: 'Active Aerodynamics & Cooling Architecture',
    subtitle: 'Adaptive kidney air-flap control, front wheel air curtains, and underbody venturi channels',
    attributes: [
      { label: 'Drag Coefficient (Cd)', val: '0.32 Aero Optimized' },
      { label: 'Active Elements', val: 'Electronically Gated Grille' },
      { label: 'Rear Downforce', val: 'Functional Carbon Diffuser' },
      { label: 'Roof Construction', val: 'Contoured CFRP Carbon Roof' },
      { label: 'Brake Cooling', val: 'Dedicated NACA Ducts' },
      { label: 'Front Air Curtains', val: 'Vortex Suppression Vents' }
    ],
    overview: `
      <p>Aerodynamic development on the BMW M5 achieves a fine balance between cooling air intake and low aerodynamic drag. The front apron incorporates large functional air intakes designed with computational fluid dynamics (CFD).</p>
      <p>The lightweight carbon-fibre reinforced plastic (CFRP) roof lowers the center of gravity while featuring a central aerodynamic recess that channels airflow directly toward the rear spoiler lip.</p>
    `,
    principles: `
      <p><strong>Active Air Flap Control:</strong> The iconic kidney grille features motorized vertical vanes that remain completely closed during cruising to reduce aerodynamic drag, opening automatically when engine and brake cooling demands surge.</p>
      <p><strong>Air Curtains & Air Breathers:</strong> Precision apertures in the front bumper route incoming air through channels past the outer wheel surfaces, smoothing air turbulence around the rotating wheels.</p>
    `,
    dynamics: `
      <p><strong>High-Speed Downforce:</strong> At speeds exceeding 200 km/h, the rear decklid spoiler and four-fin underbody diffuser generate calculated negative lift, maintaining rear axle stability during high-speed braking and sweepers.</p>
      <p><strong>Thermal Extraction:</strong> Functional hood vents and fender gills relieve under-hood air stagnation, evacuating high-pressure air while cooling the turbocharger bay.</p>
    `
  },
  cockpit: {
    category: 'DIGITAL INTERFACE & ERGONOMICS',
    title: 'BMW Curved Display & M Cockpit',
    subtitle: 'Ergonomically curved dual-screen digital architecture with M-specific telemetry graphics',
    attributes: [
      { label: 'Instrument Cluster', val: '12.3-inch Digital Display' },
      { label: 'Control Display', val: '14.9-inch Touch Screen' },
      { label: 'Operating System', val: 'BMW OS 9 with M Architecture' },
      { label: 'Head-Up Display', val: 'Full-Color AR Projection' },
      { label: 'Steering Controls', val: 'Dual M1 / M2 Preset Toggles' },
      { label: 'Telemetry Suite', val: 'M Drift Analyser & Laptimer' }
    ],
    overview: `
      <p>The M Cockpit unites driver ergonomics with high-resolution digital telemetry. A single sweeping frameless curved glass panel houses both the 12.3-inch instrumentation display and the 14.9-inch central touchscreen, angled subtly toward the driver.</p>
      <p>Physical red M1 and M2 toggle buttons on the steering wheel allow instant pre-programmed reconfiguration of the engine, transmission, steering, suspension, DSC, and xDrive settings in a single press.</p>
    `,
    principles: `
      <p><strong>Driver-Focused Telemetry:</strong> In M Track mode, all non-essential infotainment elements are silenced. The instrumentation shifts to an ultra-focused layout featuring a vertical shift light arc, tire temperature and pressure readouts, and boost gauges.</p>
      <p><strong>Tactile Precision:</strong> The steering wheel is wrapped in perforated Walknappa leather with hand-stitched M tricolor thread, backed by genuine carbon-fiber shift paddles with tactile magnetic micro-switches.</p>
    `,
    dynamics: `
      <p><strong>Cognitive Optimization:</strong> The full-color Head-Up Display projects critical racing telemetry directly in the driver's forward sightline, minimizing eye refocusing time at high velocities.</p>
      <p><strong>Real-Time Data Logging:</strong> Integrated telemetry sensors measure lateral and longitudinal G-forces, slip angles, and lap sector times, exportable for driver performance analysis.</p>
    `
  },
  safety: {
    category: 'INTEGRATED SAFETY & DRIVER ASSISTANCE',
    title: 'Active Safety Suite & CFRP Passenger Cell',
    subtitle: 'Multi-layered passive structural passenger cell combined with millimetric radar and vision arrays',
    attributes: [
      { label: 'Safety Cell', val: 'Carbon Core & Ultra-High Strength Steel' },
      { label: 'Sensor Suite', val: 'Short/Long Radar + Surround Cameras' },
      { label: 'Active Intervention', val: 'Evasion Assistant & Corner Braking' },
      { label: 'Airbag Matrix', val: '8-Point Intelligent Dual-Stage' },
      { label: 'Emergency Braking', val: 'Collision Warning with Pedestrian City Brake' },
      { label: 'Traction Guard', val: 'M Dynamic Mode (MDM) with 10-Stage DSC' }
    ],
    overview: `
      <p>The safety architecture of the BMW M5 is engineered from the inside out. The rigid passenger cell incorporates carbon-fiber structural components embedded within hot-stamped boron steel pillars, forming an ultra-rigid survival cage.</p>
      <p>Complementing this passive safety cage is an array of forward-looking ultrasonic sensors, surround-view stereoscopic cameras, and long-range millimetric radar transceivers operating in seamless harmony.</p>
    `,
    principles: `
      <p><strong>Active Collision Prevention:</strong> Front Collision Warning with City Collision Mitigation automatically pre-pressurizes the braking hydraulic system if an impending obstacle is detected, executing emergency deceleration if the driver fails to react.</p>
      <p><strong>Evasion Assistant:</strong> Assists the driver with calculated corrective steering torque during sudden evasive maneuvers around stationary obstacles or sudden highway obstructions.</p>
    `,
    dynamics: `
      <p><strong>Dynamic Stability Control (DSC):</strong> Operates in three selectable tiers: Full DSC for complete wet/snow stabilization; M Dynamic Mode (MDM) allowing calculated slip angles for track driving; and DSC OFF for unrestricted manual car control.</p>
      <p><strong>Cornering Brake Control (CBC):</strong> Asymmetrically redistributes individual wheel braking pressures during mid-corner braking maneuvers, counteracting hazardous yaw tendencies before they destabilize the vehicle.</p>
    `
  }
};

(function initTechModal() {
  const modal       = $('#tech-modal');
  const backdrop    = $('#modal-backdrop');
  const closeBtn    = $('#modal-close-btn');
  const dismissBtn  = $('#modal-dismiss-btn');
  const catEl       = $('#modal-category');
  const titleEl     = $('#modal-title');
  const subEl       = $('#modal-subtitle');
  const gridEl      = $('#modal-data-grid');
  const descEl      = $('#modal-desc-text');
  const princEl     = $('#modal-principles-text');
  const dynEl       = $('#modal-dynamics-text');
  const tabBtns     = $$('.modal-tab');
  const panels      = $$('.modal-content-panel');

  if (!modal) return;

  function openModal(key) {
    const data = technicalSpecifications[key] || technicalSpecifications.engine;
    catEl.textContent   = data.category;
    titleEl.textContent = data.title;
    subEl.textContent   = data.subtitle;

    // Populate attributes grid
    gridEl.innerHTML = data.attributes.map(attr => `
      <div class="modal-data-item">
        <span class="modal-data-label">${attr.label}</span>
        <span class="modal-data-val">${attr.val}</span>
      </div>
    `).join('');

    descEl.innerHTML  = data.overview;
    princEl.innerHTML = data.principles;
    dynEl.innerHTML   = data.dynamics;

    // Reset to overview tab
    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === 'overview'));
    panels.forEach(p => p.classList.toggle('active', p.id === 'tab-overview'));

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  // Expose globally for callout clicks and footer triggers
  window.openEngineeringModal = openModal;

  // Wire footer and page links with class open-system-modal
  $$('.open-system-modal').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const sys = link.dataset.system;
      if (sys) openModal(sys);
    });
  });

  // Wire spec cards to open modal on click
  $$('.spec-card').forEach((card, idx) => {
    const mapping = ['engine', 'engine', 'engine', 'engine', 'engine', 'engine'];
    card.style.cursor = 'pointer';
    card.title = 'Click for engineering analysis';
    card.addEventListener('click', () => openModal(mapping[idx] || 'engine'));
  });

  // Wire tech cards to open relevant modal
  $$('.tech-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.title = 'Click for deep technical breakdown';
    card.addEventListener('click', () => {
      if (card.id === 'tc-2') openModal('safety');
      else if (card.id === 'tc-3' || card.id === 'tc-4') openModal('cockpit');
      else openModal('aerodynamics');
    });
  });

  // Wire perf features
  $$('.perf-feature').forEach(pf => {
    pf.style.cursor = 'pointer';
    pf.title = 'Click for engineering breakdown';
    pf.addEventListener('click', () => {
      if (pf.id === 'pf-1') openModal('engine');
      else if (pf.id === 'pf-2') openModal('engine');
      else if (pf.id === 'pf-3') openModal('suspension');
      else if (pf.id === 'pf-4') openModal('braking');
    });
  });

  // Tab switching inside modal
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPanel = $(`#tab-${btn.dataset.tab}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  dismissBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });
})();

// ─── INTERIOR COLOUR SWATCHES ────────────────────────────────
(function initSwatches() {
  const swatches = $$('.swatch');
  const img      = $('.interior-img');
  if (!swatches.length) return;

  // Map swatch colour to CSS filter approximation for demo
  const filters = {
    'sw-black':  'brightness(1) saturate(1)',
    'sw-mocha':  'brightness(0.9) sepia(0.3) saturate(1.4)',
    'sw-blue':   'brightness(0.85) hue-rotate(200deg) saturate(1.2)',
    'sw-cognac': 'brightness(0.95) sepia(0.5) saturate(1.3)',
    'sw-white':  'brightness(1.15) saturate(0.6)',
  };

  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      if (img && filters[sw.id]) {
        img.style.filter = filters[sw.id];
        img.style.transition = 'filter 0.6s ease';
      }
    });
  });
})();

// ─── CONTACT FORM VALIDATION ──────────────────────────────────
(function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  const submitBtn = $('#form-submit-btn');
  if (!form) return;

  const validate = () => {
    let valid = true;

    const fname  = $('#fname');
    const lname  = $('#lname');
    const email  = $('#email');

    const setErr = (el, errId, msg) => {
      const errEl = $(`#${errId}`);
      if (!msg) {
        el.classList.remove('error');
        if (errEl) errEl.textContent = '';
      } else {
        el.classList.add('error');
        if (errEl) errEl.textContent = msg;
        valid = false;
      }
    };

    setErr(fname, 'fname-err', fname?.value.trim() ? '' : 'First name is required.');
    setErr(lname, 'lname-err', lname?.value.trim() ? '' : 'Last name is required.');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.value || '');
    setErr(email, 'email-err', emailOk ? '' : 'Please enter a valid email address.');

    return valid;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate submission
    const btnSpan = submitBtn.querySelector('span');
    if (btnSpan) btnSpan.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      if (btnSpan) btnSpan.textContent = 'Send Request';
      submitBtn.disabled = false;
      if (success) {
        success.classList.add('visible');
        setTimeout(() => success.classList.remove('visible'), 8000);
      }
    }, 1600);
  });

  // Live validation on blur
  $$('#fname, #lname, #email').forEach(el => {
    el.addEventListener('blur', validate);
  });
})();

// ─── SCROLL PROGRESS BAR ─────────────────────────────────────
(function initScrollProgress() {
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position:  'fixed',
    top:       '0',
    left:      '0',
    height:    '2px',
    background:'linear-gradient(90deg, #1c6ef3, #00d4ff)',
    zIndex:    '9999',
    width:     '0%',
    transition:'width 0.1s linear',
    pointerEvents: 'none',
    boxShadow: '0 0 8px #1c6ef3',
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  }, { passive: true });
})();

// ─── BUTTON RIPPLE ───────────────────────────────────────────
$$('.btn').forEach(btn => {
  btn.classList.add('btn-ripple');
});

// ─── PARALLAX (hero bg glows) ────────────────────────────────
(function initParallax() {
  const glowLeft  = $('.hero-glow-left');
  const glowRight = $('.hero-glow-right');
  if (!glowLeft) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      glowLeft.style.transform  = `translateY(${y * 0.15}px)`;
      glowRight.style.transform = `translateY(${y * 0.2}px)`;
    }
  }, { passive: true });
})();

// ─── TECH CARD SHIMMER OVERLAY ───────────────────────────────
$$('.tech-card, .spec-card').forEach(card => {
  const shimmer = document.createElement('div');
  shimmer.className = 'shimmer-hover';
  Object.assign(shimmer.style, {
    position: 'absolute',
    inset: '0',
    borderRadius: 'inherit',
    pointerEvents: 'none',
  });
  card.style.position = 'relative';
  card.appendChild(shimmer);
});

console.log('%cBMW M5 — The Ultimate Driving Machine', 'color:#1c6ef3;font-size:14px;font-weight:700;font-family:Outfit,sans-serif;');
console.log('%cBuilt with precision. Engineered to perform.', 'color:#6b7291;font-size:11px;');
