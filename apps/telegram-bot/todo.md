# Telegram Bot — TODO

Tracking items parked during the RBAC + notifications migration. Tags follow the
`todo-comments.nvim` convention (FIX/HACK/PERF/NOTE/TODO).

---

## Remaining — do next

- [ ] **FIX: replace `NODE_ENV==="production"` self-removal gate** with the real
      invariant — "would this leave zero active managers?" (count check, like the
      backfill gate). Environment-independent; also solves single-user testing.
- [ ] **zod validation for `/api/notify/*`** — endpoints hand-roll request validation (manual
      field checks, no library). Migrate to zod: one schema per endpoint, parse at the handler
      boundary, 400 with flattened issues on failure. Bonus: `z.infer` gives request types for free.
- [ ] **#3 register manager/admin command scopes reactively, not per-boot** — set each chat's
      scope in the /addmanager /removemanager HANDLERS (not the boot loop, not the service).
      Removes the boot-time 429 amplifier AND resolves the "menu button vs command list use
      different sources" note (both read the RBAC/DB write-path). Change setCommandsForChat's
      first param bot→api so handlers pass ctx.api. Remove = deleteMyCommands(chat scope) →
      falls back to all_private_chats.
- [ ] **#2 PERF: skip re-pushing unchanged boot scopes** — hash each scope's serialized payload
      (commands+scope+language), store last-applied hash (Prisma table CommandScopeState), only
      setMyCommands when it differs. Migration-checksum pattern. Prod polish; dev-gate handles dev.
- [ ] **TODO: lint for dead exports** — knip / ts-prune / eslint no-unused-exports, so the next
      orphaned export (like isManagerSubscribed) surfaces automatically (tsc won't — exports are
      assumed used).
- [ ] **TODO: drop `AppConfig.managers`, source manager count from DB** — config.managers.chatIds
      (status.ts + server.ts) holds the env BOOTSTRAP list → /status shows the seeded count, not
      the live one. Migrate both to `(await getAllManagers()).length`, delete the field + config.ts
      mapping. Keep MANAGER_CHAT_IDS (seed.ts needs it).
- [ ] **PERF: `getAllManagers()` full-scan to resolve one chatId** in resolveManagerCommand —
      fine now; if managers grow, targeted findFirst({ chatId, isActive, userRoles some MANAGER })
      → { userId } | null. YAGNI.

## Structural cleanup (reactive — pure file moves)

See `project-organization-strategies.md`.

- [ ] **TODO: `core/` for shared infra** (prisma/config/env/router/bot) — later,
      big import churn, only once feature folders exist to contrast against.
- [ ] **NOTE: menu button vs in-message command list use different sources** —
      setCommandsForChat scopes via env (getRootAdminChatId); getCommandListText
      via RBAC. Scope menus from DB roles so both agree (env→RBAC read-path).

## CI / infra

- [ ] **TODO: bump `actions/checkout@v4` → v5** (or newer) — deploy warns
      "Node.js 20 is deprecated … forced to run on Node.js 24" for checkout@v4.
      GitHub is removing Node 20 from runners. Update the pinned action version in
      `.github/workflows/telegram-bot-deploy.yml`. Low urgency (still runs), but
      clears the warning and avoids a future hard break.

## Known wrinkles (documented, fix when they cost)

- [ ] **HACK: `phone-field.tsx` casts `Input as InputComponent<...>`** — silences
      a react-phone-number-input vs FC return-type mismatch; the local
      `InputComponent` type duplicates the library's. If the lib's signature drifts,
      the cast hides it. Acceptable; revisit if the lib updates.

## Backlog / low priority (non-bot infra)

- [ ] **NOTE: self-hosted Anki sync server on a VPS** (optional) — modern Anki ships
      `--syncserver`; run on a VPS + custom sync URL to keep review history off
      AnkiWeb. AnkiWeb is the zero-effort default and the privacy delta is small, so
      this is want-not-need. (Not bot code — parked here for lack of a better home;
      move if you keep a personal-infra list.)

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
- ✅ **Gated command registration (429 quick-fix)** — REGISTER_COMMANDS flag; superseded the
  "429 storm on boot" quick-half. Structural halves tracked as #3 (reactive) + #2 (hash) [2026-07-11]
- ✅ **Manager double-check collapsed** — resolveManagerCommand returns userId; per-command
  findUnique gone (was the "verify twice" wrinkle) [2026-07-11]
