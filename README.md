# wordpress-polygon-plugin

Interactive map application for drawing, categorizing, and managing building polygons with [Leaflet](https://leafletjs.com/) and [Leaflet.Draw](https://github.com/Leaflet/Leaflet.draw). PHP + PDO backend, vanilla JS ES-module frontend.

> **Status: early / pre-1.0.** Not production-ready. Several critical security issues are documented in [Roadmap](#roadmap--known-issues) and must be addressed before any public deployment.

> **Note on the name.** "Polygon" here refers to geospatial polygons drawn on a map — **not** the Polygon (MATIC) blockchain. There is no crypto or Web3 code in this project.

> **WordPress integration.** The repo is named `wordpress-polygon-plugin` and uses `wp_`-prefixed tables, but the current code is a **standalone PHP app**. It does not register hooks, admin pages, shortcodes, or REST routes via WordPress APIs. True WordPress integration is a planned item in the roadmap.

## Features

- Draw polygons on an interactive Leaflet map (Esri World Imagery tiles by default).
- Save polygons as "buildings" with a name and category.
- Create, edit, and delete color-coded categories.
- Collapsible per-category legend; click a legend entry to fly to the building.
- GeoJSON stored as JSON strings in MySQL; decoded server-side before sending to the client.

## Tech stack

- **Backend:** PHP (PDO / MySQL), a small hand-rolled router (`core/router.php`), no framework, no Composer.
- **Frontend:** Vanilla JavaScript ES modules, Leaflet 1.9, Leaflet.Draw 1.0, Tailwind CSS via CDN.
- **Dev dependency (declared, unused):** Vite 7 — listed in `public/package.json` but not currently wired up (no `vite.config.js`, `index.html` loads `main.js` directly).

## Requirements

- PHP 7.4+ with the `pdo_mysql` extension.
- MySQL or MariaDB.
- A modern browser with ES module and `<dialog>` support.
- Node.js 18+ (only needed if you want to install the `leaflet` / `leaflet-draw` npm packages locally — the shipped `index.html` loads them from a CDN).

## Installation

1. **Clone the repo into your web root.**

   ```bash
   git clone <repo-url> wordpress-polygon-plugin
   ```

   By default the router strips `api-map/` from incoming paths (see `core/router.php:21`), so the recommended deploy location is something like `http://localhost/api-map/`. If you deploy elsewhere, update that line.

2. **Create the database schema.** There is no migration file in the repo. The two tables are inferred from the handlers (`handler/building-handler.php`, `handler/categories-handler.php`):

   ```sql
   CREATE TABLE wp_building_category (
       id    INT AUTO_INCREMENT PRIMARY KEY,
       name  VARCHAR(255) NOT NULL,
       color VARCHAR(32)  NOT NULL
   );

   CREATE TABLE wp_buildings (
       id          INT AUTO_INCREMENT PRIMARY KEY,
       name        VARCHAR(255) NOT NULL,
       geometry    JSON         NOT NULL,
       category_id INT          NOT NULL,
       FOREIGN KEY (category_id) REFERENCES wp_building_category(id)
   );
   ```

3. **Configure the database connection.** Edit `core/config.php` and set `$HOST`, `$DB`, `$DB_USERNAME`, `$DB_PASSWORD`. The shipped defaults use `root` with no password — do not use these outside of local development.

4. **Point the frontend at the API.** Edit `public/assets/js/config.js` and set `api.baseUrl` to wherever `index.php` is served. The default is `http://localhost/api-map`.

5. **Serve it.** Any server that can run PHP works. Minimal example:

   ```bash
   php -S localhost:8000
   ```

   Then open `http://localhost:8000/public/index.html`.

6. **(Optional) Install npm dependencies.** The UI works without this step because it loads Leaflet from a CDN. If you want local copies:

   ```bash
   cd public
   npm install
   ```

## API reference

All responses are JSON. The router is defined in `index.php:21-43`.

| Method | Path             | Handler                            | Body                                                                  |
| ------ | ---------------- | ---------------------------------- | --------------------------------------------------------------------- |
| GET    | `/buildings`     | `BuildingHandler::getAll`          | —                                                                     |
| POST   | `/buildings`     | `BuildingHandler::create`          | `{ "name": string, "category_id": int, "geometry": GeoJSON-string }` |
| DELETE | `/buildings/:id` | `BuildingHandler::delete`          | —                                                                     |
| GET    | `/categories`    | `CategoryHandler::getAll`          | —                                                                     |
| POST   | `/categories`    | `CategoryHandler::create`          | `{ "name": string, "color": "#rrggbb" }`                              |
| PUT    | `/categories/:id`| `CategoryHandler::update`          | `{ "name": string, "color": "#rrggbb" }`                              |
| DELETE | `/categories/:id`| `CategoryHandler::delete`          | —                                                                     |

`GET /buildings` returns categories with their buildings nested:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Warehouses",
      "color": "#ff6600",
      "buildings": [
        { "id": 7, "name": "Aria", "geometry": { "type": "Feature", "...": "..." }, "category_id": 1 }
      ]
    }
  ]
}
```

**Known API gap:** the frontend's `Building.update()` method at `public/assets/js/modules/building.js:38` sends `PUT /buildings/:id`, but no such route is registered in `index.php`. The update path is effectively dead code — see [Roadmap](#roadmap--known-issues).

## Project structure

```
.
├── index.php                       # API entry point: CORS headers, router wiring
├── core/
│   ├── config.php                  # Hardcoded DB credentials (see Roadmap)
│   └── router.php                  # Regex-based request router
├── handler/
│   ├── building-handler.php        # CRUD for wp_buildings
│   └── categories-handler.php      # CRUD for wp_building_category
├── public/
│   ├── index.html                  # UI shell: header, map, modals, legend
│   ├── package.json                # Leaflet + Leaflet.Draw + Vite (dev)
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── main.js             # MapApplication orchestrator
│           ├── config.js           # API base URL + map defaults
│           ├── services.js         # Thin fetch wrapper (ApiService)
│           └── modules/
│               ├── map.js          # Leaflet init, rendering, draw events
│               ├── building.js     # Buildings API client
│               ├── building-category.js  # Categories API client
│               └── ui.js           # Modals, forms, toasts, legend DOM
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## Roadmap / known issues

Grouped by category, roughly in priority order. Line references are against the current `main` branch.

### Security — fix before any public deployment

- **Hardcoded DB credentials** in `core/config.php:3-6` default to `root` with no password. Move to environment variables or a gitignored config file.
- **Wildcard CORS** at `index.php:7` (`Access-Control-Allow-Origin: *`) combined with no authentication means any website can create, edit, or delete data against this API.
- **No authentication or authorization** on any endpoint in `index.php`. All routes are world-writable.
- **DOM XSS**: user-supplied `building.name` is interpolated into an HTML template at `public/assets/js/modules/map.js:86`; `category.color` is inlined into a `style` attribute at `public/assets/js/modules/map.js:157` and `public/assets/js/modules/ui.js:175`. Escape or use `textContent` / validated color values.
- **Inline `onclick`** at `public/assets/js/modules/map.js:89` relies on a global `window.deleteBuilding` registered in `main.js:215`. Replace with event delegation and a CSP-friendly handler.
- **No CSRF protection** on state-changing routes.

### Correctness

- **Dead PUT route for buildings.** `public/assets/js/modules/building.js:38-54` calls `PUT /buildings/:id`, but no such route exists in `index.php`. Either register the route and add a handler, or delete `Building.update()`.
- **Form validators never called.** `UI.validateBuildingForm()` and `UI.validateCategoryForm()` at `public/assets/js/modules/ui.js:205-235` are defined but no call site exists in `main.js`. Today the HTML `required` attributes do the work; either wire the validators in or remove them.
- **`UI.setupKeyboardShortcuts()`** at `public/assets/js/modules/ui.js:253-262` is never invoked — Escape does not close modals.
- **Debug `console.log`** leftovers at `public/assets/js/main.js:155-156`.
- **Silent failure path:** `Building.getAll()` at `public/assets/js/modules/building.js:10-16` returns `[]` on error with no user-visible signal.

### Performance

- **N+1 query** in `BuildingHandler::getAll()` at `handler/building-handler.php:14-19`: one categories query, then one buildings query per category. Replace with a single `JOIN` and group in PHP.
- **No database indexes documented.** `wp_buildings.category_id` should be indexed.
- **No response caching / ETag** on `GET` endpoints.

### Accessibility

- `<dialog>` elements in `public/index.html:47`, `:111`, `:166` have no `aria-labelledby` and no focus trap.
- Legend uses color-only swatches alongside text; check contrast ratios for user-picked colors.

### WordPress compliance

The repo name implies a WordPress plugin, but there is no plugin header, no hooks, no `register_rest_route`, no `current_user_can` checks, no text domain, no `readme.txt`. Either:

1. Rename / rebrand as a standalone map app (simpler), or
2. Rewrite the backend against WordPress APIs: register a plugin header in `index.php`, move routes to `register_rest_route`, use `wpdb` instead of a raw PDO connection, add nonces and capability checks, and add a `readme.txt` in WordPress.org format.

### Dev tooling

- **Vite is declared but unused.** Either delete the devDependency from `public/package.json` or add a real build pipeline.
- **`.gitignore` is minimal.** Currently ignores only `.htaccess` and `**/node_modules`; should also cover `.env`, `.DS_Store`, `.vscode/`, `.idea/`, `*.log`.
- **No tests, no linter, no CI.**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, coding style, and PR conventions. The Roadmap section above is a good place to find self-contained first issues.

## License

MIT &copy; 2026 Altaf Syahrastani. See [LICENSE](LICENSE).
