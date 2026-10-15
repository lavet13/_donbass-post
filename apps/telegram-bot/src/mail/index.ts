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

export type Row = [label: string, value: unknown];

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
  const filled = rows.filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  const help = `${site}/post-karantin.php#openModal-callcenter`;
  // Brand palette — taken from the site (color-red.css) so the mail looks like the forms
  const BRAND = "#ed1b23";
  const INK = "#1f2328"; // body text
  const MUTED = "#6b7280"; // labels, footer
  const LINE = "#ececec"; // row separators
  const BG = "#f3f4f6"; // page behind the card
  const FONT = "Arial, Helvetica, sans-serif"; // web fonts don't load in most mail clients

  /** One label/value line of the data table. The first row has no top border. */
  function rowHtml([label, value]: Row, i: number) {
    const border = i ? `border-top:1px solid ${LINE};` : "";
    return `
          <tr>
            <td style="padding:12px 0;${border}font:13px/1.4 ${FONT};color:${MUTED};width:38%;vertical-align:top;">${esc(label)}</td>
            <td style="padding:12px 0 12px 16px;${border}font:15px/1.45 ${FONT};color:${INK};vertical-align:top;word-break:break-word;">${esc(value).replace(/\n/g, "<br>")}</td>
          </tr>`;
  }
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${filled.map(rowHtml).join("")}
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
    ...filled.map(([l, v]) => `${l}: ${v}`),
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
  const to = [
    ...(customer && z.email().safeParse(customer).success
      ? [{ addr: customer, kind: "customer" as const }]
      : []),
    ...(mailToCopy && env.MAIL_COPY_TO
      ? [{ addr: env.MAIL_COPY_TO, kind: "copy" as const }]
      : []),
  ];
  // each result carries its own address → no parallel-array indexing to type-check
  const results = await Promise.all(
    to.map(async ({ addr, kind }) => ({
      addr,
      kind,
      ...(await sendMailSafe(addr, subject, html, text)),
    })),
  );
  try {
    // createMany = one INSERT for both rows
    await prisma.emailLog.createMany({
      data: results.map((r) => ({
        label,
        recipient: r.addr,
        kind: r.kind,
        success: r.ok,
        messageId: r.ok ? r.messageId : null, // r.ok narrows the union, so each side type-checks
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

export type MailOptions<T> = {
  rows: (data: T) => Row[];
  to: (data: T) => string | undefined; // the customer's address field
  title?: string;
  copy?: boolean; // MAIL_COPY_TO — only aliexpress-joom and dostavka-rus, whose PHP did this
};

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
