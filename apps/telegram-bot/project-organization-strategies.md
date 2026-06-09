# Feature-based vs Layer-based Organization

A reference for deciding *where a file goes* and *how to group code* as a
project grows. Written against the `donbass-post` telegram-bot, but the
reasoning is general.

---

## The core distinction

There are two dominant ways to organize a codebase. They answer the same
question — "what folder does this file belong in?" — with two different rules.

**Layer-based** groups files by their *technical role*:

```
src/
├── services/      ← all DB/business logic, regardless of domain
├── types/         ← all type definitions, regardless of domain
├── middleware/    ← all middleware
├── formatters/    ← all formatters
└── commands/      ← all command handlers
```

The rule: *"What kind of thing is this?"* → a service goes in `services/`,
a type goes in `types/`.

**Feature-based** groups files by their *domain* (the business concept they
serve):

```
src/
├── rbac/          ← guards, service, cache, types — all RBAC code together
├── notifications/ ← formatters, service, types — all notification code together
└── managers/      ← commands, service — all manager code together
```

The rule: *"What feature does this belong to?"* → anything about RBAC goes
in `rbac/`, no matter whether it's a service, a type, or a guard.

---

## The same code, both ways

Your RBAC code currently lives **layer-based** — scattered across folders by role:

```
src/commands/guards.ts          ← userHasPermission, userHasRole
src/services/rbac.service.ts    ← getUserPermissions (DB queries)
src/services/rbac.cache.ts      ← the in-memory cache
src/types/rbac.ts               ← Permission, Role, WILDCARD
```

The **feature-based** version of the *exact same code*:

```
src/rbac/
├── guards.ts      ← userHasPermission, userHasRole
├── service.ts     ← getUserPermissions
├── cache.ts       ← the in-memory cache
└── types.ts       ← Permission, Role, WILDCARD
```

Nothing about the code changes — only its location. That's the whole point:
organization is about *findability and change-locality*, not behavior.

---

## When each strategy wins

### Layer-based wins when:

- **The project is small.** Few features, so "all services in one folder" is
  still easy to scan. (Your project is here.)
- **You're learning the codebase / language.** Layers map to concepts you
  already know ("this is a service, this is a type"), lowering cognitive load.
- **Infrastructure dominates.** When most code is cross-cutting plumbing
  (HTTP router, DB client, config, middleware) rather than distinct business
  domains, layers reflect reality.
- **Features are thin.** If each "feature" is just one service function and one
  type, a feature folder would hold two files — not worth the nesting.

### Feature-based wins when:

- **Features are thick and independent.** Each domain has its own commands,
  services, types, validators — enough that grouping them cuts navigation.
- **You change one feature at a time.** If a typical task is "add a field to
  notifications," having every notification file in one folder means you edit
  in one place instead of jumping across `services/`, `types/`, `formatters/`.
- **Multiple people / future-you work in parallel.** Feature folders create
  natural ownership boundaries and reduce merge collisions.
- **You want deletability.** Removing a feature = deleting one folder. With
  layers, a feature's pieces are spread out, so removal means hunting.

---

## The signal you've outgrown layer-based

Watch for these. Any one is a nudge; several together mean it's time:

1. **One change touches many folders.** Editing the RBAC feature makes you open
   `commands/`, `services/` (twice), and `types/`. The feature is *conceptually*
   one thing but *physically* four.
2. **A layer folder spans unrelated domains.** Your `services/` holds
   `manager-preferences`, `notification`, `rbac`, `rbac.cache` — four files
   about three unrelated concerns. When `services/` hits ~15–20 files across
   many domains, scanning it stops being useful.
3. **"Where does this go?" gets ambiguous.** A file that's both "a guard" and
   "RBAC" has two plausible homes under layers (`commands/guards.ts` vs a future
   `rbac/`). Feature-based removes the ambiguity: it's RBAC, full stop.

You are seeing a mild version of #1 and #2 with RBAC right now — which is
exactly why `rbac/` is a sensible *first* feature folder, even while the rest of
the app stays layered.

---

## The hybrid (what most real projects actually do)

You rarely pick one purely. The common, healthy shape is:

```
src/
├── rbac/            ← FEATURE: cohesive domain, grouped together
├── notifications/   ← FEATURE: cohesive domain, grouped together
│
├── lib/  or  core/  ← SHARED infra used by all features
│   ├── prisma/      (db client)
│   ├── config.ts
│   └── router.ts
├── middleware/      ← cross-cutting, not owned by one feature
└── server.ts        ← entrypoint
```

The rule of thumb for the split:

- **Owned by exactly one domain?** → put it in that feature folder.
- **Shared across many features (infra/plumbing)?** → keep it layered in
  `lib/` / `core/` / `middleware/`.

This is the "narrowest owner until shared" principle applied at the folder
level: code lives with its feature until enough features need it, then it
graduates to shared infrastructure.

---

## Decision heuristic (the short version)

Ask, in order:

1. **Is this shared infra (db, config, http, logging)?**
   → layered `lib/` folder. Done.
2. **Does it clearly belong to one domain, and does that domain already have
   (or deserve) 3+ files?**
   → feature folder.
3. **Otherwise (small, thin, or you're unsure)?**
   → layered. Don't over-structure ahead of need.

And the meta-rule that prevents the mess you felt:

> **Never keep `x.ts` and `x/` side by side.** A lone file is fine until it
> gains a sibling; then promote it to a folder. Ambiguity comes from
> half-finished promotions, not from choosing the "wrong" strategy.

---

## Applied to your telegram-bot

**Recommendation: stay layered for now.** The project is small enough that
layers are still easy to navigate, and you're actively learning. Forcing
feature folders everywhere would add nesting without payoff.

**The one exception worth doing when it itches:** consolidate RBAC into
`src/rbac/` (guards + service + cache + types). It's your first domain thick
enough to justify a feature folder, and it's the one you currently feel
scattered. You've already staged the copy — flipping the imports is a clean,
isolated commit whenever you want it.

**Don't** feature-folder notifications or managers yet — they're not painful
enough. Wait for the signal (a change that makes you open three folders).

The takeaway: organization is a *gradual, reactive* process. You don't design
the perfect tree upfront. You start layered, and you promote a feature folder
the moment a domain's pieces start feeling scattered. Reacting to real pain
beats predicting it.
