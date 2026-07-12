import { getAllManagers } from "@/managers/service";
import { VALID_SLUGS } from "@/commands";
import type { NotificationType } from "@/notifications/notification-types";
import z from "zod";

// type guard check for notification slugs
// as asserts; a guard verifies then narrows. That's the difference.
export function isNotificationSlug(s: string): s is NotificationType {
  return (VALID_SLUGS as readonly string[]).includes(s);
}

// Pure: no ctx, no DB. Testable in isolation. Note Number+isInteger is STRICTER than the old one
// parseInt(x,10)+isNaN: parseInt("123abc") → 123 (silently accepts trailing junk) and
// parseInt("12.9") → 12; Number("123abc") → NaN and Number("12.9") → 12.9 (isInteger false).
// For a whole-token chatId you want the strict version — reject "123abc", not truncate it.
const ChatId = z.coerce.number().int(); // coerce = Number(raw); .int() rejects NaN & floats
export function parseChatId(raw: string): number | null {
  const r = ChatId.safeParse(raw);
  return r.success ? r.data : null;
}

type ParsedArgs =
  | { ok: true; chatId: number; rest: string[] }
  | { ok: false; error: string };

export function parseCommandArgs(text: string, usage: string): ParsedArgs {
  const [chatIdStr, ...rest] = text.trim().split(/\s+/).slice(1);
  if (!chatIdStr) return { ok: false, error: usage };

  const chatId = parseChatId(chatIdStr);
  if (chatId === null) {
    return {
      ok: false,
      error: `❌ Некорректный Chat ID: <code>${chatIdStr}</code>`,
    };
  }

  return { ok: true, chatId, rest };
}

type ManagerCommand =
  | { ok: true; chatId: number; rest: string[]; userId: string }
  | { ok: false; error: string };

//
// parse + authorize. Returns DATA (doesn't reply itself) → no hidden I/O on the error path,
// and the whole thing stays unit-testable.
export async function resolveManagerCommand(
  text: string,
  usage: string,
): Promise<ManagerCommand> {
  const parsedArgs = parseCommandArgs(text, usage);

  if (!parsedArgs.ok) {
    return parsedArgs;
  }
  const { chatId, rest } = parsedArgs;

  const managers = await getAllManagers();
  const manager = managers.find((m) => m.chatId === chatId);
  if (manager === undefined) {
    return {
      ok: false,
      error:
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден.\n` +
        "Сначала добавьте его через /addmanager.",
    };
  }

  return {
    ok: true,
    chatId,
    rest,
    userId: manager.userId,
  };
}
