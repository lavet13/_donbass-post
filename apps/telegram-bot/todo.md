# Telegram Bot — TODO

Tracking items parked during the RBAC + notifications migration. Tags follow the
`todo-comments.nvim` convention (FIX/HACK/PERF/NOTE/TODO).

---

## Remaining — do next

- [ ] **FIX: replace `NODE_ENV==="production"` self-removal gate** with the real
      invariant — "would this leave zero active managers?" (count check, like the
      backfill gate). Environment-independent; also solves single-user testing.
- [ ] **FIX: PickUpPointDelivery schema models the WRONG shape** — the real producer (old PHP
      site's JS) sends ONE `sender`/`recipient`/`customer` key whose VALUE is either the
      individual or company shape — NOT sibling keys (`sender` | `companySender`). That's the
      React app's shape, and it posts to workplace-post.ru, not here. Fix: `z.union([Individual,
  Company])` on each sub-object value; delete the three top-level XOR refines (the union
      carries the XOR). Also: `recipient.pointTo` is NEVER sent (drop it), `deliveryCompany`
      arrives as a resolved NAME string not an id, and the company-recipient branch sends
      neither. Then revert formatters.ts to nested branching.
- [ ] **verify OnlinePickup's remaining rules against its real producer** — whatsApp casing and
      pointTo-as-string confirmed; still unverified: whether the pointTo XOR pickupAddressRecipient
      and the 4-field customer all-or-nothing refines match what the old site actually sends. If it
      can send neither, the XOR 400s working traffic.
- [ ] **TODO: lint for dead exports** — knip / ts-prune / eslint no-unused-exports, so the next
      orphaned export (like isManagerSubscribed) surfaces automatically (tsc won't — exports are
      assumed used).
- [ ] **PERF: `getAllManagers()` full-scan to resolve one chatId** in resolveManagerCommand —
      fine now; if managers grow, targeted findFirst({ chatId, isActive, userRoles some MANAGER })
      → { userId } | null. YAGNI.
- [ ] **restructure `notifications/types.ts`** — one file holds shared helpers
      (phone/email/text3to50/inn/positive/validatePickupTime), three payload schemas, and their
      sub-objects (~400 lines). Split: `notifications/schemas/_helpers.ts` + one file per payload,
      re-exported from an index. Do it once the schemas settle — file moves are cheap, churn isn't.
- [ ] **`/api/notify` receives display STRINGS, not ids** — the old site resolves
      pointFrom/deliveryCompany to names (`${point.name}, ${point.address}`) before POSTing, so
      the bot prints text it can't join on. Migrate to sending raw ids + DB lookup at format time.
- [ ] **old-site JS: fix `getFormattedServices` (additionalService never arrives)** — the fn has a
      block body with no `return` → undefined → JSON.stringify drops the key, so services NEVER
      reach the bot. Its lookup is also wrong: `additionalServices.indexOf(service.id)` searches an
      object array for a primitive (always -1), and `additionalServices[s.id]` indexes by id, not
      position (and the array was .reverse()d). Correct form:
      const getFormattedServices = (services) =>
      services.map((s) => additionalServices.find((as) => as.id === s.id)).filter(Boolean);
      The bot side is READY (schema declares {id,name,price}, formatter prints service.name) — it's
      simply never exercised. A partial fix (adding `return` without fixing the lookup) sends bare
      {id} and 400s. Fix both together or neither.
- [ ] **old-site JS: company customers silently dropped** — the payload gates `customer` on
      `inputs.nameCustomer`, which only exists in the individual markup.
- [ ] **NOTE: old-site JS: recipient transform resolves pointTo OR deliveryCompany** (early return),
      never both.

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
  getAllManagers().length; config field + mapping removed; MANAGER_CHAT_IDS kept for seed [done earlier]
- ✅ **zod validation for `/api/notify/*`** — schemas at the handler boundary, hand-written payload
  interfaces → `z.infer`, `!payload[f]` falsy-check bug gone. Shape corrections outstanding (see
  Remaining) [2026-07-12]
- ✅ **extract `handleNotify()`** — 3 handlers ~45 identical lines each → generic helper (~135 → ~35);
  schema↔sender mismatch is now a compile error [2026-07-12]
- ✅ **port `validatePickupTime`** — via `.superRefine` (message-returning fn drops straight in);
  regex anchored, since the server has no input mask [2026-07-12]
- ✅ **fix(web): customer phone bound to `phoneSender`** — overwrote the sender's phone;
  `phoneCustomer` never populated [2026-07-12]
- ✅ **fix: formatter printed sender's pointFrom as the recipient's pickup point** [2026-07-12]
- ✅ **Corrected /api/notify payload shapes to the real producer** — z.union per sub-object
  (sender/recipient/customer are one key, two shapes); XOR refines deleted (the union carries it);
  formatters narrow with `in`; point\*/deliveryCompany are display strings [2026-07-12]
- ✅ **fix: whatsapp casing in formatters** — client sends whatsApp*; formatter read whatsapp* [2026-07-12]
- ✅ **REGISTER_COMMANDS removed from env.ts** — no dead config left from the reverted #1 gate;
  verified absent from src/ [2026-07-12]
