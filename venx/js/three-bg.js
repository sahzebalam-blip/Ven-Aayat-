import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

const canvas = document.getElementById("siteBgCanvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 22;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);

  const isMobile = window.innerWidth < 768;

  /* =========================
     CONFIG
  ========================= */
  const NODE_COUNT = isMobile ? 85 : 125;
  const MAX_CONNECTIONS = isMobile ? 220 : 360;
  const MAX_DISTANCE = isMobile ? 2.45 : 2.85;

  const nodesData = [];
  const positions = new Float32Array(NODE_COUNT * 3);

  /* =========================
     NODES
  ========================= */
  for (let i = 0; i < NODE_COUNT; i++) {
    const spreadX = 30;
    const spreadY = 18;
    const spreadZ = 10;

    const x = (Math.random() - 0.5) * spreadX;
    const y = (Math.random() - 0.5) * spreadY;
    const z = (Math.random() - 0.5) * spreadZ;

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
      vx: (Math.random() - 0.5) * 0.010,
      vy: (Math.random() - 0.5) * 0.010,
      vz: (Math.random() - 0.5) * 0.003,
      phase: Math.random() * Math.PI * 2,
      amp: 0.18 + Math.random() * 0.35,
    });
  }

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const nodeMaterial = new THREE.PointsMaterial({
    color: 0x9fd6ff,
    size: isMobile ? 0.07 : 0.08,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(nodeGeometry, nodeMaterial);
  scene.add(points);

  /* =========================
     LINES
  ========================= */
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6);

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
  );
  lineGeometry.setDrawRange(0, 0);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x5aaeff,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  /* =========================
     SOFT DEPTH PARTICLES
     (no circles, just faint dust)
  ========================= */
  const dustCount = isMobile ? 70 : 120;
  const dustPositions = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 42;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 22 - 8;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3)
  );

  const dustMaterial = new THREE.PointsMaterial({
    color: 0x6fbfff,
    size: isMobile ? 0.03 : 0.04,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  /* =========================
     MOUSE PARALLAX
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
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

    // Node movement
    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodesData[i];
      const idx = i * 3;

      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;

      // soft bounds around base positions
      if (n.x > n.baseX + 2.8 || n.x < n.baseX - 2.8) n.vx *= -1;
      if (n.y > n.baseY + 2.2 || n.y < n.baseY - 2.2) n.vy *= -1;
      if (n.z > n.baseZ + 1.2 || n.z < n.baseZ - 1.2) n.vz *= -1;

      // wave-like energy motion
      const waveX = Math.sin(time * 0.22 + n.phase) * 0.06 * n.amp;
      const waveY = Math.cos(time * 0.48 + n.phase * 1.3) * 0.11 * n.amp;
      const waveZ = Math.sin(time * 0.30 + n.phase * 0.8) * 0.04 * n.amp;

      posArray[idx] = n.x + waveX;
      posArray[idx + 1] = n.y + waveY;
      posArray[idx + 2] = n.z + waveZ;
    }

    nodeGeometry.attributes.position.needsUpdate = true;

    // Build smart connection lines
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

    // scene drift
    points.rotation.y = Math.sin(time * 0.10) * 0.06;
    points.rotation.x = Math.cos(time * 0.08) * 0.025;

    lineSegments.rotation.y = points.rotation.y;
    lineSegments.rotation.x = points.rotation.x;

    dust.rotation.y = -time * 0.01;
    dust.rotation.x = Math.sin(time * 0.05) * 0.02;

    // mouse depth
    camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.022;
    camera.position.y += (pointer.y * 0.9 - camera.position.y) * 0.022;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
}
