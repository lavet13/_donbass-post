# Where does this code go?

A reference for deciding _where a file belongs_ as the project grows. Written
against the `donbass-post` telegram-bot; the reasoning is general.

The whole document answers one question — "what folder does this file go in?"
— and the answer always comes from two independent axes. Learn the axes, then
the procedure, then the folder strategy. Everything else is examples.

---

## The two axes (this is the core — everything follows from it)

Every file's home is decided by two questions that are INDEPENDENT of each
other. Most "where does this go?" confusion comes from collapsing them into one.

### Axis 1 — KIND: what does it DO? (decides util vs service vs type vs handler)

- **Pure helper** — output depends only on its input; changes nothing outside
  itself. No I/O, no side effects. Deterministic: same input → same output,
  forever.
- **Service** — does I/O or has side effects: reads/writes the DB, calls a
  network API, reads env/clock, mutates shared state.
- **Type** — only describes a shape; no code runs.
- **Handler** — an entry point the outside world triggers (HTTP route, Telegram
  command, middleware). Thin: parse → call a service → reply.

Two terms worth nailing, because they define the pure/service line:

- **I/O** = talking to anything OUTSIDE the function's own arguments and return
  value — a file, the DB, `fetch`, `process.env`, `Date.now()`, a log. If the
  function reaches out to get something it wasn't handed, that's I/O.
- **Side effect** = CHANGING something outside itself — a DB write, mutating a
  shared variable, a console log. Building and returning a _new_ object is not a
  side effect; mutating the argument would be.

A function with neither is **pure**.

> **Worked example — `slimTrackData(data)`:** it strips the SEO blob from a
> track.global payload. It touches only its `data` argument (no DB, no clock, no
> env) and returns a _new_ object, mutating nothing. No I/O, no side effects →
> **pure helper**.
>
> **Contrast — `isFresh(row)`:** looks similar, but it calls `Date.now()` —
> reading the clock is I/O. So `isFresh` is technically _impure_, even though it
> does no DB work. This matters less than you'd think (see Axis 2), but it's why
> "looks like a helper" isn't the same as "is pure."

### Axis 2 — SCOPE: who OWNS it? (decides generic `utils/` vs feature folder)

- **Generic** — knows nothing about your business. A chat id is just an integer;
  a date is just a date. Copy-pasteable into any project unchanged.
- **Domain-owned** — knows a specific business concept's shape or rules.
- **Shared infra** — plumbing many domains depend on (db client, router, config,
  logger).

> **The trap that bites everyone:** assuming _pure ⇒ generic `utils/`_. They're
> different axes. `slimTrackData` is pure (Axis 1) but it KNOWS track.global's
> payload shape — that `found_in_services` and `full_text` exist (Axis 2:
> domain-owned). A pure-but-domain-specific function does NOT go in generic
> `utils/`; it lives with its feature.

### The two axes crossed → the folder

|                   | generic              | domain-owned                     | shared infra     |
| ----------------- | -------------------- | -------------------------------- | ---------------- |
| **pure helper**   | `utils/`             | feature folder (`track-global/`) | `lib/` / `core/` |
| **service** (I/O) | rare — usually infra | feature folder or `services/`    | `lib/` / `core/` |
| **type**          | `types/` or inline   | feature folder `types.ts`        | `lib/` types     |
| **handler**       | —                    | `routes/` / `commands/`          | —                |

> **`slimTrackData`:** pure (row 1) × domain-owned (col 2) → **feature folder**
> → `track-global/service.ts`, beside `isFresh`. Note `isFresh` lands in the
> _same cell_ for a slightly different reason: it's impure (the clock) but also
> domain-owned, and impure × domain → feature folder too. Different rows, same
> destination — which is exactly why co-locating them is right.
>
> **`parseInteger`:** pure × generic (a number is a number) → **`utils/`**.
> Same KIND as `slimTrackData` (both pure helpers), opposite SCOPE → opposite
> home. That's the two axes doing their job.

---

## The procedure (run top to bottom, stop at the first match)

**Step 1 — Say the file's job in ONE sentence using ONE noun:**
util / type / handler / service. If you need "and" ("it validates _and_ saves"),
it's two jobs — split it first, then place each half. Most placement confusion
is really an unsplit file.

**Step 2 — Classify KIND (Axis 1):**

- describes a shape, no code runs → **type**
- triggered by an external event (request, message) → **handler** (keep it thin)
- reaches outside its args / changes outside state → **service**
- output depends only on input, changes nothing → **pure helper**

**Step 3 — Classify SCOPE (Axis 2):**

- knows nothing about the business → **generic**
- knows a domain's shape or rules → **domain-owned**
- plumbing many domains use → **shared infra**

**Step 4 — Cross them in the table above to get the folder.**

**Step 5 — Apply the "3+ files" gate before making a NEW feature folder.**
A domain earns its own folder once ~3 related files exist. Below that, a
domain-owned file can sit in the layered folder (`services/rbac.service.ts`)
until siblings accumulate. Never keep `x.ts` and `x/` side by side — promote
fully or not at all; half-finished promotions are where ambiguity comes from.

**Step 6 — Sanity-check with the smells (if one fires, you misclassified in
Step 2 — go back):**

- a "util" that imports `prisma` → it's a service
- a "service" that parses `ctx.message.text` → handler logic leaked in
- a handler with 40 lines of DB code → extract a service and call it
- a file you can't name with one noun → it's doing two jobs

> **Full worked example — `slimTrackData`:**
> Step 1: "reshapes a track.global payload" — one noun, _helper_.
> Step 2: touches only its arg → pure helper.
> Step 3: knows `found_in_services`/`full_text` → domain-owned.
> Step 4: helper × domain-owned → feature folder.
> Step 5: track-global now has `types.ts` + `service.ts` + this ≈ 3 → folder
> justified. → **`src/track-global/service.ts`**. Done.

---

## Layer-based vs feature-based (the folder strategy this all feeds)

The table decides a file's KIND-folder (`utils/`, `services/`, `types/`). This
section decides whether those live _by role_ (layer-based) or _by domain_
(feature-based).

**Layer-based** groups by technical role — all services together, all types
together:

```
src/
├── services/   ← all business logic, any domain
├── types/      ← all shapes, any domain
├── middleware/
└── commands/
```

**Feature-based** groups by domain — everything about one concept together:

```
src/
├── rbac/          ← guards + service + cache + types, all RBAC
├── notifications/ ← formatters + service + types, all notifications
└── track-global/  ← service (isFresh, slimTrackData) + types
```

Same code either way — only the location changes. Organization is about
_findability and change-locality_, not behavior.

### Which to use, and when to switch

**Layer-based wins** while the project is small, you're still learning it,
infrastructure dominates, or features are thin (one service + one type each).
**Your project is mostly here — stay layered by default.**

**Feature-based wins** when features are thick and independent, you change one
feature at a time, or you want deletability (remove a feature = delete a folder).

**The signal you've outgrown layers** — any one is a nudge, several mean act:

1. One change makes you open many folders (RBAC = `commands/` + `services/`×2 +
   `types/`). Conceptually one thing, physically four.
2. A layer folder spans unrelated domains (`services/` holds manager, notification,
   rbac… — when it hits ~15–20 files across many domains, scanning stops helping).
3. "Where does this go?" gets ambiguous (a file that's both "a guard" and "RBAC"
   has two plausible homes; a feature folder removes the ambiguity).

### The hybrid most real projects land on

```
src/
├── rbac/            ← FEATURE: cohesive domain
├── track-global/    ← FEATURE: cohesive domain
├── lib/ or core/    ← SHARED infra (prisma, config, router)
├── utils/           ← generic pure helpers (parseInteger)
├── middleware/      ← cross-cutting, no single owner
└── server.ts        ← entrypoint
```

Rule: **owned by exactly one domain → its feature folder; shared by many →
layered infra.** This is "narrowest owner until shared" at the folder level —
code lives with its feature until enough features need it, then graduates to
`lib/`.

### Applied to donbass-post today

- **Stay layered by default** — small, still learning; forcing feature folders
  everywhere adds nesting without payoff.
- **`rbac/` is the first feature folder worth making** — it's the domain thick
  enough (guards + service + cache + types) that you already feel it scattered.
- **`track-global/` is the second** — it grew to service + types this session.
- **Don't** feature-folder notifications/managers yet — wait for the signal.

Organization is _gradual and reactive_: start layered, promote a feature folder
the moment a domain's pieces feel scattered. Reacting to real pain beats
predicting it.
