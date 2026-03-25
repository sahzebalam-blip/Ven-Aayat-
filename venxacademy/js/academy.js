import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

class AcademyScene {
  constructor({ canvas, variant = "hero" }) {
    this.canvas = canvas;
    this.variant = variant;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
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

    this.lines = [];
    this.meshes = [];
    this.points = null;

    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.buildScene();
    this.resize();
    window.addEventListener("resize", this.resize.bind(this));
    this.animate();
  }

  buildScene() {
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xd7e6f6, 0.8);
    directional.position.set(3, 4, 5);
    this.scene.add(directional);

    if (this.variant === "hero") {
      this.buildHeroVisual();
    } else {
      this.buildProgramsVisual();
    }
  }

  buildHeroVisual() {
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x8cafcf,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });

    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.4 + i * 0.42, 0.012, 10, 120),
        ringMaterial.clone()
      );
      ring.rotation.x = 0.7 + i * 0.25;
      ring.rotation.y = 0.5 + i * 0.35;
      ring.position.set(0.4, -0.05, -0.2 + i * 0.1);
      this.group.add(ring);
      this.meshes.push(ring);
    }

    const nodeGeometry = new THREE.BufferGeometry();
    const count = 160;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x7fa3c6,
      size: 0.032,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });

    this.points = new THREE.Points(nodeGeometry, nodeMaterial);
    this.scene.add(this.points);

    this.createLines(12, 9.2, 5.4, 0xbfd3e7, 0.16);
  }

  buildProgramsVisual() {
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0xdce8f4,
      transparent: true,
      opacity: 0.22,
    });

    for (let i = 0; i < 5; i += 1) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 0.72),
        panelMaterial.clone()
      );

      panel.position.x = -1.8 + i * 0.9;
      panel.position.y = Math.sin(i * 0.9) * 0.32;
      panel.position.z = -0.6 + (i % 2) * 0.2;
      panel.rotation.z = (Math.random() - 0.5) * 0.12;
      panel.rotation.x = -0.08;

      this.group.add(panel);
      this.meshes.push(panel);
    }

    const nodeGeometry = new THREE.BufferGeometry();
    const count = 110;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }

    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x97b3cf,
      size: 0.028,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    });

    this.points = new THREE.Points(nodeGeometry, nodeMaterial);
    this.scene.add(this.points);

    this.createLines(8, 8, 4.2, 0xd0ddeb, 0.14);
  }

  createLines(count, spreadX, spreadY, color, opacity) {
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const drift = (Math.random() - 0.5) * 1.1;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, y + 1.2, -1),
        new THREE.Vector3(x + drift * 0.35, y + 0.2, -0.3),
        new THREE.Vector3(x + drift, y - 1.1, 0.2),
      ]);

      const points = curve.getPoints(28);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      });

      const line = new THREE.Line(geometry, material);
      line.userData.offset = Math.random() * Math.PI * 2;
      line.userData.speed = 0.14 + Math.random() * 0.12;

      this.scene.add(line);
      this.lines.push(line);
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || 600;
    const height = parent.clientHeight || 420;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const t = this.clock.getElapsedTime();
    const motion = this.prefersReducedMotion ? 0.2 : 1;

    this.group.rotation.y = Math.sin(t * 0.18) * 0.07 * motion;
    this.group.rotation.x = Math.cos(t * 0.14) * 0.025 * motion;
    this.group.position.y = Math.sin(t * 0.42) * 0.08 * motion;

    if (this.points) {
      this.points.rotation.y += 0.0007 * motion;
      this.points.rotation.x = Math.sin(t * 0.12) * 0.02 * motion;
    }

    this.meshes.forEach((mesh, index) => {
      mesh.rotation.z += 0.0007 * (index % 2 === 0 ? 1 : -1) * motion;
      if (mesh.material && "opacity" in mesh.material) {
        if (this.variant === "hero") {
          mesh.material.opacity = 0.17 + Math.sin(t * 0.8 + index) * 0.025;
        } else {
          mesh.material.opacity = 0.19 + Math.sin(t * 0.75 + index) * 0.02;
        }
      }
    });

    this.lines.forEach((line, index) => {
      line.position.y = Math.sin(t * line.userData.speed + line.userData.offset) * 0.09 * motion;
      line.position.x += Math.sin(t * 0.08 + index) * 0.0005 * motion;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

function initAcademyVisuals() {
  const heroCanvas = document.getElementById("academyHeroCanvas");
  const programsCanvas = document.getElementById("academyProgramsCanvas");

  if (heroCanvas) {
    new AcademyScene({ canvas: heroCanvas, variant: "hero" });
  }

  if (programsCanvas) {
    new AcademyScene({ canvas: programsCanvas, variant: "programs" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAcademyVisuals();

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      nav.classList.toggle("mobile-open");
    });
  }
});
