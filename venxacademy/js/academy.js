import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

/**
 * VENX Academy shared visual system
 * - Works on both overview and programs pages
 * - Detects available canvas automatically
 * - Keeps motion subtle, light, and academy-friendly
 */

class AcademyScene {
  constructor(options) {
    this.canvas = options.canvas;
    this.variant = options.variant || "hero";

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );
    this.camera.position.z = 8;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    this.clock = new THREE.Clock();

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.particles = null;
    this.lines = [];
    this.glowMeshes = [];
    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.init();
    this.onResize();
    window.addEventListener("resize", this.onResize.bind(this));
    this.animate();
  }

  init() {
    if (this.variant === "hero") {
      this.buildHeroScene();
    } else {
      this.buildProgramsScene();
    }
  }

  buildHeroScene() {
    // Soft ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xd9ebff, 0.65);
    directional.position.set(2, 3, 4);
    this.scene.add(directional);

    // Central subtle ring cluster
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x8bbcff,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
    });

    for (let i = 0; i < 3; i += 1) {
      const geometry = new THREE.TorusGeometry(1.4 + i * 0.45, 0.015, 12, 120);
      const ring = new THREE.Mesh(geometry, ringMaterial.clone());
      ring.rotation.x = 0.6 + i * 0.3;
      ring.rotation.y = 0.3 + i * 0.5;
      ring.position.x = 0.6;
      ring.position.y = -0.1 + i * 0.03;
      this.group.add(ring);
      this.glowMeshes.push(ring);
    }

    // Floating nodes
    const particleCount = 180;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x6ea8ff,
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // Knowledge-flow lines
    this.createFlowLines(12, {
      color: 0xb8d3ff,
      opacity: 0.16,
      spreadX: 10,
      spreadY: 6,
    });
  }

  buildProgramsScene() {
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xcfe2ff, 0.7);
    directional.position.set(3, 3, 4);
    this.scene.add(directional);

    // Structured floating panels
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0xdcecff,
      transparent: true,
      opacity: 0.16,
    });

    for (let i = 0; i < 5; i += 1) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.75),
        panelMaterial.clone()
      );

      panel.position.x = -1.8 + i * 0.9;
      panel.position.y = Math.sin(i * 0.8) * 0.4;
      panel.position.z = -1 + (i % 3) * 0.25;
      panel.rotation.z = (Math.random() - 0.5) * 0.15;
      panel.rotation.x = -0.08;

      this.group.add(panel);
      this.glowMeshes.push(panel);
    }

    // Soft node field
    const particleCount = 110;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8fb9ff,
      size: 0.03,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    this.createFlowLines(8, {
      color: 0xc9dcff,
      opacity: 0.12,
      spreadX: 8.5,
      spreadY: 4.5,
    });
  }

  createFlowLines(count, options) {
    for (let i = 0; i < count; i += 1) {
      const points = [];
      const x = (Math.random() - 0.5) * options.spreadX;
      const yStart = (Math.random() - 0.5) * options.spreadY;
      const drift = (Math.random() - 0.5) * 1.2;

      points.push(new THREE.Vector3(x, yStart + 1.4, -1));
      points.push(new THREE.Vector3(x + drift * 0.4, yStart + 0.5, -0.5));
      points.push(new THREE.Vector3(x + drift, yStart - 1.2, 0));

      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(30);

      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const material = new THREE.LineBasicMaterial({
        color: options.color,
        transparent: true,
        opacity: options.opacity,
      });

      const line = new THREE.Line(geometry, material);
      line.userData.baseY = yStart;
      line.userData.offset = Math.random() * Math.PI * 2;
      line.userData.speed = 0.12 + Math.random() * 0.12;

      this.scene.add(line);
      this.lines.push(line);
    }
  }

  onResize() {
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || window.innerWidth;
    const height = parent.clientHeight || 420;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const t = this.clock.getElapsedTime();
    const motionFactor = this.isReducedMotion ? 0.2 : 1;

    if (this.group) {
      this.group.rotation.y = Math.sin(t * 0.22) * 0.08 * motionFactor;
      this.group.rotation.x = Math.cos(t * 0.16) * 0.03 * motionFactor;
      this.group.position.y = Math.sin(t * 0.5) * 0.08 * motionFactor;
    }

    if (this.particles) {
      this.particles.rotation.y += 0.0007 * motionFactor;
      this.particles.rotation.x = Math.sin(t * 0.12) * 0.02 * motionFactor;
    }

    this.lines.forEach((line, index) => {
      line.position.y = Math.sin(t * line.userData.speed + line.userData.offset) * 0.12 * motionFactor;
      line.position.x += Math.sin(t * 0.08 + index) * 0.0007 * motionFactor;
    });

    this.glowMeshes.forEach((mesh, index) => {
      mesh.rotation.z += 0.0008 * (index % 2 === 0 ? 1 : -1) * motionFactor;
      if (mesh.material && "opacity" in mesh.material) {
        mesh.material.opacity = this.variant === "hero"
          ? 0.14 + Math.sin(t * 0.8 + index) * 0.03
          : 0.12 + Math.sin(t * 0.7 + index) * 0.025;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}

function initAcademyVisuals() {
  const heroCanvas =
    document.getElementById("academyHeroCanvas") ||
    document.getElementById("bgCanvas");

  const programsCanvas = document.getElementById("academyProgramsCanvas");

  if (heroCanvas) {
    new AcademyScene({
      canvas: heroCanvas,
      variant: "hero",
    });
  }

  if (programsCanvas) {
    new AcademyScene({
      canvas: programsCanvas,
      variant: "programs",
    });
  }
}

document.addEventListener("DOMContentLoaded", initAcademyVisuals);
