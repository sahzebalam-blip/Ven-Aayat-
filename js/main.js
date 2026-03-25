document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const isVenxPage = body.classList.contains("venx-page");

  // ---------- Shared: Mobile Nav ----------
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      const expanded = navLinks.classList.contains("open");
      navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((item) => {
      item.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      const clickedInsideNav = navLinks.contains(e.target);
      const clickedToggle = navToggle.contains(e.target);

      if (!clickedInsideNav && !clickedToggle) {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------- Shared: Footer Year ----------
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- Venaayat / Main Site ----------
  if (!isVenxPage) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  // ---------- VENX Only: Reveal on Scroll ----------
  const revealElements = document.querySelectorAll(
    ".section, .card, .hero-content, .cta, .token-block, .whitepaper-card"
  );

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => {
      el.classList.add("reveal-hidden");
      revealObserver.observe(el);
    });
  }

  // ---------- VENX Only: Stagger Cards ----------
  document.querySelectorAll(".cards").forEach((group) => {
    const cards = group.querySelectorAll(".card");
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.1}s`;
    });
  });

  // ---------- VENX Only: Button Micro Motion ----------
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      btn.style.setProperty("--x", `${x}px`);
      btn.style.setProperty("--y", `${y}px`);
    });
  });

  // ---------- VENX Only: Smooth Scroll ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ---------- VENX Only: Card Tilt ----------
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 20;
      const y = (e.clientY - rect.top - rect.height / 2) / 20;

      card.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0) rotateY(0)";
    });
  });
});
