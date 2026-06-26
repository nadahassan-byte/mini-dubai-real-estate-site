# Mini Dubai Real Estate Site

A small, self-contained real-estate website for browsing Dubai properties. Built with plain
**HTML, CSS and JavaScript** — no build step, no dependencies. Just open `index.html`.

## Features

- **Hero with search** — filter listings live by area, title or type.
- **Featured listings grid** — responsive cards with price (AED), beds, baths and size.
- **Type filters** — All / Apartments / Villas / Penthouses.
- **Property detail modal** — click any card for full details and an enquiry link.
- **Neighbourhoods** — Downtown, Marina, Palm Jumeirah, Business Bay (click to filter).
- **About + contact** — contact form with front-end validation (demo only).
- Fully **responsive** down to mobile, with a collapsible nav.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and content |
| `styles.css` | All styling (no framework) |
| `data.js` | Listing data — edit this to add/remove properties |
| `script.js` | Rendering, search, filters, modal, contact form |

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

1. Push these files to the repository root.
2. In the repo: **Settings → Pages → Source: Deploy from a branch**, pick `main` / root.
3. Your site goes live at `https://<user>.github.io/mini-dubai-real-estate-site/`.

## Customising

- **Listings:** edit the `LISTINGS` array in `data.js`.
- **Branding/colours:** edit the CSS variables at the top of `styles.css` (`--brand`, `--accent`, etc.).
- **Images:** listing images use Unsplash URLs; swap the `img` values for your own photos.

> Note: listings and contact details are illustrative placeholders for a demo.
