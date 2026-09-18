# AGENTS.md

## Project Context

OffGrid Designer is a static, client-only React app (Vite). There is no
backend, no database, and no auth — it was converted from a Base44 export to
run entirely as static files, deployable to any static host (e.g.
Cloudflare Pages). Treat it as user-owned application code, keep changes
focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup and the build/deploy workflow.

## Key Files

- `src/lib/calc.js`: the electrical sizing math. Treat as verified/correct —
  don't change the formulas without an explicit request.
- `src/data/`: static JSON data (appliance catalog, wire specs, fuse sizes)
  that feeds `calc.js`. Edit these, not a database, to change the catalog.
- `src/pages/Home.jsx`: owns wizard state (`project`) via `useState`; no
  persistence layer by design (in-session only, no localStorage).
- `vite.config.js`: plain Vite + `@vitejs/plugin-react`, no backend plugin.

## Working Notes

- `npm run dev` for local development, `npm run build` for the static
  production build (outputs to `dist/`).
- Run the relevant checks from `package.json` before finishing code changes.
