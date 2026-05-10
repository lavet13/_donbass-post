import type { TContext } from "@/types";
import type { CommandGroup } from "@grammyjs/commands";
import {
  adminCommands,
  LOCALES,
  managerCommands,
  publicCommands,
} from "@/commands/groups";
import type { Bot } from "grammy";
import type { BotCommand } from "grammy/types";

export function getCommandListText({
  manager = false,
  admin = false,
}: {
  manager?: boolean;
  admin?: boolean;
}): string {
  const lines: string[] = [];

  const addInlineCommands = (group: CommandGroup<TContext>) => {
    for (const cmd of group.commands) {
      lines.push(`/${cmd.stringName} - ${cmd.description}`);
    }
  };

  addInlineCommands(publicCommands);

  if (manager || admin) {
    addInlineCommands(managerCommands);
  }

  if (admin) {
    addInlineCommands(adminCommands);
  }

  if (lines.length === 0) return "Команд пока нет 😔";

  return "Доступные команды:\n" + lines.join("\n");
}

/**
 * Sets the bot command menu for a **specific chat** by merging commands
 * from one or more CommandGroups.
 *
 * Why we merge:
 * Telegram's setMyCommands REPLACES the previous list completely.
 * If we called it once per group, only the last group would remain visible.
 *
 * Scope used: "chat" (highest priority for this exact chatId)
 *
 * @param bot - The bot instance, used to access the Telegram API
 * @param chatId - The specific chat to set commands for
 * @param groups - One or more CommandGroups whose commands will be merged
 */
export async function setCommandsForChat(
  bot: Bot<TContext>,
  chatId: number,
  ...groups: CommandGroup<TContext>[]
) {
  // LOCALES = [undefined, "ru", "uk", "en"] — we support default + localized menus
  for (const languageCode of LOCALES) {
    const mergeCommands: BotCommand[] = [];

    // Step 1: Collect commands from every group for this language
    for (const group of groups) {
      const elementals = group.toElementals(languageCode);

      // Convert internal "elemental" format → simple BotCommand[]
      for (const el of elementals) {
        mergeCommands.push({
          command: el.command,
          description: el.description,
        });
      }
    }

    // Step 2: Safety — never send an empty command list to Telegram
    // Telegram behavior with empty list is inconsistent (some clients clear the menu,
    // others ignore it). Better to skip.
    if (mergeCommands.length === 0) {
      continue;
    }

    // Step 3: Send the merged list for this language + chat
    await bot.api.setMyCommands(mergeCommands, {
      scope: { type: "chat", chat_id: chatId },
      language_code: languageCode, // undefined = default language
    });
  }
}

// TContext extended with the commandSuggestion property that
// commandNotFound adds when it finds a close match
type SuggestionContext = TContext & { commandSuggestion: string | null };

export async function suggestionHandler(ctx: SuggestionContext): Promise<void> {
  if (ctx.commandSuggestion) {
    // A close match was found — suggest it to the user
    await ctx.reply(
      `🤔 Не знаю такой команды. Может, вы имели в виду <b>${ctx.commandSuggestion}</b>?`,
      { parse_mode: "HTML" },
    );
  } else {
    // No close match — generic fallback
    await ctx.reply("😕 Неизвестная команда. Используйте /help.");
  }
}
