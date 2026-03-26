import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

class AcademyScene {
  constructor({ canvas, variant = "home" }) {
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

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.setClearColor(0x000000, 0);

    this.clock = new THREE.Clock();
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.lines = [];
    this.nodes = null;
    this.rings = [];
    this.panels = [];

    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this.isMobile = window.innerWidth < 768;

    this.build();
    this.resize();

    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth < 768;
      this.resize();
    });

    this.animate();
  }

  build() {
    const ambient = new THREE.AmbientLight(0xffffff, 1.05);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xd9e9f7, 0.75);
    directional.position.set(3, 4, 5);
    this.scene.add(directional);

    if (this.variant === "home") {
      this.buildHomeScene();
    } else {
      this.buildProgramsScene();
    }
  }

  buildHomeScene() {
    this.createNodeField({
      count: this.isMobile ? 110 : 180,
      spreadX: 13,
      spreadY: 8,
      spreadZ: 4,
      color: 0x88a9c8,
      size: this.isMobile ? 0.022 : 0.028,
      opacity: 0.68,
    });

    this.createFlowLines({
      count: this.isMobile ? 10 : 18,
      spreadX: 13,
      spreadY: 8,
      color: 0xc2d5e8,
      opacity: 0.14,
    });

    this.createRings({
      count: 3,
      color: 0x9db8d2,
      opacity: 0.18,
      x: 2.1,
      y: 0.1,
    });

    this.createSoftGlow({
      color: 0xe8f2fb,
      opacity: 0.22,
      scale: [4.6, 4.6, 1],
      position: [2.2, 0.2, -1.2],
    });
  }

  buildProgramsScene() {
    this.createNodeField({
      count: this.isMobile ? 80 : 130,
      spreadX: 11,
      spreadY: 6,
      spreadZ: 3,
      color: 0x9bb6cf,
      size: this.isMobile ? 0.02 : 0.025,
      opacity: 0.52,
    });

    this.createFlowLines({
      count: this.isMobile ? 7 : 11,
      spreadX: 11,
      spreadY: 6,
      color: 0xd3dfeb,
      opacity: 0.11,
    });

    this.createPanels({
      count: this.isMobile ? 4 : 6,
      color: 0xdde9f4,
      opacity: 0.16,
    });

    this.createSoftGlow({
      color: 0xf1f6fb,
      opacity: 0.18,
      scale: [3.8, 3.8, 1],
      position: [1.8, 0.1, -1.2],
    });
  }

  createNodeField({
    count,
    spreadX,
    spreadY,
    spreadZ,
    color,
    size,
    opacity,
  }) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity,
      depthWrite: false,
    });

    this.nodes = new THREE.Points(geometry, material);
    this.scene.add(this.nodes);
  }

  createFlowLines({ count, spreadX, spreadY, color, opacity }) {
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const drift = (Math.random() - 0.5) * 1.4;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, y + 1.4, -0.8),
        new THREE.Vector3(x + drift * 0.35, y + 0.2, -0.2),
        new THREE.Vector3(x + drift, y - 1.4, 0.3),
      ]);

      const points = curve.getPoints(34);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      });

      const line = new THREE.Line(geometry, material);
      line.userData.offset = Math.random() * Math.PI * 2;
      line.userData.speed = 0.1 + Math.random() * 0.12;
      line.userData.baseX = x;

      this.scene.add(line);
      this.lines.push(line);
    }
  }

  createRings({ count, color, opacity, x, y }) {
    for (let i = 0; i < count; i += 1) {
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        wireframe: true,
      });

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.5 + i * 0.42, 0.012, 10, 120),
        material
      );

      ring.position.set(x, y, -0.4 + i * 0.12);
      ring.rotation.x = 0.7 + i * 0.22;
      ring.rotation.y = 0.45 + i * 0.35;

      this.group.add(ring);
      this.rings.push(ring);
    }
  }

  createPanels({ count, color, opacity }) {
    for (let i = 0; i < count; i += 1) {
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
      });

      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 0.7),
        material
      );

      panel.position.x = -1.8 + i * 0.78;
      panel.position.y = Math.sin(i * 0.9) * 0.34;
      panel.position.z = -0.7 + (i % 2) * 0.15;
      panel.rotation.z = (Math.random() - 0.5) * 0.14;
      panel.rotation.x = -0.08;

      this.group.add(panel);
      this.panels.push(panel);
    }
  }

  createSoftGlow({ color, opacity, scale, position }) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });

    const glow = new THREE.Mesh(geometry, material);
    glow.scale.set(scale[0], scale[1], scale[2]);
    glow.position.set(position[0], position[1], position[2]);
    this.group.add(glow);
  }

  resize() {
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || window.innerWidth;
    const height = parent.clientHeight || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const t = this.clock.getElapsedTime();
    const motion = this.prefersReducedMotion ? 0.18 : 1;

    this.group.rotation.y = Math.sin(t * 0.12) * 0.05 * motion;
    this.group.rotation.x = Math.cos(t * 0.09) * 0.015 * motion;
    this.group.position.y = Math.sin(t * 0.32) * 0.08 * motion;

    if (this.nodes) {
      this.nodes.rotation.y += 0.00055 * motion;
      this.nodes.rotation.x = Math.sin(t * 0.08) * 0.012 * motion;
    }

    this.lines.forEach((line, index) => {
      line.position.y = Math.sin(t * line.userData.speed + line.userData.offset) * 0.08 * motion;
      line.position.x = Math.sin(t * 0.05 + index) * 0.02 * motion;
    });

    this.rings.forEach((ring, index) => {
      ring.rotation.z += (index % 2 === 0 ? 0.0011 : -0.0009) * motion;
      ring.material.opacity = 0.15 + Math.sin(t * 0.7 + index) * 0.025;
    });

    this.panels.forEach((panel, index) => {
      panel.position.y += Math.sin(t * 0.45 + index) * 0.0009 * motion;
      panel.rotation.z += (index % 2 === 0 ? 0.00045 : -0.00045) * motion;
      panel.material.opacity = 0.13 + Math.sin(t * 0.7 + index) * 0.02;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

function initAcademyVisuals() {
  const homeCanvas = document.getElementById("academyHeroCanvas");
  const programsCanvas = document.getElementById("academyProgramsCanvas");

  if (homeCanvas) {
    new AcademyScene({
      canvas: homeCanvas,
      variant: "home",
    });
  }

  if (programsCanvas) {
    new AcademyScene({
      canvas: programsCanvas,
      variant: "programs",
    });
  }
}

function initMobileMenu() {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (!menuButton || !nav) return;

  menuButton.addEventListener("click", () => {
    nav.classList.toggle("mobile-open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("mobile-open");
    });
  });
}

function initRevealAnimations() {
  const items = document.querySelectorAll(
    ".academy-panel, .program-card, .pricing-panel, .faq-item, .feature-block, .cta-panel, .flow-step"
  );

  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
    }
  );

  items.forEach((item) => {
    item.classList.add("reveal-init");
    observer.observe(item);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAcademyVisuals();
  initMobileMenu();
  initRevealAnimations();
});
