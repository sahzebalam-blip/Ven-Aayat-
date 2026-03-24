import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

const canvas = document.getElementById("tokenCoreCanvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.z = 10.5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x000000, 0);

  const isMobile = window.innerWidth < 768;
  const group = new THREE.Group();
  scene.add(group);

  // Core
  const coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x9edcff,
    transparent: true,
    opacity: 0.95,
    wireframe: true,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner glow
  const innerGeo = new THREE.SphereGeometry(0.58, 24, 24);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x4ea1ff,
    transparent: true,
    opacity: 0.16,
  });
  const innerGlow = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerGlow);

  // Segmented arcs
  function createArc(radius, startAngle, endAngle, color, y = 0, rotX = 0, rotY = 0) {
    const curve = new THREE.EllipseCurve(
      0, 0,
      radius, radius,
      startAngle, endAngle,
      false,
      0
    );

    const points = curve.getPoints(90).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
    });

    const line = new THREE.Line(geometry, material);
    line.position.y = y;
    line.rotation.x = rotX;
    line.rotation.y = rotY;
    group.add(line);
    return line;
  }

  const arc1 = createArc(2.1, 0.2, 2.5, 0x6ec6ff, 0, 1.0, 0.2);
  const arc2 = createArc(2.6, 2.8, 5.4, 0xd6b36a, 0, 0.4, 0.8);
  const arc3 = createArc(3.1, 0.8, 2.1, 0x41e0ff, 0, 1.25, 1.4);
  const arc4 = createArc(2.3, 3.5, 5.7, 0x8ad7ff, 0, 0.2, 0.1);

  // Node field
  const nodeCount = isMobile ? 55 : 90;
  const nodePositions = new Float32Array(nodeCount * 3);
  const nodeData = [];

  for (let i = 0; i < nodeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.4 + Math.random() * 2.2;
    const y = (Math.random() - 0.5) * 2.2;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    nodePositions[i * 3] = x;
    nodePositions[i * 3 + 1] = y;
    nodePositions[i * 3 + 2] = z;

    nodeData.push({
      angle,
      radius,
      y,
      speed: 0.002 + Math.random() * 0.003,
      drift: Math.random() * Math.PI * 2,
    });
  }

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));

  const nodeMaterial = new THREE.PointsMaterial({
    color: 0xbbe8ff,
    size: isMobile ? 0.05 : 0.065,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
  group.add(nodes);

  // Connection lines
  const maxConnections = isMobile ? 90 : 160;
  const linePositions = new Float32Array(maxConnections * 6);

  const linesGeometry = new THREE.BufferGeometry();
  linesGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  linesGeometry.setDrawRange(0, 0);

  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x66bfff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
  group.add(lines);

  // Dust
  const dustCount = isMobile ? 80 : 120;
  const dustPositions = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 14;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

  const dustMaterial = new THREE.PointsMaterial({
    color: 0x5abaff,
    size: isMobile ? 0.024 : 0.03,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  const pointer = { x: 0, y: 0 };

  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  }

  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    core.rotation.x = t * 0.18;
    core.rotation.y = t * 0.26;

    innerGlow.scale.setScalar(1 + Math.sin(t * 1.4) * 0.05);

    arc1.rotation.z = t * 0.14;
    arc2.rotation.z = -t * 0.11;
    arc3.rotation.z = t * 0.18;
    arc4.rotation.z = -t * 0.09;

    const pos = nodeGeometry.attributes.position.array;

    for (let i = 0; i < nodeCount; i++) {
      const n = nodeData[i];
      n.angle += n.speed;

      const waveY = Math.sin(t * 0.8 + n.drift) * 0.14;
      const x = Math.cos(n.angle) * n.radius;
      const z = Math.sin(n.angle) * n.radius;
      const y = n.y + waveY;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }

    nodeGeometry.attributes.position.needsUpdate = true;

    let lineIndex = 0;
    let connectionCount = 0;
    const maxDistance = 2.25;

    for (let a = 0; a < nodeCount; a++) {
      const ax = pos[a * 3];
      const ay = pos[a * 3 + 1];
      const az = pos[a * 3 + 2];

      for (let b = a + 1; b < nodeCount; b++) {
        if (connectionCount >= maxConnections) break;

        const bx = pos[b * 3];
        const by = pos[b * 3 + 1];
        const bz = pos[b * 3 + 2];

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
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

    linesGeometry.setDrawRange(0, connectionCount * 2);
    linesGeometry.attributes.position.needsUpdate = true;

    group.rotation.y += ((pointer.x * 0.28) - group.rotation.y) * 0.02;
    group.rotation.x += ((pointer.y * 0.16) - group.rotation.x) * 0.02;

    dust.rotation.y = -t * 0.01;
    dust.rotation.x = Math.sin(t * 0.06) * 0.03;

    renderer.render(scene, camera);
  }

  resize();
  animate();
}
