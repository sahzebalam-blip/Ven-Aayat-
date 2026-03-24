import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

const heroCanvas = document.getElementById("heroOrbCanvas");

if (heroCanvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    heroCanvas.clientWidth / heroCanvas.clientHeight,
    0.1,
    100
  );
  camera.position.z = 5.6;

  const renderer = new THREE.WebGLRenderer({
    canvas: heroCanvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);

  const root = new THREE.Group();
  scene.add(root);

  const coreGroup = new THREE.Group();
  root.add(coreGroup);

  const ambientLight = new THREE.AmbientLight(0x7aa8ff, 0.72);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x8ad7ff, 2.6, 20);
  keyLight.position.set(3.2, 2.4, 4.8);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x1d4fff, 1.8, 20);
  fillLight.position.set(-3.2, -2.1, 3.4);
  scene.add(fillLight);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.12, 5),
    new THREE.MeshStandardMaterial({
      color: 0x2f6dff,
      emissive: 0x1e5eff,
      emissiveIntensity: 1.15,
      metalness: 0.48,
      roughness: 0.28,
      flatShading: false
    })
  );
  coreGroup.add(core);

  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.92, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x7cc6ff,
      transparent: true,
      opacity: 0.16
    })
  );
  coreGroup.add(innerGlow);

  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.52, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x4ea1ff,
      transparent: true,
      opacity: 0.07
    })
  );
  coreGroup.add(outerGlow);

  const fieldCount = 850;
  const fieldPositions = new Float32Array(fieldCount * 3);

  for (let i = 0; i < fieldCount; i++) {
    const i3 = i * 3;
    fieldPositions[i3] = (Math.random() - 0.5) * 16;
    fieldPositions[i3 + 1] = (Math.random() - 0.5) * 16;
    fieldPositions[i3 + 2] = (Math.random() - 0.5) * 9;
  }

  const fieldGeometry = new THREE.BufferGeometry();
  fieldGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(fieldPositions, 3)
  );

  const fieldMaterial = new THREE.PointsMaterial({
    color: 0x8ad7ff,
    size: 0.022,
    transparent: true,
    opacity: 0.72
  });

  const fieldParticles = new THREE.Points(fieldGeometry, fieldMaterial);
  scene.add(fieldParticles);

  const nodeCount = 36;
  const nodePositions = [];
  const nodeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x8fd7ff,
    transparent: true,
    opacity: 0.9
  });

  const linePoints = [];

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 2.3 + Math.random() * 1.1;
    const y = (Math.random() - 0.5) * 2.8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.7;

    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    node.position.set(x, y, z);
    node.userData.base = node.position.clone();
    node.userData.speed = 0.4 + Math.random() * 0.8;
    node.userData.offset = Math.random() * Math.PI * 2;
    root.add(node);
    nodePositions.push(node);

    if (i < nodeCount - 1 && i % 2 === 0) {
      linePoints.push(new THREE.Vector3(x, y, z));
      const nextAngle = ((i + 1) / nodeCount) * Math.PI * 2;
      const nextRadius = 2.2 + Math.random() * 1.2;
      const nx = Math.cos(nextAngle) * nextRadius;
      const ny = (Math.random() - 0.5) * 2.8;
      const nz = Math.sin(nextAngle) * nextRadius * 0.7;
      linePoints.push(new THREE.Vector3(nx, ny, nz));
    }
  }

  const linesGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x4ea1ff,
    transparent: true,
    opacity: 0.16
  });
  const signalLines = new THREE.LineSegments(linesGeometry, linesMaterial);
  root.add(signalLines);

  const streakCount = 24;
  const streaks = [];

  for (let i = 0; i < streakCount; i++) {
    const streak = new THREE.Mesh(
      new THREE.PlaneGeometry(0.02, 0.9),
      new THREE.MeshBasicMaterial({
        color: 0x7cc6ff,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide
      })
    );

    streak.position.set(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 4.2,
      (Math.random() - 0.5) * 2
    );

    streak.rotation.z = Math.random() * Math.PI;
    streak.userData.speed = 0.2 + Math.random() * 0.45;
    streak.userData.offset = Math.random() * Math.PI * 2;
    streaks.push(streak);
    root.add(streak);
  }

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.32;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.28;
  });

  const clock = new THREE.Clock();

  const animate = () => {
    const t = clock.getElapsedTime();

    core.rotation.y += 0.0028;
    core.rotation.x += 0.0009;
    core.rotation.z += 0.0012;

    innerGlow.scale.setScalar(1 + Math.sin(t * 2.2) * 0.05);
    outerGlow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.035);

    root.position.y = Math.sin(t * 1.15) * 0.08;
    root.rotation.y += (mouseX - root.rotation.y) * 0.02;
    root.rotation.x += (-mouseY - root.rotation.x) * 0.02;

    fieldParticles.rotation.y += 0.00055;
    fieldParticles.rotation.x += 0.00018;

    nodePositions.forEach((node, index) => {
      const base = node.userData.base;
      const speed = node.userData.speed;
      const offset = node.userData.offset;

      node.position.x = base.x + Math.sin(t * speed + offset) * 0.06;
      node.position.y = base.y + Math.cos(t * (speed * 0.9) + offset) * 0.08;
      node.position.z = base.z + Math.sin(t * (speed * 0.75) + offset) * 0.05;

      const pulse = 0.78 + (Math.sin(t * 2 + index * 0.35) + 1) * 0.12;
      node.scale.setScalar(pulse);
      node.material.opacity = 0.5 + (Math.sin(t * 2.4 + index) + 1) * 0.2;
    });

    streaks.forEach((streak, index) => {
      streak.material.opacity = 0.04 + (Math.sin(t * streak.userData.speed * 4 + streak.userData.offset + index) + 1) * 0.05;
      streak.position.y += Math.sin(t * streak.userData.speed + streak.userData.offset) * 0.0018;
    });

    signalLines.material.opacity = 0.11 + (Math.sin(t * 1.7) + 1) * 0.03;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = heroCanvas.clientWidth / heroCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}
