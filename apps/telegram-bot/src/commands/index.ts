import type { Bot } from "grammy";
import { NotificationTypes } from "@/notifications/notification-types";
import { getRootAdminChatId, userHasPermission } from "@/rbac/guards";
import { getAllManagers } from "@/managers/service";
import {
  adminCommands,
  managerCommands,
  publicCommands,
} from "@/commands/groups";
import type { TContext } from "@/types/context";
import { commandNotFound } from "@grammyjs/commands";

import "@/commands/public";
import "@/commands/manager";
import "@/commands/admin";

import { setCommandsForChat, suggestionHandler } from "@/commands/utils";
import { Permissions } from "@/rbac/types";

export const VALID_SLUGS = Object.values(NotificationTypes);

export async function registerCommands(bot: Bot<TContext>) {
  try {
    // Register command groups as middleware so grammY routes incoming
    // commands to the correct handler. Order matters — public first,
    // then manager, then admin, so more specific groups don't shadow
    // broader ones unexpectedly.
    bot.use(publicCommands);

    // managerCommands = /status, /preferences → gated by bot:view-status
    const managerRouter = bot.filter(async (ctx) =>
      userHasPermission(ctx, Permissions.BOT_VIEW_STATUS),
    );
    managerRouter.use(managerCommands);

    // adminCommands = /addmanager etc. → gated by users:manage
    const adminRouter = bot.filter(async (ctx) =>
      userHasPermission(ctx, Permissions.USERS_MANAGE),
    );
    adminRouter.use(adminCommands);

    bot
      .filter(commandNotFound([publicCommands, managerCommands, adminCommands]))
      .use(async (ctx) => {
        const userId = ctx.from?.id;
        if (!userId) {
          await ctx.reply("😕 Неизвестная команда.");
          return;
        }

        // 1. Check if user is admin
        if (await userHasPermission(ctx, Permissions.USERS_MANAGE)) {
          await suggestionHandler(ctx);
          return;
        }

        // Case 2: Manager typed an admin-only command
        const isManager = await userHasPermission(
          ctx,
          Permissions.BOT_VIEW_STATUS,
        );
        if (isManager) {
          const adminSuggestion = ctx.getNearestCommand(adminCommands);
          if (adminSuggestion) {
            await ctx.reply("⛔ Эта команда только для администратора.");
            return;
          }

          await suggestionHandler(ctx);
          return;
        }

        // Case 3: Normal unknown command → show suggestion
        await ctx.reply("😕 Неизвестная команда. Используйте /help.");
      });

    // Register public commands with their default scope.
    // setCommands calls bot.api.setMyCommands for every scope+language
    // combination defined on the group, and validates command names.
    await publicCommands.setCommands(bot);

    /*
    // setCommands internally does roughly this:
    // 1. Get all scope+language combinations from the group
    const { scopes } = publicCommands.toArgs();

    // 2. For each combination, make one Telegram API call
    // This is exactly what setCommands abstracts away
    for (const arg of scopes) {
      await bot.api.setMyCommands(
        arg.commands,          // the command list for this scope+language
        {
          scope: arg.scope,                    // e.g. { type: "default" }
          language_code: arg.language_code,    // e.g. "ru", "uk", or undefined
        }
      );
    } */

    // Safety net: explicitly set public commands for all private chats.
    // Telegram's "default" scope is a catch-all, but "all_private_chats"
    // is more specific and wins in private conversations.
    // We loop over scopes (instead of taking scopes[0]) to correctly
    // handle all language variants when localizations are added later.
    const publicArgs = publicCommands.toArgs();
    for (const arg of publicArgs.scopes) {
      await bot.api.setMyCommands(arg.commands, {
        scope: { type: "all_private_chats" },
        language_code: arg.language_code, // preserve language variants
      });
    }

    // Set manager commands scoped to each manager's specific chat.
    // This is per-chat rather than global so that only known managers
    // see these commands in their menu — not every user.
    const managerIds = await getAllManagers();
    for (const { chatId } of managerIds) {
      await setCommandsForChat(bot, chatId, publicCommands, managerCommands);
    }

    // Set admin commands scoped only to the root admin's chat.
    // ROOT_ADMIN_CHAT_ID is guaranteed to exist in production by validateConfig()
    // which throws on startup if it's missing. Safe to skip only in development.
    const adminId = getRootAdminChatId();
    if (adminId) {
      await setCommandsForChat(
        bot,
        adminId,
        publicCommands,
        managerCommands,
        adminCommands,
      );
    }

    // Log a summary of registered commands for observability
    const counts = {
      public: publicCommands.commands.length,
      manager: managerCommands.commands.length,
      admin: adminCommands.commands.length,
    };

    console.info(
      `Commands registered: ${counts.public} public, ${counts.manager} manager, ${counts.admin} admin`,
    );
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
}
