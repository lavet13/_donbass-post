# Telegram Bot — TODO

Tracking items parked during the RBAC + notifications migration. Tags follow the
`todo-comments.nvim` convention (FIX/HACK/PERF/NOTE/TODO).

---

## 🔴 PRODUCTION INCIDENT (active)

- [ ] **FIX: bot can't reach api.telegram.org from Moscow VPS** — `bot.init()`
  (getMe) hangs forever; container shows `Up` but never starts polling, logs
  stop after the dotenv line. Confirmed: process alive, env injected correctly,
  `wget https://api.telegram.org` from inside the container hangs. Cause is
  network egress (Telegram blocked from RU), NOT code/build/env. **Real fix =
  the telemt/AmneziaWG double-hop egress through the Netherlands VPS** — pick up
  in the dedicated double-hop chat where the NL VPS + AmneziaWG state lives.
  Possible smaller step: point grammY at a SOCKS5/HTTPS proxy via an agent
  (client.baseFetchConfig) instead of full container-level routing — evaluate
  against what's already standing on the NL side.

- [ ] **TODO: wrap `bot.init()` in a timeout (do today, independent of egress)**
  A blocked/slow Telegram API currently hangs startup silently. Race init()
  against a ~10s timeout so it fails LOUD (logged error + non-zero exit →
  container restarts) instead of becoming a silent zombie. `withTimeout` is a
  pure util → `utils/with-timeout.ts`. Mitigates the symptom; egress is the cure.

---

## Notification / RBAC migration — remaining

- [ ] **TODO: drop legacy tables** once verified in prod: `Manager` + `managers`,
  `ManagerNotificationPreferences` + `manager_notification_preferences`. Reads
  are migrated; blocked on prod being healthy first (see incident above).
- [ ] **TODO: commit done; bump version** after incident resolved:
  `yarn workspace @donbass-post/tg-bot version minor --immediate`.
- [ ] **FIX: replace `NODE_ENV==="production"` self-removal gate** with the real
  invariant — "would this leave zero active managers?" (count check, like the
  backfill gate). Environment-independent; also solves single-user testing.

## Structural cleanup (reactive — pure file moves)

See `project-organization-strategies.md`.

- [ ] **TODO: extract `notifications/` feature folder** — signal arrived. Move:
  - `notifications/subscriptions.ts` ← getManagersForType, getManagerSubscriptions,
    getAllManagerSubscriptions, isManagerSubscribed, setManagerSubscriptions
  - `notifications/{service,formatters,types,notification-types}.ts`
  - `managers/service.ts` ← addManager, removeManager, getAllManagers
  Subscription readers gate on the manager role, but the SUBSCRIPTION is the
  subject and the gate is just a filter → they belong in notifications/.
  Separate commit, after prod is healthy.
- [ ] **TODO: extract `getManagerRole()`** — `role.findUnique({name:MANAGER})`
  repeats 3× (add/remove/setSubscriptions). It's used by both managers/ and
  notifications/ → it's an RBAC primitive → `rbac/service.ts`. Extract the
  lookup only (surrounding guards differ in shape). Do during the split.
- [ ] **TODO: extract handler arg-parsing primitives** — `parseChatId`
  (parseInt + isNaN, every admin command), `parseCommandArgs` (split/slice).
  Generic ones (no domain knowledge) → utils/; slug validation knows VALID_SLUGS
  → notifications domain. Repeated 4×+.
- [ ] **TODO: move `src/docs/plans/` OUT of `src/`** → `apps/telegram-bot/docs/`.
  Docs shouldn't live under the source dir (tsup builds from src/).
- [ ] **TODO: `core/` for shared infra** (prisma/config/env/router/bot) — later,
  big import churn, only once feature folders exist to contrast against.
- [ ] **NOTE: menu button vs in-message command list use different sources** —
  setCommandsForChat scopes via env (getRootAdminChatId); getCommandListText
  via RBAC. Scope menus from DB roles so both agree (env→RBAC read-path).

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

## Done this session

- ✅ Soft-delete role revocation (revoked_at/grantedAt on UserRole)
- ✅ Notification subs: reads + writes migrated to NotificationPreferences;
  gated backfill verified (old=1, new=1)
- ✅ Deleted dead getRecipientsForType + getAllAvailableNotificationTypes
- ✅ Renamed subscription fns (getManager*/setManagerSubscriptions/isManagerSubscribed)
- ✅ getManagerSubscriptions rewritten to enter via telegramUser (+ BigInt fix)
- ✅ assertNever exhaustiveness; env.ts emptyAsUndefined; RBAC → src/rbac/
- ✅ phone-field.tsx cast (forms package, unrelated)
- ✅ check-types green across all 8 packages; committed + pushed (deploy green,
  but bot can't reach Telegram from Moscow — see incident)
- ✅ Split ref into prisma/typescript/db-migrations knowledge files (planned)
