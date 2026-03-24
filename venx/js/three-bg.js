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
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const glowMaterial1 = new THREE.MeshBasicMaterial({
    color: 0x4ea1ff,
    transparent: true,
    opacity: 0.11,
  });

  const glowMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x1e5eff,
    transparent: true,
    opacity: 0.08,
  });

  const glow1 = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 64, 64),
    glowMaterial1
  );
  glow1.position.set(-2.8, 1.3, -2.8);
  scene.add(glow1);

  const glow2 = new THREE.Mesh(
    new THREE.SphereGeometry(3.8, 64, 64),
    glowMaterial2
  );
  glow2.position.set(3.2, -1.4, -3.2);
  scene.add(glow2);

  const glow3 = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x7cc6ff,
      transparent: true,
      opacity: 0.05,
    })
  );
  glow3.position.set(0.4, 2.2, -4);
  scene.add(glow3);

  const count = 1400;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 18;
    positions[i3 + 1] = (Math.random() - 0.5) * 12;
    positions[i3 + 2] = (Math.random() - 0.5) * 8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x8ad7ff,
    size: 0.024,
    transparent: true,
    opacity: 0.65,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const linePoints = [];
  for (let i = 0; i < 40; i++) {
    linePoints.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        -2.5
      )
    );
    linePoints.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        -2.5
      )
    );
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x4ea1ff,
    transparent: true,
    opacity: 0.08,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.25;
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    glow1.position.y = Math.sin(t * 0.45) * 0.45 + 1.1;
    glow1.position.x = -2.8 + Math.cos(t * 0.35) * 0.18;

    glow2.position.y = Math.cos(t * 0.38) * 0.4 - 1.1;
    glow2.position.x = 3.2 + Math.sin(t * 0.28) * 0.2;

    glow3.position.y = 2.1 + Math.sin(t * 0.55) * 0.22;

    glow1.scale.setScalar(1 + Math.sin(t * 1.4) * 0.03);
    glow2.scale.setScalar(1 + Math.cos(t * 1.25) * 0.025);
    glow3.scale.setScalar(1 + Math.sin(t * 1.6) * 0.02);

    particles.rotation.y += 0.00075;
    particles.rotation.x += 0.00012;

    particles.position.x += (mouseX - particles.position.x) * 0.01;
    particles.position.y += (-mouseY - particles.position.y) * 0.01;

    lines.rotation.y += 0.00018;
    lines.material.opacity = 0.05 + (Math.sin(t * 1.3) + 1) * 0.018;

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
