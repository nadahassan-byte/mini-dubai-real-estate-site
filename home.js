/* Home page: featured carousel, mortgage calculator, contact form. */
(function () {
  "use strict";
  const P = window.PRIME;

  // ---------- Featured carousel ----------
  const track = document.getElementById("ex-track");
  if (track) {
    const featured = P.LISTINGS.filter((l) => l.featured).slice(0, 8);
    track.innerHTML = featured.map(exCard).join("");
    P.observeReveals();
    const prev = document.querySelector("[data-ex-prev]");
    const next = document.querySelector("[data-ex-next]");
    const step = () => Math.min(track.clientWidth * 0.85, 760);
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  }
  function exCard(it) {
    return `
      <article class="ex-card" data-id="${it.id}" tabindex="0" role="button" aria-label="View ${it.title}">
        <div class="ex-media">
          <img src="${it.img}" alt="${it.title}" loading="lazy" />
          ${P.heartHTML(it.id)}
          <div class="ex-overlay">
            <p class="ex-loc">${it.area}</p>
            <p class="ex-price">${P.priceLabel(it)}</p>
          </div>
        </div>
      </article>`;
  }

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
