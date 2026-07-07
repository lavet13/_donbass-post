# Telegram Bot — TODO

Tracking items parked during the RBAC + notifications migration. Tags follow the
`todo-comments.nvim` convention (FIX/HACK/PERF/NOTE/TODO).

---

## Remaining — do next

- [ ] **TODO: bump version** now that the migration is live in prod:
  `yarn workspace @donbass-post/tg-bot version minor --immediate`.
- [ ] **FIX: replace `NODE_ENV==="production"` self-removal gate** with the real
  invariant — "would this leave zero active managers?" (count check, like the
  backfill gate). Environment-independent; also solves single-user testing.

## Structural cleanup (reactive — pure file moves)

See `project-organization-strategies.md`.

- [ ] **TODO: extract `getManagerRole()`** — `role.findUnique({name:MANAGER})`
  repeats 3× (add/remove/setSubscriptions). Used by both managers/ and
  notifications/ → it's an RBAC primitive → `rbac/service.ts`. Extract the
  lookup only (surrounding guards differ in shape).
- [ ] **TODO: extract handler arg-parsing primitives** — `parseChatId`
  (parseInt + isNaN, every admin command), `parseCommandArgs` (split/slice).
  Generic ones (no domain knowledge) → utils/; slug validation knows VALID_SLUGS
  → notifications domain. Repeated 4×+.
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
