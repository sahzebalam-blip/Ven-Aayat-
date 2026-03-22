document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      const expanded = navLinks.classList.contains("open");
      navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    const navItems = navLinks.querySelectorAll("a");
    navItems.forEach((item) => {
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

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el) => {
    el.classList.add("visible");
    el.classList.add("show");
  });
});
if (!document.body.classList.contains("venx-page")) {
  // Not a VENX page, do nothing
} else {
  // -------- Reveal on Scroll --------
  const revealElements = document.querySelectorAll(
    ".section, .card, .hero-content, .cta"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealElements.forEach((el) => {
    el.classList.add("reveal-hidden");
    revealObserver.observe(el);
  });

  // -------- Stagger Cards --------
  const cardGroups = document.querySelectorAll(".cards");

  cardGroups.forEach((group) => {
    const cards = group.querySelectorAll(".card");

    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.1}s`;
    });
  });

  // -------- Button Micro Motion --------
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      btn.style.setProperty("--x", `${x}px`);
      btn.style.setProperty("--y", `${y}px`);
    });
  });

  // -------- Smooth Scroll --------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));

      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
}
