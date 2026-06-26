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
          <p class="card-area">${it.area}</p>
          <h3 class="card-title">${it.title}</h3>
          <div class="card-price">${P.priceLabel(it)}</div>
          <div class="card-specs">
            <span>${P.bedsLabel(it.beds)}</span>
            <span>${it.baths} bath${it.baths > 1 ? "s" : ""}</span>
            <span>${P.aed(it.size)} sqft</span>
          </div>
          <div class="card-foot">${P.cmpToggleHTML(it.id)}</div>
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
