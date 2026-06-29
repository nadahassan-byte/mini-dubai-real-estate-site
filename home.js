/* Home page: featured carousel, mortgage calculator, contact form. */
(function () {
  "use strict";
  const P = window.PRIME;

  // ---------- Immersive hero slideshow ----------
  const heroSlides = document.getElementById("hero-slides");
  if (heroSlides) {
    const feat = P.LISTINGS.filter((l) => l.featured).slice(0, 5);
    heroSlides.innerHTML = feat
      .map((it, i) => `<div class="hero-slide${i === 0 ? " active" : ""}" style="--img:url('${it.img}')"></div>`)
      .join("");
    const slides = Array.from(heroSlides.children);
    const eyebrow = document.getElementById("hero-eyebrow");
    const title = document.getElementById("hero-title");
    const price = document.getElementById("hero-price");
    const center = document.getElementById("hero-center");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let idx = 0, timer = null;

    function setSlide(n) {
      idx = (n + feat.length) % feat.length;
      slides.forEach((s, i) => s.classList.toggle("active", i === idx));
      const it = feat[idx];
      eyebrow.textContent = `${it.area} · ${it.status}`;
      title.textContent = it.title;
      price.innerHTML = P.priceLabel(it);
      center.classList.remove("is-in"); void center.offsetWidth; center.classList.add("is-in");
    }
    function play() { if (reduce) return; stop(); timer = setInterval(() => setSlide(idx + 1), 6500); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    if (prev) prev.addEventListener("click", () => { setSlide(idx - 1); play(); });
    if (next) next.addEventListener("click", () => { setSlide(idx + 1); play(); });
    const openCurrent = () => { const it = feat[idx]; if (it) P.openModal(it); };
    center.addEventListener("click", openCurrent);
    center.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCurrent(); } });

    setSlide(0);
    play();
  }

  // ---------- Featured sales & rentals (Domus Nova style) ----------
  function dnCard(it) {
    const meta = `${P.bedsLabel(it.beds)} · ${it.type}`;
    return `
      <article class="dn-card" data-id="${it.id}" tabindex="0" role="button" aria-label="View ${it.title}">
        <div class="dn-media">
          ${it.tag ? `<span class="dn-tag">${it.tag}</span>` : ""}
          ${P.heartHTML(it.id)}
          <img src="${it.img}" alt="${it.title}" loading="lazy" />
        </div>
        <div class="dn-body">
          <div class="dn-line"><span class="dn-title">${it.title}</span><span class="dn-price">${P.priceLabel(it)}</span></div>
          <div class="dn-line dn-sub"><span>${it.area}</span><span>${meta}</span></div>
        </div>
      </article>`;
  }
  function setupRow(kind, status) {
    const grid = document.getElementById("grid-" + kind);
    const tabsEl = document.querySelector('[data-tabs="' + kind + '"]');
    if (!grid || !tabsEl) return;
    const items = P.LISTINGS.filter((l) => l.status === status);
    const areas = Array.from(new Set(items.map((i) => i.area))).slice(0, 4);
    const tabs = ["All"].concat(areas);
    let active = "All";
    tabsEl.innerHTML = tabs.map((t) => `<button class="dn-tab${t === "All" ? " is-active" : ""}" data-area="${t}" role="tab">${t}</button>`).join("");
    function render() {
      const vis = items.filter((i) => active === "All" || i.area === active).slice(0, 8);
      grid.innerHTML = vis.map(dnCard).join("");
      P.observeReveals();
    }
    tabsEl.addEventListener("click", (e) => {
      const b = e.target.closest(".dn-tab"); if (!b) return;
      active = b.dataset.area;
      tabsEl.querySelectorAll(".dn-tab").forEach((x) => x.classList.toggle("is-active", x === b));
      render();
    });
    render();
  }
  setupRow("sales", "For Sale");
  setupRow("rentals", "For Rent");

  // ---------- Mortgage calculator ----------
  const mc = document.getElementById("mc");
  if (mc) {
    const RES = { resident: 0.20, national: 0.15, nonresident: 0.25 };
    const els = {
      price: document.getElementById("mc-price"),
      down: document.getElementById("mc-down"),
      downPct: document.getElementById("mc-down-pct"),
      rate: document.getElementById("mc-rate"),
      term: document.getElementById("mc-term"),
      termVal: document.getElementById("mc-term-val"),
      loan: document.getElementById("mc-loan"),
      monthly: document.getElementById("mc-monthly"),
    };
    const fmt = (n) => new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(Math.round(n));
    const num = (el) => parseFloat(String(el.value).replace(/[^0-9.]/g, "")) || 0;
    let residency = "resident";

    function compute() {
      const price = num(els.price);
      let down = num(els.down);
      if (down > price) down = price;
      const loan = Math.max(0, price - down);
      const r = num(els.rate) / 100 / 12;
      const n = num(els.term) * 12;
      let monthly = 0;
      if (n > 0) monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      els.loan.textContent = fmt(loan) + " AED";
      els.monthly.textContent = fmt(monthly) + " AED";
      els.downPct.textContent = price > 0 ? Math.round((down / price) * 100) + "%" : "0%";
      if (els.termVal) els.termVal.textContent = num(els.term) + " Years";
    }
    function setResidency(res) {
      residency = res;
      document.querySelectorAll(".mc-tab").forEach((t) => {
        const on = t.dataset.res === res;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      const price = num(els.price);
      els.down.value = fmt(price * RES[res]);
      compute();
    }

    // pretty-format the two money inputs on blur
    [els.price, els.down].forEach((el) => {
      el.addEventListener("input", compute);
      el.addEventListener("blur", () => { el.value = fmt(num(el)); compute(); });
    });
    els.rate.addEventListener("input", compute);
    els.term.addEventListener("input", compute);
    document.querySelectorAll(".mc-tab").forEach((t) => t.addEventListener("click", () => setResidency(t.dataset.res)));

    // init
    els.price.value = fmt(num(els.price));
    els.down.value = fmt(num(els.down));
    compute();
  }

  // ---------- Contact form ----------
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const note = document.getElementById("form-note");
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("cf-name").value.trim();
      const email = document.getElementById("cf-email").value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk) {
        note.textContent = "Please enter your name and a valid email.";
        note.className = "form-note err";
        return;
      }
      note.textContent = `Thanks ${name.split(" ")[0]} — an advisor will be in touch shortly.`;
      note.className = "form-note ok";
      contactForm.reset();
    });
  }
})();
