const canvas = document.getElementById("portalCanvas");

if (canvas && typeof THREE !== "undefined") {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const portalGroup = new THREE.Group();
  scene.add(portalGroup);

  // Core glow rings
  const ringMaterial1 = new THREE.MeshBasicMaterial({
    color: 0x7a5cff,
    transparent: true,
    opacity: 0.95
  });

  const ringMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x00d9ff,
    transparent: true,
    opacity: 0.78
  });

  const ringMaterial3 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28
  });

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.08, 32, 180),
    ringMaterial1
  );

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.045, 24, 180),
    ringMaterial2
  );
  ring2.rotation.x = Math.PI / 2.2;

  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.035, 24, 160),
    ringMaterial3
  );
  ring3.rotation.y = Math.PI / 2.25;

  // Inner wire core
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.65, 1),
    new THREE.MeshBasicMaterial({
      color: 0x9f8cff,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    })
  );

  // Outer halo ring
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(3.15, 0.02, 16, 240),
    new THREE.MeshBasicMaterial({
      color: 0x6bcfff,
      transparent: true,
      opacity: 0.28
    })
  );
  halo.rotation.x = Math.PI / 2.8;

  portalGroup.add(ring1, ring2, ring3, core, halo);

  // Particle field
  const particleCount = 700;
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 3 + Math.random() * 5.5;
    const angle = Math.random() * Math.PI * 2;
    const spread = (Math.random() - 0.5) * 3.5;

    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = Math.sin(angle) * (radius * 0.45) + spread;
    positions[i3 + 2] = (Math.random() - 0.5) * 6;

    scales[i] = Math.random();
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xa896ff,
    size: 0.028,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  // Soft background stars
  const bgCount = 320;
  const bgPositions = new Float32Array(bgCount * 3);

  for (let i = 0; i < bgCount; i++) {
    const i3 = i * 3;
    bgPositions[i3] = (Math.random() - 0.5) * 30;
    bgPositions[i3 + 1] = (Math.random() - 0.5) * 18;
    bgPositions[i3 + 2] = -4 - Math.random() * 12;
  }

  const bgGeometry = new THREE.BufferGeometry();
  bgGeometry.setAttribute("position", new THREE.BufferAttribute(bgPositions, 3));

  const bgMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.012,
    transparent: true,
    opacity: 0.4
  });

  const bgStars = new THREE.Points(bgGeometry, bgMaterial);
  scene.add(bgStars);

  // Mouse interaction
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener("mousemove", (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 1.1;
    targetY = (event.clientY / window.innerHeight - 0.5) * 0.9;
  });

  // Scroll depth
  let scrollTarget = 0;
  let scrollCurrent = 0;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY || window.pageYOffset;
    scrollTarget = Math.min(scrollY * 0.0015, 1.2);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.035;
    currentY += (targetY - currentY) * 0.035;
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.04;

    portalGroup.rotation.y += 0.004;
    portalGroup.rotation.x += 0.0012;

    ring2.rotation.z += 0.007;
    ring3.rotation.x += 0.009;
    halo.rotation.z -= 0.0025;
    core.rotation.x += 0.004;
    core.rotation.y -= 0.005;

    const pulse = 1 + Math.sin(t * 1.5) * 0.045;
    portalGroup.scale.set(pulse, pulse, pulse);

    portalGroup.position.x = currentX;
    portalGroup.position.y = -currentY * 0.7;
    portalGroup.position.z = -scrollCurrent;

    particles.rotation.y += 0.0008;
    particles.rotation.z += 0.00015;
    particles.position.y = Math.sin(t * 0.6) * 0.08;

    bgStars.rotation.y += 0.00015;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  });
}
