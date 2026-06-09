# Telegram Bot — TODO

Tracking items parked during the RBAC migration. Tags follow the
`todo-comments.nvim` convention (FIX/HACK/PERF/NOTE/TODO).

---

## RBAC migration — remaining steps

The migration is functionally complete and behavior-preserving. What's left:

- [ ] **TEST: manual verification pass (do this first)**
  Poke the running bot, no test framework needed:
  - Remove a manager (`/removemanager <id>`) → confirm their access is actually
    revoked (they can no longer use `/status`, `/preferences`).
  - Root user → confirm full access to all admin commands.
  - A plain (non-manager) user → confirm denied.
  This is the safety check before trusting RBAC in production. We caught the
  `isActive` regression by reasoning; this confirms it live.

- [ ] **TODO: commit the RBAC migration as one clean unit, then bump version**
  `yarn workspace @donbass-post/tg-bot version minor --immediate`
  (minor = new backward-compatible feature, per semver). `/status` reads the
  version from package.json, so it updates automatically.

- [ ] **TODO: Step 7 — drop the legacy tables (separate future session)**
  Once the manual pass confirms the new RBAC paths work in production, remove:
  - `Manager` model + `managers` table
  - `ManagerNotificationPreferences` + `manager_notification_preferences` table
  Blocked until ALL read paths are migrated off them — notably the
  command-menu scoping in `registerCommands` (`getAllManagers()`) and the
  notification routing still read the old `Manager` table. Migrate those reads
  to RBAC/`NotificationPreferences` first, THEN drop the tables.

---

## Known wrinkles (documented, fix when they start costing)

- [ ] **HACK: `removeManager` overloads `telegram_users.is_active`**
  (in `services/manager-preferences.service.ts`)
  It flips the base-user `is_active` flag to revoke the *manager role*. Once
  client features land, a fired manager shouldn't also be a disabled client.
  Fix: add `isActive`/`revokedAt` to the `UserRole` model and soft-delete the
  role assignment instead; reserve `is_active` for account-level enablement.

- [ ] **NOTE: seed re-asserts managers from `MANAGER_CHAT_IDS` every deploy**
  (in `prisma/seed.ts`)
  Intentional for now — the env secret is the source of truth for managers, so
  the unconditional upsert is harmless. IF runtime manager management becomes
  authoritative, switch to a bootstrap-only fallback ("seed from env only when
  zero managers exist") to stop `/removemanager` being undone on next deploy.

- [ ] **NOTE: `manager-preferences.service.ts` is doing double duty**
  It mixes "manager CRUD" with "notification subscription" logic. When
  notifications gets extracted into a feature folder, split these — subscription
  functions belong with notifications, not managers.

- [ ] **NOTE: menu button vs in-message command list use different sources**
  Verified in dev: removing ROOT_ADMIN_CHAT_ID leaves the RBAC-based
  getCommandListText showing admin commands (DB has the root role), but the
  Telegram menu button stays empty because setCommandsForChat scopes it via
  getRootAdminChatId() (env). Fix as part of the env→RBAC read-path migration:
  scope menus from DB roles so both paths agree. Not a bug — a consistency gap.

---

## Structural cleanup (parked — pure file moves, zero behavior change)

Do these reactively, when a domain's scattered pieces start to annoy. Not now.
See `project-organization-strategies.md` for the reasoning.

- [ ] **TODO: consolidate RBAC into a `src/rbac/` feature folder**
  Already staged as a dormant copy. Flip imports when ready (clean isolated
  commit). First good feature-folder candidate.
  Target: `rbac/{guards,service,cache,types}.ts`

- [ ] **TODO: extract `notifications/` feature folder (later)**
  Wait for the signal: when "add a notification type" forces edits across
  `types/`, `formatters/`, `services/`, `seed.ts`, `routes/`.
  Target: `notifications/{service,formatters,types,notification-types,preferences}.ts`

- [ ] **TODO: introduce a `core/` folder for shared infra (later)**
  Move cross-cutting wiring: `prisma/`, `config.ts`, `env.ts`, `router.ts`,
  `bot.ts`. Keep `server.ts` at root, leave `middleware/` and `utils/` as-is.
  Big import-path churn for zero behavior change — only worth it once the
  feature folders exist to contrast against.

---

## Done this session (for reference)

- ✅ RBAC schema (roles, permissions, join tables, `NotificationPreferences`)
- ✅ Migration generated + verified additive (old tables intact)
- ✅ Idempotent seed: roles, permissions, wildcard expansion, root bootstrap
- ✅ Permission/role helpers + some/every combinators
- ✅ In-memory cache with invalidation wired into add/removeManager
- ✅ `registerCommands` + all commands switched to permission checks
- ✅ Removed `isRootAdmin` / `isActiveManager` from hot path
- ✅ Fixed `isActive` regression in `getUserPermissions`/`getUserRoles`
- ✅ `env.ts` hardening (`emptyAsUndefined` — empty secret no longer becomes 0)
- ✅ Command localization (RU/UK/EN)
- ✅ Structural cleanup: `types/context.ts`, `utils/date.ts`
- ✅ Typed permission/role slugs (`rbac.ts`) — typos now caught at compile time
