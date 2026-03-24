// NAV TOGGLE
const navToggle = document.querySelector(".nav-toggle");
const body = document.body;

if (navToggle) {
  navToggle.addEventListener("click", () => {
    body.classList.toggle("nav-open");
  });
}

// REVEAL ON SCROLL
const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.85;

  revealElements.forEach((el) => {
    const top = el.getBoundingClientRect().top;

    if (top < trigger) {
      el.classList.add("in-view");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// TOKENOMICS SIDE PANEL INTERACTION
const items = document.querySelectorAll(".tokenomics-item");

const title = document.getElementById("tokenomicsTitle");
const percent = document.getElementById("tokenomicsPercent");
const desc = document.getElementById("tokenomicsDescription");

items.forEach((btn) => {
  btn.addEventListener("click", () => {
    items.forEach((i) => i.classList.remove("active"));
    btn.classList.add("active");

    if (title) title.textContent = btn.dataset.name;
    if (percent) percent.textContent = btn.dataset.percent;
    if (desc) desc.textContent = btn.dataset.description;
  });
});
