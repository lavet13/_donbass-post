# Web app — TODO

Backlog + progress log for apps/web (and the shared packages/ui and packages/forms it renders). Same conventions as apps/telegram-bot/todo.md.

---

## Remaining — do next

(nothing queued)

## Structural cleanup

- [ ] **Yarn 4.12.0 → 4.18.1** as its own chore commit: `yarn set version 4.18.1`, remove the old `.yarn/releases/yarn-4.12.0.cjs` if it stays, `yarn install`. Safe: the Dockerfile and the bot deploy copy `.yarn/releases/` wholesale, and neither deploy workflow triggers on the root package.json or yarn.lock.
- [ ] **14 pre-existing lint problems** (9 errors) in 7 files under apps/web/src (`yarn workspace @donbass-post/web lint`). Were 19 in 11 files; the rest went with the deleted duplicate copies.

## CI / infra

- [ ] **nginx marks unhashed public files immutable for a year.** `location ~* \.(js|css|png|jpg|svg|ttf|woff2)$` also matches public/ files without a content hash (logomini_np-bsd.png, fonts/), so a replaced logo never reaches returning visitors. Narrow it to `/assets/`.
- [ ] **Register the site with the search engines** (needs your accounts). Add donbass-post.duckdns.org to Yandex Webmaster and Google Search Console and submit /sitemap.xml in both. In Yandex Webmaster, set JavaScript rendering to "Запретить рендеринг": the public pages are prerendered now, and Yandex's own guidance is to disable rendering in that case.
- [ ] **Prerendered pages contain no fetched data.** Schedules, tracking results and department lists load through React Query in the browser, so crawlers see the page text and form labels, not the list of branches. If branch addresses should be searchable, fetch them at build time in scripts/prerender.mjs and seed the QueryClient before rendering /schedules.

## Done

- 2026-10-19 — fix(ui): Radix primitives imported from the declared radix-ui package (~1.4.3), not Themes' hoisted sub-packages
- 2026-10-19 — fix(ui): navigation menu panel sized to content in Firefox (max-height: fit-content acts as none in the block axis there)
- 2026-10-19 — fix(web): lang ru, brand favicon, GitHub Pages redirect leftovers removed
- 2026-10-19 — feat(web): per-route title/description/Open Graph; noindex on /auth, dashboard and the 404 page
- 2026-10-19 — feat(web): robots.txt and sitemap.xml for donbass-post.duckdns.org
- 2026-10-19 — feat(web): home page linking every public service (replaced the placeholder)
- 2026-10-19 — build(ui): Tailwind @source for packages/ui and packages/forms; package-only classes were never generated
- 2026-10-19 — refactor(web): deleted ten unused copies (main-nav, navigation-menu, border-beam, main-sidebar, hover-card, input, toast)
- 2026-10-19 — refactor(web): collapsible, drawer, label, password-toggle-field now from @donbass-post/ui (copies were identical)
- 2026-10-19 — refactor(web): last eight UI copies (auto-dismiss-message, autosize-textarea, command, radio-group, toggle, tabs, resizable, sidebar) now from @donbass-post/ui; they differed only in import paths and class order
- 2026-10-19 — refactor(web): every form runs on @donbass-post/forms (one commit: separate React contexts); web forms layer deleted
- 2026-10-19 — fix(forms): package validatePickupTime matched the old "с … до" format, not the field's HH:MM - HH:MM mask
- 2026-10-19 — refactor(web): lib/utils and duplicated hooks deleted in favour of the packages; packages/ui sidebar no longer imports through the app's "@/" alias
- 2026-10-19 — refactor: no browser-only globals during render (cssVar helper, resolvedTheme in the three theme toggles)
- 2026-10-19 — refactor(web): Yandex map lazy-loaded inside <ClientOnly> (its module touches document on import)
- 2026-10-19 — feat(web): build prerenders the six public pages (client build + vite build --ssr + scripts/prerender.mjs); dist/spa.html for client-only routes
- 2026-10-19 — feat(nginx): try_files serves prerendered pages, then the SPA shell, then index.html (safe in either deploy order)
