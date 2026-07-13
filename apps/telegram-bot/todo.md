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
- [ ] **PERF/FIX: `setMyCommands` 429 storm on boot** — `registerCommands` fires one
      `setMyCommands` per scope×language PLUS one per-manager (`setCommandsForChat` loop) PLUS
      root admin, on EVERY startup; tsx restarts on every file save → hammers Telegram's
      rate limit (seen: `429 retry_after: 841`). Command scopes are server-side Telegram state
      that persists across restarts, so re-pushing identical lists every boot is wasted calls.
      Quick: gate registration (or just the per-chat loops) behind NODE_ENV/REGISTER_COMMANDS
      so dev restarts don't re-push. Better: only call setMyCommands when the command set
      actually changed (hash/version check).
- [ ] **register manager/admin command scopes reactively, not per-boot** — instead of looping
      every manager at startup, set each chat's scope when a manager is added/removed
      (/addmanager, /removemanager). Removes the boot-time amplifier above AND resolves the
      parked "menu button vs command list use different sources" note (both would read from the
      RBAC/DB write-path). Structural fix.
- [ ] **PERF: skip re-pushing unchanged command scopes on boot** — for boot-time scopes
      (public/all_private_chats/admin), hash each scope's command list, store last-applied hash
      (small table or JSON), only call setMyCommands when it differs. Idempotency via fingerprint
      (like a migration checksum). Prod-side polish; #1 dev-gate already handles dev.
- [ ] **TODO: lint for dead exports** — extract-and-replace refactors leave orphaned exported
      helpers that `tsc` won't flag (exports are assumed used-externally). Add knip / ts-prune /
      eslint no-unused-exports so the next `isManagerSubscribed` shows up automatically.
- [ ] **TODO: drop `AppConfig.managers`, source manager count from DB** — `config.managers.chatIds`
      is read by status.ts + server.ts but holds the env BOOTSTRAP list, so /status shows the seeded
      count, not the live one. Migrate both to `(await getAllManagers()).length`, delete the config
      field + its config.ts mapping. Keep MANAGER_CHAT_IDS (seed.ts still needs it).
- [ ] **PERF: `getAllManagers()` is a full-scan used to resolve one chatId** in
      resolveManagerCommand — fine at current scale, but if the manager list grows, swap to a
      targeted `telegramUser.findFirst({ where:{ chatId, isActive:true, userRoles:{ some:{ revokedAt:null,
      role:{ name:MANAGER } } } }, select:{ id:true } })` → `{ userId } | null`. YAGNI for now.

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
- [ ] **NOTE: seed re-asserts managers from MANAGER_CHAT_IDS** — now
      bootstrap-only (zero active managers). Authority is runtime.
- [ ] **NOTE: root `yarn db:migrate` fights the interactive prompt** — generate
      migrations from inside apps/telegram-bot; consider dropping db:migrate from
      root package.json (keep db:deploy).
- [ ] **NOTE: append/remove verify the manager twice** — `resolveManagerCommand`
      (getAllManagers) + the per-command `findUnique` both check active-manager. The
      findUnique stays for now because we need `user.id`. Collapse — have
      `resolveManagerCommand` return `user.id` — only once a 3rd command wants it
      (rule of three). Until then, keep them separate.

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
  notifications/, lifecycle fns → managers/ (getManagerRole extraction still TODO)
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
- ✅ **Gated command registration** — REGISTER_COMMANDS flag (default false), fixes dev 429 storm
  from tsx restart-on-save [2026-07-11]
