const canvas = document.getElementById("portalCanvas");

if (canvas && typeof THREE !== "undefined") {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
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

  // Main group
  const portalGroup = new THREE.Group();
  scene.add(portalGroup);

  // ===== Portal layers =====

  // Main portal frame
  const frame1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.045, 32, 240),
    new THREE.MeshBasicMaterial({
      color: 0x7a5cff,
      transparent: true,
      opacity: 0.9
    })
  );

  // Secondary frame
  const frame2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.02, 24, 240),
    new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.45
    })
  );

  // Thin inner ring
  const frame3 = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.018, 24, 200),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16
    })
  );

  // Tilt for portal feel
  frame2.rotation.x = Math.PI / 18;
  frame3.rotation.y = Math.PI / 9;

  // Inner core wire
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 1),
    new THREE.MeshBasicMaterial({
      color: 0x9c84ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    })
  );

  // Soft halo
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.012, 16, 260),
    new THREE.MeshBasicMaterial({
      color: 0x72dfff,
      transparent: true,
      opacity: 0.16
    })
  );
  halo.rotation.x = Math.PI / 2.8;

  portalGroup.add(frame1, frame2, frame3, core, halo);

  // ===== Tunnel particles =====
  const tunnelCount = 900;
  const tunnelPositions = new Float32Array(tunnelCount * 3);

  for (let i = 0; i < tunnelCount; i++) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.8 + Math.random() * 2.5;
    const depth = -Math.random() * 26;

    tunnelPositions[i3] = Math.cos(angle) * radius;
    tunnelPositions[i3 + 1] = Math.sin(angle) * radius;
    tunnelPositions[i3 + 2] = depth;
  }

  const tunnelGeometry = new THREE.BufferGeometry();
  tunnelGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(tunnelPositions, 3)
  );

  const tunnelMaterial = new THREE.PointsMaterial({
    color: 0xa893ff,
    size: 0.03,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });

  const tunnelParticles = new THREE.Points(tunnelGeometry, tunnelMaterial);
  portalGroup.add(tunnelParticles);

  // ===== Full-page subtle stars =====
  const starCount = 380;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    starPositions[i3] = (Math.random() - 0.5) * 34;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 22;
    starPositions[i3 + 2] = -2 - Math.random() * 18;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.012,
    transparent: true,
    opacity: 0.3
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ===== Mouse / scroll interaction =====
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener("mousemove", (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.7;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  let scrollTarget = 0;
  let scrollCurrent = 0;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY || window.pageYOffset;
    scrollTarget = Math.min(scrollY * 0.0012, 1.1);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.03;
    currentY += (targetY - currentY) * 0.03;
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.04;

    // Portal motion
    portalGroup.rotation.z += 0.0008;
    frame1.rotation.z += 0.0022;
    frame2.rotation.z -= 0.0016;
    frame3.rotation.z += 0.0012;
    halo.rotation.z -= 0.0009;
    core.rotation.x += 0.0024;
    core.rotation.y += 0.003;

    // Subtle breathing
    const pulse = 1 + Math.sin(t * 1.4) * 0.035;
    portalGroup.scale.set(pulse, pulse, pulse);

    // Mouse / scroll parallax
    portalGroup.position.x = currentX;
    portalGroup.position.y = -currentY * 0.7;
    portalGroup.position.z = -scrollCurrent;

    // Tunnel movement
    const positions = tunnelGeometry.attributes.position.array;
    for (let i = 0; i < tunnelCount; i++) {
      const i3 = i * 3;
      positions[i3 + 2] += 0.065;

      if (positions[i3 + 2] > 1.5) {
        positions[i3 + 2] = -26;
      }
    }
    tunnelGeometry.attributes.position.needsUpdate = true;

    // Atmospheric movement
    tunnelParticles.rotation.z += 0.0009;
    stars.rotation.y += 0.00012;
    stars.rotation.x += 0.00005;

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
