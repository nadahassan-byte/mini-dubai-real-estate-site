/* Listings page: filter by location + property type (+ status + search). */
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
  const countEl = document.getElementById("result-count");

  P.types().forEach((t) => fType.add(new Option(t === "Apartment" ? "Apartments" : t + "s", t)));
  P.locations().forEach((l) => fLoc.add(new Option(l, l)));

  // Preselect from URL (?location= / ?type=)
  const params = new URLSearchParams(location.search);
  if (params.get("location")) fLoc.value = params.get("location");
  if (params.get("type")) fType.value = params.get("type");

  function matches(it) {
    if (fType.value !== "all" && it.type !== fType.value) return false;
    if (fLoc.value !== "all" && it.area !== fLoc.value) return false;
    if (fStatus.value !== "all" && it.status !== fStatus.value) return false;
    const q = fSearch.value.trim().toLowerCase();
    if (q && !(it.area.toLowerCase().includes(q) || it.title.toLowerCase().includes(q) || it.type.toLowerCase().includes(q))) return false;
    return true;
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
          <div class="card-foot">
            <span class="card-ref">Ref. PRM-${String(it.id).padStart(4, "0")}</span>
            ${P.cmpToggleHTML(it.id)}
          </div>
        </div>
      </article>`;
  }

  function render() {
    const vis = P.LISTINGS.filter(matches);
    grid.innerHTML = vis.map(card).join("");
    empty.hidden = vis.length !== 0;
    countEl.textContent = `${vis.length} ${vis.length === 1 ? "property" : "properties"}`;
    P.observeReveals();
  }

  [fType, fLoc, fStatus].forEach((el) => el.addEventListener("change", render));
  fSearch.addEventListener("input", render);
  const clearBtn = document.getElementById("f-clear");
  if (clearBtn) clearBtn.addEventListener("click", () => {
    fType.value = "all"; fLoc.value = "all"; fStatus.value = "all"; fSearch.value = "";
    render();
  });

  render();
})();
