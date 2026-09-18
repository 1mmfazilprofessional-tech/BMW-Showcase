/* ═══════════════════════════════════════════════════════════════
   BMW M5 SHOWCASE — REAL 3D CAR ENGINE
   Three.js + GLTFLoader
   Real BMW GLB model / autonomous showroom presentation
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function initRealBMWShowroom() {

  // ─── DOM ─────────────────────────────────────────────────────
  const stage = document.getElementById('car-stage');
  const wrapper = document.getElementById('car-model-wrapper');
  const container = document.getElementById('bmw-3d-container');
  const canvas = document.getElementById('bmw-3d-canvas');

  const turntable = document.getElementById('showroom-turntable');
  const shadowContact = document.querySelector('.car-shadow-contact');
  const lightOverlay = document.getElementById('car-lighting-overlay');

  const calloutsWrap =
    document.getElementById('inspection-callouts-container');

  const svgCanvas =
    document.getElementById('inspection-svg-canvas');

  const svgPath =
    document.getElementById('svg-connector-path');

  const statusModeText =
    document.getElementById('status-mode-text');

  const statusStepBadge =
    document.getElementById('status-step-badge');

  const loading =
    document.getElementById('car-3d-loading');

  const loadingProgress =
    document.getElementById('car-3d-loading-progress');

  if (!stage || !wrapper || !container || !canvas) {
    console.warn('BMW 3D container not found.');
    return;
  }

  // ─── CHECK THREE.JS ──────────────────────────────────────────
  if (typeof THREE === 'undefined') {
    console.error('Three.js was not loaded.');
    return;
  }

  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('GLTFLoader was not loaded.');
    return;
  }

  // ─── THREE.JS SCENE ──────────────────────────────────────────
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    1,
    0.1,
    1000
  );

  camera.position.set(0, 1.4, 7.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ─── CINEMATIC AUTOMOTIVE STUDIO LIGHTING ───────────────────
  const ambientLight = new THREE.HemisphereLight(0xeaf2ff, 0x030509, 1.15);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 5.2);
  keyLight.position.set(4.5, 6.5, 5.5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const softbox = new THREE.DirectionalLight(0xbfd8ff, 3.4);
  softbox.position.set(-5.5, 4.0, 3.5);
  scene.add(softbox);

  const roofLight = new THREE.DirectionalLight(0xffffff, 2.8);
  roofLight.position.set(0, 8, 1);
  scene.add(roofLight);

  const blueRim = new THREE.PointLight(0x1688ff, 7.0, 10, 2);
  blueRim.position.set(-3.8, 2.8, -3.5);
  scene.add(blueRim);

  const redRim = new THREE.PointLight(0xff1838, 6.5, 10, 2);
  redRim.position.set(3.8, 2.4, -3.2);
  scene.add(redRim);

  const frontSoftbox = new THREE.SpotLight(0xffffff, 12, 16, Math.PI / 7, 0.55, 1.4);
  frontSoftbox.position.set(0, 5.5, 6.5);
  frontSoftbox.target.position.set(0, 0.8, 0);
  scene.add(frontSoftbox);
  scene.add(frontSoftbox.target);

  const sideSoftbox = new THREE.SpotLight(0xbdd8ff, 9, 14, Math.PI / 6, 0.6, 1.5);
  sideSoftbox.position.set(-6, 3.5, 2.5);
  sideSoftbox.target.position.set(0, 0.8, 0);
  scene.add(sideSoftbox);
  scene.add(sideSoftbox.target);

  const rearRedSoftbox = new THREE.SpotLight(0xff1638, 8, 14, Math.PI / 6, 0.65, 1.6);
  rearRedSoftbox.position.set(5.5, 3.0, -4.5);
  rearRedSoftbox.target.position.set(0, 0.9, 0);
  scene.add(rearRedSoftbox);
  scene.add(rearRedSoftbox.target);

  // Thin luminous background bars reproduce the blue/red studio streaks.
  const blueBar = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 4.8),
    new THREE.MeshBasicMaterial({ color: 0x1688ff, transparent: true, opacity: 0.52, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  blueBar.position.set(-2.6, 2.2, -3.8);
  blueBar.rotation.z = -0.22;
  scene.add(blueBar);

  const redBar = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 4.2),
    new THREE.MeshBasicMaterial({ color: 0xff1838, transparent: true, opacity: 0.46, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  redBar.position.set(2.7, 2.0, -3.7);
  redBar.rotation.z = 0.25;
  scene.add(redBar);

  // ─── SHOWROOM FLOOR ──────────────────────────────────────────
  const floorGeometry = new THREE.CircleGeometry(5.5, 96);

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x080a0f,
    metalness: 0.75,
    roughness: 0.28
  });

  const floor = new THREE.Mesh(
    floorGeometry,
    floorMaterial
  );

  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.03;
  floor.receiveShadow = true;

  scene.add(floor);

  // ─── TURNTABLE ───────────────────────────────────────────────
  const platformGeometry =
    new THREE.CylinderGeometry(3.5, 3.5, 0.12, 96);

  const platformMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x11151d,
      metalness: 0.9,
      roughness: 0.2
    });

  const platform = new THREE.Mesh(
    platformGeometry,
    platformMaterial
  );

  platform.position.y = 0.02;
  platform.receiveShadow = true;
  platform.castShadow = true;

  scene.add(platform);

  // ─── BLUE SHOWROOM LIGHT RINGS ───────────────────────────────
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x1688ff,
    transparent: true,
    opacity: 0.9
  });

  const ringOuter = new THREE.Mesh(
    new THREE.TorusGeometry(3.42, 0.025, 12, 128),
    ringMaterial
  );
  ringOuter.rotation.x = Math.PI / 2;
  ringOuter.position.y = 0.11;
  scene.add(ringOuter);

  const ringInner = new THREE.Mesh(
    new THREE.TorusGeometry(2.95, 0.012, 10, 128),
    new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.7
    })
  );
  ringInner.rotation.x = Math.PI / 2;
  ringInner.position.y = 0.115;
  scene.add(ringInner);

  const bluePlatformLight = new THREE.PointLight(0x1688ff, 2.5, 8, 2);
  bluePlatformLight.position.set(0, 0.6, 0);
  scene.add(bluePlatformLight);

  // ─── BMW MODEL ROOT ──────────────────────────────────────────
  const carRoot = new THREE.Group();

  carRoot.position.set(0, 0.12, 0);
  carRoot.visible = true;

  scene.add(carRoot);

  let carModel = null;
  let modelMeshes = [];

  // ─── MODEL LOADER ────────────────────────────────────────────
  const loader = new THREE.GLTFLoader();

  const MODEL_URL =
    'https://raw.githubusercontent.com/VIHAR2212/open-road/main/public/models/2022_bmw_m5_cs.glb';

  loader.load(
    MODEL_URL,

    function onLoad(gltf) {

      carModel = gltf.scene;

      carRoot.add(carModel);

      // Collect meshes and build a reliable automotive material pass.
      // The source M5 asset uses light/white paint. For the requested hero treatment,
      // force the exterior paint to deep gloss black while preserving glass, lamps,
      // tyres, chrome and other recognizable details.
      carModel.traverse(function(object) {
        if (!object.isMesh) return;

        modelMeshes.push(object);
        object.castShadow = true;
        object.receiveShadow = true;

        const objectLabel = (object.name || '').toLowerCase();
        // Clone materials per mesh so the black body treatment cannot
        // accidentally recolor wheels, glass, interior or lamp materials
        // that share the same source material.
        if (Array.isArray(object.material)) {
          object.material = object.material.map(function(material) {
            return material && material.clone ? material.clone() : material;
          });
        } else if (object.material && object.material.clone) {
          object.material = object.material.clone();
        }

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach(function(material) {
          if (!material) return;

          const materialLabel = (material.name || '').toLowerCase();
          const label = objectLabel + ' ' + materialLabel;

          const isLamp =
            /head.?light|headlamp|led|light|lamp|taillight|tail.?light|indicator|turn.?signal/.test(label);

          const isGlass =
            /glass|window|windshield|windscreen|mirror.?glass/.test(label);

          const isTyre =
            /tyre|tire|rubber/.test(label);

          const isBrake =
            /brake|caliper|disc|rotor/.test(label);

          const isChrome =
            /chrome|grille|kidney|metal|trim|exhaust|badge|logo/.test(label);

          const isInterior =
            /seat|dashboard|interior|cockpit|steering|console|carpet|door.?panel/.test(label);

          const isWheel =
            /wheel|rim|alloy/.test(label);

          // Explicitly identify painted body panels. Some source assets carry
          // white paint as a texture; removing that paint map is essential so
          // the requested deep-black finish is actually rendered black.
          const isBodyPaint = true;

          // Exterior paint: true deep-black glossy automotive finish.
          // Remove a light source texture from painted panels so it cannot
          // override the black base color.
          if (isBodyPaint && !isLamp && !isGlass && !isTyre && !isBrake && !isChrome && !isWheel) {
            if (material.map) {
              material.map = null;
            }
            if (material.color) {
              material.color.setHex(0x030407);
            }
            if ('metalness' in material) {
              material.metalness = 0.9;
            }
            if ('roughness' in material) {
              material.roughness = 0.14;
            }
            if ('envMapIntensity' in material) {
              material.envMapIntensity = 1.6;
            }
          } else if (!isLamp && !isGlass && !isTyre && !isBrake && !isChrome && !isWheel) {
            if (material.color) {
              material.color.setHex(isInterior ? 0x07090d : 0x080b10);
            }
            if ('metalness' in material) {
              material.metalness = isInterior ? 0.28 : 0.78;
            }
            if ('roughness' in material) {
              material.roughness = isInterior ? 0.3 : 0.17;
            }
          }

          if (isWheel) {
            if (material.color) material.color.setHex(0x090b0f);
            if ('metalness' in material) material.metalness = 0.88;
            if ('roughness' in material) material.roughness = 0.2;
          }

          if (isTyre) {
            if (material.color) material.color.setHex(0x030405);
            if ('metalness' in material) material.metalness = 0.05;
            if ('roughness' in material) material.roughness = 0.72;
          }

          if (isBrake) {
            if (material.color) material.color.setHex(0xb30c1b);
            if ('metalness' in material) material.metalness = 0.72;
            if ('roughness' in material) material.roughness = 0.2;
          }

          if (isChrome) {
            if (material.color && /grille|kidney/.test(label)) {
              material.color.setHex(0x030405);
            }
            if ('metalness' in material) material.metalness = 0.92;
            if ('roughness' in material) material.roughness = 0.16;
          }

          if (isGlass) {
            if (material.color) material.color.setHex(0x071018);
            if ('metalness' in material) material.metalness = 0.12;
            if ('roughness' in material) material.roughness = 0.08;
            if ('transparent' in material) material.transparent = true;
            if ('opacity' in material) material.opacity = Math.min(material.opacity || 1, 0.72);
          }

          if (isLamp) {
            if (material.color) material.color.setHex(0xdff6ff);
            if (material.emissive) {
              material.emissive.setHex(0xc9efff);
              material.emissiveIntensity = 5.0;
            }
            if ('metalness' in material) material.metalness = 0.05;
            if ('roughness' in material) material.roughness = 0.08;
          }

          material.needsUpdate = true;
        });
      });

      // ─── REALISTIC VEHICLE LIGHTING / DETAIL MATERIALS ───────
      carModel.traverse(function(object) {
        if (!object.isMesh || !object.material) return;

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        const name = (object.name || '').toLowerCase();

        materials.forEach(function(material) {
          if (!material) return;

          if (/head.?light|headlamp|led|lamp/.test(name) && material.emissive) {
            material.emissive.setHex(0xbfefff);
            material.emissiveIntensity = 3.2;
            if (material.color) material.color.setHex(0xd9f8ff);
            if ('roughness' in material) material.roughness = 0.12;
            material.needsUpdate = true;
          }

          if (/brake.?caliper|caliper|brake/.test(name) && material.color) {
            material.color.setHex(0xc10d1d);
            if ('metalness' in material) material.metalness = 0.72;
            if ('roughness' in material) material.roughness = 0.2;
            material.needsUpdate = true;
          }

          if (/wheel|rim|alloy/.test(name) && 'metalness' in material) {
            material.metalness = Math.max(material.metalness || 0, 0.82);
            if ('roughness' in material) material.roughness = Math.min(material.roughness ?? 0.3, 0.24);
            material.needsUpdate = true;
          }
        });
      });

      // Headlights are real Three.js lights parented to the vehicle, so they rotate with it.
      [
        [-0.88, 0.72, 2.28],
        [ 0.88, 0.72, 2.28]
      ].forEach(function(position) {
        const headLight = new THREE.PointLight(0xbfefff, 6.5, 4.5, 2);
        headLight.position.set(position[0], position[1], position[2]);
        carModel.add(headLight);
      });

      // ─── AUTO CENTER / SCALE ───────────────────────────────

      const box = new THREE.Box3().setFromObject(carModel);

      const size = new THREE.Vector3();
      const center = new THREE.Vector3();

      box.getSize(size);
      box.getCenter(center);

      carModel.position.x -= center.x;
      carModel.position.y -= box.min.y;
      carModel.position.z -= center.z;

      const maxDimension =
        Math.max(size.x, size.y, size.z);

      const desiredSize = 5.15;

      const scale =
        desiredSize / maxDimension;

      carModel.scale.setScalar(scale);

      // Recalculate after scaling.
      const scaledBox =
        new THREE.Box3().setFromObject(carModel);

      const scaledCenter =
        new THREE.Vector3();

      scaledBox.getCenter(scaledCenter);

      carModel.position.x -= scaledCenter.x;
      carModel.position.y -= scaledBox.min.y;
      carModel.position.z -= scaledCenter.z;

      carRoot.visible = true;
      carRoot.position.set(0, 0.18, 0);

      if (loading) {
        loading.classList.add('hidden');
      }

      if (loadingProgress) {
        loadingProgress.style.width = '100%';
      }

      setupVehicleParts();
      updateStatus(
        '360° SHOWROOM PRESENTATION',
        'STAGE 1 / 3'
      );

      startPresentation();
    },

    function onProgress(xhr) {

      if (xhr.lengthComputable) {

        const percent =
          (xhr.loaded / xhr.total) * 100;

        if (loadingProgress) {
          loadingProgress.style.width =
            `${percent}%`;
        }
      }
    },

    function onError(error) {

      console.error(
        'BMW GLB failed to load:',
        error
      );

      if (loading) {
        loading.classList.add('hidden');
      }

      updateStatus(
        '3D MODEL LOAD ERROR',
        'CHECK MODEL PATH'
      );
    }
  );

  // ─── VEHICLE PART DEFINITIONS ────────────────────────────────
  const vehicleParts = [
    {
      id: 'engine',
      objectNames: ['engine', 'motor'],
      system: 'engine',
      tag: 'POWERTRAIN',
      title: 'M Performance Powertrain',
      desc: 'Real engine geometry highlighted directly on the loaded BMW M5 3D model.',
      camera: [2.7, 1.3, 4.0]
    },
    {
      id: 'headlights',
      objectNames: ['headlight', 'head light', 'light'],
      system: 'aerodynamics',
      tag: 'ILLUMINATION',
      title: 'BMW M Adaptive Lighting',
      desc: 'Actual lighting geometry highlighted on the 3D vehicle.',
      camera: [2.8, 1.3, 4.4]
    },
    {
      id: 'grille',
      objectNames: ['grille', 'kidney'],
      system: 'aerodynamics',
      tag: 'AERODYNAMICS',
      title: 'Signature Kidney Grille',
      desc: 'Actual grille geometry highlighted on the 3D vehicle.',
      camera: [2.5, 1.15, 4.8]
    },
    {
      id: 'wheels',
      objectNames: ['wheel', 'tire', 'tyre'],
      system: 'braking',
      tag: 'WHEELS',
      title: 'M Performance Wheels',
      desc: 'Actual wheel geometry highlighted on the vehicle.',
      camera: [3.4, 0.75, 2.8]
    },
    {
      id: 'mirrors',
      objectNames: ['mirror'],
      system: 'aerodynamics',
      tag: 'AERODYNAMICS',
      title: 'M Aerodynamic Mirrors',
      desc: 'Actual mirror geometry highlighted on the vehicle.',
      camera: [3.2, 1.65, 3.4]
    },
    {
      id: 'cockpit',
      objectNames: ['dashboard', 'seat', 'interior', 'cockpit'],
      system: 'cockpit',
      tag: 'DIGITAL INTERFACE',
      title: 'M Cockpit',
      desc: 'Interior geometry available in the loaded 3D model.',
      camera: [2.8, 1.8, 2.5]
    },
    {
      id: 'spoiler',
      objectNames: ['spoiler', 'wing'],
      system: 'aerodynamics',
      tag: 'AERODYNAMICS',
      title: 'Rear Aerodynamic Wing',
      desc: 'Actual rear aerodynamic geometry highlighted on the BMW.',
      camera: [-3.0, 1.4, -3.5]
    },
    {
      id: 'exhaust',
      objectNames: ['exhaust', 'muffler', 'tailpipe'],
      system: 'aerodynamics',
      tag: 'EXHAUST',
      title: 'M Performance Exhaust',
      desc: 'Actual exhaust geometry highlighted on the vehicle.',
      camera: [-3.2, 0.8, -3.7]
    }
  ];

  // ─── FIND MODEL OBJECT ───────────────────────────────────────
  function findObjectsByNames(names) {

    if (!carModel) return [];

    const results = [];

    carModel.traverse(object => {

      if (!object.name) return;

      const objectName =
        object.name.toLowerCase();

      names.forEach(name => {

        if (
          objectName === name.toLowerCase() ||
          objectName.includes(name.toLowerCase())
        ) {
          if (!results.includes(object)) {
            results.push(object);
          }
        }
      });
    });

    return results;
  }

  // ─── HIGHLIGHT SYSTEM ───────────────────────────────────────
  let highlightedObjects = [];

  function clearHighlight() {

    highlightedObjects.forEach(item => {

      if (item.material) {

        if (Array.isArray(item.material)) {

          item.material.forEach(mat => {

            if (mat && mat.emissive) {
              mat.emissive.setHex(
                item.originalEmissive || 0x000000
              );
              mat.emissiveIntensity =
                item.originalIntensity || 0;
            }
          });

        } else if (item.material.emissive) {

          item.material.emissive.setHex(
            item.originalEmissive || 0x000000
          );

          item.material.emissiveIntensity =
            item.originalIntensity || 0;
        }
      }
    });

    highlightedObjects = [];
  }

  function highlightPart(part) {

    clearHighlight();

    const objects =
      findObjectsByNames(part.objectNames);

    objects.forEach(object => {

      if (!object.material) return;

      if (Array.isArray(object.material)) {

        object.material.forEach(material => {

          if (!material || !material.emissive)
            return;

          const original =
            material.emissive.getHex();

          const originalIntensity =
            material.emissiveIntensity || 0;

          highlightedObjects.push({
            material,
            originalEmissive: original,
            originalIntensity
          });

          material.emissive.setHex(0x1677ff);
          material.emissiveIntensity = 1.4;
        });

      } else if (object.material.emissive) {

        const material = object.material;

        highlightedObjects.push({
          material,
          originalEmissive:
            material.emissive.getHex(),
          originalIntensity:
            material.emissiveIntensity || 0
        });

        material.emissive.setHex(0x1677ff);
        material.emissiveIntensity = 1.4;
      }
    });
  }

  // ─── CALLOUT CREATION ────────────────────────────────────────
  let calloutElements = [];

  function setupVehicleParts() {

    if (!calloutsWrap) return;

    calloutsWrap.innerHTML = '';

    calloutElements =
      vehicleParts.map(part => {

        const anchor =
          document.createElement('div');

        anchor.className =
          'callout-anchor';

        anchor.id =
          `anchor-${part.id}`;

        anchor.innerHTML = `
          <div class="callout-ring"></div>
          <div class="callout-dot"></div>
        `;

        anchor.style.opacity = '0';
        anchor.style.pointerEvents = 'none';

        const card =
          document.createElement('div');

        card.className =
          'callout-card';

        card.id =
          `card-${part.id}`;

        card.innerHTML = `
          <div class="callout-card-tag">
            ${part.tag}
          </div>

          <div class="callout-card-title">
            ${part.title}
          </div>

          <div class="callout-card-desc">
            ${part.desc}
          </div>

          <div class="callout-card-action">
            <span>View Engineering Specs</span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        `;

        card.style.opacity = '0';
        card.style.pointerEvents = 'none';

        card.addEventListener(
          'mouseenter',
          () => {
            isPausedByUser = true;
          }
        );

        card.addEventListener(
          'mouseleave',
          () => {
            isPausedByUser = false;
          }
        );

        anchor.addEventListener(
          'mouseenter',
          () => {
            isPausedByUser = true;
          }
        );

        anchor.addEventListener(
          'mouseleave',
          () => {
            isPausedByUser = false;
          }
        );

        card.addEventListener(
          'click',
          () => {

            if (
              typeof window.openEngineeringModal ===
              'function'
            ) {
              window.openEngineeringModal(
                part.system
              );
            }
          }
        );

        calloutsWrap.appendChild(anchor);
        calloutsWrap.appendChild(card);

        return {
          part,
          anchor,
          card
        };
      });
  }

  // ─── STATUS ──────────────────────────────────────────────────
  function updateStatus(mode, step) {

    if (statusModeText) {
      statusModeText.textContent = mode;
    }

    if (statusStepBadge) {
      statusStepBadge.textContent = step;
    }
  }

  // ─── PRESENTATION STATE ─────────────────────────────────────
  const STATES = {
    ENTRANCE: 0,
    ROTATION: 1,
    PAUSE: 2,
    INSPECTION: 3,
    RESET: 4
  };

  let currentState = STATES.ENTRANCE;
  let stateStart = 0;

  let isPausedByUser = false;

  let currentPartIndex = 0;
  let partStart = 0;

  let activeCard = null;
  let activeAnchor = null;

  let startCameraPosition =
    new THREE.Vector3();

  let startCameraLook =
    new THREE.Vector3();

  let currentCameraTarget =
    new THREE.Vector3(0, 1, 0);

  const ENTRANCE_DURATION = 1800;
  const ROTATION_DURATION = 8500;
  const PAUSE_DURATION = 6000;
  const PART_DURATION = 3600;

  // ─── CAMERA LOOK ─────────────────────────────────────────────
  function lookAtCar() {

    camera.lookAt(
      currentCameraTarget
    );
  }

  // ─── SHOWCASE ENTRANCE ──────────────────────────────────────
  function entrance(progress) {

    const ease =
      1 - Math.pow(1 - progress, 3);

    carRoot.position.y =
      THREE.MathUtils.lerp(
        -2.2,
        0.12,
        ease
      );

    carRoot.position.z =
      THREE.MathUtils.lerp(
        -1.8,
        0,
        ease
      );

    carRoot.scale.setScalar(
      THREE.MathUtils.lerp(
        0.82,
        1,
        ease
      )
    );

    camera.position.set(
      0,
      THREE.MathUtils.lerp(
        2.4,
        1.45,
        ease
      ),
      THREE.MathUtils.lerp(
        9,
        7.5,
        ease
      )
    );

    currentCameraTarget.set(
      0,
      0.9,
      0
    );

    lookAtCar();

    if (shadowContact) {
      shadowContact.style.opacity =
        String(ease);
    }

    if (turntable) {
      turntable.style.opacity =
        String(ease);
    }
  }

  // ─── 360° REAL MODEL ROTATION ────────────────────────────────
  function rotateCar(progress) {

    const eased =
      progress * progress *
      (3 - 2 * progress);

    carRoot.rotation.y =
      eased * Math.PI * 2;

    carRoot.position.y =
      0.12 +
      Math.sin(progress * Math.PI) *
      0.025;

    camera.position.set(
      0,
      1.45,
      7.5
    );

    currentCameraTarget.set(
      0,
      0.9,
      0
    );

    lookAtCar();

    if (lightOverlay) {

      lightOverlay.style.opacity =
        String(
          0.08 +
          Math.abs(
            Math.sin(progress * Math.PI * 2)
          ) * 0.22
        );
    }

    updateStatus(
      'AUTONOMOUS 360° SHOWROOM',
      `${Math.round(progress * 360)}° ROTATION`
    );
  }

  // ─── INSPECTION CAMERA ───────────────────────────────────────
  function inspectPart(part, progress) {

    const target =
      new THREE.Vector3(
        part.camera[0],
        part.camera[1],
        part.camera[2]
      );

    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(
            -2 * progress + 2,
            2
          ) / 2;

    camera.position.lerpVectors(
      startCameraPosition,
      target,
      ease
    );

    currentCameraTarget.lerpVectors(
      startCameraLook,
      new THREE.Vector3(0, 0.85, 0),
      ease
    );

    lookAtCar();
  }

  // ─── CALLOUT VISIBILITY ──────────────────────────────────────
  function hideCallouts() {

    if (activeCard) {

      activeCard.classList.remove('active');
      activeCard.style.opacity = '0';
      activeCard.style.pointerEvents =
        'none';

      activeCard = null;
    }

    if (activeAnchor) {

      activeAnchor.style.opacity = '0';
      activeAnchor.style.pointerEvents =
        'none';

      activeAnchor = null;
    }

    if (svgPath) {
      svgPath.setAttribute('d', '');
    }
  }

  function showCallout(index) {

    const entry =
      calloutElements[index];

    if (!entry) return;

    const {
      part,
      anchor,
      card
    } = entry;

    hideCallouts();

    anchor.style.left = '50%';
    anchor.style.top = '50%';

    card.style.left =
      window.innerWidth <= 640
        ? '50%'
        : '68%';

    card.style.top =
      window.innerWidth <= 640
        ? 'auto'
        : '22%';

    card.style.bottom =
      window.innerWidth <= 640
        ? '-10px'
        : 'auto';

    card.classList.add('active');

    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';

    anchor.style.opacity = '1';
    anchor.style.pointerEvents = 'auto';

    activeCard = card;
    activeAnchor = anchor;

    highlightPart(part);

    updateStatus(
      `INSPECTION: ${part.tag}`,
      `PART ${index + 1} OF ${vehicleParts.length}`
    );
  }

  // ─── PRESENTATION ENGINE ────────────────────────────────────
  let lastTime = 0;

  function presentationLoop(timestamp) {

    if (!lastTime) {
      lastTime = timestamp;
      stateStart = timestamp;
    }

    if (!carModel) {
      renderer.render(
        scene,
        camera
      );

      requestAnimationFrame(
        presentationLoop
      );

      return;
    }

    const elapsed =
      timestamp - stateStart;

    // ── ENTRANCE ─────────────────────────────────────────────
    if (currentState === STATES.ENTRANCE) {

      const progress =
        Math.min(
          elapsed / ENTRANCE_DURATION,
          1
        );

      entrance(progress);

      if (progress >= 1) {

        currentState = STATES.ROTATION;
        stateStart = timestamp;

        carRoot.rotation.y = 0;
      }
    }

    // ── REAL 360 ROTATION ───────────────────────────────────
    else if (
      currentState === STATES.ROTATION
    ) {

      const progress =
        Math.min(
          elapsed / ROTATION_DURATION,
          1
        );

      rotateCar(progress);

      if (progress >= 1) {

        currentState = STATES.PAUSE;
        stateStart = timestamp;

        carRoot.rotation.y = 0;

        if (lightOverlay) {
          lightOverlay.style.opacity = '0';
        }
      }
    }

    // ── BEAUTY SHOT PAUSE ────────────────────────────────────
    else if (
      currentState === STATES.PAUSE
    ) {

      const progress =
        Math.min(
          elapsed / PAUSE_DURATION,
          1
        );

      const breathe =
        Math.sin(progress * Math.PI) *
        0.025;

      carRoot.position.y =
        0.12 + breathe;

      camera.position.set(
        0,
        1.45,
        7.5
      );

      currentCameraTarget.set(
        0,
        0.9,
        0
      );

      lookAtCar();

      updateStatus(
        'INTELLIGENT VEHICLE INSPECTION',
        `SYSTEM ACTIVE: ${
          Math.max(
            0,
            Math.ceil(
              (PAUSE_DURATION - elapsed) /
              1000
            )
          )
        }S`
      );

      if (progress >= 1) {

        currentState = STATES.INSPECTION;
        stateStart = timestamp;

        currentPartIndex = 0;
        partStart = timestamp;

        startCameraPosition.copy(
          camera.position
        );

        startCameraLook.copy(
          currentCameraTarget
        );

        showCallout(0);
      }
    }

    // ── REAL MODEL COMPONENT INSPECTION ──────────────────────
    else if (
      currentState === STATES.INSPECTION
    ) {

      const part =
        vehicleParts[currentPartIndex];

      const partElapsed =
        timestamp - partStart;

      if (part) {

        const transition =
          Math.min(
            partElapsed / 900,
            1
          );

        inspectPart(
          part,
          transition
        );

        if (
          !isPausedByUser &&
          partElapsed >= PART_DURATION
        ) {

          currentPartIndex++;

          if (
            currentPartIndex >=
            vehicleParts.length
          ) {

            currentState =
              STATES.RESET;

            stateStart = timestamp;

          } else {

            partStart = timestamp;

            startCameraPosition.copy(
              camera.position
            );

            startCameraLook.copy(
              currentCameraTarget
            );

            showCallout(
              currentPartIndex
            );
          }
        }
      }
    }

    // ── RESET ────────────────────────────────────────────────
    else if (
      currentState === STATES.RESET
    ) {

      hideCallouts();
      clearHighlight();

      updateStatus(
        'INSPECTION CYCLE COMPLETE',
        'STANDBY'
      );

      const progress =
        Math.min(
          elapsed / 2200,
          1
        );

      const ease =
        1 - Math.pow(
          1 - progress,
          3
        );

      camera.position.lerp(
        new THREE.Vector3(
          0,
          1.45,
          7.5
        ),
        ease
      );

      currentCameraTarget.lerp(
        new THREE.Vector3(
          0,
          0.9,
          0
        ),
        ease
      );

      lookAtCar();

      if (progress >= 1) {

        currentState =
          STATES.ROTATION;

        stateStart = timestamp;

        carRoot.rotation.y = 0;
      }
    }

    renderer.render(
      scene,
      camera
    );

    requestAnimationFrame(
      presentationLoop
    );
  }

  // ─── START PRESENTATION ─────────────────────────────────────
  function startPresentation() {

    currentState =
      STATES.ENTRANCE;

    stateStart =
      performance.now();

    requestAnimationFrame(
      presentationLoop
    );
  }

  // ─── RESIZE ─────────────────────────────────────────────────
  function resizeRenderer() {

    const rect =
      container.getBoundingClientRect();

    const width =
      Math.max(rect.width, 1);

    const height =
      Math.max(rect.height, 1);

    renderer.setSize(
      width,
      height,
      false
    );

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();
  }

  window.addEventListener(
    'resize',
    resizeRenderer
  );

  resizeRenderer();

  // ─── MOUSE INTERACTION ──────────────────────────────────────
  let pointerDown = false;
  let pointerX = 0;

  canvas.addEventListener(
    'pointerdown',
    event => {

      pointerDown = true;
      pointerX = event.clientX;

      canvas.setPointerCapture?.(
        event.pointerId
      );
    }
  );

  canvas.addEventListener(
    'pointermove',
    event => {

      if (!pointerDown || !carModel)
        return;

      const delta =
        event.clientX - pointerX;

      pointerX = event.clientX;

      carRoot.rotation.y +=
        delta * 0.008;
    }
  );

  canvas.addEventListener(
    'pointerup',
    () => {
      pointerDown = false;
    }
  );

  canvas.addEventListener(
    'pointercancel',
    () => {
      pointerDown = false;
    }
  );

  // ─── REDUCED MOTION ──────────────────────────────────────────
  if (
    window.matchMedia &&
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  ) {

    // Keep the actual model visible,
    // but reduce automatic motion.
    console.log(
      'Reduced motion preference detected.'
    );
  }

  // ─── INITIAL STATUS ─────────────────────────────────────────
  updateStatus(
    'LOADING REAL BMW M5 3D MODEL',
    'INITIALIZING'
  );

  console.log(
    '%cBMW M5 REAL 3D SHOWROOM ENGINE',
    'color:#00d4ff;font-size:14px;font-weight:700;'
  );

})();