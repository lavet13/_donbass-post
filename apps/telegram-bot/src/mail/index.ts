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
  const html = `<h3>${esc(title)}</h3>
<h5>Указанные данные</h5>
${filled.map(([l, v]) => `<p><b>${esc(l)}</b><br>${esc(v)}</p>`).join("\n")}
<p><i>Это письмо сформировано автоматически службой уведомлений сайта компании. Отвечать на него не нужно.</i></p>
<p><b>Если Вы обнаружили ошибку в указанных данных - обратитесь по телефонам, указанным на сайте <a href="${esc(help)}">Наша Почта</a>.</b></p>`;
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
