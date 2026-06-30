/* Listings page: filter (location + type + status + search), sort,
   shareable URLs, and load-more pagination. */
(function () {
  "use strict";
  const P = window.PRIME;
  const grid = document.getElementById("listings-grid");
  if (!grid) return;

  const empty = document.getElementById("empty-state");
  const fType = document.getElementById("f-type");
  const fLoc = document.getElementById("f-location");
  const fStatus = document.getElementById("f-status");
  const fSearch = document.getElementById("f-search");
  const fSort = document.getElementById("f-sort");
  const countEl = document.getElementById("result-count");
  const loadMore = document.getElementById("load-more");
  const PAGE = 9;
  let shown = PAGE;
  let lastMatched = [];   // full filtered set (for the map)
  let view = "list";

  P.types().forEach((t) => fType.add(new Option(t === "Apartment" ? "Apartments" : t + "s", t)));
  P.locations().forEach((l) => fLoc.add(new Option(l, l)));

  // ---- read filters from URL ----
  const params = new URLSearchParams(location.search);
  if (params.get("location")) fLoc.value = params.get("location");
  if (params.get("type")) fType.value = params.get("type");
  if (params.get("status")) fStatus.value = params.get("status");
  if (params.get("q")) fSearch.value = params.get("q");
  if (params.get("sort")) fSort.value = params.get("sort");
  let minPrice = parseFloat(params.get("minprice")) || 0;
  let maxPrice = parseFloat(params.get("maxprice")) || 0;

  function buildQS() {
    const p = new URLSearchParams();
    if (fLoc.value !== "all") p.set("location", fLoc.value);
    if (fType.value !== "all") p.set("type", fType.value);
    if (fStatus.value !== "all") p.set("status", fStatus.value);
    if (fSearch.value.trim()) p.set("q", fSearch.value.trim());
    if (fSort.value !== "featured") p.set("sort", fSort.value);
    if (minPrice > 0) p.set("minprice", String(minPrice));
    if (maxPrice > 0) p.set("maxprice", String(maxPrice));
    return p.toString();
  }
  function syncURL() {
    const qs = buildQS();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  function matches(it) {
    if (fType.value !== "all" && it.type !== fType.value) return false;
    if (fLoc.value !== "all" && it.area !== fLoc.value) return false;
    if (fStatus.value !== "all" && it.status !== fStatus.value) return false;
    if (minPrice > 0 && it.price < minPrice) return false;
    if (maxPrice > 0 && it.price > maxPrice) return false;
    const q = fSearch.value.trim().toLowerCase();
    if (q && !(it.area.toLowerCase().includes(q) || it.title.toLowerCase().includes(q) || it.type.toLowerCase().includes(q))) return false;
    return true;
  }
  function sortFn(a, b) {
    switch (fSort.value) {
      case "newest": return (b.added || "").localeCompare(a.added || "");
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "size-desc": return b.size - a.size;
      default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.added || "").localeCompare(a.added || "");
    }
  }

  const ICON = {
    bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 18v2M21 18v2M3 13V7M7 11V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></svg>',
    bath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M7 19l-1 2M18 19l1 2"/></svg>',
    area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 9h4V4M20 15h-4v5"/></svg>',
  };
  function card(it) {
    return `
      <article class="card" data-id="${it.id}" tabindex="0" role="button" aria-label="View ${it.title}" data-reveal>
        <div class="card-media">
          <span class="badge">${it.status}</span>
          ${P.heartHTML(it.id)}
          <img src="${it.img}" alt="${it.title}" loading="lazy" />
          <span class="card-view">View property</span>
        </div>
        <div class="card-body">
          <div class="card-price">${P.priceLabel(it)}</div>
          <p class="card-sub">${it.type} in ${it.area}</p>
          <div class="card-specs">
            <span>${ICON.bed} ${P.bedsLabel(it.beds)}</span>
            <span>${ICON.bath} ${it.baths} bath${it.baths > 1 ? "s" : ""}</span>
            <span>${ICON.area} ${P.aed(it.size)} sqft</span>
          </div>
          <div class="card-foot"><span class="card-ref">Ref. PRM-${String(it.id).padStart(4, "0")}</span>${P.cmpToggleHTML(it.id)}</div>
        </div>
      </article>`;
  }

  function render() {
    const all = P.LISTINGS.filter(matches).sort(sortFn);
    lastMatched = all;
    const vis = all.slice(0, shown);
    grid.innerHTML = vis.map(card).join("");
    empty.hidden = all.length !== 0;
    countEl.textContent = `${all.length} ${all.length === 1 ? "property" : "properties"}`;
    loadMore.hidden = all.length <= shown || view === "map";
    P.observeReveals();
    if (view === "map") updateMap();
  }
  function reset() { shown = PAGE; syncURL(); render(); }

  [fType, fLoc, fStatus, fSort].forEach((el) => el.addEventListener("change", reset));
  fSearch.addEventListener("input", reset);
  loadMore.addEventListener("click", () => { shown += PAGE; render(); });
  document.getElementById("f-clear").addEventListener("click", () => {
    fType.value = "all"; fLoc.value = "all"; fStatus.value = "all"; fSearch.value = ""; fSort.value = "featured";
    minPrice = 0; maxPrice = 0;
    reset();
  });
  document.getElementById("copy-link").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(location.href); const b = e.currentTarget; const o = b.textContent; b.textContent = "Link copied ✓"; setTimeout(() => { b.textContent = o; }, 1800); } catch (err) {}
  });

  // ---- re-render prices on currency change (covers map popups too) ----
  document.addEventListener("prime:currency", () => { if (view === "map") updateMap(); });

  // ---- saved searches ----
  const ssWrap = document.getElementById("saved-searches");
  const ssChips = document.getElementById("ss-chips");
  function describe(qs) {
    const p = new URLSearchParams(qs);
    const bits = [];
    if (p.get("type")) bits.push(p.get("type") + "s");
    if (p.get("status")) bits.push(p.get("status"));
    if (p.get("location")) bits.push("in " + p.get("location"));
    if (p.get("q")) bits.push('“' + p.get("q") + '”');
    if (p.get("maxprice")) bits.push("≤ " + P.moneyText(parseFloat(p.get("maxprice"))));
    if (p.get("minprice")) bits.push("≥ " + P.moneyText(parseFloat(p.get("minprice"))));
    return bits.join(" · ") || "All properties";
  }
  function renderSearches() {
    const list = P.getSearches();
    ssWrap.hidden = list.length === 0;
    ssChips.innerHTML = list.map((s) =>
      `<span class="ss-chip"><button class="ss-apply" data-qs="${encodeURIComponent(s.qs)}">${s.name}</button><button class="ss-del" data-del="${s.id}" aria-label="Delete saved search">✕</button></span>`
    ).join("");
  }
  function applyQS(qs) {
    const p = new URLSearchParams(qs);
    fLoc.value = p.get("location") || "all";
    fType.value = p.get("type") || "all";
    fStatus.value = p.get("status") || "all";
    fSearch.value = p.get("q") || "";
    fSort.value = p.get("sort") || "featured";
    minPrice = parseFloat(p.get("minprice")) || 0;
    maxPrice = parseFloat(p.get("maxprice")) || 0;
    reset();
  }
  document.getElementById("save-search").addEventListener("click", (e) => {
    const qs = buildQS();
    const name = describe(qs);
    P.saveSearch(name, qs);
    renderSearches();
    const b = e.currentTarget, o = b.textContent; b.textContent = "★ Saved ✓"; setTimeout(() => { b.textContent = o; }, 1600);
  });
  ssChips.addEventListener("click", (e) => {
    const apply = e.target.closest(".ss-apply");
    if (apply) { applyQS(decodeURIComponent(apply.dataset.qs)); return; }
    const del = e.target.closest(".ss-del");
    if (del) { P.removeSearch(del.dataset.del); renderSearches(); }
  });
  renderSearches();

  // ---- map view (Leaflet, lazy-loaded) ----
  const mapWrap = document.getElementById("map-wrap");
  let map = null, markers = null, leafletLoading = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletLoading) return leafletLoading;
    leafletLoading = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = "assets/vendor/leaflet/leaflet.css";
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = "assets/vendor/leaflet/leaflet.js";
      js.onload = resolve; js.onerror = reject;
      document.head.appendChild(js);
    });
    return leafletLoading;
  }
  function markerIcon() {
    const base = "assets/vendor/leaflet/images/";
    return window.L.icon({
      iconUrl: base + "marker-icon.png", iconRetinaUrl: base + "marker-icon-2x.png",
      shadowUrl: base + "marker-shadow.png",
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });
  }
  function popupHTML(it) {
    return `<div class="map-pop" data-id="${it.id}">
      <div class="map-pop-img" style="background-image:url('${it.img}')"></div>
      <div class="map-pop-body">
        <p class="map-pop-price">${P.priceLabel(it)}</p>
        <p class="map-pop-title">${it.title}</p>
        <p class="map-pop-sub">${it.area} · ${P.bedsLabel(it.beds)}</p>
        <a class="map-pop-link" href="property.html?id=${it.id}">View property →</a>
      </div></div>`;
  }
  function updateMap() {
    if (!map) return;
    if (markers) markers.clearLayers(); else markers = window.L.layerGroup().addTo(map);
    const pts = [];
    lastMatched.forEach((it) => {
      if (typeof it.lat !== "number") return;
      const m = window.L.marker([it.lat, it.lng], { icon: markerIcon() }).bindPopup(popupHTML(it), { minWidth: 220 });
      markers.addLayer(m); pts.push([it.lat, it.lng]);
    });
    if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
  }
  function showMap() {
    loadLeaflet().then(() => {
      if (!map) {
        map = window.L.map("map", { scrollWheelZoom: false }).setView([25.11, 55.22], 11);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19, attribution: "© OpenStreetMap contributors",
        }).addTo(map);
      }
      setTimeout(() => { map.invalidateSize(); updateMap(); }, 60);
    }).catch(() => { mapWrap.innerHTML = '<p class="map-fail">Map could not be loaded. Please check your connection.</p>'; });
  }
  function setView(v) {
    view = v;
    document.querySelectorAll(".vt-btn").forEach((b) => {
      const on = b.dataset.view === v;
      b.classList.toggle("is-active", on); b.setAttribute("aria-selected", String(on));
    });
    grid.hidden = v === "map";
    mapWrap.hidden = v !== "map";
    loadMore.hidden = v === "map" || lastMatched.length <= shown;
    if (v === "map") showMap();
  }
  document.querySelector(".view-toggle").addEventListener("click", (e) => {
    const b = e.target.closest(".vt-btn"); if (b) setView(b.dataset.view);
  });

  // ---- sticky filter bar: add depth once it pins under the header ----
  const filtersBar = document.getElementById("filters");
  if (filtersBar && "IntersectionObserver" in window) {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;width:1px;height:1px;pointer-events:none;";
    filtersBar.parentNode.insertBefore(sentinel, filtersBar);
    new IntersectionObserver(
      ([e]) => filtersBar.classList.toggle("is-stuck", !e.isIntersecting),
      { rootMargin: "-85px 0px 0px 0px", threshold: 0 }
    ).observe(sentinel);
  }

  render();
})();
