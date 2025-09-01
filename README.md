# OSINT Library (Tabs) — PWA

A clean, mobile‑first, multi‑tab site for your OSINT links that works online **and offline** (PWA). Built for GitHub Pages.

## Quick Start
1. **Copy links.sample.json → links.json** and fill in your categories/links.
2. Push the folder to a **public GitHub repo** (e.g., `osint-library`).
3. Enable **GitHub Pages** → Deploy from branch → `/` root.
4. Visit your site → Add to Home Screen (Android/Chrome installs PWA).

## Structure
- `index.html` — Minimal shell with tabs + welcome.
- `style.css` — Dark, clean UI.
- `app.js` — Builds tabs from `links.json`.
- `links.json` — Your data (categories, groups, links).
- `service-worker.js` — Offline cache for PWA.
- `manifest.webmanifest` — PWA metadata.
- `icons/` — App icons.

## Data Shape (links.json)
```jsonc
{
  "categories": [
    {
      "name": "Category Name",
      "links": [
        {"title":"Site", "url":"https://...", "note":"Optional"}
      ]
      // Optional: groups for sub‑sections rendered as cards
      ,"groups":[
        {"name":"Group A", "links":[{"title":"..","url":".."}]}
      ]
    }
  ]
}
```

## Notes
- This repo ships with `links.sample.json`. **Rename to `links.json`.**
- If you prefer a flat list per category, omit `groups` and use `links` only.
- You can add or rename categories any time — no code changes needed.
- Works offline after first load. Service worker updates automatically on deploy.
