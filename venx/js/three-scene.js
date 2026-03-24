import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

// ---------- HERO ORB ----------
const heroCanvas = document.getElementById("heroOrbCanvas");

if (heroCanvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, heroCanvas.clientWidth / heroCanvas.clientHeight, 0.1, 100);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
  renderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4ea1ff,
    emissive: 0x1e5eff,
    emissiveIntensity: 0.5,
    metalness: 0.6,
    roughness: 0.2,
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  const light = new THREE.PointLight(0x7cc6ff, 2);
  light.position.set(3, 3, 3);
  scene.add(light);

  const animate = () => {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.005;
    sphere.rotation.x += 0.002;
    renderer.render(scene, camera);
  };

  animate();
}

// ---------- TOKENOMICS ----------
const tokenCanvas = document.getElementById("tokenomicsCanvas");

if (tokenCanvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, tokenCanvas.clientWidth / tokenCanvas.clientHeight, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas: tokenCanvas, alpha: true });
  renderer.setSize(tokenCanvas.clientWidth, tokenCanvas.clientHeight);

  const light = new THREE.PointLight(0x4ea1ff, 2);
  light.position.set(5, 5, 5);
  scene.add(light);

  const group = new THREE.Group();
  scene.add(group);

  const blocks = [];
  const count = 7;

  for (let i = 0; i < count; i++) {
    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4ea1ff,
      emissive: 0x1e5eff,
      emissiveIntensity: 0.3,
    });

    const cube = new THREE.Mesh(geo, mat);

    const angle = (i / count) * Math.PI * 2;
    cube.position.x = Math.cos(angle) * 2;
    cube.position.y = Math.sin(angle) * 2;

    group.add(cube);
    blocks.push(cube);
  }

  const animate = () => {
    requestAnimationFrame(animate);

    group.rotation.z += 0.003;

    blocks.forEach((b) => {
      b.rotation.x += 0.01;
      b.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
  };

  animate();
}
