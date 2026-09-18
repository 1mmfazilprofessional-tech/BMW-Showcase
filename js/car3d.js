/* BMW 3D SHOWCASE
   Real GLB Vehicle Viewer
   Three.js r128 + GLTFLoader
*/

'use strict';

(function () {
  const container = document.getElementById('bmw-3d-container');
  const canvas = document.getElementById('bmw-3d-canvas');
  const loading = document.getElementById('car-3d-loading');
  const loadingProgress = document.getElementById('car-3d-loading-progress');

  if (!container || !canvas) {
    console.error('BMW 3D container or canvas not found.');
    return;
  }

  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded.');
    return;
  }

  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('GLTFLoader is not loaded.');
    return;
  }

  /* -------------------------------------------------------
     BASIC SETUP
  ------------------------------------------------------- */

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  camera.position.set(4.5, 2.4, 6.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(
    container.clientWidth,
    container.clientHeight,
    false
  );

  renderer.outputEncoding = THREE.sRGBEncoding;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* -------------------------------------------------------
     LIGHTING
  ------------------------------------------------------- */

  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff,
    0x111111,
    2.2
  );

  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(
    0xffffff,
    3.5
  );

  keyLight.position.set(5, 8, 6);
  keyLight.castShadow = true;

  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(
    0x8bbcff,
    2.0
  );

  fillLight.position.set(-6, 3, 4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(
    0xffffff,
    2.5
  );

  rimLight.position.set(0, 5, -7);
  scene.add(rimLight);

  /* -------------------------------------------------------
     FLOOR
  ------------------------------------------------------- */

  const floorGeometry = new THREE.CircleGeometry(6, 64);

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x080808,
    metalness: 0.85,
    roughness: 0.35
  });

  const floor = new THREE.Mesh(
    floorGeometry,
    floorMaterial
  );

  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.65;
  floor.receiveShadow = true;

  scene.add(floor);

  /* -------------------------------------------------------
     TURNTABLE
  ------------------------------------------------------- */

  const platformGeometry = new THREE.CylinderGeometry(
    4.1,
    4.1,
    0.12,
    96
  );

  const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x151515,
    metalness: 0.95,
    roughness: 0.25
  });

  const platform = new THREE.Mesh(
    platformGeometry,
    platformMaterial
  );

  platform.position.y = -0.55;
  platform.receiveShadow = true;

  scene.add(platform);

  /* -------------------------------------------------------
     VEHICLE ROOT
  ------------------------------------------------------- */

  const carRoot = new THREE.Group();

  carRoot.position.set(
    0,
    -0.2,
    -7
  );

  scene.add(carRoot);

  let bmwModel = null;

  /* -------------------------------------------------------
     VEHICLE PARTS
  ------------------------------------------------------- */

  const vehicleParts = {
    body: [],
    wheels: [],
    headlights: [],
    grille: [],
    mirrors: [],
    windows: [],
    interior: [],
    engine: [],
    exhaust: [],
    spoiler: []
  };

  /* -------------------------------------------------------
     HIGHLIGHT MATERIAL
  ------------------------------------------------------- */

  function highlightMeshes(meshes) {
    meshes.forEach(function (mesh) {
      if (!mesh || !mesh.material) return;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach(function (material) {
        if (!material) return;

        material.emissive = new THREE.Color(0x087cff);
        material.emissiveIntensity = 1.2;
      });
    });
  }

  function restoreMeshes(meshes) {
    meshes.forEach(function (mesh) {
      if (!mesh || !mesh.material) return;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach(function (material) {
        if (!material) return;

        if (material.emissive) {
          material.emissive.set(0x000000);
        }

        material.emissiveIntensity = 0;
      });
    });
  }

  function clearAllHighlights() {
    Object.keys(vehicleParts).forEach(function (key) {
      restoreMeshes(vehicleParts[key]);
    });
  }

  /* -------------------------------------------------------
     FIND VEHICLE PARTS
  ------------------------------------------------------- */

  function classifyMesh(mesh) {
    const name = (
      mesh.name ||
      ''
    ).toLowerCase();

    if (
      name.includes('wheel') ||
      name.includes('tire') ||
      name.includes('tyre')
    ) {
      vehicleParts.wheels.push(mesh);
    }

    if (
      name.includes('headlight') ||
      name.includes('light')
    ) {
      vehicleParts.headlights.push(mesh);
    }

    if (
      name.includes('grille') ||
      name.includes('grill')
    ) {
      vehicleParts.grille.push(mesh);
    }

    if (
      name.includes('mirror')
    ) {
      vehicleParts.mirrors.push(mesh);
    }

    if (
      name.includes('window') ||
      name.includes('windshield') ||
      name.includes('glass')
    ) {
      vehicleParts.windows.push(mesh);
    }

    if (
      name.includes('seat') ||
      name.includes('dashboard') ||
      name.includes('interior') ||
      name.includes('cockpit')
    ) {
      vehicleParts.interior.push(mesh);
    }

    if (
      name.includes('engine') ||
      name.includes('motor')
    ) {
      vehicleParts.engine.push(mesh);
    }

    if (
      name.includes('exhaust') ||
      name.includes('muffler')
    ) {
      vehicleParts.exhaust.push(mesh);
    }

    if (
      name.includes('spoiler')
    ) {
      vehicleParts.spoiler.push(mesh);
    }

    if (
      name.includes('body') ||
      name.includes('hood') ||
      name.includes('trunk') ||
      name.includes('bumper') ||
      name.includes('door')
    ) {
      vehicleParts.body.push(mesh);
    }
  }

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const loader = new THREE.GLTFLoader();

  loader.load(
    'assets/models/bmw_m4_competition_m_package.glb',

    function (gltf) {
      bmwModel = gltf.scene;

      bmwModel.traverse(function (object) {
        if (!object.isMesh) return;

        object.castShadow = true;
        object.receiveShadow = true;

        classifyMesh(object);
      });

      /* -----------------------------------------------
         CENTER AND SCALE MODEL
      ----------------------------------------------- */

      const box = new THREE.Box3().setFromObject(
        bmwModel
      );

      const size = new THREE.Vector3();

      box.getSize(size);

      const center = new THREE.Vector3();

      box.getCenter(center);

      bmwModel.position.sub(center);

      const maxDimension = Math.max(
        size.x,
        size.y,
        size.z
      );

      const targetSize = 5.2;

      const scale =
        targetSize / maxDimension;

      bmwModel.scale.setScalar(scale);

      /* -----------------------------------------------
         ADD MODEL
      ----------------------------------------------- */

      carRoot.add(bmwModel);

      carRoot.rotation.y = Math.PI;

      if (loading) {
        loading.style.opacity = '0';

        setTimeout(function () {
          loading.style.display = 'none';
        }, 500);
      }

      if (loadingProgress) {
        loadingProgress.style.width = '100%';
      }

      console.log(
        'BMW GLB loaded successfully.'
      );

      console.log(
        'Vehicle parts:',
        vehicleParts
      );

      startShowroomPresentation();
    },

    function (xhr) {
      if (
        xhr &&
        xhr.total &&
        loadingProgress
      ) {
        const percent =
          (xhr.loaded / xhr.total) * 100;

        loadingProgress.style.width =
          Math.min(percent, 100) + '%';
      }
    },

    function (error) {
      console.error(
        'BMW GLB loading failed:',
        error
      );

      if (loading) {
        const label =
          loading.querySelector(
            '.car-3d-loading-label'
          );

        if (label) {
          label.textContent =
            'VEHICLE LOAD ERROR';
        }
      }
    }
  );

  /* -------------------------------------------------------
     CAMERA
  ------------------------------------------------------- */

  const cameraHome = {
    position: new THREE.Vector3(
      4.5,
      2.4,
      6.5
    ),

    target: new THREE.Vector3(
      0,
      0,
      0
    )
  };

  const cameraTarget = new THREE.Vector3(
    0,
    0,
    0
  );

  function updateCamera() {
    camera.lookAt(cameraTarget);
  }

  /* -------------------------------------------------------
     ENTRANCE ANIMATION
  ------------------------------------------------------- */

  let presentationStarted = false;

  function startShowroomPresentation() {
    if (presentationStarted) return;

    presentationStarted = true;

    const startPosition =
      new THREE.Vector3(
        0,
        -0.2,
        -7
      );

    const finalPosition =
      new THREE.Vector3(
        0,
        -0.2,
        0
      );

    carRoot.position.copy(
      startPosition
    );

    const startTime =
      performance.now();

    const duration = 4500;

    function entranceAnimation(now) {
      const elapsed =
        now - startTime;

      let progress =
        Math.min(
          elapsed / duration,
          1
        );

      /* Smooth ease-out */

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      carRoot.position.lerpVectors(
        startPosition,
        finalPosition,
        eased
      );

      if (progress < 1) {
        requestAnimationFrame(
          entranceAnimation
        );
      } else {
        carRoot.position.copy(
          finalPosition
        );

        beginPause();
      }
    }

    requestAnimationFrame(
      entranceAnimation
    );
  }

  /* -------------------------------------------------------
     PAUSE AFTER ARRIVAL
  ------------------------------------------------------- */

  function beginPause() {
    setTimeout(
      function () {
        beginRotation();
      },
      6000
    );
  }

  /* -------------------------------------------------------
     REAL 360 DEGREE ROTATION
  ------------------------------------------------------- */

  function beginRotation() {
    const startRotation =
      carRoot.rotation.y;

    const startTime =
      performance.now();

    const duration =
      7000;

    function rotateAnimation(now) {
      const elapsed =
        now - startTime;

      let progress =
        Math.min(
          elapsed / duration,
          1
        );

      carRoot.rotation.y =
        startRotation +
        progress *
          Math.PI *
          2;

      if (progress < 1) {
        requestAnimationFrame(
          rotateAnimation
        );
      } else {
        carRoot.rotation.y =
          startRotation +
          Math.PI * 2;

        startInspectionSequence();
      }
    }

    requestAnimationFrame(
      rotateAnimation
    );
  }

  /* -------------------------------------------------------
     INSPECTION SEQUENCE
  ------------------------------------------------------- */

  const inspectionSteps = [
    {
      name: 'HEADLIGHTS',
      meshes: function () {
        return vehicleParts.headlights;
      },
      camera: [3.2, 1.4, 4.8]
    },

    {
      name: 'WHEELS',
      meshes: function () {
        return vehicleParts.wheels;
      },
      camera: [4.5, 0.8, 3.8]
    },

    {
      name: 'ENGINE',
      meshes: function () {
        return vehicleParts.engine;
      },
      camera: [0, 2.2, 3.0]
    },

    {
      name: 'GRILLE',
      meshes: function () {
        return vehicleParts.grille;
      },
      camera: [0, 1.0, 4.8]
    },

    {
      name: 'EXHAUST',
      meshes: function () {
        return vehicleParts.exhaust;
      },
      camera: [-3.5, 0.8, -3.8]
    },

    {
      name: 'SPOILER',
      meshes: function () {
        return vehicleParts.spoiler;
      },
      camera: [-2.8, 1.5, -3.8]
    }
  ];

  let inspectionIndex = 0;

  function startInspectionSequence() {
    inspectionIndex = 0;

    inspectNextPart();
  }

  function inspectNextPart() {
    clearAllHighlights();

    if (
      inspectionIndex >=
      inspectionSteps.length
    ) {
      finishPresentation();
      return;
    }

    const step =
      inspectionSteps[
        inspectionIndex
      ];

    const meshes =
      step.meshes();

    if (meshes.length > 0) {
      highlightMeshes(meshes);
    }

    animateCameraTo(
      step.camera,
      1200
    );

    inspectionIndex++;

    setTimeout(
      inspectNextPart,
      2800
    );
  }

  /* -------------------------------------------------------
     CAMERA ANIMATION
  ------------------------------------------------------- */

  function animateCameraTo(
    positionArray,
    duration
  ) {
    const start =
      camera.position.clone();

    const target =
      new THREE.Vector3(
        positionArray[0],
        positionArray[1],
        positionArray[2]
      );

    const startTime =
      performance.now();

    function moveCamera(now) {
      const elapsed =
        now - startTime;

      const progress =
        Math.min(
          elapsed / duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      camera.position.lerpVectors(
        start,
        target,
        eased
      );

      updateCamera();

      if (progress < 1) {
        requestAnimationFrame(
          moveCamera
        );
      }
    }

    requestAnimationFrame(
      moveCamera
    );
  }

  /* -------------------------------------------------------
     PRESENTATION FINISHED
  ------------------------------------------------------- */

  function finishPresentation() {
    clearAllHighlights();

    animateCameraTo(
      [
        cameraHome.position.x,
        cameraHome.position.y,
        cameraHome.position.z
      ],
      1800
    );

    setTimeout(function () {
      enableManualControl();
    }, 1900);
  }

  /* -------------------------------------------------------
     MOUSE / POINTER CONTROL
  ------------------------------------------------------- */

  let manualControlEnabled = false;

  let pointerDown = false;
  let previousPointerX = 0;

  function enableManualControl() {
    manualControlEnabled = true;
  }

  canvas.addEventListener(
    'pointerdown',
    function (event) {
      if (!manualControlEnabled) return;

      pointerDown = true;

      previousPointerX =
        event.clientX;

      canvas.setPointerCapture(
        event.pointerId
      );
    }
  );

  canvas.addEventListener(
    'pointermove',
    function (event) {
      if (
        !manualControlEnabled ||
        !pointerDown ||
        !bmwModel
      ) {
        return;
      }

      const difference =
        event.clientX -
        previousPointerX;

      previousPointerX =
        event.clientX;

      carRoot.rotation.y +=
        difference * 0.008;
    }
  );

  canvas.addEventListener(
    'pointerup',
    function (event) {
      pointerDown = false;

      try {
        canvas.releasePointerCapture(
          event.pointerId
        );
      } catch (e) {}
    }
  );

  canvas.addEventListener(
    'pointerleave',
    function () {
      pointerDown = false;
    }
  );

  /* -------------------------------------------------------
     RESIZE
  ------------------------------------------------------- */

  function resize() {
    const width =
      container.clientWidth;

    const height =
      container.clientHeight;

    if (!width || !height) return;

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
      width,
      height,
      false
    );
  }

  window.addEventListener(
    'resize',
    resize
  );

  resize();

  /* -------------------------------------------------------
     RENDER LOOP
  ------------------------------------------------------- */

  function animate() {
    requestAnimationFrame(
      animate
    );

    updateCamera();

    renderer.render(
      scene,
      camera
    );
  }

  animate();

  console.log(
    'BMW Real 3D Showcase initialized.'
  );
})();
