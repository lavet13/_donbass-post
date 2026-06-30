# Telegram Bot — TODO

Tracking items parked during the RBAC + notifications migration. Tags follow the
`todo-comments.nvim` convention (FIX/HACK/PERF/NOTE/TODO).

---

## Notification migration — remaining

- [ ] **FIX: two competing recipient functions** — `getRecipientsForType` (no
  role gate, future client shape) vs `getManagersForType` (manager-gated,
  current behavior). Only the latter is used. Delete `getRecipientsForType`;
  relax the gate later when clients receive notifications (see NOTE below).
- [ ] **FIX: `getUserSubscriptions` missing `BigInt(chatId)`** — raw number on a
  BigInt column silently matches nothing. Rewrite to enter via `telegramUser`
  (plain map, not flatMap-over-one-row).
- [ ] **TODO: delete unused `getAllAvailableNotificationTypes`.**
- [ ] **TODO: Step 4 — drop legacy tables** once verified in prod:
  `Manager` + `managers`, `ManagerNotificationPreferences` +
  `manager_notification_preferences`. Reads are now migrated; verify, then drop.

## RBAC migration — remaining

- [ ] **TODO: commit RBAC + soft-delete + notif migration, then bump version**
  `yarn workspace @donbass-post/tg-bot version minor --immediate` (new feature).
- [ ] **FIX: revert `NODE_ENV === "production"` self-removal gate** in
  removeManagerCommand — test with a second chatId instead (keep rules
  environment-agnostic). Later: replace "is self?" with "would this leave zero
  active managers?" (the real invariant).

## Known wrinkles (documented, fix when they cost)

- [ ] **NOTE: notifications are manager-only** — `getManagersForType` gates on
  the manager role. When clients should receive notifications, relax the gate
  (or revive the general `getRecipientsForType` shape).
- [ ] **NOTE: seed re-asserts managers from `MANAGER_CHAT_IDS`** — now
  bootstrap-only (runs only when zero active managers). Authority is runtime.
- [ ] **NOTE: `manager-preferences.service.ts` double duty** — manager CRUD +
  notification subscriptions. Split during the notifications/ folder extraction:
  subscription fns → `notifications/preferences.ts`, manager fns → `managers/`.
- [ ] **NOTE: menu button vs in-message command list use different sources** —
  setCommandsForChat scopes via env (getRootAdminChatId); getCommandListText
  via RBAC. Scope menus from DB roles so both agree (env→RBAC read-path).
- [ ] **PERF/TODO: extract `getManagerRole()`** — `role.findUnique({name:MANAGER})`
  now repeats 3× (add/remove/setSubscriptions). Extract the lookup only (the
  surrounding guards differ in shape), during the notifications split.

## Structural cleanup (reactive — pure file moves)

See `project-organization-strategies.md`.

- [ ] **TODO: consolidate RBAC into `src/rbac/`** — guards/service/cache/types
  already copied there; flip imports as a clean isolated commit.
- [ ] **TODO: extract `notifications/` feature folder** — the signal has arrived
  (notif work spans services/types/formatters/seed/routes). Move + rename the
  subscription fns here in one commit.
- [ ] **TODO: `core/` for shared infra** (prisma/config/env/router/bot) — later,
  big import churn, only once feature folders exist to contrast against.
- [ ] **NOTE: root `yarn db:migrate` fights the interactive prompt** — generate
  migrations from inside apps/telegram-bot; consider dropping db:migrate from
  root package.json (keep db:deploy).
- [ ] **FIX: `packages/forms` type error** (pre-existing, unrelated) —
  react-phone-number-input `inputComponent` rejects the `FC`-typed `Input`
  (React's FC return widened to ReactNode|Promise). Cast or retype Input.

## Done (RBAC + soft-delete + notification migration)

- ✅ RBAC schema, additive migration, idempotent seed (roles/perms/wildcard/root)
- ✅ Permission/role helpers + some/every combinators + in-memory cache
- ✅ All commands switched to permission checks; isRootAdmin/isActiveManager gone
- ✅ `revokedAt`/`grantedAt` on UserRole — role revocation off `is_active`
- ✅ Two-gate reads (account is_active + role revokedAt); add/remove rewired
- ✅ Notification prefs: backfilled (gated), writes + reads migrated to new table
- ✅ getAllManagers/getManagersForType/getUserSubscriptions/getAllSubscriptions/
  isSubscribed/setUserSubscriptions → all on RBAC + NotificationPreferences
- ✅ env.ts hardening (emptyAsUndefined); typed slugs; assertNever exhaustiveness
- ✅ Structural: types/context.ts, utils/date.ts, utils/assert-never.ts
