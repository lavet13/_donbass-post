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

// The PHP put raw $_POST values into the HTML. Anyone could type
// <a href="...">Оплатить</a> as their name and get a phishing link
// sent from your domain. Every user value goes through esc().
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

export function orderConfirmation(rows: Row[], site: string) {
  const help = `${site}/post-karantin.php#openModal-callcenter`;
  const html = `<h3>Заявка на просчет заказа успешно зарегистрирована</h3>
<h5>Указанные данные</h5>
${rows.map(([l, v]) => `<p><b>${esc(l)}</b><br>${esc(v)}</p>`).join("\n")}
<p><i>Это письмо сформировано автоматически службой уведомлений сайта компании. Отвечать на него не нужно.</i></p>
<p><b>Если Вы обнаружили ошибку в указанных данных - обратитесь по телефонам, указанным на сайте <a href="${esc(help)}">Наша Почта</a>.</b></p>`;
  const text = [
    "Заявка на просчет заказа успешно зарегистрирована",
    "",
    ...rows.map(([l, v]) => `${l}: ${v ?? ""}`),
    "",
    "Это письмо сформировано автоматически. Отвечать на него не нужно.",
    `Если Вы обнаружили ошибку в указанных данных, обратитесь по телефонам на сайте: ${help}`,
  ].join("\n");
  return { subject: "Подтверждение регистрации заявки", html, text };
}

/** Customer (if the address is real) + manager copy, each sent separately. */
export async function sendOrderConfirmation(
  rows: Row[],
  customer: string | undefined,
  site: string,
  label: string,
) {
  const { subject, html, text } = orderConfirmation(rows, site);
  const to = [
    ...(customer && z.email().safeParse(customer).success
      ? [{ addr: customer, kind: "customer" as const }]
      : []),
    ...(env.MAIL_COPY_TO
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

// `{$currentDomain}` from the PHP: use the form's Origin if it's one of ours.
// isOriginAllowed is the function your cors middleware already uses.
export function siteFromRequest(request: Request) {
  const origin = request.headers.get("Origin");
  return origin && isOriginAllowed(origin) ? origin : "https://donbass-post.ru";
}
