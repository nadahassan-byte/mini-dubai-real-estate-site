(function () {
  "use strict";

  const grid = document.getElementById("listings-grid");
  const emptyState = document.getElementById("empty-state");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  let activeFilter = "all";
  let activeQuery = "";

  const aed = (n) =>
    new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);

  function priceLabel(item) {
    const suffix = item.status === "For Rent" ? ' <small>/ yr</small>' : "";
    return `AED ${aed(item.price)}${suffix}`;
  }

  function bedsLabel(beds) {
    return beds === 0 ? "Studio" : `${beds} bed${beds > 1 ? "s" : ""}`;
  }

  function matches(item) {
    const byType = activeFilter === "all" || item.type === activeFilter;
    const q = activeQuery.trim().toLowerCase();
    const byQuery =
      !q ||
      item.area.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q);
    return byType && byQuery;
  }

  function cardTemplate(item, i) {
    const featured = i === 0;
    return `
      <article class="card${featured ? " card--featured" : ""}" data-id="${item.id}" tabindex="0" role="button" aria-label="View ${item.title}" data-reveal data-reveal-delay="${i % 3}">
        <div class="card-media">
          <span class="badge">${item.status}</span>
          <img src="${item.img}" alt="${item.title}" loading="lazy" />
          <span class="card-view">View property</span>
        </div>
        <div class="card-body">
          ${featured ? '<p class="card-feature">Featured residence</p>' : ""}
          <p class="card-area">${item.area}</p>
          <h3 class="card-title">${item.title}</h3>
          <div class="card-price">${priceLabel(item)}</div>
          <div class="card-specs">
            <span>${bedsLabel(item.beds)}</span>
            <span>${item.baths} bath${item.baths > 1 ? "s" : ""}</span>
            <span>${aed(item.size)} sqft</span>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const visible = LISTINGS.filter(matches);
    grid.innerHTML = visible.map(cardTemplate).join("");
    emptyState.hidden = visible.length !== 0;
    observeReveals();
  }

  // Filter chips
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.filter;
      render();
    });
  });

  // Search
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    activeQuery = searchInput.value;
    render();
    document.getElementById("listings").scrollIntoView({ behavior: "smooth" });
  });
  searchInput.addEventListener("input", () => {
    activeQuery = searchInput.value;
    render();
  });

  // Neighbourhood tiles -> filter by area
  document.querySelectorAll(".hood").forEach((h) => {
    h.addEventListener("click", () => {
      activeQuery = h.dataset.hood;
      searchInput.value = h.dataset.hood;
      activeFilter = "all";
      chips.forEach((c) => c.classList.toggle("is-active", c.dataset.filter === "all"));
      render();
    });
  });

  // Modal
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  function openModal(item) {
    modalBody.innerHTML = `
      <div class="modal-media"><img src="${item.img}" alt="${item.title}" /></div>
      <div class="modal-content">
        <span class="badge">${item.status}</span>
        <p class="modal-area">${item.area}, Dubai</p>
        <h3>${item.title}</h3>
        <div class="modal-price">${priceLabel(item)}</div>
        <div class="modal-specs">
          <div><strong>${bedsLabel(item.beds)}</strong><span>Bedrooms</span></div>
          <div><strong>${item.baths}</strong><span>Bathrooms</span></div>
          <div><strong>${aed(item.size)}</strong><span>sqft</span></div>
          <div><strong>${item.type}</strong><span>Property type</span></div>
        </div>
        <p>${item.blurb}</p>
        <a href="#contact" class="btn" data-close>Enquire about this property</a>
      </div>`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const item = LISTINGS.find((l) => l.id === Number(card.dataset.id));
    if (item) openModal(item);
  });
  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    const item = LISTINGS.find((l) => l.id === Number(card.dataset.id));
    if (item) openModal(item);
  });
  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  // Mobile nav
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });

  // Contact form (front-end only demo)
  const contactForm = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk) {
      formNote.textContent = "Please enter your name and a valid email.";
      formNote.className = "form-note err";
      return;
    }
    formNote.textContent = `Thanks ${name.split(" ")[0]} — an advisor will be in touch shortly.`;
    formNote.className = "form-note ok";
    contactForm.reset();
  });

  // Year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Sticky header: solid after scrolling past the hero fold
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 80);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal — fade/slide elements in as they enter the viewport
  let revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
  }
  function observeReveals() {
    const els = document.querySelectorAll("[data-reveal]:not(.in)");
    if (!revealObserver) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    els.forEach((el) => revealObserver.observe(el));
  }

  render();
  observeReveals();
})();
