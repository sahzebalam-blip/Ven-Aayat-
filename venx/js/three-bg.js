import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

const canvas = document.getElementById("siteBgCanvas");

if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 🌫️ Soft glow layers
  const glow1 = new THREE.Mesh(
    new THREE.SphereGeometry(2.8, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x4ea1ff,
      transparent: true,
      opacity: 0.08,
    })
  );
  glow1.position.set(-2, 1.2, -2);
  scene.add(glow1);

  const glow2 = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x1e5eff,
      transparent: true,
      opacity: 0.06,
    })
  );
  glow2.position.set(2.5, -1, -2);
  scene.add(glow2);

  // ✨ Particles (very subtle)
  const count = 800;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 14;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x8ad7ff,
    size: 0.02,
    transparent: true,
    opacity: 0.5,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    glow1.position.y = Math.sin(t * 0.5) * 0.5 + 1;
    glow2.position.y = Math.cos(t * 0.4) * 0.5 - 1;

    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0001;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
