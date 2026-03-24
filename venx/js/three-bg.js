import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

const canvas = document.getElementById("siteBgCanvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 7.5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // stronger glow blobs
  const glow1 = new THREE.Mesh(
    new THREE.SphereGeometry(3.8, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x4ea1ff,
      transparent: true,
      opacity: 0.18,
    })
  );
  glow1.position.set(-3.2, 1.4, -3.2);
  scene.add(glow1);

  const glow2 = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x1e5eff,
      transparent: true,
      opacity: 0.14,
    })
  );
  glow2.position.set(3.4, -1.5, -3.5);
  scene.add(glow2);

  const glow3 = new THREE.Mesh(
    new THREE.SphereGeometry(2.8, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x7cc6ff,
      transparent: true,
      opacity: 0.09,
    })
  );
  glow3.position.set(0.3, 2.3, -4.5);
  scene.add(glow3);

  // particles
  const count = 2200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 22;
    positions[i3 + 1] = (Math.random() - 0.5) * 14;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x8ad7ff,
    size: 0.03,
    transparent: true,
    opacity: 0.85,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // visible but still premium signal lines
  const linePoints = [];
  for (let i = 0; i < 60; i++) {
    linePoints.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        -2.5
      )
    );
    linePoints.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        -2.5
      )
    );
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x5daeff,
    transparent: true,
    opacity: 0.14,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.35;
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    glow1.position.y = 1.2 + Math.sin(t * 0.45) * 0.55;
    glow1.position.x = -3.2 + Math.cos(t * 0.35) * 0.25;

    glow2.position.y = -1.2 + Math.cos(t * 0.38) * 0.48;
    glow2.position.x = 3.4 + Math.sin(t * 0.28) * 0.28;

    glow3.position.y = 2.1 + Math.sin(t * 0.6) * 0.3;

    glow1.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
    glow2.scale.setScalar(1 + Math.cos(t * 1.3) * 0.045);
    glow3.scale.setScalar(1 + Math.sin(t * 1.8) * 0.04);

    particles.rotation.y += 0.001;
    particles.rotation.x += 0.00018;
    particles.position.x += (mouseX - particles.position.x) * 0.012;
    particles.position.y += (-mouseY - particles.position.y) * 0.012;

    lines.rotation.y += 0.00025;
    lines.rotation.x += 0.00005;
    lines.material.opacity = 0.1 + (Math.sin(t * 1.3) + 1) * 0.03;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}
