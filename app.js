/* Shared engine: helpers, favourites, compare, modal, drawer — used by every page. */
(function () {
  "use strict";

  // Bulletproof imagery: if any photo fails to load (e.g. a removed stock
  // image), swap in an elegant on-brand gradient instead of a broken icon.
  const IMG_FALLBACK = "data:image/svg+xml," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='#2a2d33'/><stop offset='1' stop-color='#14161a'/></linearGradient></defs>" +
    "<rect width='1200' height='900' fill='url(#g)'/>" +
    "<g fill='rgba(192,130,63,0.10)'>" +
    "<rect x='220' y='360' width='150' height='540'/><rect x='430' y='250' width='200' height='650'/>" +
    "<rect x='700' y='420' width='120' height='480'/><rect x='860' y='300' width='210' height='600'/></g></svg>"
  );
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.fb) { t.dataset.fb = "1"; t.src = IMG_FALLBACK; }
  }, true);

  const LISTINGS = window.LISTINGS || [];
  const byId = (id) => LISTINGS.find((l) => l.id === Number(id));

  const aed = (n) => new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
  function bedsLabel(b) { return b === 0 ? "Studio" : `${b} bed${b > 1 ? "s" : ""}`; }

  // ---------- currency ----------
  // rate = units of the currency per 1 AED. Static fallbacks are refined by
  // a live FX feed at load (see loadLiveRates) — the site works either way.
  const CUR_KEY = "prime_currency";
  const CURRENCIES = {
    AED: { name: "UAE Dirham", rate: 1 },
    USD: { name: "US Dollar", rate: 0.2723 },
    EUR: { name: "Euro", rate: 0.2510 },
    GBP: { name: "British Pound", rate: 0.2145 },
    SAR: { name: "Saudi Riyal", rate: 1.0210 },
    INR: { name: "Indian Rupee", rate: 22.71 },
    CNY: { name: "Chinese Yuan", rate: 1.9620 },
    RUB: { name: "Russian Ruble", rate: 21.50 },
  };
  let curCode = (function () { try { return localStorage.getItem(CUR_KEY) || "AED"; } catch (e) { return "AED"; } })();
  if (!CURRENCIES[curCode]) curCode = "AED";

  function convertFromAed(amount, code) { const c = CURRENCIES[code || curCode]; return amount * (c ? c.rate : 1); }
  function moneyText(amount, code) {
    code = code || curCode;
    return `${code} ${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(Math.round(convertFromAed(amount, code)))}`;
  }
  function priceLabel(it) {
    const rent = it.status === "For Rent";
    return `<span class="amt" data-aed="${it.price}">${moneyText(it.price)}</span>${rent ? ' <small>/ yr</small>' : ""}`;
  }
  function refreshPrices() {
    document.querySelectorAll(".amt[data-aed]").forEach((el) => { el.textContent = moneyText(parseFloat(el.dataset.aed)); });
  }
  function setCurrency(code) {
    if (!CURRENCIES[code]) return;
    curCode = code;
    try { localStorage.setItem(CUR_KEY, code); } catch (e) {}
    document.querySelectorAll("[data-currency]").forEach((s) => { if (s.value !== code) s.value = code; });
    refreshPrices();
    document.dispatchEvent(new CustomEvent("prime:currency", { detail: { code: code } }));
  }
  function loadLiveRates() {
    const eps = (window.PRIME_CONFIG && window.PRIME_CONFIG.fxEndpoints) || [];
    (function tryEp(i) {
      if (i >= eps.length || typeof fetch !== "function") return;
      fetch(eps[i]).then((r) => (r.ok ? r.json() : Promise.reject())).then((data) => {
        const aedRates = data && data.aed;
        if (!aedRates) return Promise.reject();
        Object.keys(CURRENCIES).forEach((code) => {
          if (code === "AED") return;
          const v = aedRates[code.toLowerCase()];
          if (typeof v === "number" && v > 0) CURRENCIES[code].rate = v;
        });
        refreshPrices();
      }).catch(() => tryEp(i + 1));
    })(0);
  }

  // ---------- storage ----------
  const FAV_KEY = "prime_favs", CMP_KEY = "prime_compare", CMP_MAX = 4;
  const load = (k) => { try { return (JSON.parse(localStorage.getItem(k)) || []).map(Number); } catch (e) { return []; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let favs = load(FAV_KEY);
  let cmp = load(CMP_KEY);
  const isFav = (id) => favs.includes(Number(id));
  const isCmp = (id) => cmp.includes(Number(id));

  const RECENT_KEY = "prime_recent";
  let recent = load(RECENT_KEY);
  function recordView(id) { id = Number(id); recent = [id].concat(recent.filter((x) => x !== id)).slice(0, 12); store(RECENT_KEY, recent); }
  function getRecent() { return recent.map(byId).filter(Boolean); }

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
      ["Price / sqft", (it) => `<span class="amt" data-aed="${Math.round(it.price / it.size)}">${moneyText(Math.round(it.price / it.size))}</span>`],
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
    // currency selector — injected so every page gets it without HTML edits
    const actions = document.querySelector(".header-actions");
    if (actions && !actions.querySelector("[data-currency]")) {
      const sel = document.createElement("select");
      sel.className = "cur-select";
      sel.setAttribute("data-currency", "");
      sel.setAttribute("aria-label", "Display currency");
      sel.innerHTML = Object.keys(CURRENCIES).map((c) => `<option value="${c}">${c}</option>`).join("");
      sel.value = curCode;
      sel.addEventListener("change", () => setCurrency(sel.value));
      actions.insertBefore(sel, actions.firstChild);
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

  // ---------- footer (socials + newsletter) ----------
  const SOCIAL_ICONS = [
    ["Instagram", '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'],
    ["X", '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20"/></svg>'],
    ["Facebook", '<svg viewBox="0 0 24 24"><path d="M14 8h2.5M14 8c0-2 1-3 3-3h.5M14 8v3m0 0h-2.5M14 11v8"/></svg>'],
    ["LinkedIn", '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7"/></svg>'],
    ["YouTube", '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 9.5l3.5 2.5L11 14.5z" fill="currentColor" stroke="none"/></svg>'],
  ];
  function initFooter() {
    const markup = SOCIAL_ICONS.map(([name, svg]) =>
      `<a class="social" href="#" aria-label="${name}" title="${name}">${svg}</a>`).join("");
    document.querySelectorAll("[data-socials]").forEach((el) => { el.innerHTML = markup; });

    const form = document.getElementById("news-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("news-email");
        const consent = document.getElementById("news-consent");
        const note = document.getElementById("news-note");
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        if (!ok) { note.textContent = "Please enter a valid email address."; note.className = "news-note err"; return; }
        if (consent && !consent.checked) { note.textContent = "Please accept the Privacy Policy to continue."; note.className = "news-note err"; return; }
        submitEnquiry({ email: email.value.trim(), interest: "Newsletter", message: "Newsletter signup" }).catch(() => {});
        note.textContent = "Thank you — you're on the list.";
        note.className = "news-note ok";
        form.reset();
      });
    }
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

      // open full property detail page from any card / row carrying data-id
      const opener = e.target.closest("[data-id]");
      if (opener && opener.dataset.id) { if (byId(opener.dataset.id)) location.href = "property.html?id=" + opener.dataset.id; }
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
      const card = e.target.closest(".card, .ex-card, .dn-card");
      if (card && card.dataset.id) { e.preventDefault(); if (byId(card.dataset.id)) location.href = "property.html?id=" + card.dataset.id; }
    });
  }

  // ---------- saved searches ----------
  const SS_KEY = "prime_saved_searches";
  function getSearches() { try { return JSON.parse(localStorage.getItem(SS_KEY)) || []; } catch (e) { return []; } }
  function saveSearch(name, qs) {
    const list = getSearches();
    if (list.some((s) => s.qs === qs)) return list; // no duplicates
    list.unshift({ id: Date.now(), name: name, qs: qs });
    store(SS_KEY, list.slice(0, 24));
    return getSearches();
  }
  function removeSearch(id) { store(SS_KEY, getSearches().filter((s) => String(s.id) !== String(id))); return getSearches(); }

  // ---------- enquiries (configurable backend) ----------
  const ENQ_KEY = "prime_enquiries";
  function localEnquiries() { try { return JSON.parse(localStorage.getItem(ENQ_KEY)) || []; } catch (e) { return []; } }
  function submitEnquiry(payload) {
    const cfg = window.PRIME_CONFIG || {};
    const rec = Object.assign(
      { created_at: new Date().toISOString(), source: (location.pathname.split("/").pop() || "index.html") },
      payload
    );
    try { const all = localEnquiries(); all.unshift(rec); localStorage.setItem(ENQ_KEY, JSON.stringify(all.slice(0, 200))); } catch (e) {}

    if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
      return fetch(cfg.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + (cfg.enquiriesTable || "enquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + cfg.supabaseAnonKey, Prefer: "return=minimal" },
        body: JSON.stringify(rec),
      }).then((r) => { if (!r.ok) throw new Error("supabase " + r.status); return true; });
    }
    if (cfg.web3formsKey) {
      return fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ access_key: cfg.web3formsKey, subject: "New PRIME enquiry — " + (rec.source || "") }, rec)),
      }).then((r) => { if (!r.ok) throw new Error("web3forms " + r.status); return true; });
    }
    return Promise.resolve(true); // local-only mode
  }
  function exportEnquiries() {
    const blob = new Blob([JSON.stringify(localEnquiries(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "prime-enquiries.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return localEnquiries().length + " enquiries exported";
  }

  // ---------- expose + init ----------
  window.PRIME = {
    LISTINGS, byId, aed, priceLabel, bedsLabel,
    heartHTML, cmpToggleHTML, isFav, isCmp,
    observeReveals, openModal, recordView, getRecent,
    galleryFor: window.galleryFor,
    moneyText, convertFromAed, setCurrency, refreshPrices,
    currencies: () => CURRENCIES, currency: () => curCode,
    getSearches, saveSearch, removeSearch,
    submitEnquiry, exportEnquiries,
    locations: () => Array.from(new Set(LISTINGS.map((l) => l.area))).sort(),
    types: () => Array.from(new Set(LISTINGS.map((l) => l.type))).sort(),
  };

  document.addEventListener("DOMContentLoaded", () => {
    injectOverlays();
    initChrome();
    initFooter();
    initEvents();
    syncFavs();
    syncCmp();
    observeReveals();
    loadLiveRates();
  });
})();
