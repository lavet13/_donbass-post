# IDEAS

Speculative, not committed. Act on these sparingly — YAGNI. Anything here that earns a
decision graduates to todo.md; anything that needs a real design gets a docs/plans/ file.

---

- **Yandex Maps on the web app** — pin the pickup points / delivery geography.
  `ymap3-components` (npm) wraps the JS API v3 for React; its "Example 2: map with clusterer"
  is the shape wanted — `YMapCustomClusterer` with `marker`/`cluster`/`gridSize`/`features`.
  Needs an API key. NOTE: promoted to todo.md as a scoped task — see there.

- **Telegram Premium for animated (custom) emoji in bot messages** — worth checking whether a
  bot can use custom emoji entities at all, and what it costs. Cosmetic; zero user value beyond
  polish, so it stays here until something else makes it cheap.

- **MDX for the web app's blog** — render post content statically on the frontend instead of
  fetching it from the backend. Open questions, roughly in order:
  - Are API requests even needed for blog content, or is SSG enough?
  - What's the good approach WITHOUT a metaframework (no Next.js / Gatsby — not interested)?
    Vite + an MDX plugin + a build-time glob is the obvious candidate.
  - Deploy trigger: a webhook that fires GitHub Actions to rebuild the site (or the bot) when
    content changes. No pipeline exists for this today.

- **Postgres backups on the VPS** — currently only ad-hoc `pg_dump -t` before destructive
  migrations. A scheduled dump + offsite copy + a RESTORE that's actually been tested.
  (Untested backups aren't backups.) Promote to todo.md the first time a restore would have
  saved something.

- **auth: JWT access+refresh vs server-side sessions, and a multi-provider identity model** —
  the bot has authorization (RBAC on chatId) but no authentication; Telegram *is* the identity
  provider today, and a chatId arriving through Telegram's API is trusted implicitly. Nothing
  to forge, no session to hold. Questions to answer before this is a task, in order:
  1. **Which surface actually needs a logged-in user?** apps/web? the mini-app? If none, this
     is premature — blocked on the same thing as `packages/contracts`: owning the endpoint.
  2. **Identity model before tokens.** Four entry points (bot / Telegram Login / email / phone)
     is not "add auth", it's "one user, many credentials":
     `User` ← `AuthIdentity(provider, providerId, userId)`, so `telegram:123456`,
     `email:x@y.z`, `phone:+7…` all resolve to one user row. The current `telegramUser.chatId`
     IS the one-provider version of that — widening it later is another staged migration.
  3. **What does JWT buy over an opaque token in an httpOnly cookie + a `Session` row?**
     One API, one consumer → stateless verification isn't worth much, and the refresh half is
     a session table regardless (rotation, revocation). `revokedAt` semantics already exist
     from the RBAC work.
  Provider notes:
  - **Telegram Login Widget** — cheapest bridge. Payload is HMAC-SHA256 signed with the bot
    token, verified server-side, links straight to the chatId already stored. No password.
  - **Phone** — two very different costs. The bot's `request_contact` keyboard button returns
    a Telegram-verified number for free, but only for people already in the bot. Independent
    phone signup needs SMS OTP from a provider: costs money and needs one that actually
    delivers to RU/DNR numbers.
  - **Email** — needs a mail sender + a verification flow. Most work, least leverage here.
  If this ever goes ahead it's `docs/plans/` scale: multi-session and hard to reverse.
