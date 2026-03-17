// Category filter functionality
document.addEventListener("DOMContentLoaded", function () {
  const categoryBtns = document.querySelectorAll(".category-btn");
  const menuCards = document.querySelectorAll(".menu-card");

  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter");

      // Update active button
      categoryBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Filter cards (in a real implementation, you'd add data attributes)
      // For now, show all cards
      menuCards.forEach((card) => {
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      });
    });
  });

  // Smooth scroll for navbar links
  document.querySelectorAll(".navbar-menu a").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
});
