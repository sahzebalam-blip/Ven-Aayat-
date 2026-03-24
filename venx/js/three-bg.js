import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

const canvas = document.getElementById("siteBgCanvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Group
  const group = new THREE.Group();
  scene.add(group);

  // Stronger ambient glow blobs
  const makeGlow = (size, color, opacity, x, y, z) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 64, 64),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
      })
    );
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  };

  const glow1 = makeGlow(4.6, 0x4ea1ff, 0.22, -3.8, 1.6, -4.5);
  const glow2 = makeGlow(5.0, 0x1e5eff, 0.18, 3.8, -1.8, -4.8);
  const glow3 = makeGlow(3.2, 0x7cc6ff, 0.12, 0.4, 2.4, -5.5);

  // Dense particles
  const count = 3200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 26;
    positions[i3 + 1] = (Math.random() - 0.5) * 16;
    positions[i3 + 2] = (Math.random() - 0.5) * 12;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x8ad7ff,
    size: 0.038,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);

  // Visible signal lines
  const linePoints = [];
  for (let i = 0; i < 90; i++) {
    linePoints.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 14,
        -3
      )
    );
    linePoints.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 14,
        -3
      )
    );
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x5daeff,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lines);

  // Mouse parallax
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.9;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    glow1.position.y = 1.4 + Math.sin(t * 0.55) * 0.7;
    glow1.position.x = -3.8 + Math.cos(t * 0.35) * 0.35;

    glow2.position.y = -1.6 + Math.cos(t * 0.48) * 0.65;
    glow2.position.x = 3.8 + Math.sin(t * 0.32) * 0.35;

    glow3.position.y = 2.3 + Math.sin(t * 0.75) * 0.42;

    glow1.scale.setScalar(1 + Math.sin(t * 1.6) * 0.07);
    glow2.scale.setScalar(1 + Math.cos(t * 1.35) * 0.06);
    glow3.scale.setScalar(1 + Math.sin(t * 1.9) * 0.05);

    group.rotation.y += (mouseX - group.rotation.y) * 0.01;
    group.rotation.x += (-mouseY - group.rotation.x) * 0.01;

    particles.rotation.y += 0.0016;
    particles.rotation.x += 0.00025;

    lines.rotation.y += 0.00045;
    lines.rotation.x += 0.00008;
    lines.material.opacity = 0.14 + (Math.sin(t * 1.6) + 1) * 0.04;

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
