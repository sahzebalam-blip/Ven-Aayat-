import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

const canvas = document.getElementById("siteBgCanvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 18.5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);

  const isMobile = window.innerWidth < 768;

  /* =========================
     CONFIG
  ========================= */
  const NODE_COUNT = isMobile ? 105 : 165;
  const MAX_CONNECTIONS = isMobile ? 300 : 560;
  const MAX_DISTANCE = isMobile ? 2.85 : 3.35;

  const nodesData = [];
  const positions = new Float32Array(NODE_COUNT * 3);

  /* =========================
     NODE FIELD
     center density + wide spread
  ========================= */
  for (let i = 0; i < NODE_COUNT; i++) {
    const clusterBias = Math.random();

    let x, y, z;

    if (clusterBias < 0.55) {
      // denser center field
      x = (Math.random() - 0.5) * 18;
      y = (Math.random() - 0.5) * 10;
      z = (Math.random() - 0.5) * 6;
    } else {
      // outer field
      x = (Math.random() - 0.5) * 34;
      y = (Math.random() - 0.5) * 20;
      z = (Math.random() - 0.5) * 10;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    nodesData.push({
      baseX: x,
      baseY: y,
      baseZ: z,
      x,
      y,
      z,
      vx: (Math.random() - 0.5) * 0.008,
      vy: (Math.random() - 0.5) * 0.008,
      vz: (Math.random() - 0.5) * 0.0025,
      phase: Math.random() * Math.PI * 2,
      amp: 0.24 + Math.random() * 0.4,
    });
  }

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const nodeMaterial = new THREE.PointsMaterial({
    color: 0xc2e8ff,
    size: isMobile ? 0.08 : 0.105,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(nodeGeometry, nodeMaterial);
  scene.add(points);

  /* =========================
     SMART CONNECTION LINES
  ========================= */
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6);

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
  );
  lineGeometry.setDrawRange(0, 0);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x72c8ff,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  /* =========================
     DEPTH DUST
  ========================= */
  const dustCount = isMobile ? 90 : 160;
  const dustPositions = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 46;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 28;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 24 - 8;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3)
  );

  const dustMaterial = new THREE.PointsMaterial({
    color: 0x8fd7ff,
    size: isMobile ? 0.04 : 0.055,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  /* =========================
     CENTER ENERGY MIST
     no circles, just faint core depth
  ========================= */
  const mistCount = isMobile ? 36 : 60;
  const mistPositions = new Float32Array(mistCount * 3);

  for (let i = 0; i < mistCount; i++) {
    mistPositions[i * 3] = (Math.random() - 0.5) * 14;
    mistPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
  }

  const mistGeometry = new THREE.BufferGeometry();
  mistGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(mistPositions, 3)
  );

  const mistMaterial = new THREE.PointsMaterial({
    color: 0x4fb7ff,
    size: isMobile ? 0.12 : 0.18,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mist = new THREE.Points(mistGeometry, mistMaterial);
  scene.add(mist);

  /* =========================
     POINTER PARALLAX
  ========================= */
  const pointer = { x: 0, y: 0 };

  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* =========================
     RESIZE
  ========================= */
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  }

  window.addEventListener("resize", onResize);

  /* =========================
     ANIMATION
  ========================= */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    const posArray = nodeGeometry.attributes.position.array;

    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodesData[i];
      const idx = i * 3;

      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;

      if (n.x > n.baseX + 2.8 || n.x < n.baseX - 2.8) n.vx *= -1;
      if (n.y > n.baseY + 2.1 || n.y < n.baseY - 2.1) n.vy *= -1;
      if (n.z > n.baseZ + 1.15 || n.z < n.baseZ - 1.15) n.vz *= -1;

      const waveX = Math.sin(time * 0.22 + n.phase) * 0.08 * n.amp;
      const waveY = Math.cos(time * 0.46 + n.phase * 1.3) * 0.16 * n.amp;
      const waveZ = Math.sin(time * 0.30 + n.phase * 0.8) * 0.05 * n.amp;

      posArray[idx] = n.x + waveX;
      posArray[idx + 1] = n.y + waveY;
      posArray[idx + 2] = n.z + waveZ;
    }

    nodeGeometry.attributes.position.needsUpdate = true;

    let lineIndex = 0;
    let connectionCount = 0;

    for (let a = 0; a < NODE_COUNT; a++) {
      const ax = posArray[a * 3];
      const ay = posArray[a * 3 + 1];
      const az = posArray[a * 3 + 2];

      for (let b = a + 1; b < NODE_COUNT; b++) {
        if (connectionCount >= MAX_CONNECTIONS) break;

        const bx = posArray[b * 3];
        const by = posArray[b * 3 + 1];
        const bz = posArray[b * 3 + 2];

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < MAX_DISTANCE) {
          linePositions[lineIndex++] = ax;
          linePositions[lineIndex++] = ay;
          linePositions[lineIndex++] = az;

          linePositions[lineIndex++] = bx;
          linePositions[lineIndex++] = by;
          linePositions[lineIndex++] = bz;

          connectionCount++;
        }
      }
    }

    lineGeometry.setDrawRange(0, connectionCount * 2);
    lineGeometry.attributes.position.needsUpdate = true;

    // layered motion
    points.rotation.y = Math.sin(time * 0.10) * 0.075;
    points.rotation.x = Math.cos(time * 0.08) * 0.03;

    lineSegments.rotation.y = points.rotation.y;
    lineSegments.rotation.x = points.rotation.x;

    dust.rotation.y = -time * 0.012;
    dust.rotation.x = Math.sin(time * 0.05) * 0.025;

    mist.rotation.y = time * 0.018;
    mist.rotation.x = Math.sin(time * 0.04) * 0.02;

    // subtle center breathing
    mistMaterial.opacity = 0.07 + Math.sin(time * 0.9) * 0.015;

    // camera depth
    camera.position.x += (pointer.x * 1.25 - camera.position.x) * 0.02;
    camera.position.y += (pointer.y * 0.85 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
}
