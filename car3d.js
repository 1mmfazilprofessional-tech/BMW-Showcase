/* ═══════════════════════════════════════════════════════════════
   BMW M5 SHOWCASE — CAR3D.JS
   Autonomous 360° Showroom Presentation & Intelligent Vehicle
   Inspection Engine.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function initAutonomousShowroom() {
  const stage          = document.getElementById('car-stage');
  const carWrapper     = document.getElementById('car-model-wrapper');
  const carImg         = document.getElementById('hero-car-img');
  const lightOverlay   = document.getElementById('car-lighting-overlay');
  const turntable      = document.getElementById('showroom-turntable');
  const shadowContact  = document.querySelector('.car-shadow-contact');
  const calloutsWrap   = document.getElementById('inspection-callouts-container');
  const svgCanvas      = document.getElementById('inspection-svg-canvas');
  const svgPath        = document.getElementById('svg-connector-path');
  const statusPill     = document.getElementById('inspection-status-pill');
  const statusModeText = document.getElementById('status-mode-text');
  const statusStepBadge= document.getElementById('status-step-badge');

  if (!stage || !carWrapper || !carImg) return;

  // ─── 8 PRECISION VEHICLE COMPONENTS ──────────────────────────
  // Normalized coordinates (0.0 to 1.0) on the vehicle image
  const vehicleParts = [
    {
      id: 'engine',
      system: 'engine',
      tag: 'POWERTRAIN',
      title: '4.4L M TwinPower Turbo V8',
      desc: 'Hot-V bi-turbo architecture with cross-bank manifolds, 627 HP & instantaneous throttle response.',
      anchorX: 0.32,
      anchorY: 0.44,
      cardSide: 'left',
      cardOffsetY: 0.08
    },
    {
      id: 'headlights',
      system: 'aerodynamics',
      tag: 'ILLUMINATION',
      title: 'Adaptive LED Laserlights',
      desc: 'Precision hexagonal matrix with 650m dynamic projection and selective anti-dazzle high-beam.',
      anchorX: 0.23,
      anchorY: 0.51,
      cardSide: 'left',
      cardOffsetY: 0.32
    },
    {
      id: 'grille',
      system: 'aerodynamics',
      tag: 'AERODYNAMICS',
      title: 'Active Kidney Air Flap System',
      desc: 'Motorized active vertical vanes close for drag reduction (Cd 0.32) and open for track cooling.',
      anchorX: 0.25,
      anchorY: 0.57,
      cardSide: 'left',
      cardOffsetY: 0.58
    },
    {
      id: 'brakes',
      system: 'braking',
      tag: 'DECELERATION',
      title: 'M Carbon Ceramic 6-Piston Brakes',
      desc: '395mm drilled ceramic discs with monobloc calipers delivering 1,000°C fade-free stopping power.',
      anchorX: 0.49,
      anchorY: 0.64,
      cardSide: 'center-bottom',
      cardOffsetY: 0.72
    },
    {
      id: 'wheels',
      system: 'braking',
      tag: 'UNSPRUNG MASS',
      title: '20" M Forged Light Alloys',
      desc: 'Staggered ultra-lightweight forged alloys wrapped in bespoke Michelin Pilot Sport 4S tires.',
      anchorX: 0.47,
      anchorY: 0.73,
      cardSide: 'right',
      cardOffsetY: 0.65
    },
    {
      id: 'suspension',
      system: 'suspension',
      tag: 'CHASSIS CONTROL',
      title: 'Adaptive M Suspension (100Hz)',
      desc: 'Step-less electromagnetic damping valves sampling road dynamics 100 times every second.',
      anchorX: 0.48,
      anchorY: 0.53,
      cardSide: 'right',
      cardOffsetY: 0.40
    },
    {
      id: 'mirrors',
      system: 'aerodynamics',
      tag: 'AERODYNAMICS',
      title: 'M Carbon Aerodynamic Mirrors',
      desc: 'Twin-stalk carbon-fiber housings sculpted to guide laminar air streams along the greenhouse.',
      anchorX: 0.64,
      anchorY: 0.37,
      cardSide: 'right',
      cardOffsetY: 0.12
    },
    {
      id: 'cockpit',
      system: 'cockpit',
      tag: 'DIGITAL INTERFACE',
      title: 'BMW Curved Display & M Cockpit',
      desc: '12.3" driver telemetry and 14.9" touchscreen with Head-Up Display and real-time M telemetry.',
      anchorX: 0.54,
      anchorY: 0.33,
      cardSide: 'right',
      cardOffsetY: -0.05
    }
  ];

  // ─── STATE DEFINITIONS ───────────────────────────────────────
  const STATES = {
    ENTRANCE:    0,
    ROTATION_360:1,
    PAUSE_5S:    2,
    INSPECTION:  3,
    CYCLE_RESET: 4
  };

  let currentState = STATES.ENTRANCE;
  let stateStartTime = 0;
  let currentPartIndex = 0;
  let partStartTime = 0;
  let isPausedByUser = false;
  let activeCardEl = null;
  let activeAnchorEl = null;

  // Rotation properties
  let rotationAngle = 0;
  const ROTATION_DURATION = 8500; // 8.5 seconds for high-fidelity 360 rotation
  const PAUSE_DURATION    = 5000; // 5-second presentation moment
  const PART_DURATION     = 3600; // 3.6 seconds per part callout

  // ─── DOM INJECTION OF CALLOUTS ──────────────────────────────
  calloutsWrap.innerHTML = '';
  const calloutElements = vehicleParts.map((part) => {
    // Anchor pin
    const anchor = document.createElement('div');
    anchor.className = 'callout-anchor';
    anchor.id = `anchor-${part.id}`;
    anchor.setAttribute('aria-label', `${part.title} anchor`);
    anchor.innerHTML = `
      <div class="callout-ring"></div>
      <div class="callout-dot"></div>
    `;
    anchor.style.opacity = '0';
    anchor.style.pointerEvents = 'none';

    // Info card
    const card = document.createElement('div');
    card.className = 'callout-card';
    card.id = `card-${part.id}`;
    card.innerHTML = `
      <div class="callout-card-tag">${part.tag}</div>
      <div class="callout-card-title">${part.title}</div>
      <div class="callout-card-desc">${part.desc}</div>
      <div class="callout-card-action">
        <span>View Engineering Specs</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    `;
    card.style.opacity = '0';
    card.style.pointerEvents = 'none';

    // Interaction: hover pauses presentation
    const pauseOnHover = () => { isPausedByUser = true; };
    const resumeOnLeave = () => { isPausedByUser = false; };
    card.addEventListener('mouseenter', pauseOnHover);
    card.addEventListener('mouseleave', resumeOnLeave);
    anchor.addEventListener('mouseenter', pauseOnHover);
    anchor.addEventListener('mouseleave', resumeOnLeave);

    // Interaction: click opens deep-dive modal
    const triggerModal = () => {
      if (typeof window.openEngineeringModal === 'function') {
        window.openEngineeringModal(part.system);
      }
    };
    card.addEventListener('click', triggerModal);
    anchor.addEventListener('click', triggerModal);

    calloutsWrap.appendChild(anchor);
    calloutsWrap.appendChild(card);

    return { part, anchor, card };
  });

  // ─── RESPONSIVE COORDINATE RECALCULATION ─────────────────────
  function updateCalloutPositions() {
    const stageRect = stage.getBoundingClientRect();
    const imgRect   = carImg.getBoundingClientRect();

    if (stageRect.width === 0 || imgRect.width === 0) return;

    // Image offset inside stage
    const imgOffsetX = imgRect.left - stageRect.left;
    const imgOffsetY = imgRect.top  - stageRect.top;

    const isMobile = window.innerWidth <= 640;

    calloutElements.forEach(({ part, anchor, card }) => {
      // Calculate exact pixel position of the vehicle component
      const targetPxX = imgOffsetX + (imgRect.width * part.anchorX);
      const targetPxY = imgOffsetY + (imgRect.height * part.anchorY);

      anchor.style.left = `${targetPxX}px`;
      anchor.style.top  = `${targetPxY}px`;

      if (isMobile) {
        card.style.left = '50%';
        card.style.top  = 'auto';
        card.style.bottom = '-10px';
      } else {
        let cardPxX, cardPxY;
        cardPxY = stageRect.height * (0.15 + (part.cardOffsetY || 0));

        if (part.cardSide === 'left') {
          cardPxX = Math.max(10, imgOffsetX - 170);
        } else if (part.cardSide === 'center-bottom') {
          cardPxX = stageRect.width * 0.35;
          cardPxY = stageRect.height * 0.78;
        } else {
          cardPxX = Math.min(stageRect.width - 250, imgOffsetX + imgRect.width - 40);
        }

        card.style.left = `${cardPxX}px`;
        card.style.top  = `${cardPxY}px`;
        card.style.bottom = 'auto';
      }
    });
  }

  window.addEventListener('resize', updateCalloutPositions);
  carImg.addEventListener('load', updateCalloutPositions);
  setTimeout(updateCalloutPositions, 200);

  // ─── SVG CONNECTOR LINE DRAWING ──────────────────────────────
  function drawConnectorLine(anchorEl, cardEl) {
    if (!anchorEl || !cardEl || window.innerWidth <= 640) {
      svgPath.setAttribute('d', '');
      return;
    }

    const stageRect  = stage.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    const cardRect   = cardEl.getBoundingClientRect();

    // Coordinates relative to stage SVG canvas
    const startX = (anchorRect.left + anchorRect.width / 2) - stageRect.left;
    const startY = (anchorRect.top  + anchorRect.height / 2) - stageRect.top;

    // Connect to the closest edge of the card
    let endX, endY;
    if (cardRect.left > anchorRect.left) {
      endX = cardRect.left - stageRect.left;
      endY = (cardRect.top + cardRect.height / 2) - stageRect.top;
    } else {
      endX = (cardRect.left + cardRect.width) - stageRect.left;
      endY = (cardRect.top + cardRect.height / 2) - stageRect.top;
    }

    // Midpoint elbow curve for clean technical aesthetic
    const midX = startX + (endX - startX) * 0.55;
    const pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

    svgPath.setAttribute('d', pathD);
    svgPath.style.strokeDashoffset = '0';
  }

  function clearConnectorLine() {
    svgPath.style.strokeDashoffset = '600';
  }

  // ─── AUTONOMOUS SHOWCASE ENGINE (RAF LOOP) ───────────────────
  let lastTimestamp = 0;

  function runShowroomPresentation(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      stateStartTime = timestamp;
    }
    const elapsedInState = timestamp - stateStartTime;

    // ── STATE 0: NATURAL ENTRANCE & SUSPENSION SETTLE ─────────
    if (currentState === STATES.ENTRANCE) {
      const duration = 1600;
      const progress = Math.min(elapsedInState / duration, 1);
      // Smooth hydraulic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      const translateY = (1 - ease) * 16;
      const opacity    = ease;

      carWrapper.style.transform = `translateY(${translateY}px)`;
      carWrapper.style.opacity   = opacity;
      if (turntable) turntable.style.opacity = opacity;
      if (shadowContact) shadowContact.style.opacity = opacity;

      statusModeText.textContent = '360° SHOWROOM PRESENTATION';
      statusStepBadge.textContent = 'STAGE 1 / 3';

      if (progress >= 1) {
        currentState = STATES.ROTATION_360;
        stateStartTime = timestamp;
        rotationAngle = 0;
      }
    }

    // ── STATE 1: AUTONOMOUS 360-DEGREE SHOWROOM ROTATION ──────
    else if (currentState === STATES.ROTATION_360) {
      const progress = Math.min(elapsedInState / ROTATION_DURATION, 1);
      rotationAngle = progress * 360;

      // Realistic 3D perspective rotation on the showroom turntable
      const rad = (rotationAngle * Math.PI) / 180;
      const rotY = Math.sin(rad) * 16;
      const rotX = Math.cos(rad) * 2;
      const scaleVal = 1 + Math.sin(rad) * 0.02;

      carWrapper.style.transform = `perspective(1600px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scaleVal})`;

      // Shift dynamic surface reflection and turntable specularity
      if (lightOverlay) {
        lightOverlay.style.opacity = (Math.abs(Math.sin(rad)) * 0.4).toString();
        lightOverlay.style.background = `linear-gradient(${110 + rotY * 2}deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)`;
      }
      if (turntable) {
        turntable.style.transform = `translateX(-50%) rotateY(${rotY * 0.3}deg)`;
      }

      statusModeText.textContent = 'AUTONOMOUS 360° TURNTABLE';
      statusStepBadge.textContent = `${Math.round(rotationAngle)}° ROTATION`;

      if (progress >= 1) {
        // Reset transform seamlessly to baseline beauty angle
        carWrapper.style.transition = 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        carWrapper.style.transform  = 'perspective(1600px) rotateY(0deg) rotateX(0deg) scale(1)';
        if (lightOverlay) lightOverlay.style.opacity = '0';

        setTimeout(() => {
          carWrapper.style.transition = '';
        }, 1000);

        currentState = STATES.PAUSE_5S;
        stateStartTime = timestamp;
      }
    }

    // ── STATE 2: 5-SECOND PRESENTATION PAUSE MOMENT ───────────
    else if (currentState === STATES.PAUSE_5S) {
      const remainingSeconds = Math.max(0, Math.ceil((PAUSE_DURATION - elapsedInState) / 1000));

      statusModeText.textContent = 'INTELLIGENT VEHICLE INSPECTION';
      statusStepBadge.textContent = `SYSTEM ACTIVE: ${remainingSeconds}S`;

      const breathe = Math.sin((elapsedInState / 1000) * Math.PI) * 2;
      carWrapper.style.transform = `perspective(1600px) rotateY(0deg) translateY(${breathe}px)`;

      if (elapsedInState >= PAUSE_DURATION) {
        currentState = STATES.INSPECTION;
        stateStartTime = timestamp;
        currentPartIndex = 0;
        partStartTime = timestamp;
        updateCalloutPositions();
      }
    }

    // ── STATE 3: INTELLIGENT SEQUENTIAL COMPONENT CALLOUTS ────
    else if (currentState === STATES.INSPECTION) {
      const currentCallout = calloutElements[currentPartIndex];
      const partElapsed = timestamp - partStartTime;

      if (currentCallout) {
        const { part, anchor, card } = currentCallout;

        // Show active callout
        if (activeCardEl !== card) {
          // Deactivate previous
          if (activeCardEl) {
            activeCardEl.classList.remove('active');
            activeCardEl.style.opacity = '0';
            activeCardEl.style.pointerEvents = 'none';
          }
          if (activeAnchorEl) {
            activeAnchorEl.style.opacity = '0';
            activeAnchorEl.style.pointerEvents = 'none';
          }

          // Activate new
          card.classList.add('active');
          card.style.opacity = '1';
          card.style.pointerEvents = 'auto';
          anchor.style.opacity = '1';
          anchor.style.pointerEvents = 'auto';

          activeCardEl = card;
          activeAnchorEl = anchor;

          statusModeText.textContent = `INSPECTION: ${part.tag}`;
          statusStepBadge.textContent = `PART ${currentPartIndex + 1} OF ${vehicleParts.length}`;

          drawConnectorLine(anchor, card);
        }

        // If not paused by user hover, advance through parts
        if (!isPausedByUser) {
          if (partElapsed >= PART_DURATION) {
            currentPartIndex++;
            partStartTime = timestamp;

            if (currentPartIndex >= vehicleParts.length) {
              currentState = STATES.CYCLE_RESET;
              stateStartTime = timestamp;
            }
          }
        }
      }
    }

    // ── STATE 4: CYCLE RESET / TRANSITION ─────────────────────
    else if (currentState === STATES.CYCLE_RESET) {
      if (activeCardEl) {
        activeCardEl.classList.remove('active');
        activeCardEl.style.opacity = '0';
        activeCardEl.style.pointerEvents = 'none';
        activeCardEl = null;
      }
      if (activeAnchorEl) {
        activeAnchorEl.style.opacity = '0';
        activeAnchorEl.style.pointerEvents = 'none';
        activeAnchorEl = null;
      }
      clearConnectorLine();

      statusModeText.textContent = 'INSPECTION CYCLE COMPLETE';
      statusStepBadge.textContent = 'STANDBY';

      if (elapsedInState >= 2500) {
        currentState = STATES.ROTATION_360;
        stateStartTime = timestamp;
        rotationAngle = 0;
      }
    }

    requestAnimationFrame(runShowroomPresentation);
  }

  // Launch autonomous presentation
  requestAnimationFrame(runShowroomPresentation);
})();

console.log('%c🏎 Autonomous 360° Showroom & Inspection Engine Initialized', 'color:#00d4ff;font-weight:700;');
