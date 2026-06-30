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
| `play.html` | **Careers game hub** — "Break the ceiling" recruitment game (campaign: *Trust better. Get better*) |
| `play.css` | Styling for the careers game hub (campaign brand palette) |
| `play.js` | Game loop, career-tier progression, leaderboard, lead capture, share card |

## Careers game — "Break the ceiling"

A self-contained recruitment activation at `play.html` for the *Trust better. Get
better* campaign. It is independent of the property site (its own brand palette and
fonts) and needs no build step.

- **The game** — an endless vertical climber. You rise automatically; steer left/right
  (drag/hold or arrow keys) to hit the **weak point** in each ceiling and smash through.
  Hit solid concrete and the run ends. Height = score.
- **Progression** — each height milestone breaks into the next career tier
  (New broker → Top performer → Team lead → Director) with a rising earnings indicator.
- **Lead capture (the point of the build)** — anyone can play; saving a score opens a
  one-step opt-in (name, email/WhatsApp, "which describes you?" segment, consent). Entries
  go to the leaderboard and, if configured, to a CRM.
- **Leaderboards** — weekly (resets Mon 00:00 GST), all-time, and office-vs-office.
- **Sharing** — a branded score card is rendered to canvas for native share / clipboard.
- **`?code=`** — links a physical-puzzle recipient to their lead profile.

### Wiring a real backend

The board and leads are stored in `localStorage` for the demo. To connect a backend,
set the config at the top of `play.js` (or before it loads):

```js
window.BH.config.crmWebhook = "https://crm.example/api/leads"; // POST lead payload
window.BH.config.scoreApi   = "https://api.example/scores";    // server-validated submit
```

Analytics events (`play_start`, `play_end`, `save_clicked`, `score_saved`,
`lead_captured`, `share_clicked`) are emitted via `console.debug` / `window.dataLayer` —
point them at your tracker. Adding another game module (Cast for the catch, the puzzle,
the diagnostic) reuses the same leaderboard, capture and share code unchanged.

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
