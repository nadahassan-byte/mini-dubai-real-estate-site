# PRIME — Dubai Real Estate

A self-contained luxury real-estate site for browsing Dubai properties. Built with plain
**HTML, CSS and vanilla JavaScript** — no build step, no framework. Just open `index.html`.

## Features

- **Immersive home page** — full-screen hero carousel, Featured Sales & Featured Rentals rows.
- **Listings page** with:
  - Filter by **location, type, status** and **keyword search** (title / community / type).
  - **Sort** by featured, newest, price (↑/↓) or size.
  - **Map view** — every matching listing as a pin (Leaflet + OpenStreetMap); popups link to the property.
  - **Shareable filters** — the URL always reflects your filters; "Copy link" shares them.
  - **Saved searches** — save a filter combo and re-apply it later (stored in your browser).
  - **Load-more pagination**.
- **Property detail pages** with gallery, amenities, mortgage estimate, enquiry form and breadcrumb.
- **Multi-currency** — switch the header currency; all prices convert using **live exchange rates**
  (with a bundled static fallback so it always works). Choice is remembered.
- **Favourites** (saved drawer) and **compare up to 4** properties side by side.
- **Calculators** — mortgage repayment **and** an affordability calculator
  (income → borrowing power & budget, with a "homes you can afford" link).
- **Recently viewed** properties.
- **Real enquiries** — contact / enquiry / newsletter forms persist submissions (see below).
- **Social previews** — Open Graph / Twitter card meta on every page (per-listing on detail pages).
- Fully **responsive** with a collapsible nav.

## Files

| File | Purpose |
|------|---------|
| `index.html`, `listings.html`, `property.html`, `legal.html` | Pages |
| `styles.css` | All styling (no framework) |
| `config.js` | Site config — enquiry backend + FX endpoints (safe to commit) |
| `data.js` | Listing data + map coordinates — edit to add/remove properties |
| `app.js` | Shared engine: currency, favourites, compare, enquiries, saved searches, modal |
| `home.js` | Home page: hero, featured rows, calculators, contact form |
| `listings.js` | Listings: filters, sort, search, saved searches, map |
| `property.js` | Property detail page |
| `assets/props/` | Property photography (one unique image per listing) |
| `assets/vendor/leaflet/` | Bundled Leaflet (so the map needs no CDN at runtime) |

## Where enquiries go

Out of the box, every form submission is stored in the visitor's browser (`localStorage`), so the
forms are fully functional with **zero setup**. From any page's dev console you can run
`PRIME.exportEnquiries()` to download them as JSON.

To capture enquiries for real, edit **`config.js`** and fill in **one** option:

- **Email via Web3Forms** (easiest, free, no backend): get an access key at
  [web3forms.com](https://web3forms.com) and set `web3formsKey`. Enquiries arrive in your inbox.
- **Supabase** (a real database): create a table `enquiries` with text columns
  `name, email, phone, interest, message, property_ref, source`, add an RLS policy allowing
  anonymous `INSERT`, then set `supabaseUrl` and `supabaseAnonKey`.

If both are set, Supabase is used. A local copy is always kept too. (The anon/publishable key is
designed to be public; row-level security protects the data.)

## Run locally

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

(Serve over http rather than opening the file directly so live exchange rates and map tiles load.)

## Deploy

Static hosting (Vercel, Netlify, GitHub Pages). Push to the repo root and point the host at it.

## Customising

- **Listings:** edit the `LISTINGS` array in `data.js`. Map pins derive from `AREA_COORDS` + each
  listing's `area`; add a community there to place it on the map.
- **Currencies:** edit the `CURRENCIES` map in `app.js` (rates are units per 1 AED; live values
  refine them at load).
- **Branding/colours:** edit the CSS variables at the top of `styles.css`.

> Listings and contact details are illustrative placeholders for a demo.
