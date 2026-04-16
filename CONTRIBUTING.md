# Contributing

Thanks for your interest in improving `wordpress-polygon-plugin`. This guide covers local setup, the workflow for proposing changes, and the coding conventions the current codebase follows.

## Local development setup

1. **Fork and clone** the repo.
2. **Stand up a local LAMP-like environment** — any PHP 7.4+ setup with MySQL/MariaDB works. For a quick-start without Apache/Nginx:

   ```bash
   php -S localhost:8000
   ```

3. **Create the database** and the two tables (`wp_building_category`, `wp_buildings`) using the SQL in [README.md → Installation](README.md#installation).
4. **Configure** `core/config.php` with your local DB credentials. Never commit real credentials.
5. **Point the frontend at your API** by editing `public/assets/js/config.js` (`api.baseUrl`).
6. **(Optional)** `cd public && npm install` if you want local copies of Leaflet / Leaflet.Draw. The shipped HTML loads them from a CDN so this step is not required for most changes.

Open `public/index.html` in a browser and confirm the map loads, you can create a category, draw a polygon, and save it as a building.

## Workflow for changes

1. **Open an issue first** for non-trivial work — especially anything in the README's Roadmap. A short comment with your intended approach avoids duplicated effort.
2. **Branch from `main`.** Use a descriptive name, e.g. `fix/xss-building-name`, `feat/put-building-route`.
3. **Keep PRs focused.** One concern per PR — a security fix shouldn't also refactor unrelated modules.
4. **Write commit messages in the imperative mood** with a short subject line (under ~72 chars). Add a body if the change needs context.

   ```
   Escape building name in map popup

   The popup HTML in map.js:86 interpolated building.name without
   escaping, allowing stored XSS. Switch to textContent and rebuild
   the popup from DOM nodes.
   ```

5. **Open a PR against `main`.** Describe what changed, why, and how you tested it. Link the issue if there is one.

## Coding style

No linter is configured yet, so "match the surrounding file" is the rule.

- **PHP:** 4-space indentation, opening brace on its own line for class/method definitions (see `handler/building-handler.php`). Use PDO prepared statements for any new queries.
- **JavaScript:** 2-space indentation, single quotes, no semicolons at end of line (see `public/assets/js/main.js`). ES modules only; no CommonJS.
- **HTML / Tailwind:** keep classes readable; break long class lists onto separate lines when it helps.

If you add new files, mirror the conventions of files in the same directory.

## Things that will get a PR merged quickly

- Anchored fixes for items in the [README Roadmap](README.md#roadmap--known-issues) — especially the Security group.
- Small, self-contained patches (e.g. removing the debug `console.log` at `public/assets/js/main.js:155-156`, or wiring `UI.setupKeyboardShortcuts()`).
- Docs improvements: screenshots for the README, a `schema.sql` dump, an `.env.example` scaffold.

## Things that will need more discussion before merging

- Renaming or rebranding the project.
- A full migration to real WordPress plugin APIs (hooks, `register_rest_route`, `wpdb`).
- Adopting a build tool (Vite is listed but unused — pick an approach and wire it consistently).
- Changing the DB schema.

Please open an issue for these before spending significant time on a PR.

## Reporting bugs

Include, at minimum:

- PHP version (`php -v`), MySQL/MariaDB version.
- Browser + version, and whether the browser console shows errors.
- The exact steps to reproduce.
- What you expected vs. what happened.

## Security issues

The README's Roadmap lists known security gaps; those are fair game for public PRs. If you discover something **not** already listed that you believe needs private disclosure, email `syahrastanialtaf@gmail.com` instead of opening a public issue.

## Contact

Questions not suited to an issue: `syahrastanialtaf@gmail.com`.
