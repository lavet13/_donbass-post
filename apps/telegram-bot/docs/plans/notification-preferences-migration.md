# Plan: Migrate notification subscriptions to `NotificationPreferences`

## Problem

Notification subscriptions currently live in the legacy
`ManagerNotificationPreferences` table, keyed by `Manager.id`. The new
`NotificationPreferences` table (keyed by `TelegramUser.id`, i.e. `userId`) is
**empty** — nothing writes to it yet.

If we naively point the *read* path at the new table, every manager silently
stops receiving notifications (zero rows returned, no error). On a delivery bot
that drops real customer orders. So this is a staged data migration, not a
one-query swap.

## Approaches considered

**A — Big-bang.** Switch reads + writes to the new table and backfill in one
commit, then drop the old table. Rejected: no safe rollback if the backfill
mapping is wrong, and the old table is gone.

**B — Staged (chosen).** Same pattern as the RBAC table migration: keep the old
table alive, move one concern at a time, verify between steps. Reversible at
every step because the old data is untouched until the very end.

## The migration, in order

1. **Backfill** (seed): copy `ManagerNotificationPreferences` →
   `NotificationPreferences`, mapping each old row's `manager.telegramUserId`
   to the new `userId`. `notificationTypeId` is unchanged (NotificationType is
   shared). Idempotent.
2. **Migrate writes**: `setManagerPreferences` and the append/remove preference
   commands write to `NotificationPreferences`.
3. **Migrate reads**: `getManagersForNotification`, `getManagerNotifications`,
   `isManagerSubscribed`, `getAllPreferences` read from `NotificationPreferences`.
4. **(Step 7) Drop** `ManagerNotificationPreferences` (and `Manager`) once all
   reads/writes are off them. Separate migration.

Verify after each step (manual: subscribe a manager, fire a notification,
confirm delivery) before moving to the next.

## The key design decision: backfill idempotency

The seed runs on **every deploy**, but the backfill reads the OLD table. Once
step 2 flips writes to the NEW table, the old table freezes. If the seed keeps
backfilling old → new every deploy, a subscription removed at runtime (in the
new table) would get **resurrected** from the frozen old table — the same
resurrection bug we fixed for `MANAGER_CHAT_IDS`.

**Resolution: gate the backfill like the manager bootstrap** — only backfill
when `NotificationPreferences` is empty. Once the new table has any data (from
backfill or from migrated writes), the backfill never runs again, so it can't
resurrect anything. Bootstrap-only, consistent with the pattern already used.

## Mapping reference (for implementation)

```
OLD  ManagerNotificationPreferences { managerId, notificationTypeId }
        manager.telegramUserId  ─┐
                                 ▼
NEW  NotificationPreferences    { userId, notificationTypeId }
```
Read old rows with `include: { manager: { select: { telegramUserId: true } } }`,
then upsert into the new table keyed on the `@@unique([userId, notificationTypeId])`
composite (`userId_notificationTypeId`).

## Open questions

- Confirm the gating strategy (backfill only when new table empty) vs. per-row
  upsert-always. Leaning: gated, for the resurrection reason above.
- When the read/write functions move into a future `notifications/` folder,
  rename them in the same commit (`getRecipientsForType`, `getUserSubscriptions`,
  `isSubscribed`, `getAllSubscriptions`) — no separate rename churn.
- Should the manager-role gate stay in `getManagersForNotification`, or will
  clients eventually receive notifications too (which would relax it)?
