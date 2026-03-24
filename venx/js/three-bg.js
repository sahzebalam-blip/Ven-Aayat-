import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

const canvas = document.getElementById("siteBgCanvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);

  /* --------------------------
     Energy glow field
  -------------------------- */
  const glowGroup = new THREE.Group();
  scene.add(glowGroup);

  function createGlow(size, color, opacity, x, y, z) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    glowGroup.add(mesh);
    return mesh;
  }

  const glowA = createGlow(4.8, 0x256dff, 0.16, -7.0, 3.5, -8);
  const glowB = createGlow(3.7, 0x00cfff, 0.13, 7.5, -1.8, -7);
  const glowC = createGlow(5.6, 0x1f44ff, 0.10, 0, -5.5, -10);
  const glowD = createGlow(2.8, 0x86d8ff, 0.10, 3.8, 5.3, -6);

  /* --------------------------
     Nodes
  -------------------------- */
  const NODE_COUNT = window.innerWidth < 768 ? 90 : 160;
  const positions = new Float32Array(NODE_COUNT * 3);
  const basePositions = [];
  const velocities = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 30;
    const y = (Math.random() - 0.5) * 18;
    const z = (Math.random() - 0.5) * 8;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    basePositions.push({ x, y, z });
    velocities.push({
      x: (Math.random() - 0.5) * 0.004,
      y: (Math.random() - 0.5) * 0.004,
      z: (Math.random() - 0.5) * 0.0015,
    });
  }

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const nodeMaterial = new THREE.PointsMaterial({
    color: 0x9ad7ff,
    size: window.innerWidth < 768 ? 0.07 : 0.085,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(nodeGeometry, nodeMaterial);
  scene.add(points);

  /* --------------------------
     Lines
  -------------------------- */
  const maxConnections = 700;
  const linePositions = new Float32Array(maxConnections * 6);

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setDrawRange(0, 0);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x62b2ff,
    transparent: true,
    opacity: 0.20,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  /* --------------------------
     Mouse parallax
  -------------------------- */
  const mouse = { x: 0, y: 0 };

  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* --------------------------
     Resize
  -------------------------- */
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    nodeMaterial.size = window.innerWidth < 768 ? 0.07 : 0.085;
  }

  window.addEventListener("resize", handleResize);

  /* --------------------------
     Animation
  -------------------------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    const pos = nodeGeometry.attributes.position.array;

    glowA.position.x = -7 + Math.sin(time * 0.24) * 1.2;
    glowA.position.y = 3.5 + Math.cos(time * 0.22) * 0.7;

    glowB.position.x = 7.5 + Math.cos(time * 0.20) * 1.1;
    glowB.position.y = -1.8 + Math.sin(time * 0.28) * 0.7;

    glowC.position.x = Math.sin(time * 0.16) * 1.5;
    glowC.position.y = -5.5 + Math.cos(time * 0.18) * 0.65;

    glowD.position.x = 3.8 + Math.sin(time * 0.33) * 0.85;
    glowD.position.y = 5.3 + Math.cos(time * 0.31) * 0.5;

    glowGroup.rotation.z = Math.sin(time * 0.05) * 0.06;

    for (let i = 0; i < NODE_COUNT; i++) {
      const idx = i * 3;
      const base = basePositions[i];
      const vel = velocities[i];

      pos[idx] += vel.x;
      pos[idx + 1] += vel.y;
      pos[idx + 2] += vel.z;

      if (pos[idx] > base.x + 2.5 || pos[idx] < base.x - 2.5) vel.x *= -1;
      if (pos[idx + 1] > base.y + 2.0 || pos[idx + 1] < base.y - 2.0) vel.y *= -1;
      if (pos[idx + 2] > base.z + 1.0 || pos[idx + 2] < base.z - 1.0) vel.z *= -1;

      pos[idx + 1] += Math.sin(time * 0.6 + i * 0.35) * 0.0012;
    }

    nodeGeometry.attributes.position.needsUpdate = true;

    let connectionCount = 0;
    let lineIndex = 0;
    const maxDistance = window.innerWidth < 768 ? 2.5 : 2.9;

    for (let a = 0; a < NODE_COUNT; a++) {
      for (let b = a + 1; b < NODE_COUNT; b++) {
        if (connectionCount >= maxConnections) break;

        const ax = pos[a * 3];
        const ay = pos[a * 3 + 1];
        const az = pos[a * 3 + 2];

        const bx = pos[b * 3];
        const by = pos[b * 3 + 1];
        const bz = pos[b * 3 + 2];

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < maxDistance) {
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

    camera.position.x += (mouse.x * 1.15 - camera.position.x) * 0.025;
    camera.position.y += (mouse.y * 0.85 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);

    points.rotation.y = Math.sin(time * 0.12) * 0.05;
    points.rotation.x = Math.cos(time * 0.10) * 0.025;

    lineSegments.rotation.y = points.rotation.y;
    lineSegments.rotation.x = points.rotation.x;

    renderer.render(scene, camera);
  }

  animate();
}
