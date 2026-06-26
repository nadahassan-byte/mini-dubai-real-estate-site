/* Shared engine: helpers, favourites, compare, modal, drawer — used by every page. */
(function () {
  "use strict";

  const LISTINGS = window.LISTINGS || [];
  const byId = (id) => LISTINGS.find((l) => l.id === Number(id));

  const aed = (n) => new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
  function priceLabel(it) {
    const suffix = it.status === "For Rent" ? ' <small>/ yr</small>' : "";
    return `AED ${aed(it.price)}${suffix}`;
  }
  function bedsLabel(b) { return b === 0 ? "Studio" : `${b} bed${b > 1 ? "s" : ""}`; }

  // ---------- storage ----------
  const FAV_KEY = "prime_favs", CMP_KEY = "prime_compare", CMP_MAX = 4;
  const load = (k) => { try { return (JSON.parse(localStorage.getItem(k)) || []).map(Number); } catch (e) { return []; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let favs = load(FAV_KEY);
  let cmp = load(CMP_KEY);
  const isFav = (id) => favs.includes(Number(id));
  const isCmp = (id) => cmp.includes(Number(id));

  function toggleFav(id) {
    id = Number(id);
    favs = isFav(id) ? favs.filter((x) => x !== id) : favs.concat(id);
    store(FAV_KEY, favs);
    syncFavs();
    if (!isFav(id)) {} // no-op
  }
  function toggleCmp(id) {
    id = Number(id);
    if (isCmp(id)) { cmp = cmp.filter((x) => x !== id); }
    else {
      if (cmp.length >= CMP_MAX) { toast(`Compare up to ${CMP_MAX} properties at once`); return; }
      cmp = cmp.concat(id);
    }
    store(CMP_KEY, cmp);
    syncCmp();
  }

  // ---------- shared markup ----------
  const HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 1.7 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.3 0 4.6 3.4 3 6.7C19.5 16.4 12 21 12 21z"/></svg>';
  function heartHTML(id) {
    return `<button class="heart${isFav(id) ? " is-fav" : ""}" data-fav="${id}" aria-pressed="${isFav(id)}" aria-label="Save to favourites" title="Save to favourites">${HEART_SVG}</button>`;
  }
  function cmpToggleHTML(id) {
    return `<button class="cmp-toggle${isCmp(id) ? " is-on" : ""}" data-cmp="${id}" aria-pressed="${isCmp(id)}" title="Add to compare">${isCmp(id) ? "✓ Comparing" : "Compare"}</button>`;
  }

  function injectOverlays() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <!-- Property quick view -->
      <div class="modal" id="modal" hidden>
        <div class="modal-backdrop" data-close></div>
        <div class="modal-card" role="dialog" aria-modal="true" aria-label="Property details">
          <button class="modal-close" data-close aria-label="Close">✕</button>
          <div class="modal-body" id="modal-body"></div>
        </div>
      </div>

      <!-- Saved drawer -->
      <div class="drawer" id="fav-drawer" hidden>
        <div class="drawer-backdrop" data-drawer-close></div>
        <aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="Saved properties">
          <div class="drawer-head">
            <h3>Saved properties</h3>
            <button class="drawer-close" data-drawer-close aria-label="Close">✕</button>
          </div>
          <p class="drawer-empty" id="fav-empty">No saved properties yet. Tap the heart on any listing to save it here.</p>
          <div class="fav-list" id="fav-list"></div>
        </aside>
      </div>

      <!-- Compare bar -->
      <div class="cmp-bar" id="cmp-bar" hidden>
        <div class="cmp-bar-inner">
          <div class="cmp-thumbs" id="cmp-thumbs"></div>
          <div class="cmp-bar-actions">
            <span class="cmp-bar-count"><strong id="cmp-count">0</strong> selected</span>
            <button class="link-muted" id="cmp-clear">Clear</button>
            <button class="btn btn-sm" id="cmp-open">Compare</button>
          </div>
        </div>
      </div>

      <!-- Compare modal -->
      <div class="modal" id="cmp-modal" hidden>
        <div class="modal-backdrop" data-close></div>
        <div class="modal-card modal-card--wide" role="dialog" aria-modal="true" aria-label="Compare properties">
          <button class="modal-close" data-close aria-label="Close">✕</button>
          <div class="cmp-modal-body" id="cmp-body"></div>
        </div>
      </div>

      <div class="toast" id="toast" hidden></div>`;
    document.body.appendChild(wrap);
  }

  // ---------- modal ----------
  let scrollLockCount = 0;
  function lockScroll() { scrollLockCount++; document.body.style.overflow = "hidden"; }
  function unlockScroll() { scrollLockCount = Math.max(0, scrollLockCount - 1); if (!scrollLockCount) document.body.style.overflow = ""; }

  function openModal(item) {
    const body = document.getElementById("modal-body");
    body.innerHTML = `
      <div class="modal-media"><img src="${item.img}" alt="${item.title}" /></div>
      <div class="modal-content">
        <div class="modal-top">
          <span class="badge">${item.status}</span>
          ${heartHTML(item.id)}
        </div>
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
        <div class="modal-actions">
          <a href="index.html#contact" class="btn" data-close>Enquire about this property</a>
          ${cmpToggleHTML(item.id)}
        </div>
      </div>`;
    show("modal");
  }

  function show(id) { const m = document.getElementById(id); if (m && m.hidden) { m.hidden = false; lockScroll(); } }
  function hide(id) { const m = document.getElementById(id); if (m && !m.hidden) { m.hidden = true; unlockScroll(); } }

  // ---------- favourites UI ----------
  function syncFavs() {
    document.querySelectorAll("[data-fav]").forEach((el) => {
      const on = isFav(el.dataset.fav);
      el.classList.toggle("is-fav", on);
      if (el.hasAttribute("aria-pressed")) el.setAttribute("aria-pressed", String(on));
    });
    document.querySelectorAll("[data-fav-count]").forEach((el) => {
      el.textContent = favs.length;
      el.classList.toggle("has", favs.length > 0);
    });
    renderDrawer();
  }
  function renderDrawer() {
    const list = document.getElementById("fav-list");
    if (!list) return;
    const items = favs.map(byId).filter(Boolean);
    const empty = document.getElementById("fav-empty");
    if (empty) empty.hidden = items.length > 0;
    list.innerHTML = items.map((it) => `
      <div class="fav-row" data-id="${it.id}">
        <div class="fav-thumb"><img src="${it.img}" alt="" /></div>
        <div class="fav-meta">
          <p class="fav-area">${it.area}</p>
          <p class="fav-title">${it.title}</p>
          <p class="fav-price">${priceLabel(it)}</p>
        </div>
        <button class="fav-remove" data-fav="${it.id}" aria-label="Remove from saved">✕</button>
      </div>`).join("");
  }

  // ---------- compare UI ----------
  function syncCmp() {
    document.querySelectorAll("[data-cmp]").forEach((el) => {
      if (!el.classList.contains("cmp-toggle")) return;
      const on = isCmp(el.dataset.cmp);
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-pressed", String(on));
      el.textContent = on ? "✓ Comparing" : "Compare";
    });
    renderCmpBar();
  }
  function renderCmpBar() {
    const bar = document.getElementById("cmp-bar");
    if (!bar) return;
    const items = cmp.map(byId).filter(Boolean);
    bar.hidden = items.length === 0;
    document.getElementById("cmp-thumbs").innerHTML = items.map((it) =>
      `<div class="cmp-thumb"><img src="${it.img}" alt="${it.title}" /><button data-cmp="${it.id}" aria-label="Remove ${it.title}">✕</button></div>`
    ).join("");
    document.getElementById("cmp-count").textContent = items.length;
    document.getElementById("cmp-open").disabled = items.length < 2;
  }
  function openCompare() {
    const items = cmp.map(byId).filter(Boolean);
    if (items.length < 2) return;
    const rows = [
      ["Price", (it) => priceLabel(it)],
      ["Type", (it) => it.type],
      ["Location", (it) => it.area],
      ["Status", (it) => it.status],
      ["Bedrooms", (it) => bedsLabel(it.beds)],
      ["Bathrooms", (it) => String(it.baths)],
      ["Size", (it) => `${aed(it.size)} sqft`],
      ["Price / sqft", (it) => `AED ${aed(Math.round(it.price / it.size))}`],
    ];
    const cols = `200px repeat(${items.length}, minmax(180px, 1fr))`;
    let html = `<h3 class="cmp-modal-title">Compare properties</h3>`;
    html += `<div class="cmp-scroll"><div class="cmp-grid" style="grid-template-columns:${cols}">`;
    html += `<div class="cmp-corner"></div>`;
    html += items.map((it) => `
      <div class="cmp-col-head">
        <div class="cmp-col-media"><img src="${it.img}" alt="${it.title}" /></div>
        <p class="card-area">${it.area}</p>
        <h4>${it.title}</h4>
        <button class="cmp-col-remove" data-cmp="${it.id}">Remove</button>
      </div>`).join("");
    rows.forEach((r, i) => {
      html += `<div class="cmp-rowlabel${i % 2 ? " alt" : ""}">${r[0]}</div>`;
      html += items.map((it) => `<div class="cmp-cell${i % 2 ? " alt" : ""}">${r[1](it)}</div>`).join("");
    });
    html += `</div></div>`;
    document.getElementById("cmp-body").innerHTML = html;
    show("cmp-modal");
  }

  // ---------- toast ----------
  let toastTimer = null;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove("show"); setTimeout(() => { t.hidden = true; }, 300); }, 2600);
  }

  // ---------- shared header / chrome ----------
  function initChrome() {
    const header = document.querySelector(".site-header");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 80);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (navToggle && nav) {
      navToggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(open));
      });
      nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });
    }
    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  // ---------- reveal ----------
  let revealObserver = null;
  function observeReveals() {
    const els = document.querySelectorAll("[data-reveal]:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    }
    els.forEach((el) => revealObserver.observe(el));
  }

  // ---------- global events ----------
  function initEvents() {
    document.addEventListener("click", (e) => {
      const fav = e.target.closest("[data-fav]");
      if (fav) { e.preventDefault(); e.stopPropagation(); toggleFav(fav.dataset.fav); return; }
      const cmpt = e.target.closest("[data-cmp]");
      if (cmpt) { e.preventDefault(); e.stopPropagation(); toggleCmp(cmpt.dataset.cmp); return; }

      if (e.target.closest("[data-saved-open]")) { e.preventDefault(); show("fav-drawer"); return; }
      if (e.target.closest("[data-drawer-close]")) { hide("fav-drawer"); return; }
      if (e.target.closest("#cmp-open")) { openCompare(); return; }
      if (e.target.closest("#cmp-clear")) { cmp = []; store(CMP_KEY, cmp); syncCmp(); return; }
      if (e.target.closest("[data-close]")) { hide("modal"); hide("cmp-modal"); return; }

      // open property modal from any card / row carrying data-id
      const opener = e.target.closest("[data-id]");
      if (opener) { const it = byId(opener.dataset.id); if (it) openModal(it); }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      ["cmp-modal", "modal", "fav-drawer"].some((id) => {
        const m = document.getElementById(id);
        if (m && !m.hidden) { hide(id); return true; }
        return false;
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".card, .ex-card");
      if (card && card.dataset.id) { e.preventDefault(); const it = byId(card.dataset.id); if (it) openModal(it); }
    });
  }

  // ---------- expose + init ----------
  window.PRIME = {
    LISTINGS, byId, aed, priceLabel, bedsLabel,
    heartHTML, cmpToggleHTML, isFav, isCmp,
    observeReveals, openModal,
    locations: () => Array.from(new Set(LISTINGS.map((l) => l.area))).sort(),
    types: () => Array.from(new Set(LISTINGS.map((l) => l.type))).sort(),
  };

  document.addEventListener("DOMContentLoaded", () => {
    injectOverlays();
    initChrome();
    initEvents();
    syncFavs();
    syncCmp();
    observeReveals();
  });
})();
