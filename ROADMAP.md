# Roadmap

donbass-post is replacing the delivery service's legacy information system, piece by piece. Before the migration, that system was made of:

- **the old PHP website**: order forms and their handlers, plus a MySQL database of past orders (the handlers are switched off since stage 1);
- **workplace-post.ru**: a separate REST service the site used for cargo search, tracking and the delivery-cost calculator (switched off since stage 5);
- **a shared Excel workbook with VBA macros**: the real core, used for shipment registration and accounting, trip and bonded-warehouse (СВХ) manifests, tracking, cost calculation and payments. It is the part still running, and its retirement is the last stage.

The migration follows the **strangler fig** pattern. The new system takes over one function at a time while the old one keeps running. A function is switched off in the old system only after the new one has been verified on production against the same real data. Where client code can't change at the same time as the server, the response format is kept as it was, so the client doesn't care which system answers.

Development happens on `donbass-post.duckdns.org`.

## Status at a glance

| #   | Stage                      | Scope                                                                                                                       | Status     |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Web forms                  | Order forms submit to the Node.js REST API instead of PHP handlers                                                          | ✅ Done    |
| 2   | Historical data            | Past orders moved from the legacy MySQL and verified                                                                        | ✅ Done    |
| 3   | Notifications              | Managers notified in Telegram, customers by e-mail                                                                          | ✅ Done    |
| 4   | Protection & integrity     | Rate limits, e-mail limits, field lengths matching the schema                                                               | ✅ Done    |
| 5   | workplace-post.ru services | Cargo search and tracking moved here; the service is switched off                                                           | ✅ Done    |
| 6   | Access                     | Authentication for customers and staff, role-based access                                                                   | ⏳ Planned |
| 7   | Admin panel                | Managers working with orders, reference data and users; the workbook's core functions, cost calculation included, move here | ⏳ Planned |
| 8   | Customer dashboard         | A customer's orders and shipments, with their statuses                                                                      | ⏳ Planned |
| 9   | Decommissioning            | The shared Excel/VBA workbook is retired once its functions live here                                                       | ⏳ Planned |

Stage 6 comes first among the planned stages: the admin panel and the dashboard both depend on knowing who the user is and what they may see. The admin panel goes before the customer dashboard, because the statuses managers enter in the panel are what make the dashboard's statuses current; until then a dashboard could only show what the last uploaded workbook said, which the public search page already does. So staff sign-in comes first. The delivery-cost calculator went away with workplace-post.ru; it comes back with the workbook's cost function in stage 7, once the tariff rules are known.

---

## Done

### 1. Web forms → REST API

- All seven order forms submit to the bot's REST API. The legacy PHP handlers are switched off.
- **Validation:**
  - **Server:** strict Zod schemas, including conditional rules (individual vs company sender/recipient/customer). The server is the single source of truth.
  - **Client:** interactive, but only renders the server's errors per field (`renderServerErrors`), plus a few guards the server can't see through input masks (a half-filled phone number, for example).
- **Form state** (the pick-up-point form) is saved per form in `localStorage` and replayed on load.

### 2. Historical data

- Past orders (100k+ rows in two tables) moved from the legacy MySQL into the new database.
- Verified by row counts, encoding and access through the ORM.

### 3. Notifications

- **Managers:** every accepted order goes to Telegram, with notification types and per-manager preferences (RBAC).
- **Customers:** a confirmation e-mail listing what they entered.
  - SPF, DKIM and DMARC are set up; Gmail passes all three, and mail-tester.com scores it 10/10.
  - The e-mail is sent only for an accepted order and never delays the response.
  - Every attempt is logged in `EmailLog`.
  - Passport data is never included.

### 4. Protection & integrity

- **Rate limiting:** nginx `limit_req` zones separate form submissions from lookups (`lookups_rl`).
- **E-mail limit** per normalised recipient address, so a form can't be used to flood someone else's inbox.
- **Field length limits** match the column sizes, so a value that's too long becomes a readable 400 instead of a lost order.
- **The lost-orders investigation** found 879 historical rows with truncated e-mail addresses and two hidden schema defects. All are fixed without data loss.
- **CORS:** the `www.` origin issue was diagnosed and fixed without weakening the rate limits.

### 5. workplace-post.ru services: search and tracking

The site's search page (`search-gruz.php`) now calls only this API. **workplace-post.ru is switched off.**

**Data comes from the managers' Excel files.** They send `.xlsx` workbooks to the bot without any command (manager role required). The bot recognises the kind of file and shows a report. Nothing is written until «Загрузить» is pressed.

| Workbook                               | Table(s)                                                                 | Update strategy                                                 |
| -------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| «Отслеживание» (monthly, 3 sheets)     | `cargo_shipments`, `cargo_warehouse_movements`, `cargo_delivery_records` | The session's files replace all three tables in one transaction |
| Rostov (102 monthly sheets since 2018) | `rostov_shipments`                                                       | Replace the date range the file covers                          |
| LNR (7 sheets)                         | `lnr_shipments`                                                          | Replace the date range the file covers                          |
| ALI and ИМ (promo orders)              | `promo_orders` (`source` = ALI / IM)                                     | Replace the date range the file covers, per source              |

**Endpoints:**

| Endpoint                                | Returns                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /api/cargo-tracking/search/:query` | Cargo by ТТН or track number. Same response format as workplace-post.ru               |
| `GET /api/tracking/:ttn`                | The newest Rostov row and every LNR declaration for a ТТН                             |
| `GET /api/im-tracking/:promo`           | Every order listing the promo code, with the status taken from the cell's fill colour |

**Key decisions**, with the reasoning in the code comments:

- **Streaming reader** (`tracking/read.ts`). Loading the ИМ workbook whole peaks at ~540 MiB, against the bot container's 500 MiB limit; streaming peaks at ~142 MiB for the ИМ workbook and ~144 MiB for the Rostov one. Tracking files are therefore recognised first; the cargo reader (which loads the whole file) is used only when the sheet names say it's an «Отслеживание» workbook.
- **Columns found by header text, not position** (`findColumns`). Headers are compared case-sensitively («дата» ≠ «ДАТА»), and each must match exactly one column.
- **The file kind is decided by a vote.** Each sheet's kind comes from its header row; only sheets that have data rows vote, so empty sheets with another layout don't count. Mixed files are refused, and sheets with data but unknown headers are named in the report.
- **Messy cells are normalised by rules, not fixed by hand:**
  - dates of every shape (`cellDay`), with a plausibility guard: 2018 … one month from now;
  - a ТТН is the first number of exactly 8 digits;
  - promo codes are runs of 4 or more digits;
  - rich text and formula results are unwrapped (`plainValue`);
  - merged cells are filled down.
- **"Replace the file's date range"** instead of replacing everything or upserting:
  - the history outside the file's range is kept;
  - ТТН numbers are reused across years, so there's no stable key to upsert by;
  - no ghost rows are left behind when managers edit cells.
- **The count shown before the import comes from the same `where` builders as the delete,** so the number a manager confirms is the number that gets replaced.
- **No row is dropped silently:** every row of the file is either imported or listed in the report with its sheet, row number and reason.

**Verification:**

- **Tests:** 148, run with `yarn vitest run`.
- **Double imports:** each real workbook was imported twice; the second run deleted exactly what the first created.
- **Cross-check against workplace-post.ru:** while it was still running, the same ТТН and track numbers were looked up by hand in both systems and returned the same data.
- **Completeness on every upload:** the report accounts for every row of the file, imported or skipped with a reason.

Code: `src/cargo-tracking/`, `src/tracking/`, `src/uploads/document.ts`, `src/utils/cell.ts`.

---

## Next

### Now: study the Excel workbook

- [ ] **Read the workbook's VBA macros** once access is granted: how shipment registration, manifests, cost calculation and payments actually work, and what the buttons do.
- [ ] **Tariff rules:** from the macros if the cost is calculated in the workbook, otherwise from staff; then recalculate past orders by the recovered rules and compare with what was actually charged.

### Stage 6: Access

- [ ] **Staff sign-in first**, built on the existing manager roles: the admin panel needs it before anything else.
- [ ] **Customer sign-in without a password:**
  - a one-time link or code sent by e-mail (the mail infrastructure from stage 3 is ready);
  - and/or Telegram login, with the payload's signature checked server-side against the bot token.
- [ ] **Role-based access:**
  - **customer:** sees only their own orders;
  - **manager:** sees orders and reference data;
  - **admin:** additionally manages users and roles.
- [ ] **Session/JWT handling** for `apps/web` and the API.

### Stage 7: Admin panel

Introduced as a bridge from the Excel workbook, in four steps:

1. [ ] **Read-only search for managers** over the data already imported from the workbooks. Their work in Excel doesn't change, and they get instant search across every year right away.
2. [ ] **Order processing and status entry** in the panel, with an Excel export in the same structure, so going back to the workbook stays possible.
3. [ ] **Move the core functions one at a time:** shipment registration, trip and СВХ manifests, cost and payments. Each is checked against the workbook's results. The macros' buttons are operations, and they become actions in the panel; the workbook's look isn't copied.
4. [ ] **The workbook becomes a report.** The source of truth moves to the database, function by function.

**Open questions for the business-process analysis:**

- Which statuses do an order and a shipment go through, and who changes them, and when?
- Which personal data does a manager need, and which should be hidden?
- How are manager actions logged?
- Can a manager create an order on a customer's behalf (taken over the phone, say)?
- How does the panel sit next to the Telegram notifications managers already rely on?

### Stage 8: Customer dashboard

Built after the panel, so the statuses it shows are the ones managers enter there.

- [ ] **Shipment statuses as self-service,** so customers stop calling managers to ask where a parcel is.
- [ ] **Repeat orders** pre-filled from the profile, so fewer typos end up in phones and addresses.
- [ ] **Verified contacts:** signing in with an e-mail code proves the address, so confirmations can't go to non-existent mailboxes again.
- [ ] **Decide how an account is linked to its orders,** including historical ones (by phone, e-mail or track number).

### Stage 9: Decommissioning

- [ ] **Retire the shared Excel/VBA workbook** once all of its functions run here.

### Measurement (before stage 8 goes live)

Record baselines first, or there will be nothing to compare against:

- [ ] status inquiries per month, and a manager's time per inquiry;
- [ ] orders that need manual correction;
- [ ] **the share of repeat customers.** It can be computed now from the migrated order history, grouped by phone or e-mail.

---

## Smaller follow-ups

**Telegram bot**

- [ ] One shared upload list for cargo and tracking files sent together. Today each flow posts its own list.
- [ ] A streaming reader for the cargo workbook too, which still loads the whole file.
- [ ] Escape `%` and `_` in the cargo search's `contains` queries (needs a probe first).
- [ ] Remove the unused `TRACK_GLOBAL_PROXY` from `env.ts`; the proxy now comes from `config.telegram.proxy`.
- [ ] Upgrade `tsx` once a release fixes the DEP0205 warning.
- [ ] Add a GIN index on `promo_orders.promo_codes` if the table ever grows large (see the `PERF` comment in the schema).
- [ ] Move outgoing SMTP to another hosting provider.
- [ ] Find what fills the JavaScript heap: on 20 Nov the bot died with "JavaScript heap out of memory" after ~23 h of uptime (the heap was ~250 MB of live data), and the open upload list was lost with it.

**Validation**

- [ ] The server publishes a description of its Zod rules, and the client builds matching live checks from it. One source of truth, and no duplicated rules.

**`apps/web`** (details in `apps/web/todo.md`)

- [ ] **Hydration:** `hydrateRoot` instead of `createRoot`. First make the first render deterministic (theme, media queries, auth, cookie atoms, React Query data, head tags).
- [ ] **Direction-aware view transitions,** skipped on the initial load.
- [ ] **Typography:** `@fontsource-variable` fonts and `clamp()`-sized headings.
- [ ] **Fix the phone menu drawer** opening by itself on first visit: the `sidebar-state` cookie atom defaults to open.
- [ ] **Refactor `main-nav.tsx`** around a `MainNavContext`.
- [ ] **Search Console / Yandex Webmaster:** register and submit the sitemap.
- [ ] **nginx immutable-cache rule:** narrow it to `/assets/`.
- [ ] **Clean up:** the existing lint problems, the favicon `type`, and the Yarn upgrade.
