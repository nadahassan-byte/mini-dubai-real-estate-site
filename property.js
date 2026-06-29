/* Property detail page. */
(function () {
  "use strict";
  const P = window.PRIME;
  const root = document.getElementById("property");
  const id = new URLSearchParams(location.search).get("id");
  const item = P.byId(id);

  if (!item) {
    root.innerHTML = `<div class="container"><div class="prop-missing"><h1>Property not found</h1><p class="muted">This listing may have been removed.</p><a href="listings.html" class="btn">Browse all properties</a></div></div>`;
    return;
  }

  P.recordView(item.id);

  // ----- meta / share -----
  document.title = `${item.title} — PRIME by betterhomes`;
  const setMeta = (id2, attr, val) => { const el = document.getElementById(id2); if (el) el.setAttribute(attr, val); };
  const desc = `${item.type} in ${item.area}, Dubai — ${P.bedsLabel(item.beds)}, ${item.baths} bath, ${P.aed(item.size)} sqft. ${item.blurb}`;
  setMeta("meta-desc", "content", desc);
  setMeta("og-title", "content", `${item.title} — ${P.priceLabel(item).replace(/<[^>]+>/g, "")}`);
  setMeta("og-desc", "content", desc);
  setMeta("og-image", "content", new URL(item.img, location.href).href);

  // ----- breadcrumb -----
  document.getElementById("crumbs").innerHTML =
    `<a href="index.html">Home</a><span>/</span><a href="listings.html">Properties</a><span>/</span><a href="listings.html?location=${encodeURIComponent(item.area)}">${item.area}</a><span>/</span><span class="crumb-current">${item.title}</span>`;

  // ----- amenities (derived) -----
  const base = ["Floor-to-ceiling windows", "Built-in wardrobes", "Covered parking", "24/7 security", "High-speed fibre"];
  const byType = {
    Villa: ["Private pool", "Landscaped garden", "Maid's & driver's rooms", "Home gym", "Smart-home system"],
    Penthouse: ["Private terrace", "Plunge pool", "Private lift lobby", "Concierge service", "Smart-home system"],
    Apartment: ["Shared pool & gym", "Concierge", "Balcony", "Children's play area", "Covered parking"],
    Townhouse: ["Private garden", "Community pool", "Maid's room", "Two parking bays", "Park access"],
  };
  const amenities = Array.from(new Set([...(byType[item.type] || []), ...base])).slice(0, 9);

  // ----- mortgage estimate (sale only) -----
  let monthly = "";
  if (item.status === "For Sale") {
    const loan = item.price * 0.8, r = 0.0425 / 12, n = 25 * 12;
    const m = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    monthly = `<p class="prop-mortgage">Est. mortgage <strong>AED ${P.aed(Math.round(m))}/mo</strong> <span class="muted">· 20% down, 4.25%, 25 yrs</span> · <a href="index.html#calculator">Adjust</a></p>`;
  }

  const gallery = (P.galleryFor ? P.galleryFor(item) : [item.img]);

  root.innerHTML = `
    <div class="container prop-grid">
      <div class="prop-gallery">
        <div class="prop-main"><img id="prop-main-img" src="${gallery[0]}" alt="${item.title}" /><span class="badge">${item.status}</span></div>
        <div class="prop-thumbs">
          ${gallery.map((g, i) => `<button class="prop-thumb${i === 0 ? " active" : ""}" data-img="${g}" aria-label="View image ${i + 1}"><img src="${g}" alt="" /></button>`).join("")}
        </div>
      </div>

      <aside class="prop-info">
        <p class="card-area">${item.area}, Dubai</p>
        <h1 class="prop-title">${item.title}</h1>
        <div class="prop-price">${P.priceLabel(item)}</div>
        ${monthly}
        <div class="prop-specs">
          <div><span>Bedrooms</span><strong>${P.bedsLabel(item.beds)}</strong></div>
          <div><span>Bathrooms</span><strong>${item.baths}</strong></div>
          <div><span>Size</span><strong>${P.aed(item.size)} sqft</strong></div>
          <div><span>Type</span><strong>${item.type}</strong></div>
          <div><span>Reference</span><strong>PRM-${String(item.id).padStart(4, "0")}</strong></div>
          <div><span>Status</span><strong>${item.status}</strong></div>
        </div>
        <div class="prop-actions">
          <a href="#enquire" class="btn">Enquire / book a viewing</a>
          ${P.heartHTML(item.id)}
          ${P.cmpToggleHTML(item.id)}
        </div>
        <button class="link-gold prop-share" id="prop-share" type="button">Share this property</button>
      </aside>
    </div>

    <div class="container prop-detail">
      <div class="prop-about">
        <h2>About this property</h2>
        <p>${item.blurb}</p>
        <p class="muted">Set in ${item.area}, this ${item.type.toLowerCase()} offers ${P.bedsLabel(item.beds).toLowerCase()} and ${item.baths} bathrooms across ${P.aed(item.size)} sqft, finished to PRIME's exacting standard. Our advisors can arrange a private viewing at a time that suits you.</p>
        <h3>Features &amp; amenities</h3>
        <ul class="prop-amenities">${amenities.map((a) => `<li>${a}</li>`).join("")}</ul>
      </div>
      <aside class="prop-enquire" id="enquire">
        <h3>Enquire about this property</h3>
        <p class="muted">Reference PRM-${String(item.id).padStart(4, "0")}</p>
        <form class="contact-form" id="prop-form" novalidate>
          <div class="field"><label for="pf-name">Name</label><input id="pf-name" type="text" required /></div>
          <div class="field"><label for="pf-email">Email</label><input id="pf-email" type="email" required /></div>
          <div class="field"><label for="pf-phone">Phone</label><input id="pf-phone" type="tel" /></div>
          <div class="field"><label for="pf-msg">Message</label><textarea id="pf-msg" rows="3">I'd like to arrange a viewing of ${item.title} (PRM-${String(item.id).padStart(4, "0")}).</textarea></div>
          <button type="submit" class="btn">Send enquiry</button>
          <p class="form-note" id="pf-note" role="status"></p>
        </form>
      </aside>
    </div>`;

  // ----- gallery swap -----
  const mainImg = document.getElementById("prop-main-img");
  root.querySelectorAll(".prop-thumb").forEach((t) => {
    t.addEventListener("click", () => {
      mainImg.src = t.dataset.img;
      root.querySelectorAll(".prop-thumb").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
    });
  });

  // ----- share -----
  document.getElementById("prop-share").addEventListener("click", async () => {
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title: item.title, url }); }
      else { await navigator.clipboard.writeText(url); flash("Link copied to clipboard"); }
    } catch (e) {}
  });
  function flash(msg) { const b = document.getElementById("prop-share"); const o = b.textContent; b.textContent = msg; setTimeout(() => { b.textContent = o; }, 1800); }

  // ----- enquiry -----
  const form = document.getElementById("prop-form");
  const ref = "PRM-" + String(item.id).padStart(4, "0");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("pf-name").value.trim();
    const email = document.getElementById("pf-email").value.trim();
    const note = document.getElementById("pf-note");
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { note.textContent = "Please enter your name and a valid email."; note.className = "form-note err"; return; }
    const btn = form.querySelector("button[type=submit]");
    if (btn) btn.disabled = true;
    note.textContent = "Sending…"; note.className = "form-note";
    P.submitEnquiry({
      name: name,
      email: email,
      phone: document.getElementById("pf-phone").value.trim(),
      interest: item.status === "For Rent" ? "Renting" : "Buying",
      message: document.getElementById("pf-msg").value.trim(),
      property_ref: ref,
    }).then(() => {
      note.textContent = `Thank you ${name.split(" ")[0]} — an advisor will contact you about ${ref} shortly.`;
      note.className = "form-note ok";
      form.reset();
    }).catch(() => {
      note.textContent = "Sorry, something went wrong. Please call us on +971 4 000 0000.";
      note.className = "form-note err";
    }).then(() => { if (btn) btn.disabled = false; });
  });

  // ----- recently viewed -----
  const recent = P.getRecent().filter((r) => r.id !== item.id).slice(0, 4);
  if (recent.length) {
    document.getElementById("recent-section").hidden = false;
    document.getElementById("recent-grid").innerHTML = recent.map((it) => `
      <article class="card" data-id="${it.id}" tabindex="0" role="button" aria-label="View ${it.title}">
        <div class="card-media"><span class="badge">${it.status}</span>${P.heartHTML(it.id)}<img src="${it.img}" alt="${it.title}" loading="lazy" /><span class="card-view">View property</span></div>
        <div class="card-body"><p class="card-area">${it.area}</p><h3 class="card-title">${it.title}</h3><div class="card-price">${P.priceLabel(it)}</div></div>
      </article>`).join("");
    P.observeReveals();
  }
})();
