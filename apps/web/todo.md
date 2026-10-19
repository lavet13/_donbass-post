# Web app — TODO

Backlog + progress log for apps/web (and the shared packages/ui and packages/forms it renders). Same conventions as apps/telegram-bot/todo.md.

---

## Remaining — do next

- [ ] **Finish moving apps/web onto packages/ui.** apps/web/src/components/ui duplicated the package; every fix had to land twice (the radix-ui import fix touched 29 files instead of ~15, the Firefox menu fix two). Dead copies and identical ones are done (see Done). What's left are copies that drifted, so each needs a decision, not a mechanical swap:

      | Component          | Web importers | Lines differing | Note                                              |
      |--------------------|---------------|-----------------|---------------------------------------------------|
      | auto-dismiss-message | 7           | 8               | `use-auto-dismiss.tsx` inside it is identical      |
      | autosize-textarea  | 1             | 4               |                                                   |
      | command            | 2             | 6               | combobox-field, schedules                         |
      | tabs               | 1             | 20              | /auth; biggest drift, compare behaviour in browser |
      | toggle             | 1             | 6               | online-pickup-rf form                             |
      | radio-group        | 1             | 4               | radio-group-field                                 |
      | resizable          | 1             | 12              | only used by web's sidebar.tsx                    |
      | sidebar.tsx        | 1             | —               | packages/ui has sidebar/index.tsx; diff those two  |

      Per component: diff the two files, keep the newer behaviour in packages/ui, switch the importers to `@donbass-post/ui/<name>`, delete the web copy. One commit each; check `yarn turbo run check-types --filter=@donbass-post/web` and click the importing page before committing. Tailwind now scans packages/ui (`@source` in its stylesheet), so deleting a web copy can no longer drop CSS.

- [ ] **Move apps/web's forms layer onto packages/forms.** apps/web/src/components/forms (13 field components + field-groups), components/ui/form.tsx and hooks/form-context duplicate packages/forms; the web app imports the package in only 4 files. form.tsx is NOT web-only: it equals packages/forms' form-primitives except that it reads `useFieldContext` from the web copy of form-context. Field components find their form through React context, and the two copies create different context objects, so a form built with web's `useAppForm` cannot render the package's fields. Migrate one form (route) at a time: switch its `useAppForm` and all of its fields together, then delete the web copies once nothing imports them.

## Structural cleanup

- [ ] **Yarn 4.12.0 → 4.18.1** as its own chore commit: `yarn set version 4.18.1`, remove the old `.yarn/releases/yarn-4.12.0.cjs` if it stays, `yarn install`. Safe: the Dockerfile and the bot deploy copy `.yarn/releases/` wholesale, and neither deploy workflow triggers on the root package.json or yarn.lock.
- [ ] **19 pre-existing lint problems** (10 errors) in 11 files under apps/web/src (`yarn workspace @donbass-post/web lint`). Present on main before the SEO and dedupe work.

## CI / infra

- [ ] **nginx marks unhashed public files immutable for a year.** `location ~* \.(js|css|png|jpg|svg|ttf|woff2)$` also matches public/ files without a content hash (logomini_np-bsd.png, fonts/), so a replaced logo never reaches returning visitors. Narrow it to `/assets/`.
- [ ] **Decide on prerendering after measuring.** Add donbass-post.duckdns.org to Yandex Webmaster and Google Search Console; use their page checks to see what the robots get. Prerender only if public pages come back empty in Yandex, and then only the mostly-text pages (home, schedules) using the portfolio's approach. Yandex: disable its JS rendering if we prerender.

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
