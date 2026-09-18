# OffGrid Designer

A static, client-only wizard for sizing a 12V off-grid electrical system
(camper van, RV, boat, or tiny house). There is no backend, no database, and
no user accounts — the appliance catalog, wire spec table, and fuse size
table ship as static JSON in `src/data/`, and the in-progress build lives in
React state for the duration of the session.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Build

```bash
npm run build
```

This produces a static `dist/` folder — plain HTML/CSS/JS, no server
required.

## Deploy to Cloudflare Pages

Point Cloudflare Pages at this repo (or drag-and-drop the `dist/` folder in
the Pages dashboard) with:

- **Build command:** `npm run build`
- **Build output directory:** `dist`

No environment variables or backend services are needed.

## Project structure

- `src/lib/calc.js` — the electrical sizing math (battery bank, solar,
  inverter, DC-DC charger, wire/fuse selection). Pure functions, no I/O.
- `src/lib/buildSheet.js` — derives the parts list and install order from
  `calc.js`'s output.
- `src/data/` — the appliance catalog, wire spec table, and fuse size table,
  as static JSON.
- `src/pages/Home.jsx` — owns the wizard state (`project`) and step
  navigation.
- `src/components/wizard/` — the four wizard steps (Load, System, Wiring,
  Build Sheet) and their subcomponents.

## Safety

This tool produces planning estimates only. Every build includes a safety
disclaimer (in the wizard footer and on the printable Build Sheet) that the
design must be checked by a qualified installer before you build it.
