# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is (and isn't)

Despite the name `wordpress-polygon-plugin`, this is **not** a real WordPress plugin: no plugin header, no hooks, no `register_rest_route`, no `wpdb`, no text domain. It is a standalone PHP + vanilla JS app that happens to use `wp_`-prefixed tables. "Polygon" refers to **geospatial polygons** (Leaflet.Draw), not the Polygon/MATIC blockchain. Treat it as a standalone app when making changes; do not assume WordPress APIs are available.

The README's "Roadmap / known issues" section is the authoritative list of open defects — consult it before proposing fixes so you don't duplicate a known item, and update it when you close one.

## Commands

There is no build step, no test runner, and no linter configured. `npm test` in `public/` intentionally exits 1.

- **Run the app locally:** `php -S localhost:8000` from the repo root, then open `http://localhost:8000/public/index.html`. The router at `core/router.php:21` strips an `api-map/` prefix, so if you deploy elsewhere you must either mount the app under that path or edit that line.
- **Install frontend deps (optional):** `cd public && npm install` — only needed if you want local copies of `leaflet` / `leaflet-draw`; the shipped `public/index.html` loads them from CDNs.
- **Database schema** is not in the repo. The two tables (`wp_building_category`, `wp_buildings`) are documented in `README.md` under Installation, inferred from the handlers.
- **Vite is declared but unused** (`public/package.json` devDependency with no `vite.config.js`). Don't assume a bundler is running; `index.html` loads `main.js` directly as a module.

## Architecture

### Request flow (backend)

```
index.php → Router::handleRequest() → {Building,Category}Handler method → JSON string → echo
```

- `index.php` is the only entry point. It sets wildcard CORS headers, constructs a single `Router` and two handler instances sharing one `$PDO`, then registers 7 routes (`index.php:21-43`).
- `core/router.php` is a minimal regex router: it turns `:id` into `(\d+)`, matches against the request path (with `api-map/` stripped), and invokes the handler closure with captured params. Only integer IDs are supported.
- Handlers (`handler/*.php`) are thin PDO wrappers. They always return `json_encode([...])`; they do not `echo` — `index.php:46` does that.
- `core/config.php` constructs the PDO instance into `$PDO` at include time. There is no service container; classes receive `$PDO` via constructor from `index.php`.

### Data shape quirk: `GET /buildings`

`BuildingHandler::getAll()` (`handler/building-handler.php:12-33`) does **not** return a flat list of buildings. It returns an array of categories with their buildings nested under `category.buildings`, and it decodes each building's `geometry` JSON string into an object before sending. The frontend assumes this shape throughout (`map.js:71`, `map.js:135`). If you ever flatten this, expect cascading frontend changes.

This method is also the main performance issue: it runs one `SELECT buildings WHERE category_id = ?` per category (N+1). Replace with a JOIN if you touch it.

### Frontend orchestration

```
MapApplication (main.js)
  ├── Map              (modules/map.js)           — Leaflet init, rendering, draw events
  ├── Building         (modules/building.js)      — buildings API client
  ├── Category         (modules/building-category.js) — categories API client
  └── UI               (modules/ui.js)            — modals, forms, toasts, legend DOM
        │
        └── ApiService (services.js)              — fetch wrapper used by Building/Category
```

- `main.js` is the single wiring point: it instantiates the four modules, sets up cross-module callbacks (`onDrawCreated`, `onBuildingChange`, `onCategoryChange`), and owns the form submit handlers.
- After **any** mutation, `handleDataChange()` refetches both categories and buildings and re-renders the whole map and legend. There is no incremental update path.
- `config.js` holds the API base URL (`api.baseUrl`, default `http://localhost/api-map`) and the Leaflet map defaults (center, zoom, Esri tile layer). Changing the deploy path requires editing this file.

### The `window.deleteBuilding` bridge

`main.js:215` assigns `window.deleteBuilding` after app init so that the inline `onclick="deleteBuilding(...)"` in the popup HTML at `map.js:89` can find it. This is an intentional cross-module bridge, not a leftover — if you refactor one side, update the other. Replacing it with event delegation is listed in the Roadmap.

### Known broken contract to watch for

`public/assets/js/modules/building.js:38-54` defines `Building.update()` which sends `PUT /buildings/:id`, but **no such route is registered** in `index.php`. Nothing in `main.js` calls it today, so it's latent dead code. If you wire it up on the frontend, you must also add the handler method and register the route.

## Project conventions

- **PHP:** 4-space indent, brace-on-new-line for class/method declarations, PDO prepared statements for every query.
- **JavaScript:** 2-space indent, single quotes, **no trailing semicolons** (see `main.js`, `map.js`, `ui.js`). ES modules only.
- No linter enforces either of the above — match the surrounding file.
- User's global rules (`~/.claude/CLAUDE.md`): no emoji unless asked; no unit tests unless asked; always ask for verify after a plan; don't run formatters unless asked.
