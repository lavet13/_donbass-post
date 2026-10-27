import nodemailer from "nodemailer";
import z from "zod";
import { env } from "@/env";
import { prisma } from "@/prisma";
import { isOriginAllowed } from "@/middleware";

const transport = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // 465 = TLS from the first byte; 1025 (Mailpit) = plain
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  : null;

/** Call once at startup: logs whether mail works, never crashes the bot. */
export async function verifyMail() {
  if (!transport)
    return console.warn("[mail] SMTP_HOST not set — e-mail disabled");
  try {
    await transport.verify(); // connects AND logs in, so a wrong password shows up here
    console.log(`[mail] SMTP ready (${env.SMTP_HOST}:${env.SMTP_PORT})`);
  } catch (err) {
    console.error("[mail] SMTP verify failed:", err);
  }
}

/** Most confirmations one inbox may receive per hour; past it the order still goes through, the e-mail is skipped. */
const RECIPIENT_HOURLY_CAP = 30;

/**
 * The inbox an address really lands in: lowercased, "+tag" dropped, and for
 * Gmail the dots dropped too — so victim+1@…, V.ictim@gmail.com … share one cap.
 * Used only for counting; the e-mail still goes to the address as typed.
 */
export function recipientKey(addr: string) {
  const at = addr.lastIndexOf("@");
  const domain = addr
    .slice(at + 1)
    .trim()
    .toLowerCase();
  const local = addr.slice(0, at).trim().toLowerCase().split("+")[0] ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com")
    return `${local.replaceAll(".", "")}@gmail.com`;
  return `${local}@${domain}`;
}

/**
 * True when this inbox already received RECIPIENT_HOURLY_CAP confirmations in
 * the last hour. Counts only delivered ones, so skipped rows don't extend the
 * block. Fails closed: if the count itself errors (database down), don't send —
 * an unverifiable cap is treated as reached.
 */
async function overRecipientCap(key: string) {
  try {
    const sent = await prisma.emailLog.count({
      where: {
        recipientKey: key,
        kind: "customer",
        success: true,
        sentAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // sent within the last hour
      },
    });
    return sent >= RECIPIENT_HOURLY_CAP;
  } catch (err) {
    console.error("[mail] recipient cap check failed — not sending:", err);
    return true;
  }
}

/**
 * Escapes a value for safe use inside the HTML e-mail body.
 * Every user-supplied field must pass through this: the PHP inserted raw form
 * values, so anyone could put a link into an e-mail sent from our domain.
 */
export const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/** Best-effort like Email::send: never throws, reports what happened. */
export async function sendMailSafe(
  to: string,
  subject: string,
  html: string,
  text: string,
) {
  if (!transport) return { ok: false as const, error: "disabled" };
  try {
    const info = await transport.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    return { ok: true as const, messageId: info.messageId };
  } catch (err) {
    console.error(`[mail] to ${to} failed:`, err);
    return { ok: false as const, error: String(err) };
  }
}

export type Field = [label: string, value: unknown];
export type Section = { section: string };
export type Row = Field | Section;
export type MailOptions<T> = {
  rows: (data: T) => Row[];
  to: (data: T) => string | undefined; // the customer's address field
  title?: string;
  copy?: boolean; // MAIL_COPY_TO — only aliexpress-joom and dostavka-rus, whose PHP did this
};

const DEFAULT_TITLE = "Заявка на просчет заказа успешно зарегистрирована";
/**
 * Builds the confirmation e-mail: subject, an HTML body and a plain-text body.
 * The text version is not optional — mail without one scores lower with spam
 * filters, and some clients show only the text part.
 */
export function orderConfirmation({
  rows,
  site,
  title = DEFAULT_TITLE,
}: {
  rows: Row[];
  site: string;
  title?: string;
}) {
  const items = compact(rows);
  const help = `${site}/post-karantin.php#openModal-callcenter`;

  const tableHtml = items
    .map((r, i, arr) => {
      const prev = arr[i - 1];
      return isSection(r)
        ? sectionHtml(r.section, i === 0)
        : fieldHtml(r, prev === undefined || isSection(prev)); // first row, or right under a heading
    })
    .join("");

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
  <!-- preheader: the grey preview line after the subject in the inbox list -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(title)} — проверьте указанные данные.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr><td style="background:${BRAND};padding:18px 28px;">
          <div style="font:bold 22px/1 ${FONT};letter-spacing:1px;color:#ffffff;">НАША ПОЧТА</div>
          <div style="font:12px/1.6 ${FONT};color:#ffe3e4;text-transform:uppercase;letter-spacing:2px;">почта по-новому</div>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;">
          <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:#fdecec;font:bold 12px/1.4 ${FONT};color:${BRAND};">✓ Заявка принята</div>
          <h1 style="margin:14px 0 6px;font:bold 21px/1.3 ${FONT};color:${INK};">${esc(title)}</h1>
          <p style="margin:0;font:14px/1.5 ${FONT};color:${MUTED};">Проверьте, пожалуйста, данные, которые вы указали в заявке:</p>
        </td></tr>
        <tr><td style="padding:8px 28px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tableHtml}
          </table>
        </td></tr>
        <tr><td style="padding:16px 28px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-left:4px solid ${BRAND};border-radius:6px;">
            <tr><td style="padding:16px 18px;font:14px/1.5 ${FONT};color:${INK};">
              <b>Нашли ошибку в данных?</b><br>
              Свяжитесь с нами по телефонам, указанным на сайте — мы всё исправим.
              <div style="margin-top:12px;"><a href="${esc(help)}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:${BRAND};color:#ffffff;font:bold 14px/1 ${FONT};text-decoration:none;">Контакты «Наша Почта»</a></div>
            </td></tr>
          </table>
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td style="padding:16px 28px;font:12px/1.5 ${FONT};color:${MUTED};text-align:center;">
          Это письмо сформировано автоматически службой уведомлений сайта компании. Отвечать на него не нужно.<br>
          © «Наша Почта» · <a href="${esc(site)}" style="color:${MUTED};">${esc(site.replace(/^https?:\/\//, ""))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    title,
    "",
    ...items.map((r) =>
      isSection(r) ? `\n${r.section.toUpperCase()}` : `${r[0].trim()}: ${r[1]}`,
    ),
    "",
    "Это письмо сформировано автоматически. Отвечать на него не нужно.",
    `Если Вы обнаружили ошибку в указанных данных, обратитесь по телефонам на сайте: ${help}`,
  ].join("\n");
  return { subject: "Подтверждение регистрации заявки", html, text };
}

/**
 * Sends the order confirmation: to the customer, and — only when mailToCopy is
 * set (the two forms whose PHP did this) — a copy to MAIL_COPY_TO. Each is a
 * separate message, so one rejected address can't sink the other.
 * The customer address is skipped unless it's a valid e-mail (forms send "0"
 * for none). Never throws: every attempt, sent or failed, becomes an
 * email_logs row — the caller fires this with `void`.
 */
export async function sendOrderConfirmation({
  rows,
  customer,
  site,
  label,
  confirmationTitle: title,
  mailToCopy,
}: {
  rows: Row[];
  customer: string | undefined;
  site: string;
  label: string;
  confirmationTitle?: string;
  mailToCopy?: boolean;
}) {
  const { subject, html, text } = orderConfirmation({ rows, site, title });
  const customerTo =
    customer && z.email().safeParse(customer).success
      ? [{ addr: customer, kind: "customer" as const }]
      : [];
  const capped =
    customerTo[0] !== undefined &&
    (await overRecipientCap(recipientKey(customerTo[0].addr)));
  const to = [
    ...(capped ? [] : customerTo), // the copy below is ours — never capped
    ...(mailToCopy && env.MAIL_COPY_TO
      ? [{ addr: env.MAIL_COPY_TO, kind: "copy" as const }]
      : []),
  ];
  // a capped customer still gets an email_logs row, so the block is visible
  const skipped = capped
    ? customerTo.map((r) => ({
        ...r,
        ok: false as const,
        error: `skipped: over the ${RECIPIENT_HOURLY_CAP}/hour cap`,
      }))
    : [];
  const sent = await Promise.all(
    to.map(async ({ addr, kind }) => ({
      addr,
      kind,
      ...(await sendMailSafe(addr, subject, html, text)),
    })),
  );
  try {
    await prisma.emailLog.createMany({
      data: [...skipped, ...sent].map((r) => ({
        label,
        recipient: r.addr,
        recipientKey: recipientKey(r.addr),
        kind: r.kind,
        success: r.ok,
        messageId: r.ok ? r.messageId : null,
        errorMessage: r.ok ? null : r.error,
      })),
    });
  } catch (err) {
    // the caller fires this with `void`, so a throw here would become an unhandled rejection
    console.error(`[mail/${label}] EmailLog write failed:`, err);
  }
}

/**
 * The site the customer came from, used for the help link in the e-mail
 * (the Node version of the PHP currentDomain). The Origin header is
 * trusted only when it's on the CORS allowlist; otherwise falls back to donbass-post.ru.
 */
export function siteFromRequest(request: Request) {
  const origin = request.headers.get("Origin");
  return origin && isOriginAllowed(origin) ? origin : "https://donbass-post.ru";
}

/**
 * Fires the confirmation for a handled order without awaiting it: the client
 * gets its response now, and a slow mail server can't delay it. Safe to call
 * with `void` because sendOrderConfirmation never throws.
 */
export function confirmOrder<T>(
  mail: MailOptions<T>,
  data: T,
  request: Request,
  label: string,
) {
  void sendOrderConfirmation({
    rows: mail.rows(data),
    customer: mail.to(data),
    site: siteFromRequest(request),
    label,
    confirmationTitle: mail.title,
    mailToCopy: mail.copy,
  });
}

// Same prefixes forms.js writes in buildBody — keep the two lists in sync
const DELIVERY_PREFIX =
  /^(Пункт выдачи|Адресная доставка(?:\((?:ЛДНР|Крым)\))?|ПВЗ СДЭК):\s*([\s\S]*)$/i;

/**
 * Turns the client's "<mode>: <place>" departament into its own row, so the
 * e-mail says «Адресная доставка — ул. …» instead of a combined label with the
 * prefix repeated in the value. Unprefixed values (cart, dostavka-rus send a
 * plain point name) keep the fallback label.
 */
export function deliveryRow(
  departament: string,
  fallback = "Пункт выдачи",
): Row {
  const m = DELIVERY_PREFIX.exec(departament);
  if (!m) return [fallback, departament];
  const [, label, place] = m; // groups 1 and 2 always exist on a match
  return [label ?? fallback, place ?? ""]; // ?? only satisfies noUncheckedIndexedAccess
}

/** A sub-heading inside the data table («Отправитель», «Данные о грузе», …). */
export const section = (title: string): Section => ({ section: title });

// Array.isArray tells the two apart: a Field is a tuple, a Section is an object
function isSection(r: Row): r is Section {
  return !Array.isArray(r);
}
/** Empty = absent, or whitespace-only once stringified. Numbers (0 included) and booleans count as filled. */
function hasValue(v: unknown) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}

/**
 * Drops empty fields, then any section heading that has no field left under it —
 * so an absent customer removes «Заказчик» together with its rows.
 */
function compact(rows: Row[]): Row[] {
  const kept = rows.filter((r) => isSection(r) || hasValue(r[1]));
  return kept.filter((r, i) => {
    const next = kept[i + 1]; // possibly undefined (noUncheckedIndexedAccess)
    return !isSection(r) || (next !== undefined && !isSection(next));
  });
}

// Brand palette — taken from the site (color-red.css) so the mail looks like the forms
const BRAND = "#ed1b23";
const INK = "#1f2328"; // body text
const MUTED = "#6b7280"; // labels, footer
const LINE = "#ececec"; // row separators
const BG = "#f3f4f6"; // page behind the card
const FONT = "Arial, Helvetica, sans-serif"; // web fonts don't load in most mail clients

/** A red uppercase sub-heading row spanning both columns. */
function sectionHtml(title: string, first: boolean) {
  return `
          <tr><td colspan="2" style="padding:${first ? 4 : 22}px 0 6px;border-bottom:2px solid ${BRAND};font:bold 12px/1.4 ${FONT};color:${BRAND};text-transform:uppercase;letter-spacing:1px;">${esc(title)}</td></tr>`;
}

/** One label/value line. No top border right under a heading (the heading's underline is enough). */
function fieldHtml([label, value]: Field, noBorder: boolean) {
  const border = noBorder ? "" : `border-top:1px solid ${LINE};`;
  return `
          <tr>
            <td style="padding:12px 0;${border}font:13px/1.4 ${FONT};color:${MUTED};width:38%;vertical-align:top;">${esc(label.trim())}</td>
            <td style="padding:12px 0 12px 16px;${border}font:15px/1.45 ${FONT};color:${INK};vertical-align:top;word-break:break-word;">${esc(value).replace(/\n/g, "<br>")}</td>
          </tr>`;
}
