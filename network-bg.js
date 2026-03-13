(function setupNetworkCanvas() {
  const canvas = document.getElementById("networkCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  let pointer = { x: null, y: null };

  function makePoints() {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const count = mobile ? 34 : 58;

    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.8 + 1.3,
    }));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.8);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makePoints();
  }

  function glow(x, y, r, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(215,248,255,${a})`);
    g.addColorStop(0.42, `rgba(72,215,255,${a * 0.75})`);
    g.addColorStop(1, "rgba(72,215,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const maxDist = window.matchMedia("(max-width: 768px)").matches ? 128 : 180;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          const alpha = 1 - dist / maxDist;
          ctx.strokeStyle = `rgba(84,176,255,${alpha * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      if (pointer.x !== null) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 170) {
          ctx.strokeStyle = `rgba(72,215,255,${(1 - dist / 170) * 0.18})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      glow(p.x, p.y, p.r * 8, 0.13);
      ctx.fillStyle = "rgba(232,250,255,0.95)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("mousemove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    pointer.x = null;
    pointer.y = null;
  });

  window.addEventListener("resize", resize);
  resize();
  draw();
})();