# Telegram Bot — TODO

Backlog + progress log. Tags follow the `todo-comments.nvim` convention (FIX/HACK/PERF/NOTE/TODO).

---

## Remaining — do next

- [ ] **verify OnlinePickup's remaining rules against its real producer** — whatsApp casing and
      pointTo-as-string confirmed; still unverified: whether the pointTo XOR pickupAddressRecipient
      and the 4-field customer all-or-nothing refines match what the old site actually sends. If it
      can send neither, the XOR 400s working traffic.
- [ ] **verify a COMPANY-branch pick-up-point submit end-to-end** — the payload now keys by mode
      (`companySender`/`companyRecipient`/`companyCustomer`) and the notify transform renames them
      back to `sender`/`recipient`/`customer`. Individual branch verified in prod; company branch
      only reasoned through. Confirm: workplace-post.ru 200 AND the notify lands with the renamed
      keys AND the manager message arrives.
- [ ] **TODO: lint for dead exports** — knip / ts-prune / eslint no-unused-exports, so the next
      orphaned export (like isManagerSubscribed) surfaces automatically (tsc won't — exports are
      assumed used).
- [ ] **PERF: `getAllManagers()` full-scan to resolve one chatId** in resolveManagerCommand —
      fine now; if managers grow, targeted findFirst({ chatId, isActive, userRoles some MANAGER })
      → { userId } | null. YAGNI.
- [ ] **restructure `notifications/types.ts`** — one file holds shared helpers
      (phone/email/text/inn/positive/validatePickupTime), three payload schemas, and their
      sub-objects (~400 lines). Split: `notifications/schemas/_helpers.ts` + one file per payload,
      re-exported from an index. Do it once the schemas settle — file moves are cheap, churn isn't.
- [ ] **`/api/notify` receives display STRINGS, not ids** — the old site resolves
      pointFrom/deliveryCompany to names (`${point.name}, ${point.address}`) before POSTing, so
      the bot prints text it can't join on. Migrate to sending raw ids + DB lookup at format time.
- [ ] **NOTE: old-site JS: recipient transform resolves pointTo OR deliveryCompany** (early
      return), never both — so deliveryCompany would ship as a raw id. Latent only: pointTo is
      never set for this endpoint today, so the branch never fires.
- [ ] **NOTE (cosmetic): pick-up-point schema messages say "2 символа", server says 3** — safe by
      construction (workplace-post.ru 400s first, so the bot's message never reaches a user).
      Bump to 3 only if the mismatch bothers you when reading the file.

## Needs a decision before it's a task

- [ ] **auth: JWT access+refresh vs server-side sessions, and a multi-provider identity model** —
      the bot has authorization (RBAC on chatId) but no authentication; Telegram *is* the identity
      provider today. Questions to answer FIRST, in order:
      1. Which surface actually needs a logged-in user? (apps/web? the mini-app?) If none, this is
         premature — it's blocked on the same thing as `packages/contracts`: owning the endpoint.
      2. Identity model before tokens: `User` ← `AuthIdentity(provider, providerId, userId)` so
         telegram / email / phone all resolve to one user. Current `telegramUser.chatId` is the
         one-provider version — widening it later is another staged migration.
      3. What does JWT buy over an opaque token in an httpOnly cookie + a `Session` row? One API,
         one consumer → stateless verification isn't worth much, and the refresh half is a session
         table anyway (rotation + revocation). `revokedAt` semantics already exist from the RBAC work.
      Provider notes: **Telegram Login Widget** is the cheap bridge — payload is HMAC-SHA256 signed
      with the bot token, verifiable server-side, links to the chatId already stored. **Phone** is
      possible two ways: the bot's `request_contact` button gives a Telegram-verified number for
      free (but only for existing bot users), or SMS OTP via a provider — costs money and needs one
      that delivers to RU/DNR numbers. **Email** needs a mail sender + verification flow.
      Scale/reversibility puts this at `docs/plans/` level if it ever goes ahead; consider moving
      to ideas.md until question 1 has an answer.

## Structural cleanup (reactive — pure file moves)

See `project-organization-strategies.md`.

- [ ] **TODO: `core/` for shared infra** (prisma/config/env/router/bot) — later,
      big import churn, only once feature folders exist to contrast against.
- [ ] **`packages/contracts` — share zod schemas between web + bot** — payload shape defined twice.
      A Yarn 4 workspace package (like @donbass-post/forms/ui) exporting the schemas; `z.infer`
      replaces both hand-written types. NOT gRPC — both sides are TS. **Blocked on owning the
      endpoint**: web POSTs to workplace-post.ru, and the bot's real client is the PHP site's JS,
      so a shared contract wouldn't bind either producer today. Do this WITH that migration.

## CI / infra

- [ ] **TODO: bump `actions/checkout@v4` → v5** (or newer) — deploy warns
      "Node.js 20 is deprecated … forced to run on Node.js 24" for checkout@v4.
      GitHub is removing Node 20 from runners. Update the pinned action version in
      `.github/workflows/telegram-bot-deploy.yml`. Low urgency (still runs), but
      clears the warning and avoids a future hard break.

## Known wrinkles (documented, fix when they cost)

- [ ] **HACK: `phone-field.tsx` casts `Input as InputComponent<...>`** — silences a
      react-phone-number-input vs FC return-type mismatch; the local `InputComponent` type
      duplicates the library's. If the lib's signature drifts, the cast hides it.
- [ ] **NOTE: `/api/notify`'s real client is the old PHP site's JS, not apps/web** — apps/web
      POSTs to workplace-post.ru (co-worker's backend). Always verify payload shapes against the
      old-site JS until the migration lands.
- [ ] **NOTE: pick-up-point form is ~1500 lines of imperative DOM rebuilding** — six near-identical
      change handlers, hand-rolled persistence, manual state replay. All of it is what the
      apps/web React replacement gives for free. Don't invest further beyond keeping it correct;
      the fix is the migration, not more patches.
- [ ] **TEST: removeManager's last-manager invariant is the first real test candidate** — guards
      a catastrophic silent state (zero managers → notifications go nowhere, only a warning
      logged), tricky logic, hard to reproduce by hand. Needs a real Postgres → integration test
      + test-DB scaffolding. Do it if/when that scaffolding exists.

## Backlog / low priority (non-bot infra)

- [ ] **NOTE: self-hosted Anki sync server on a VPS** (optional) — modern Anki ships
      `--syncserver`; run on a VPS + custom sync URL to keep review history off
      AnkiWeb. AnkiWeb is the zero-effort default and the privacy delta is small, so
      this is want-not-need. (Not bot code — parked here for lack of a better home;
      move if you keep a personal-infra list.)
- [ ] **NOTE: capture chmod / chown in bash-knowledge.md** — permissions (rwx, octal 755/644,
      symbolic u+x), ownership (chown user:group), -R recursive. Check existing bash-knowledge.md
      coverage first, then ref + cards.
- [ ] **NOTE: capture find `-path` vs `-name`, and `sed -n 'A,Bp'` line-range printing** in
      bash-knowledge.md when the chmod/chown one gets done.

## Done

- ✅ Soft-delete role revocation (revoked_at/grantedAt on UserRole)
- ✅ Notification subs: reads + writes migrated to NotificationPreferences;
  gated backfill verified (old=1, new=1)
- ✅ Deleted dead getRecipientsForType + getAllAvailableNotificationTypes
- ✅ Renamed subscription fns; getManagerSubscriptions rewritten via telegramUser (+ BigInt fix)
- ✅ assertNever exhaustiveness; env.ts emptyAsUndefined; RBAC → src/rbac/
- ✅ phone-field.tsx cast (forms package, unrelated)
- ✅ **PROD egress fixed** — grammY routed through NL SOCKS5 relay (socks5h);
  bot.init() wrapped in withTimeout; TELEGRAM_PROXY env-gated (inert in dev)
- ✅ **notifications/ + managers/ folder extraction** — subscription fns →
  notifications/, lifecycle fns → managers/
- ✅ **Legacy tables dropped** — Manager + ManagerNotificationPreferences,
  backed up (pg_dump -t) then dropped; seed cleaned; applied in prod, seed green
- ✅ db:migrate / db:generate scripts split (--name reaches migrate alone)
- ✅ docs/plans moved out of src/
- ✅ Split ref into prisma/typescript/db-migrations/rbac/devops + psql knowledge files
- ✅ **Version bumped** — tg-bot minor (migration + egress are user-facing) [2026-07-11]
- ✅ **Deploy skips docs-only pushes** — `!apps/telegram-bot/*.md` in the paths filter [2026-07-11]
- ✅ **getManagerRole NOT extracted → deleted** — relation-filter everywhere (`role:{name}`,
  `connect:{name}`, reactivation via fetched row's roleId); dropped role_not_found /
  manager_role_not_found tokens (role is seeded) [2026-07-11]
- ✅ **Handler arg-parsing extracted** — `commands/args.ts`: parseChatId (strict
  Number.isInteger), parseCommandArgs, resolveManagerCommand (discriminated-union Result);
  `isNotificationSlug` type guard; slug validation moved to command layer; fixed
  `/setpreferences <chatId>` clear-all [2026-07-11]
- ✅ **subscriptionErrorReply** — token→message via exhaustive switch + assertNever,
  extracted (arms identical across append/remove/set) [2026-07-11]
- ✅ **append/remove → single-row atomic ops** — createMany{skipDuplicates}/deleteMany with
  count-as-signal; killed the read-modify-write race; setManagerSubscriptions kept for
  /setpreferences [2026-07-11]
- ✅ **resolveManagerCommand returns userId** — append/remove dropped their redundant manager
  findUnique; getAllManagers → {chatId,userId}[] [2026-07-11]
- ✅ **Deleted orphaned isManagerSubscribed** — dead after the atomic count refactor [2026-07-11]
- ~~✅ Gated command registration (429 quick-fix) — REGISTER_COMMANDS flag~~
  → **REVERTED.** #1 not landed — gating dev hid useful signal; #3 was the real fix.
- ✅ **Manager double-check collapsed** — resolveManagerCommand returns userId; per-command
  findUnique gone (was the "verify twice" wrinkle) [2026-07-11]
- ✅ **#3 reactive command registration** — deleted per-manager boot loop; set scope in
  /addmanager (all 3 add outcomes), clear in /removemanager (revoked); setCommandsForChat
  bot→api; symmetric per-language clearCommandsForChat. Closes menu-source mismatch. [2026-07-11]
- ✅ **#2 hash-gated boot registration — considered, YAGNI** — after #3, residual is ~12 fixed
  prod-only calls on rare restarts, under the limit; a persisted checksum can desync from
  Telegram's real state. Not worth the complexity at this scale. [2026-07-11]
- ✅ **Dropped AppConfig.managers, manager count from DB** — status.ts/server.ts →
  getAllManagers().length; config field + mapping removed; MANAGER_CHAT_IDS kept for seed
- ✅ **zod validation for `/api/notify/*`** — schemas at the handler boundary, hand-written payload
  interfaces → `z.infer`, `!payload[f]` falsy-check bug gone [2026-07-12]
- ✅ **extract `handleNotify()`** — 3 handlers ~45 identical lines each → generic helper (~135 → ~35);
  schema↔sender mismatch is now a compile error [2026-07-12]
- ✅ **port `validatePickupTime`** — via `.superRefine` (message-returning fn drops straight in);
  regex anchored, since the server has no input mask [2026-07-12]
- ✅ **fix(web): customer phone bound to `phoneSender`** — overwrote the sender's phone;
  `phoneCustomer` never populated [2026-07-12]
- ✅ **fix: formatter printed sender's pointFrom as the recipient's pickup point** [2026-07-12]
- ✅ **Corrected /api/notify payload shapes to the real producer** — z.union per sub-object
  (sender/recipient/customer are one key, two shapes); XOR refines deleted (the union carries it);
  formatters narrow with `in`; pointFrom/pointTo/deliveryCompany are display strings [2026-07-12]
- ✅ **fix: whatsapp casing in formatters** — client sends whatsApp*; formatter read whatsapp* [2026-07-12]
- ✅ **REGISTER_COMMANDS removed from env.ts** — no dead config left from the reverted #1 gate;
  verified absent from src/ [2026-07-12]
- ✅ **NODE_ENV self-removal gate → "would this leave zero active managers?" count invariant** —
  in removeManager (service), counted + written in one transaction; last_manager token +
  assertNever; "active manager" now defined identically across all queries [2026-07-12]
- ✅ **set/clearCommandsForChat are best-effort** — own try/catch; a failed menu push no longer
  reports a committed add/remove as ❌ (fixes /addmanager <fake chatId> for testing) [2026-07-12]
- ✅ **fix(notes): psql connect command** — `docker compose exec … -U "$POSTGRES_USER"` expanded on
  the HOST (empty); corrected to `sh -c '…'` so the container expands its own env [2026-07-12]
- ✅ **online-pickup-rf notify outage closed** — pickupTime regex expected Cyrillic but the form's
  Inputmask emits "HH:MM - HH:MM"; shippingPayment enum drift; phone national-format rejection.
  Anchored regex + `.string().min(1)` + `defaultCountry:"RU"`; prod-verified both modes [2026-07-18]
- ✅ **dimensions no longer required** — длина/ширина/высота are computation inputs, not fields;
  cubicMeter's `>0` is the single volume invariant. cubicMeter locked via readOnly (online-pickup
  builds its payload from FormData, and `disabled` drops a control from FormData) [2026-07-19]
- ✅ **validation harvest against workplace-post.ru** — degenerate payloads → 400s revealed the real
  ruleset (min-3 names/addresses, min-9 phones). Proved the bot was STRICTER than the gate [2026-07-23]
- ✅ **notify schemas aligned to the gate** — four `textNtoM` helpers → one
  `text(min, required, minMsg)`; every pick-up-point field min-2 (looser than the server's 3, so
  the server rejects first); online-pickup matched to its own form [2026-07-23]
- ✅ **payload keyed by mode** — `[isCompanySender ? "companySender" : "sender"]: data` (+ recipient,
  customer) per the workplace-post.ru API spec; notify transform renames company keys back on
  EVERY return path (the early returns for pointFrom/deliveryCompany were skipping it) [2026-07-23]
- ✅ **old-site JS: company customers no longer dropped** — the payload gate was `inputs.nameCustomer`
  (only present in the individual markup); now `fields.some(f => f === "nameCustomer" ||
  f === "companyCustomer")` [2026-07-23]
- ✅ **pick-up-point: client validation deleted, server errors rendered** — clearAllErrors removes
  ALL `.form-error-message` spans (the old code removed one nextElementSibling → duplicates piled
  up on resubmit); renderServerErrors joins per field, `path.split('.').pop()` for nested keys,
  focuses the first invalid [2026-07-23]
- ✅ **pick-up-point: event delegation** — form-level input/change/keyup listeners replaced per-input
  binding; every `inputs = {…}` map deleted (7 copies, several hundred lines), grep-verified zero
  [2026-07-23]
- ✅ **pick-up-point: persistence** — per-form STORAGE_KEY; phones survive reload AND section toggle
  (keyup only fires on real keystrokes, never on programmatic mask init); toggle/customer/service
  state replayed via `__senderMode`/`__recipientMode`/`__customerMode`/`__customerOpen`/`__services`
  + `dispatchEvent('change')`; replay moved to the END of ready (the `#customer-toggle` listener is
  registered near the bottom of the file) [2026-07-23]
- ✅ **AutoNumeric fields handled generically** — `AutoNumeric.isManagedByAutoNumeric(el)` /
  `getAutoNumericElement(el).set()/.getNumber()` instead of a hardcoded list of numeric names
  [2026-07-23]
- ✅ **justified client guards** (things the server can't see through a mask) — incomplete phone via
  `inputmask.isComplete()`, empty shippingPayment, null cashOnDelivery; `novalidate` on the form
  (native email validation threw "not focusable" on the collapsed section); isAdult button synced
  after restore [2026-07-23]
- ✅ **deliveryCompany omitted when falsy** — `parseId` (strict `Number.isInteger`) + spread-if;
  a `0` was 400ing the notify with "Invalid input" [2026-07-23]
