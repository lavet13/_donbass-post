This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/telegram-bot/**/*
- Files matching these patterns are excluded: apps/telegram-bot/src/lib/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/telegram-bot/.env.sample
apps/telegram-bot/.gitignore
apps/telegram-bot/docker-compose.yml
apps/telegram-bot/ecosystem.config.cjs
apps/telegram-bot/environments.d.ts
apps/telegram-bot/eslint.config.ts
apps/telegram-bot/package.json
apps/telegram-bot/prettier.config.ts
apps/telegram-bot/prisma.config.ts
apps/telegram-bot/src/bot.ts
apps/telegram-bot/src/commands/admin/addmanager.ts
apps/telegram-bot/src/commands/admin/allpreferences.ts
apps/telegram-bot/src/commands/admin/appendpreference.ts
apps/telegram-bot/src/commands/admin/index.ts
apps/telegram-bot/src/commands/admin/managers.ts
apps/telegram-bot/src/commands/admin/removemanager.ts
apps/telegram-bot/src/commands/admin/removepreference.ts
apps/telegram-bot/src/commands/admin/setpreference.ts
apps/telegram-bot/src/commands/groups.ts
apps/telegram-bot/src/commands/guards.ts
apps/telegram-bot/src/commands/index.ts
apps/telegram-bot/src/commands/manager/index.ts
apps/telegram-bot/src/commands/manager/preferences.ts
apps/telegram-bot/src/commands/manager/status.ts
apps/telegram-bot/src/commands/public/getchatid.ts
apps/telegram-bot/src/commands/public/help.ts
apps/telegram-bot/src/commands/public/index.ts
apps/telegram-bot/src/commands/public/start.ts
apps/telegram-bot/src/commands/utils.ts
apps/telegram-bot/src/config.ts
apps/telegram-bot/src/env.ts
apps/telegram-bot/src/formatters/messages.ts
apps/telegram-bot/src/middleware/index.ts
apps/telegram-bot/src/prisma/index.ts
apps/telegram-bot/src/prisma/migrations/20260220020200_init/migration.sql
apps/telegram-bot/src/prisma/migrations/migration_lock.toml
apps/telegram-bot/src/prisma/schema.prisma
apps/telegram-bot/src/prisma/seed.ts
apps/telegram-bot/src/router.ts
apps/telegram-bot/src/routes/index.ts
apps/telegram-bot/src/server.ts
apps/telegram-bot/src/services/manager-preferences.service.ts
apps/telegram-bot/src/services/notification.service.ts
apps/telegram-bot/src/types.ts
apps/telegram-bot/src/types/notification-types.ts
apps/telegram-bot/src/types/notifications.ts
apps/telegram-bot/src/utils.ts
apps/telegram-bot/src/utils/validate.ts
apps/telegram-bot/todo.md
apps/telegram-bot/tsconfig.json
apps/telegram-bot/tsup.config.ts
```

# Files

## File: apps/telegram-bot/src/commands/admin/addmanager.ts
```typescript
import { getBotManager } from "@/bot";
import { addManager, getAllManagers } from "@/services/manager-preferences.service";
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { setCommandsForChat } from "@/commands/utils";
import { managerCommands, publicCommands } from "../groups";

/**
 * /addmanager <chatId> [username] [firstName] [lastName]
 *
 * Examples:
 *   /addmanager 123456789
 *   /addmanager 123456789 john_doe John Doe
 */
export const addManagerCommand = new Command<TContext>("addmanager", "Добавить менеджера", async (ctx) => {
  const text = ctx.message?.text ?? "";
  const parts = text.trim().split(/\s+/).slice(1); // drop "/addmanager"

  if (parts.length === 0) {
    await ctx.reply(
      "❌ <b>Использование:</b>\n" +
        "<code>/addmanager &lt;chatId&gt; [username] [firstName] [lastName]</code>\n\n" +
        "Примеры:\n" +
        "<code>/addmanager 123456789</code>\n" +
        "<code>/addmanager 123456789 john_doe John Doe</code>",
      { parse_mode: "HTML" },
    );
    return;
  }

  const [chatIdStr, username, firstName, lastName] = parts as [
    string,
    string,
    string,
    string,
  ];

  const chatId = parseInt(chatIdStr, 10);

  if (isNaN(chatId)) {
    await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
      parse_mode: "HTML",
    });
    return;
  }

  const existingManagers = await getAllManagers();

  if (existingManagers.includes(chatId)) {
    await ctx.reply(
      `⚠ Менеджер с Chat ID <code>${chatId}</code> уже существует.`,
      { parse_mode: "HTML" },
    );
    return;
  }

  try {
    await addManager({
      chatId,
      username,
      firstName,
      lastName,
    });

    const bot = getBotManager().getBot();
    // Update the new manager's chat menu to show public + manager commands.
    // Must include publicCommands too — setMyCommands replaces, not appends.
    await setCommandsForChat(bot, chatId, publicCommands, managerCommands);

    const displayName = [firstName, lastName].filter(Boolean).join(" ");
    const usernameStr = username ? ` (@${username})` : "";

    await ctx.reply(
      `✅ Менеджер добавлен:\n\n` +
        `Chat ID: <code>${chatId}</code>\n` +
        (displayName ? `Имя: ${displayName}${usernameStr}\n` : "") +
        `\nУведомления не настроены. Используйте:\n` +
        `<code>/setpreferences ${chatId} &lt;slug1&gt; [slug2 ...]</code>`,
      { parse_mode: "HTML" },
    );
  } catch (err) {
    console.error("Error in /addmanager:", err);
    await ctx.reply(
      "❌ Произошла ошибка при добавлении менеджера. Попробуйте позже.",
    );
  }
});
```

## File: apps/telegram-bot/src/commands/admin/allpreferences.ts
```typescript
import { getAllPreferences } from "@/services/manager-preferences.service";
import type { TContext } from "@/types";
import { NotificationTypeNames } from "@/types/notification-types";
import { Command } from "@grammyjs/commands";

export const allPreferencesCommand = new Command<TContext>(
  "allpreferences",
  "Настройки всех менеджеров",
  async (ctx) => {
    try {
      const allPreferences = await getAllPreferences();

      if (allPreferences.length === 0) {
        await ctx.reply(
          "<b>Менеджеры не настроены</b>\n\n" +
            "В базе данных нет активных менеджеров.\n" +
            "Используйте команду для миграции из переменных окружения.",
          { parse_mode: "HTML" },
        );
        return;
      }

      const lines: string[] = ["👥 <b>Настройки уведомлений менеджеров</b>\n"];

      if (allPreferences.length === 0) {
        lines.push("В базе данных нет менеджеров с настройками\n");
        await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
        return;
      }

      for (const [index, preference] of allPreferences.entries()) {
        lines.push(`${index + 1}. Chat ID: <code>${preference.chatId}</code>`);

        if (preference.notifications.length === 0) {
          lines.push("   └ 🔕 Все уведомления отключены");
        } else {
          lines.push("   └ Получает:");
          preference.notifications.forEach((type) => {
            lines.push(`      • ${NotificationTypeNames[type]}`);
          });
        }

        lines.push(""); // Empty line between managers
      }

      lines.push(
        "Для изменения настроек используйте команды управления менеджерами",
      );

      await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
    } catch (err) {
      console.error("Error in allpreferences command:", err);
      await ctx.reply(
        "❌ Произошла ошибка при получении настроек. Попробуйте позже.",
      );
    }
  },
);
```

## File: apps/telegram-bot/src/commands/admin/appendpreference.ts
```typescript
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { VALID_SLUGS } from "..";
import { NotificationTypeNames, type NotificationType } from "@/types/notification-types";
import { getAllManagers, getManagerNotifications, isManagerSubscribed, setManagerPreferences } from "@/services/manager-preferences.service";

/**
 * /appendpreference <chatId> <slug>
 *
 * Adds a single notification type to a manager's existing preferences.
 * Unlike /setpreferences, this does NOT clear existing subscriptions.
 *
 * Examples:
 *   /appendpreference 123456789 ali-parcel-pickup
 */
export const appendPreferenceCommand = new Command<TContext>(
  "appendpreference",
  "Добавить тип уведомлений менеджеру",
  async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.trim().split(/\s+/).slice(1); // drop /appendpreference

    if (parts.length < 2) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/appendpreference &lt;chatId&gt; &lt;slug&gt;</code>\n\n" +
          "Доступные слаги:\n" +
          VALID_SLUGS.map(
            (s) => `<code>${s}</code> — ${NotificationTypeNames[s]}`,
          ).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr, slug] = parts as [string, NotificationType];
    const chatId = parseInt(chatIdStr, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    if (!VALID_SLUGS.includes(slug as NotificationType)) {
      await ctx.reply(
        `❌ Неизвестный слаг: <code>${slug}</code>\n\n` +
          "Доступные:\n" +
          VALID_SLUGS.map((s) => `<code>${s}</code>`).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const allManagers = await getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      const alreadySubscribed = await isManagerSubscribed(chatId, slug);
      if (alreadySubscribed) {
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> уже подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
        return;
      }

      const current = await getManagerNotifications(chatId);
      await setManagerPreferences(chatId, [...current, slug]);

      await ctx.reply(
        `✅ Менеджер <code>${chatId}</code> подписан на <b>${NotificationTypeNames[slug]}</b>.\n\n` +
          "Текущие подписки:\n" +
          [...current, slug]
            .map((s) => `${NotificationTypeNames[s]}`)
            .join("\n"),
        { parse_mode: "HTML" },
      );
    } catch (err) {
      console.error("Error in /appendpreference:", err);
      await ctx.reply("❌ Произошла ошибка. Попробуйте позже.");
    }
  },
);
```

## File: apps/telegram-bot/src/commands/admin/index.ts
```typescript
import { adminCommands } from "@/commands/groups";
import { addManagerCommand } from "./addmanager";
import { managersCommand } from "./managers";
import { removeManagerCommand } from "./removemanager";
import { appendPreferenceCommand } from "./appendpreference";
import { setPreferenceCommand } from "./setpreference";
import { removePreferenceCommand } from "./removepreference";
import { allPreferencesCommand } from "./allpreferences";

adminCommands.add([
  managersCommand,
  addManagerCommand,
  removeManagerCommand,
  appendPreferenceCommand,
  removePreferenceCommand,
  setPreferenceCommand,
  allPreferencesCommand,
]);
```

## File: apps/telegram-bot/src/commands/admin/managers.ts
```typescript
import { Command } from "@grammyjs/commands";
import { isActiveManager, isRootAdmin } from "../guards";
import type { TContext } from "@/types";
import { prisma } from "@/prisma";
import { getCommandListText } from "@/commands/utils";

export const managersCommand = new Command<TContext>(
  "managers",
  "Информация о менеджерах",
  async (ctx) => {
    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    const managers = await prisma.manager.findMany({
      where: {
        telegramUser: { isActive: true },
      },
      include: {
        telegramUser: true,
      },
    });

    if (managers.length === 0) {
      await ctx.reply(
        "<b>Менеджеры не настроены</b>\n\n" +
          "Добавьте менеджеров командой /addmanager",
        { parse_mode: "HTML" },
      );
      return;
    }

    const list = managers.map(
      (manager, index) =>
        `${index + 1}. Chat ID: <code>${manager.telegramUser.chatId}</code>`,
    );

    await ctx.reply(
      `👥 <b>Список менеджеров</b>\n\n` +
        `Всего менеджеров: ${managers.length}\n\n` +
        `${list.join("\n")}\n\n` +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);
```

## File: apps/telegram-bot/src/commands/admin/removemanager.ts
```typescript
import { getBotManager } from "@/bot";
import { getAllManagers, removeManager } from "@/services/manager-preferences.service";
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { setCommandsForChat } from "@/commands/utils";
import { publicCommands } from "@/commands/groups";

/**
 * /removemanager <chatId>
 *
 * Marks the manager as inactive (does not delete from DB).
 *
 * Example:
 *   /removemanager 123456789
 */
export const removeManagerCommand = new Command<TContext>("removemanager", "Удалить менеджера", async (ctx) => {
  const text = ctx.message?.text ?? "";
  const parts = text.trim().split(/\s+/).slice(1); // drop "/removemanager"

  if (parts.length === 0) {
    await ctx.reply(
      "❌ <b>Использование:</b>\n" +
        "<code>/removemanager &lt;chatId&gt;</code>\n\n" +
        "Пример:\n" +
        "<code>/removemanager 123456789</code>",
      { parse_mode: "HTML" },
    );
    return;
  }

  const [chatIdStr] = parts as [string];
  const chatId = parseInt(chatIdStr, 10);

  if (isNaN(chatId)) {
    await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
      parse_mode: "HTML",
    });
    return;
  }

  const existingManagers = await getAllManagers();
  if (!existingManagers) {
    await ctx.reply(
      `❌ Активный менеджер с Chat ID <code>${chatId}</code> не найден.`,
      { parse_mode: "HTML" },
    );
    return;
  }

  // Prevent self-removal
  if (ctx.from?.id === chatId) {
    await ctx.reply("⛔ Нельзя удалить самого себя.", { parse_mode: "HTML" });
    return;
  }

  try {
    await removeManager(chatId);

    const bot = getBotManager().getBot();
    // Demote the removed manager's chat menu back to public commands only.
    await setCommandsForChat(bot, chatId, publicCommands);

    await ctx.reply(
      `✅ Менеджер <code>${chatId}</code> деактивирован.\n\n` +
        `Данные сохранены в базе. Для полного удаления обратитесь к администратору БД.`,
      { parse_mode: "HTML" },
    );
  } catch (err) {
    console.error("Error in /removemanager:", err);
    await ctx.reply(
      "❌ Произошла ошибка при удалении менеджера. Попробуйте позже.",
    );
  }
});
```

## File: apps/telegram-bot/src/commands/admin/removepreference.ts
```typescript
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { VALID_SLUGS } from "..";
import { NotificationTypeNames, type NotificationType } from "@/types/notification-types";
import { getAllManagers, getManagerNotifications, isManagerSubscribed, setManagerPreferences } from "@/services/manager-preferences.service";

/**
 * /removepreference <chatId> <slug>
 *
 * Removes a single notification type from a manager's existing preferences.
 * Unlike /setpreferences, this does NOT touch other subscriptions.
 *
 * Examples:
 *   /removepreference 123456789 ali-parcel-pickup
 */
export const removePreferenceCommand = new Command<TContext>(
  "removepreference",
  "Удалить тип уведомления у менеджера",
  async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.trim().split(/\s+/).slice(1);

    if (parts.length < 2) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/removepreference &lt;chatId&gt; &lt;slug&gt;</code>\n\n" +
          "Доступные слаги:\n" +
          VALID_SLUGS.map(
            (s) => `  • <code>${s}</code> — ${NotificationTypeNames[s]}`,
          ).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr, slug] = parts as [string, NotificationType];
    const chatId = parseInt(chatIdStr!, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    if (!VALID_SLUGS.includes(slug as NotificationType)) {
      await ctx.reply(
        `❌ Неизвестный слаг: <code>${slug}</code>\n\n` +
          "Доступные:\n" +
          VALID_SLUGS.map((s) => `  • <code>${s}</code>`).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const allManagers = await getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      const isSubscribed = await isManagerSubscribed(chatId, slug);
      if (!isSubscribed) {
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> не подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
        return;
      }

      const current = await getManagerNotifications(chatId);
      const updated = current.filter((s) => s !== slug);
      await setManagerPreferences(chatId, updated);

      if (updated.length === 0) {
        await ctx.reply(
          `✅ Подписка на <b>${NotificationTypeNames[slug]}</b> удалена у менеджера <code>${chatId}</code>.\n\n` +
            "⚠ Менеджер больше не подписан ни на одно уведомление.",
          { parse_mode: "HTML" },
        );
      } else {
        await ctx.reply(
          `✅ Подписка на <b>${NotificationTypeNames[slug]}</b> удалена у менеджера <code>${chatId}</code>.\n\n` +
            "Оставшиеся подписки:\n" +
            updated.map((s) => `  • ${NotificationTypeNames[s]}`).join("\n"),
          { parse_mode: "HTML" },
        );
      }
    } catch (err) {
      console.error("Error in /removepreference:", err);
      await ctx.reply("❌ Произошла ошибка. Попробуйте позже.");
    }
  },
);
```

## File: apps/telegram-bot/src/commands/admin/setpreference.ts
```typescript
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { VALID_SLUGS } from "..";
import { NotificationTypeNames, type NotificationType } from "@/types/notification-types";
import { getAllManagers, setManagerPreferences } from "@/services/manager-preferences.service";

export const setPreferenceCommand = new Command<TContext>(
  "setpreferences",
  "Задать настройки уведомлений менеджера",
  async (ctx) => {
    const item = ctx.match;
    console.log({ item });
    const text = ctx.message?.text ?? "";
    // e.g. "/setpreferences 123456789 online-pickup-rf pick-up-point-delivery-order"
    const parts = text.trim().split(/\s+/).slice(1);
    if (parts.length < 2) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/setpreferences &lt;chatId&gt; [slug1 slug2 ...]</code>\n\n" +
          "Доступные типы уведомлений:\n" +
          VALID_SLUGS.map(
            (s) => `<code>${s}</code> — ${NotificationTypeNames[s]}`,
          ).join("\n") +
          "\n\nЧтобы <b>снять все</b> подписки — укажите только chatId без слагов.",
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr, ...slugs] = parts as [string, ...NotificationType[]];
    const chatId = parseInt(chatIdStr, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    const invalidSlugs = slugs.filter((s) => !VALID_SLUGS.includes(s));
    if (invalidSlugs.length > 0) {
      await ctx.reply(
        "❌ Неизвестные типы уведомлений:\n" +
          `${invalidSlugs.map((s) => `<code>${s}</code>`).join(", ")}\n\n` +
          "Доступные:\n" +
          VALID_SLUGS.map((s) => `  <code>${s}</code>`).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const allManagers = await getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден в базе данных.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      await setManagerPreferences(chatId, slugs);

      if (slugs.length === 0) {
        await ctx.reply(
          `✅ Все подписки для менеджера <code>${chatId}</code> сняты.`,
          { parse_mode: "HTML" },
        );
      } else {
        const list = slugs
          .map((s) => `  ${NotificationTypeNames[s]}`)
          .join("\n");

        await ctx.reply(
          `✅ Настройки менеджера <code>${chatId}</code> обновлены:\n\n${list}`,
          { parse_mode: "HTML" },
        );
      }
    } catch (err) {
      console.error(`Error in /setpreferences:`, err);
      await ctx.reply(
        `❌ Произошла ошибка при обновлении настроек. Попробуйте позже.`,
      );
    }
  },
);
```

## File: apps/telegram-bot/src/commands/groups.ts
```typescript
import { type TContext } from "@/types";
import { CommandGroup, LanguageCodes } from "@grammyjs/commands";

export const LOCALES = [
  undefined,
  LanguageCodes.Russian,
  LanguageCodes.Ukrainian,
  LanguageCodes.English,
] as const;

export const publicCommands = new CommandGroup<TContext>();

export const adminCommands = new CommandGroup<TContext>();

export const managerCommands = new CommandGroup<TContext>();
```

## File: apps/telegram-bot/src/commands/manager/index.ts
```typescript
import { managerCommands } from "@/commands/groups";
import { statusCommand } from "./status";
import { preferencesCommand } from "./preferences";

managerCommands.add([statusCommand, preferencesCommand]);
```

## File: apps/telegram-bot/src/commands/manager/preferences.ts
```typescript
import { getManagerNotifications } from "@/services/manager-preferences.service";
import type { TContext } from "@/types";
import { NotificationTypeNames } from "@/types/notification-types";
import { Command } from "@grammyjs/commands";

/**
 * /preferences — shows the calling manager their own notification subscriptions
 */
export const preferencesCommand = new Command<TContext>(
  "preferences",
  "Мои настройки уведомлений",
  async (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply("❌ Не удалось определить ваш ID");
      return;
    }

    try {
      // Get user's notification subscriptions
      const userNotifications = await getManagerNotifications(userId);

      if (userNotifications.length === 0) {
        // Manager in database but with no subscriptions
        await ctx.reply(
          "📬 <b>Ваши настройки уведомлений</b>\n\n" +
            "🔕 <b>Все уведомления отключены</b>\n\n" +
            "У вас нет активных подписок на уведомления.\n" +
            "Чтобы изменить настройки, обратитесь к администратору.",
          { parse_mode: "HTML" },
        );
        return;
      }

      // Manager has specific subscriptions
      const notificationList = userNotifications
        .map((type) => `  • ${NotificationTypeNames[type]}`)
        .join("\n");

      await ctx.reply(
        "📬 <b>Ваши настройки уведомлений</b>\n\n" +
          "Вы получаете следующие типы уведомлений:\n\n" +
          notificationList +
          "\n\nЧтобы изменить настройки, обратитесь к администратору.",
        { parse_mode: "HTML" },
      );
    } catch (err) {
      console.error("Error in preferences command:", err);
      await ctx.reply(
        "❌ Произошла ошибка при получении ваших настроек. Попробуйте позже.",
      );
    }
  },
);
```

## File: apps/telegram-bot/src/commands/manager/status.ts
```typescript
import { config } from "@/config";
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { isActiveManager, isRootAdmin } from "../guards";
import { version } from "../../../package.json";
import { getCommandListText } from "@/commands/utils";

export const statusCommand = new Command<TContext>(
  "status",
  "Показать статус бота",
  async (ctx) => {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    const managerCount = config.managers.getChatIds().length;

    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    await ctx.reply(
      "✅ <b>Статус бота</b>\n\n" +
        `⏱ <b>Время работы:</b> ${hours}ч ${minutes}м ${seconds}с\n` +
        `🤖 <b>Версия:</b> ${version}\n` +
        `📡 <b>Режим:</b> ${config.telegram.useWebhook ? "webhook" : "polling"}\n` +
        `💾 <b>Память:</b> ${heapUsedMB} / ${heapTotalMB} MB\n` +
        `👥 <b>Менеджеров:</b> ${managerCount}\n` +
        `🌍 <b>Окружение:</b> ${config.server.nodeEnv}\n\n` +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);
```

## File: apps/telegram-bot/src/commands/public/getchatid.ts
```typescript
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";

export const getChatIdCommand = new Command<TContext>(
  "getchatid",
  "Получить свой Chat ID",
  async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    const username = ctx.from?.username;

    await ctx.reply(
      "🆔 <b>Ваши идентификаторы</b>\n\n" +
        `Chat ID: <code>${chatId}</code>\n` +
        `User ID: <code>${userId}</code>\n` +
        (username ? `Username: @${username}` : ""),
      { parse_mode: "HTML" },
    );
  },
);
```

## File: apps/telegram-bot/src/commands/public/help.ts
```typescript
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { isActiveManager, isRootAdmin } from "@/commands/guards";
import { getCommandListText } from "@/commands/utils";

export const helpCommand = new Command<TContext>(
  "help",
  "Помощь",
  async (ctx) => {
    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    await ctx.reply(
      "ℹ️ <b>Помощь</b>\n\n" +
        "Этот бот используется для обработки заявок на доставку.\n\n" +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);
```

## File: apps/telegram-bot/src/commands/public/index.ts
```typescript
import { startCommand } from "./start";
import { getChatIdCommand } from "./getchatid";
import { helpCommand } from "./help";
import { publicCommands } from "@/commands/groups";

publicCommands.add([startCommand, getChatIdCommand, helpCommand]);
```

## File: apps/telegram-bot/src/commands/public/start.ts
```typescript
import type { TContext } from "@/types";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { isActiveManager, isRootAdmin } from "@/commands/guards";
import { getCommandListText } from "@/commands/utils";

export const startCommand = new Command<TContext>(
  "start",
  "Начать работу с ботом",
  async (ctx) => {
    const username = ctx.from?.first_name || "пользователь";
    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    await ctx.reply(
      `👋 Привет ${username}! Я бот <b>Нашей Почты</b>.\n\n` +
        "Я помогаю обрабатывать заявки и уведомления.\n\n" +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);

startCommand.localize(LanguageCodes.Russian, "start", "Начать работу с ботом");
startCommand.localize(
  LanguageCodes.Ukrainian,
  "start",
  "Почати роботу з ботом",
);
```

## File: apps/telegram-bot/src/commands/utils.ts
```typescript
import type { TContext } from "@/types";
import type { CommandGroup } from "@grammyjs/commands";
import {
  adminCommands,
  LOCALES,
  managerCommands,
  publicCommands,
} from "@/commands/groups";
import type { Bot } from "grammy";
import type { BotCommand, LanguageCode } from "grammy/types";

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
 * Sets the Telegram command menu for a specific chat, merging commands from
 * multiple CommandGroups into a single menu per language variant.
 *
 * Telegram's setMyCommands replaces the entire command list on each call,
 * so we must merge all groups before sending — otherwise each call would
 * overwrite the previous one, leaving only the last group's commands visible.
 *
 * Scope priority (highest wins):
 *   default < all_private_chats < chat:<id>  ← this function sets chat:<id>
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
  // Step 1: For every supported language (including default/undefined)...
  for (const languageCode of LOCALES) {
    const allCommandsForLocale: BotCommand[] = [];

    // Step 2: Ask every command group what commands it has in this language
    for (const group of groups) {
      const elementals = group.toElementals(languageCode);

      // Step 3: Convert the elemental objects into the simple BotCommand format
      for (const e of elementals) {
        allCommandsForLocale.push({
          command: e.command,
          description: e.description,
        });
      }
    }

    // Step 4: Only send to Telegram if we actually have commands
    if (allCommandsForLocale.length === 0) {
      continue;
    }

    // Step 5: Send the merged commands for this language to this specific chat
    await bot.api.setMyCommands(allCommandsForLocale, {
      scope: { type: "chat", chat_id: chatId },
      language_code: languageCode,
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
    await ctx.reply("😕 Не знаю такой команды. Используйте /help.");
  }
}
```

## File: apps/telegram-bot/src/types.ts
```typescript
import { Context } from "grammy";
import { type CommandsFlavor } from "@grammyjs/commands";

export type TContext = CommandsFlavor<Context>;
```

## File: apps/telegram-bot/prettier.config.ts
```typescript
import config from "@donbass-post/prettier-config";

export default config;
```

## File: apps/telegram-bot/prisma.config.ts
```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
    seed: "tsx src/prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

## File: apps/telegram-bot/src/commands/guards.ts
```typescript
import type { TContext } from "@/types";
import { prisma } from "@/prisma";
import { config } from "@/config";

/**
 * Returns the root admin chat ID from env.
 * This is the single operator/owner who can manage the team.
 */
export function getRootAdminChatId(): number | null {
  return config.telegram.rootAdminChatId;
}

/**
 * Returns true if the user is the root admin (configured via ROOT_ADMIN_CHAT_ID env).
 * */
export function isRootAdmin(ctx: TContext): boolean {
  const adminId = getRootAdminChatId();
  if (!adminId) return false;
  return ctx.from?.id === adminId;
}

export async function isActiveManager(ctx: TContext): Promise<boolean> {
  const userId = ctx.from?.id;
  if (!userId) return false;

  try {
    const telegramUser = await prisma.telegramUser.findUnique({
      where: {
        chatId: BigInt(userId),
      },
      select: {
        isActive: true,
        managerProfile: true,
      },
    });

    return !!(telegramUser?.isActive && telegramUser.managerProfile);
  } catch(err) {
    console.error(`Error checking manager status:`, err);
    return false;
  }
}

/**
 * Guard for root-admin-only commands.
 * Replies with an error and returns false if the user is not the root admin.
 * */
export async function requireRootAdmin(ctx: TContext): Promise<boolean> {
  if (isRootAdmin(ctx)) return true;

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery({ text: "⛔ Только для администратора." });
  } else {
    await ctx.reply("⛔ Эта команда только для администратора системы.");
  }

  return false;
}

/**
 * Guard for manager-only commands.
 * Replies with an error and returns false if the user is not an active manager.
 * */
export async function requireManager(ctx: TContext): Promise<boolean> {
  if (isRootAdmin(ctx)) return true;

  const manager = await isActiveManager(ctx);
  if (manager) return true;

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery({ text: "⛔ Только для менеджеров." });
  } else {
    await ctx.reply("⛔ Эта команда только для менеджеров.");
  }

  return false;
}
```

## File: apps/telegram-bot/src/prisma/index.ts
```typescript
import { PrismaClient } from "@/lib/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

console.log({ databaseUrl: process.env.DATABASE_URL });
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["info", "query", "warn", "error"]
      : undefined,
  errorFormat: "pretty",
});
```

## File: apps/telegram-bot/src/prisma/migrations/20260220020200_init/migration.sql
```sql
-- CreateTable
CREATE TABLE "telegram_users" (
    "id" TEXT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "telegram_user_id" TEXT NOT NULL,

    CONSTRAINT "managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "delivery_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "telegram_user_id" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_types" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_notification_preferences" (
    "id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "notification_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications_logs" (
    "id" TEXT NOT NULL,
    "manager_chat_id" BIGINT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "payload" JSONB,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_chat_id_key" ON "telegram_users"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "managers_telegram_user_id_key" ON "managers"("telegram_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_telegram_user_id_key" ON "clients"("telegram_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_types_slug_key" ON "notification_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "manager_notification_preferences_manager_id_notification_ty_key" ON "manager_notification_preferences"("manager_id", "notification_type_id");

-- CreateIndex
CREATE INDEX "notifications_logs_manager_chat_id_idx" ON "notifications_logs"("manager_chat_id");

-- CreateIndex
CREATE INDEX "notifications_logs_notification_type_idx" ON "notifications_logs"("notification_type");

-- CreateIndex
CREATE INDEX "notifications_logs_sent_at_idx" ON "notifications_logs"("sent_at");

-- AddForeignKey
ALTER TABLE "managers" ADD CONSTRAINT "managers_telegram_user_id_fkey" FOREIGN KEY ("telegram_user_id") REFERENCES "telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_telegram_user_id_fkey" FOREIGN KEY ("telegram_user_id") REFERENCES "telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_notification_preferences" ADD CONSTRAINT "manager_notification_preferences_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "managers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_notification_preferences" ADD CONSTRAINT "manager_notification_preferences_notification_type_id_fkey" FOREIGN KEY ("notification_type_id") REFERENCES "notification_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## File: apps/telegram-bot/src/prisma/migrations/migration_lock.toml
```toml
# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "postgresql"
```

## File: apps/telegram-bot/src/utils/validate.ts
```typescript
import { z } from "zod";
import { error } from "@/router";

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const messages = result.error.issues.map(i => i.message).join("; ");
    console.log({ messages });

    return {
      success: false,
      response: error(`${messages}`),
    };
  }

  return { success: true, data: result.data };
}
```

## File: apps/telegram-bot/.gitignore
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist.zip
dist
dist-ssr
*.local
.tanstack
.env
.turbo

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

/lib/prisma
```

## File: apps/telegram-bot/eslint.config.ts
```typescript
import { node } from "@donbass-post/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "node_modules",
    ".tanstack",
    ".git",
    "public",
    "ecosystem.config.cjs",
  ]),
  ...node(),
]);
```

## File: apps/telegram-bot/src/prisma/schema.prisma
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../lib/prisma"
}

datasource db {
  provider = "postgresql"
}

/// Base model for any Telegram user (managers, clients, etc.)
model TelegramUser {
  id        String   @id @default(cuid(2))
  chatId    BigInt   @unique @map("chat_id")
  username  String?
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  phone     String? // Phone number if provided
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  managerProfile Manager?
  clientProfile  Client?

  @@map("telegram_users")
}

/// Manager profile - extends TelegramUser
/// These are staff members who receive notifications
model Manager {
  id        String   @id @default(cuid(2))
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  telegramUserId String                           @unique @map("telegram_user_id")
  telegramUser   TelegramUser                     @relation(fields: [telegramUserId], references: [id], onDelete: Cascade)
  preferences    ManagerNotificationPreferences[]

  @@map("managers")
}

/// Client profile - extends TelegramUser
/// These are your customers who use the service
model Client {
  id              String   @id @default(cuid(2))
  deliveryAddress String?  @map("delivery_address")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  telegramUserId String       @unique @map("telegram_user_id")
  telegramUser   TelegramUser @relation(fields: [telegramUserId], references: [id], onDelete: Cascade)

  @@map("clients")
}

model NotificationType {
  id          String   @id @default(cuid(2))
  slug        String   @unique // e.g. "online-pickup-rf", "pick-up-point-delivery-order"
  name        String // Human-readable name in Russian
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  preferences ManagerNotificationPreferences[]

  @@map("notification_types")
}

model ManagerNotificationPreferences {
  id        String   @id @default(cuid(2))
  createdAt DateTime @default(now()) @map("created_at")

  managerId String  @map("manager_id")
  manager   Manager @relation(fields: [managerId], references: [id], onDelete: Cascade)

  notificationTypeId String           @map("notification_type_id")
  notificationType   NotificationType @relation(fields: [notificationTypeId], references: [id], onDelete: Cascade)

  @@unique([managerId, notificationTypeId])
  @@map("manager_notification_preferences")
}

model NotificationLog {
  id               String   @id @default(cuid(2))
  managerChatId    BigInt   @map("manager_chat_id")
  notificationType String   @map("notification_type")
  payload          Json? // Store the notification payload
  success          Boolean
  errorMessage     String?  @map("error_message")
  sentAt           DateTime @default(now()) @map("sent_at")

  @@index([managerChatId])
  @@index([notificationType])
  @@index([sentAt])
  @@map("notifications_logs")
}
```

## File: apps/telegram-bot/src/types/notification-types.ts
```typescript
/**
 * Available notification endpoint types
 */
export const NotificationTypes = {
  ONLINE_PICKUP_RF: "online-pickup-rf",
  PICK_UP_POINT_DELIVERY: "pick-up-point-delivery-order",
  ALI_PARCEL_PICKUP: "ali-parcel-pickup",
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

/**
 * Human-readable names for notification types
 */
export const NotificationTypeNames: Record<NotificationType, string> = {
  [NotificationTypes.ONLINE_PICKUP_RF]: "Онлайн-забор по РФ",
  [NotificationTypes.PICK_UP_POINT_DELIVERY]: "Забор груза ЛДНР/Запорожье",
  [NotificationTypes.ALI_PARCEL_PICKUP]: "Забор посылки AliExpress",
};
```

## File: apps/telegram-bot/src/utils.ts
```typescript
import { format, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

/**
 * Форматирует дату в российском формате с названием месяца
 * @param date Дата для форматирования
 * @returns Отформатированная строка даты
 */
export const formatRussianDate = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      console.error("Invalid dateObj:", date);
      return "Invalid Date";
    }

    const eestDate = toZonedTime(dateObj, "Europe/Moscow");

    const normalizedDate = startOfDay(eestDate);

    return format(normalizedDate, "d MMMM yyyy г.", { locale: ru });
  } catch (error) {
    console.error("Error in formatRussianDate:", error, "Input:", date);
    return "Error Formatting Date";
  }
};

/**
 * Форматирует дату и время в российском формате
 * @param date Дата для форматирования
 * @returns Отформатированная строка даты и времени
 */
export const formatRussianDateTime = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      console.error("Invalid dateObj:", date);
      return "Invalid Date";
    }

    const eestDate = toZonedTime(dateObj, "Europe/Moscow");

    return format(eestDate, "d MMMM yyyy г., HH:mm", { locale: ru });
  } catch (error) {
    console.error("Error in formatRussianDate:", error, "Input:", date);
    return "Error Formatting Date";
  }
};
```

## File: apps/telegram-bot/ecosystem.config.cjs
```javascript
module.exports = {
  apps: [
    {
      name: "telegram-bot",
      script: "./dist/server.js",
      instances: 1,
      exec_mode: "fork",

      // Environment
      env_production: {
        NODE_ENV: "production",
      },

      // Auto-restart settings
      max_memory_restart: "500M",
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: "30s",

      // Logging
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Advanced features
      watch: false,
      ignore_watch: ["node_modules", "logs", ".git"],

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Optional but recommended for bots
      autorestart: true, // restart on crash (default true, but explicit)
      cron_restart: "", // if you ever want scheduled restart (e.g. '0 4 * * *')
    },
  ],
};
```

## File: apps/telegram-bot/src/prisma/seed.ts
```typescript
import { getEnv } from "@/env";
import { prisma } from "@/prisma";
import type { NotificationType } from "@/types/notification-types";

async function main() {
  console.log("Starting database seeding...");

  // 1. Create notification types
  console.log("Creating notification types...");

  const notificationTypes = [
    {
      slug: "online-pickup-rf",
      name: "Онлайн-забор по РФ",
      description:
        "Уведомления о новых заявках на онлайн-забор посылок по территории РФ",
    },
    {
      slug: "pick-up-point-delivery-order",
      name: "Забор груза ЛДНР/Запорожье",
      description:
        "Уведомления о новых заявках на забор груза в ЛДНР и Запорожской области",
    },
    {
      slug: "ali-parcel-pickup",
      name: "Забор посылки AliExpress",
      description: "Уведомления о новых заявках на забор посылок AliExpress",
    },
  ] satisfies {
    slug: NotificationType;
    name: string;
    description: string;
  }[];

  for (const type of notificationTypes) {
    await prisma.notificationType.upsert({
      where: {
        slug: type.slug,
      },
      update: type,
      create: type,
    });
    console.log(`✅ Created/Updated notification type: ${type.name}`);
  }

  // 2. Migrate existing managers from MANAGER_CHAT_IDS
  console.log("\nMigrating managers from environment variables...");

  const managerChatIdsStr = getEnv("MANAGER_CHAT_IDS", "");
  const managerChatIds = managerChatIdsStr
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .map((id) => parseInt(id, 10))
    .filter((id) => !isNaN(id));

  if (managerChatIds.length === 0) {
    console.warn("⚠ No MANAGER_CHAT_IDS found in environment");
  }

  for (const chatId of managerChatIds) {
    const telegramUser = await prisma.telegramUser.upsert({
      where: {
        chatId: BigInt(chatId),
      },
      update: {
        isActive: true,
      },
      create: {
        chatId: BigInt(chatId),
        isActive: true,
      },
    });

    // Create Manager profile if doesn't exist
    await prisma.manager.upsert({
      where: {
        telegramUserId: telegramUser.id,
      },
      update: {},
      create: {
        telegramUserId: telegramUser.id,
      },
    });

    console.log(`✅ Created/Updated manager: ${chatId}`);
  }

  console.log("\n✅ Database seeding completed!");
}

main()
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## File: apps/telegram-bot/src/services/manager-preferences.service.ts
```typescript
import type { Prisma } from "@/lib/prisma/client";
import { prisma } from "@/prisma";
import type { NotificationType } from "@/types/notification-types";

/**
 * Database-backed Manager Notification Preferences Service
 *
 * Works with the TelegramUser -> Manager -> Preferences structure
 */

/**
 * Get managers who should receive a specific notification type
 */
export async function getManagersForNotification(
  notificationType: NotificationType,
): Promise<number[]> {
  try {
    const notificationTypeRecord = await prisma.notificationType.findUnique({
      where: { slug: notificationType },
    });

    if (!notificationTypeRecord) {
      console.warn(
        `Notification type not found in database: ${notificationType}`,
      );
      return [];
    }

    const preferences = await prisma.managerNotificationPreferences.findMany({
      where: {
        notificationTypeId: notificationTypeRecord.id,
        manager: { telegramUser: { isActive: true } },
      },
      include: {
        manager: {
          include: {
            telegramUser: true,
          },
        },
      },
    });

    return preferences.map((pref) => Number(pref.manager.telegramUser.chatId));
  } catch (err) {
    console.error("Failed to get managers for notification:", err);
    return [];
  }
}

/**
 * Get all notification types a manager is subscribed to
 */
export async function getManagerNotifications(
  chatId: number,
): Promise<NotificationType[]> {
  try {
    const telegramUser = await prisma.telegramUser.findUnique({
      where: {
        chatId: BigInt(chatId),
      },
      include: {
        managerProfile: {
          include: {
            preferences: {
              include: {
                notificationType: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !telegramUser ||
      !telegramUser.isActive ||
      !telegramUser.managerProfile
    ) {
      return [];
    }

    return telegramUser.managerProfile.preferences.map(
      (pref) => pref.notificationType.slug as NotificationType,
    );
  } catch (err) {
    console.error("Failed to get manager notifications:", err);
    return [];
  }
}

/**
 * Get all managers
 */
export async function getAllManagers(): Promise<number[]> {
  try {
    const managers = await prisma.manager.findMany({
      where: {
        telegramUser: {
          isActive: true,
        },
      },
      include: {
        telegramUser: true,
      },
    });

    return managers.map((m) => Number(m.telegramUser.chatId));
  } catch (err) {
    console.error("Failed to get all managers:", err);
    return [];
  }
}

/**
 * Get preferences for display (for /allpreferences command)
 */
export async function getAllPreferences(): Promise<
  {
    chatId: number;
    notifications: NotificationType[];
  }[]
> {
  try {
    const managers = await prisma.manager.findMany({
      where: {
        telegramUser: {
          isActive: true,
        },
      },
      include: {
        telegramUser: true,
        preferences: {
          include: {
            notificationType: true,
          },
        },
      },
    });

    return managers.map((manager) => ({
      chatId: Number(manager.telegramUser.chatId),
      notifications: manager.preferences.map(
        (pref) => pref.notificationType.slug as NotificationType,
      ),
    }));
  } catch (err) {
    console.error("Failed to get all preferences:", err);
    return [];
  }
}

/*
 * Check if a manager is subscribed to a notification type
 * */
export async function isManagerSubscribed(
  chatId: number,
  notificationType: NotificationType,
): Promise<boolean> {
  try {
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { chatId: BigInt(chatId) },
      include: {
        managerProfile: {
          include: {
            preferences: {
              include: {
                notificationType: true,
              },
            },
          },
        },
      },
    });

    if (
      !telegramUser ||
      !telegramUser.isActive ||
      !telegramUser.managerProfile
    ) {
      return false;
    }

    return telegramUser.managerProfile.preferences.some(
      (pref) => pref.notificationType.slug === notificationType,
    );
  } catch (err) {
    console.error("Failed to check manager subscription:", err);
    return false;
  }
}

/**
 * Add a manager to the database
 */
export async function addManager({
  chatId,
  username,
  firstName,
  lastName,
}: {
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // Create or update TelegramUser
      const telegramUser = await tx.telegramUser.upsert({
        where: { chatId: BigInt(chatId) },
        update: {
          username,
          firstName,
          lastName,
          isActive: true,
        },
        create: {
          chatId: BigInt(chatId),
          username,
          firstName,
          lastName,
          isActive: true,
        },
      });

      await tx.manager.upsert({
        where: { telegramUserId: telegramUser.id },
        update: {},
        create: {
          telegramUserId: telegramUser.id,
        },
      });
    });

    console.log(`✅ Manager added/updated: ${chatId}`);
  } catch (err) {
    console.error("Failed to add manager:", err);
    throw err;
  }
}

/**
 * Remove a manager (set user inactive)
 */
export async function removeManager(chatId: number): Promise<void> {
  try {
    await prisma.telegramUser.update({
      where: { chatId: BigInt(chatId) },
      data: { isActive: false },
    });
  } catch (err) {
    console.error("Failed to remove manager:", err);
    throw err;
  }
}

export async function setManagerPreferences(
  chatId: number,
  notificationTypes: NotificationType[],
): Promise<void> {
  try {
    const telegramUser = await prisma.telegramUser.findUnique({
      where: {
        chatId: BigInt(chatId),
      },
      include: {
        managerProfile: true,
      },
    });

    if (!telegramUser || !telegramUser.managerProfile) {
      throw new Error(`Manager not found: ${chatId}`);
    }

    const manager = telegramUser.managerProfile;

    // Get notification type IDs
    const notificationTypeRecords = await prisma.notificationType.findMany({
      where: {
        slug: { in: notificationTypes },
      },
    });

    await prisma.$transaction(async (tx) => {
      // Delete existing preferences
      await tx.managerNotificationPreferences.deleteMany({
        where: { managerId: manager.id },
      });

      // Create new preferences
      await tx.managerNotificationPreferences.createMany({
        data: notificationTypeRecords.map((nt) => ({
          managerId: manager.id,
          notificationTypeId: nt.id,
        })),
      });
    });

    console.log(`Preferences updated for  manager: ${chatId}`);
  } catch (err) {
    console.error("Failed to set manager preferences:", err);
    throw err;
  }
}

export async function getAllAvailableNotificationTypes(): Promise<
  Array<Prisma.NotificationTypeGetPayload<{}>>
> {
  try {
    const types = await prisma.notificationType.findMany({
      where: { isActive: true },
    });

    return types;
  } catch (err) {
    console.error("Failed to get notification types:", err);
    return [];
  }
}
```

## File: apps/telegram-bot/todo.md
```markdown

```

## File: apps/telegram-bot/tsconfig.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@donbass-post/typescript-config/node.json",
  "compilerOptions": {
    "noEmit": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "src/**/*",
    "*.config.ts",
    "environments.d.ts",
  ],
  "exclude": [
    "node_modules",
    "dist",
  ]
}
```

## File: apps/telegram-bot/docker-compose.yml
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: "0.5" # Max 50% of one CPU
          memory: 512M # Max 512MB RAM
    image: postgres:16-alpine
    container_name: donbass-post-db
    restart: unless-stopped
    environment:
      TZ: "Europe/Moscow"
      PGTZ: "Europe/Moscow"
    env_file:
      - .env
    ports:
      - "127.0.0.1:5434:5432"
    volumes:
      - donbass-post-data:/var/lib/postgresql/data
    networks:
      - donbass-post-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U donbass_post -d donbass_post_db"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  donbass-post-data:
    driver: local

networks:
  donbass-post-network:
    driver: bridge
```

## File: apps/telegram-bot/src/env.ts
```typescript
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import type { EnvKeys } from "environments";
import { resolve } from "path";

/**
 * Load and expand environment variables from .env file
 * This handles variable interpolation like ${VARIABLE_NAME}
 */
export function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");

  // Load .env file
  const env = config({ path: envPath });

  // Expand variables (handles ${VARIABLE} syntax)
  expand(env);

  return process.env;
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: EnvKeys, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Validate required environment variables
 */
export function validateEnv(requiredVars: string[]): void {
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

// Auto-load on import
export const loadedEnv = loadEnv();
```

## File: apps/telegram-bot/src/types/notifications.ts
```typescript
import { z } from "zod";
/**
 * Base notification payload
 */
export interface BaseNotificationPayload {
  timestamp?: string;
  source?: string;
}

/**
 * Online pickup notification payload
 */
export interface OnlinePickupPayload extends BaseNotificationPayload {
  // Sender information
  surnameSender: string;
  nameSender: string;
  patronymicSender: string;
  phoneSender: string;

  // Pickup details
  cityRegion: string;
  pickupAddress: string;
  pickupTime: string;

  // Package details
  totalWeight: number;
  cubicMeter: number;
  description: string;
  long?: number;
  width?: number;
  height?: number;

  // Recipient information
  surnameRecipient: string;
  nameRecipient: string;
  patronymicRecipient: string;
  phoneRecipient: string;
  emailRecipient: string;
  pointTo?: number;
  pickupAddressRecipient?: string;
  shippingPayment: string;

  // Customer information (optional)
  surnameCustomer?: string;
  nameCustomer?: string;
  patronymicCustomer?: string;
  phoneCustomer?: string;

  // Contact preferences
  telegramSender?: boolean;
  whatsappSender?: boolean;
  telegramRecipient?: boolean;
  whatsappRecipient?: boolean;
}

/**
 * Pick-up point delivery order payload
 */
export interface PickUpPointDeliveryOrderPayload extends BaseNotificationPayload {
  // Sender information
  sender: {
    // Physical person fields
    nameSender?: string;
    surnameSender?: string;
    patronymicSender?: string;
    telegramSender?: boolean;
    whatsAppSender?: boolean;
    emailSender?: string; // emailFizSender in form

    // Company fields
    companySender?: string;
    innSender?: string;

    // Common fields
    phoneSender: string;
    pickupAddress: string;
    pointFrom: string;
  };

  // Recipient information
  recipient: {
    // Physical person fields
    nameRecipient?: string;
    surnameRecipient?: string;
    patronymicRecipient?: string;
    telegramRecipient?: boolean;
    whatsAppRecipient?: boolean;

    // Company fields
    companyRecipient?: string;
    innRecipient?: string;
    emailRecipient?: string;

    // Common fields
    phoneRecipient: string;
    deliveryAddress: string;
    deliveryCompany?: string;
    pointTo?: string;
  };

  // Customer information (optional - third party payer)
  customer?: {
    // Physical person fields
    nameCustomer?: string;
    surnameCustomer?: string;
    patronymicCustomer?: string;
    telegramCustomer?: boolean;
    whatsAppCustomer?: boolean;

    // Company fields
    companyCustomer?: string;
    innCustomer?: string;
    emailCustomer?: string;

    // Common fields
    phoneCustomer: string;
  };

  // Cargo data
  cargoData: {
    shippingPayment: string; // "Отправитель" | "Получатель" | "Третье лицо"
    description: string;
    weightHeaviestPosition: number;
    totalWeight: number;
    declaredPrice: number;
    cashOnDelivery?: number;
    cubicMeter: number;
    long?: number;
    width?: number;
    height?: number;
  };

  // Additional services
  additionalService?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

export const phoneRuSchema = z
  .string({ error: "Заполните телефон!" })
  .regex(/^\+7\d{10,}$/, "Телефон должен быть в формате +7XXXXXXXXXX");

export const AliParcelPickupSchema = z.object({
  address: z
    .string({ error: "Адрес обязателен!" })
    .trim()
    .min(1, "Адрес обязателен!")
    .min(3, "Адрес должен содержать от 3 до 50 символов")
    .max(50, "Адрес должен содержать от 3 до 50 символов"),
  track: z
    .string({ error: "Трек обязателен!" })
    .trim()
    .min(1, "Трек обязателен!")
    .min(3, "Трек должен содержать от 3 до 50 символов")
    .max(50, "Трек должен содержать от 3 до 50 символов"),
  code: z
    .string({ error: "Код обязателен!" })
    .trim()
    .min(1, "Код обязателен!")
    .min(3, "Код должен содержать от 3 до 50 символов")
    .max(50, "Код должен содержать от 3 до 50 символов"),
  phone: phoneRuSchema,
});

export type AliParcelPickupPayload = z.infer<typeof AliParcelPickupSchema> &
  BaseNotificationPayload;
```

## File: apps/telegram-bot/tsup.config.ts
```typescript
import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node18",
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: !options.watch && "terser",
}));
```

## File: apps/telegram-bot/src/services/notification.service.ts
```typescript
import { Bot } from "grammy";
import {
  formatAliParcelPickupMessage,
  formatOnlinePickupMessage,
  formatPickUpPointDeliveryOrderMessage,
} from "@/formatters/messages";
import type {
  AliParcelPickupPayload,
  OnlinePickupPayload,
  PickUpPointDeliveryOrderPayload,
} from "@/types/notifications";
import {
  NotificationTypes,
  type NotificationType,
} from "@/types/notification-types";
import {
  getManagersForNotification,
  getAllManagers,
} from "@/services/manager-preferences.service";
import { prisma } from "@/prisma";

/**
 * Result of sending notifications to managers
 */
export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  skipped: number; // Managers who were skipped due to preferences
  errors: Array<{ chatId: number; errorMessage: string }>;
}

/**
 * Send a message to managers based on notification type
 *
 * This is the core function - it routes messages to managers based on their preferences.
 * The message formatting is handled by separate formatter functions.
 *
 * @param bot - Telegram bot instance
 * @param message - Formatted HTML message to send
 * @param notificationType - Type of notification to determine which managers receive it
 * @param payload - Optional payload to log
 * @returns Statistics about the send operation
 */
export async function sendToManagers(
  bot: Bot,
  message: string,
  notificationType: NotificationType,
  payload?: any,
): Promise<NotificationResult> {
  const targetManagers = await getManagersForNotification(notificationType);
  const allManagers = await getAllManagers();

  if (allManagers.length === 0) {
    console.warn("No manager chat IDs configured");
    return { success: false, sent: 0, failed: 0, skipped: 0, errors: [] };
  }

  if (targetManagers.length === 0) {
    console.warn(
      `No managers subscribed to notification type: ${notificationType}`,
    );
    return {
      success: false,
      sent: 0,
      failed: 0,
      skipped: allManagers.length,
      errors: [],
    };
  }

  const results = await Promise.allSettled(
    targetManagers.map(async (chatId) => {
      // Log successful notification
      try {
        await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });

        try {
          await prisma.notificationLog.create({
            data: {
              managerChatId: BigInt(chatId),
              notificationType,
              payload: payload || null,
              success: true,
              errorMessage: null,
            },
          });
        } catch (logErr) {
          console.error(
            `Sent OK to ${chatId} but logging success failed:`,
            logErr,
          );
        }

        return { chatId, success: true } as const;
      } catch (sendErr) {
        const errorMessage =
          sendErr instanceof Error ? sendErr.message : String(sendErr);

        try {
          await prisma.notificationLog.create({
            data: {
              managerChatId: BigInt(chatId),
              success: false,
              errorMessage,
              payload: payload || null,
              notificationType,
            },
          });
        } catch (logErr) {
          console.error(
            `Failed to send to ${chatId} and also failed to log it:`,
            logErr,
          );
        }

        throw sendErr;
      }
    }),
  );

  const errors: NotificationResult["errors"] = [];
  let sent = 0;
  let failed = 0;

  for (const [index, result] of results.entries()) {
    const chatId = targetManagers[index]!;

    if (result.status === "fulfilled") {
      sent++;
      console.warn(
        `✅ [${notificationType}] Notification delivered to ${chatId}`,
      );
    } else {
      failed++;
      const errorMessage =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);

      errors.push({ chatId, errorMessage });
      console.error(
        `❌ [${notificationType}] Failed to send to ${chatId}: ${errorMessage}`,
      );
    }
  }

  const skipped = allManagers.length - targetManagers.length;

  if (skipped > 0) {
    console.warn(
      `ℹ️ [${notificationType}] Skipped ${skipped} managers (not subscribed)`,
    );
  }

  return {
    success: sent > 0,
    sent,
    failed,
    skipped,
    errors,
  };
}

/**
 * Send online pickup notification to all managers
 *
 * Convenience function that formats and sends in one step.
 * */
export async function notifyOnlinePickup(
  bot: Bot,
  payload: OnlinePickupPayload,
): Promise<NotificationResult> {
  const message = formatOnlinePickupMessage(payload);

  return sendToManagers(
    bot,
    message,
    NotificationTypes.ONLINE_PICKUP_RF,
    payload,
  );
}

/**
 * Send pick-up point delivery order notification to all managers
 *
 * Convenience function that formats and sends in one step.
 */
export async function notifyPickUpPointDeliveryOrder(
  bot: Bot,
  payload: PickUpPointDeliveryOrderPayload,
): Promise<NotificationResult> {
  const message = formatPickUpPointDeliveryOrderMessage(payload);

  return sendToManagers(
    bot,
    message,
    NotificationTypes.PICK_UP_POINT_DELIVERY,
    payload,
  );
}

export async function notifyAliParcelPickup(
  bot: Bot,
  payload: AliParcelPickupPayload,
): Promise<NotificationResult> {
  const message = formatAliParcelPickupMessage(payload);

  return sendToManagers(
    bot,
    message,
    NotificationTypes.ALI_PARCEL_PICKUP,
    payload,
  );
}
```

## File: apps/telegram-bot/src/config.ts
```typescript
import { getEnv } from "@/env";
import { prisma } from "@/prisma";
import { NotificationTypes } from "@/types/notification-types";

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  telegram: {
    token: getEnv("TELEGRAM_BOT_TOKEN"),
    useWebhook: getEnv("USE_WEBHOOK", "") === "true",
    webhookUrl: getEnv("WEBHOOK_URL", ""),
    webhookSecret: getEnv("WEBHOOK_SECRET", ""),
    rootAdminChatId: parseInt(getEnv("ROOT_ADMIN_CHAT_ID", ""), 10) || null,
  },

  server: {
    port: parseInt(getEnv("PORT", "3000")),
    nodeEnv: getEnv("NODE_ENV") as "development" | "production",
  },

  managers: {
    /**
     * Get list of manager chat IDs
     * Expected format: "123456789,987654321,111222333"
     */
    getChatIds(): number[] {
      const chatIdsStr = getEnv("MANAGER_CHAT_IDS", "");

      if (!chatIdsStr) {
        console.warn(
          "MANAGER_CHAT_IDS not set - notifications will not be sent",
        );
        return [];
      }

      return chatIdsStr
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
    },
  },
} as const;

export function validateConfig(cfg: typeof config): void {
  const errors: string[] = [];

  if (!cfg.telegram.token) {
    errors.push("TELEGRAM_BOT_TOKEN is required");
  }

  if (!cfg.telegram.rootAdminChatId && process.env.NODE_ENV === "production") {
    errors.push("ROOT_ADMIN_CHAT_ID is required");
  }

  if (cfg.telegram.useWebhook) {
    if (!cfg.telegram.webhookUrl) {
      errors.push("WEBHOOK_URL is required when USE_WEBHOOK=true");
    }

    if (!cfg.telegram.webhookSecret) {
      console.warn(
        "⚠ WEBHOOK_SECRET not set — webhook requests will NOT be verified!",
      );
    } else if (cfg.telegram.webhookSecret.length < 10) {
      errors.push("WEBHOOK_SECRET is too short (min 10 chars recommended)");
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }

  console.warn("✅ Configuration validated");
}

export async function validateNotificationTypes() {
  const dbTypes = await prisma.notificationType.findMany({
    select: { slug: true },
  });
  const dbSlugs = new Set(dbTypes.map((t) => t.slug));

  const missingSlugs = Object.values(NotificationTypes).filter(
    (slug) => !dbSlugs.has(slug),
  );

  if (missingSlugs.length > 0) {
    throw new Error(
      `Notification types missing from DB: ${missingSlugs.join(", ")}. Run yarn db:seed.`,
    );
  } else {
    console.warn("✅ Notification types validated against DB");
  }
}
```

## File: apps/telegram-bot/src/formatters/messages.ts
```typescript
import type {
    AliParcelPickupPayload,
  OnlinePickupPayload,
  PickUpPointDeliveryOrderPayload,
} from "@/types/notifications";
import { formatRussianDateTime } from "@/utils";

export function formatOnlinePickupMessage(
  payload: OnlinePickupPayload,
): string {
  const lines: string[] = [
    "📦 <b>Новая заявка на онлайн-забор по РФ</b>",
    "",
    "👤 <b>Отправитель:</b>",
    `ФИО: ${payload.surnameSender} ${payload.nameSender} ${payload.patronymicSender}`,
    `📱 Телефон: ${payload.phoneSender}`,
  ];

  // Contact preferences for sender
  const senderPrefs: string[] = [];
  if (payload.telegramSender) senderPrefs.push("Telegram");
  if (payload.whatsappSender) senderPrefs.push("MAX");
  if (senderPrefs.length > 0) {
    lines.push(`💬 Предпочтения: ${senderPrefs.join(", ")}`);
  }

  lines.push(
    "",
    "📍 <b>Забор посылки:</b>",
    `Город/Регион: ${payload.cityRegion}`,
    `Адрес: ${payload.pickupAddress}`,
    `⏰ Время: ${payload.pickupTime}`,
    "",
    "📦 <b>Информация о посылке:</b>",
    `Вес: ${payload.totalWeight} кг`,
    `Объем: ${payload.cubicMeter} м³`,
  );

  if (payload.long && payload.width && payload.height) {
    lines.push(
      `Размеры: ${payload.long} × ${payload.width} × ${payload.height} см`,
    );
  }

  lines.push(
    `Описание: ${payload.description}`,
    "",
    "👥 <b>Получатель:</b>",
    `ФИО: ${payload.surnameRecipient} ${payload.nameRecipient} ${payload.patronymicRecipient}`,
    `📱 Телефон: ${payload.phoneRecipient}`,
    `📧 Email: ${payload.emailRecipient}`,
  );

  // Contact preferences for recipient
  const recipientPrefs: string[] = [];
  if (payload.telegramRecipient) recipientPrefs.push("Telegram");
  if (payload.whatsappRecipient) recipientPrefs.push("WhatsApp");
  if (recipientPrefs.length > 0) {
    lines.push(`💬 Предпочтения: ${recipientPrefs.join(", ")}`);
  }

  // Delivery address
  if (payload.pointTo) {
    lines.push(`📍 Пункт выдачи: ${payload.pointTo}`);
  } else if (payload.pickupAddressRecipient) {
    lines.push(`📍 Адрес доставки: ${payload.pickupAddressRecipient}`);
  }

  lines.push(`💰 Оплата доставки: ${payload.shippingPayment}`);

  // Customer information (if provided)
  if (
    payload.surnameCustomer ||
    payload.nameCustomer ||
    payload.patronymicCustomer
  ) {
    lines.push(
      "",
      "💼 <b>Заказчик:</b>",
      `ФИО: ${payload.surnameCustomer} ${payload.nameCustomer} ${payload.patronymicCustomer}`,
      `📱 Телефон: ${payload.phoneCustomer || "—"}`,
    );
  }

  lines.push("", `🕐 Время: ${formatRussianDateTime(new Date())}`);

  return lines.join("\n");
}

/**
 * Format pick-up point delivery order message
 */
export function formatPickUpPointDeliveryOrderMessage(
  payload: PickUpPointDeliveryOrderPayload,
): string {
  const lines: string[] = [
    "📦 <b>Новая заявка на забор груза по ЛДНР и Запорожье</b>",
    "",
  ];

  // Sender information
  lines.push("👤 <b>Отправитель:</b>");

  if (payload.sender.nameSender && payload.sender.surnameSender) {
    // Physical person
    lines.push(
      `ФИО: ${payload.sender.surnameSender} ${payload.sender.nameSender} ${payload.sender.patronymicSender || ""}`,
    );

    const senderPrefs: string[] = [];
    if (payload.sender.telegramSender) senderPrefs.push("Telegram");
    if (payload.sender.whatsAppSender) senderPrefs.push("WhatsApp");
    if (senderPrefs.length > 0) {
      lines.push(`💬 Предпочтения: ${senderPrefs.join(", ")}`);
    }

    if (payload.sender.emailSender) {
      lines.push(`📧 Email: ${payload.sender.emailSender}`);
    }
  } else if (payload.sender.companySender) {
    // Company
    lines.push(
      `🏢 Компания: ${payload.sender.companySender}`,
      `🆔 ИНН: <code>${payload.sender.innSender || "—"}</code>`,
      `📧 Email: ${payload.sender.emailSender || "—"}`,
    );
  }

  lines.push(
    `📱 Телефон: ${payload.sender.phoneSender}`,
    `📍 Адрес забора: ${payload.sender.pickupAddress}`,
    `🏙 Пункт отправления: ${payload.sender.pointFrom}`,
  );

  // Recipient information
  lines.push("", "👥 <b>Получатель:</b>");

  if (payload.recipient.nameRecipient && payload.recipient.surnameRecipient) {
    // Physical person
    lines.push(
      `ФИО: ${payload.recipient.surnameRecipient} ${payload.recipient.nameRecipient} ${payload.recipient.patronymicRecipient || ""}`,
    );

    const recipientPrefs: string[] = [];
    if (payload.recipient.telegramRecipient) recipientPrefs.push("Telegram");
    if (payload.recipient.whatsAppRecipient) recipientPrefs.push("WhatsApp");
    if (recipientPrefs.length > 0) {
      lines.push(`💬 Предпочтения: ${recipientPrefs.join(", ")}`);
    }
  } else if (payload.recipient.companyRecipient) {
    // Company
    lines.push(
      `🏢 Компания: ${payload.recipient.companyRecipient}`,
      `🆔 ИНН: <code>${payload.recipient.innRecipient || "—"}</code>`,
      `📧 Email: ${payload.recipient.emailRecipient || "—"}`,
    );
  }

  lines.push(
    `📱 Телефон: ${payload.recipient.phoneRecipient}`,
    `📍 Адрес доставки: ${payload.recipient.deliveryAddress}`,
  );

  if (payload.recipient.pointTo) {
    lines.push(`🏙 Пункт выдачи: ${payload.sender.pointFrom}`);
  }

  if (payload.recipient.deliveryCompany) {
    lines.push(
      `🚚 Транспортная компания: ${payload.recipient.deliveryCompany}`,
    );
  }

  // Customer information (if provided)
  if (payload.customer) {
    lines.push("", "💼 <b>Заказчик:</b>");

    if (payload.customer.nameCustomer && payload.customer.surnameCustomer) {
      // Physical person
      lines.push(
        `ФИО: ${payload.customer.surnameCustomer} ${payload.customer.nameCustomer} ${payload.customer.patronymicCustomer || ""}`,
      );

      const customerPrefs: string[] = [];
      if (payload.customer.telegramCustomer) customerPrefs.push("Telegram");
      if (payload.customer.whatsAppCustomer) customerPrefs.push("WhatsApp");
      if (customerPrefs.length > 0) {
        lines.push(`💬 Предпочтения: ${customerPrefs.join(", ")}`);
      }
    } else if (payload.customer.companyCustomer) {
      // Company
      lines.push(
        `🏢 Компания: ${payload.customer.companyCustomer}`,
        `🆔 ИНН: <code>${payload.customer.innCustomer || "—"}</code>`,
        `📧 Email: ${payload.customer.emailCustomer || "—"}`,
      );
    }

    lines.push(`📱 Телефон: ${payload.customer.phoneCustomer}`);
  }

  // Cargo data
  lines.push(
    "",
    "📦 <b>Информация о грузе:</b>",
    `Описание: ${payload.cargoData.description}`,
    `Общий вес: ${payload.cargoData.totalWeight} кг`,
    `Вес самой тяжелой позиции: ${payload.cargoData.weightHeaviestPosition} кг`,
  );

  if (
    payload.cargoData.long &&
    payload.cargoData.width &&
    payload.cargoData.height
  ) {
    lines.push(
      `Размеры: ${payload.cargoData.long} × ${payload.cargoData.width} × ${payload.cargoData.height} см`,
    );
  }

  lines.push(
    `💎 Заявленная стоимость: ${payload.cargoData.declaredPrice} ₽`,
    `💰 Плательщик доставки: ${payload.cargoData.shippingPayment}`,
  );

  if (payload.cargoData.cashOnDelivery) {
    lines.push(`💵 Наложенный платеж: ${payload.cargoData.cashOnDelivery} ₽`);
  }

  // Additional services
  if (payload.additionalService && payload.additionalService.length > 0) {
    lines.push(
      "",
      "➕ <b>Дополнительные услуги:</b>",
      ...payload.additionalService.map(
        (service) => `  • Услуга: ${service.name}`,
      ),
    );
  }

  lines.push("", `🕐 Время: ${formatRussianDateTime(new Date())}`);

  return lines.join("\n");
}

export function formatAliParcelPickupMessage(
  payload: AliParcelPickupPayload,
): string {
  const lines: string[] = [
    "📦 <b>Код и информация для забор заказа AliExpress</b>",
    "",
    `📍 <b>Адрес:</b> ${payload.address}`,
    `🔢 <b>Трек-номер:</b> <code>${payload.track}</code>`,
    `🔑 <b>Код получения:</b> <code>${payload.code}</code>`,
    `📱 <b>Телефон:</b> ${payload.phone}`,
    "",
    `🕐 Время: ${formatRussianDateTime(new Date())}`,
  ];

  return lines.join("\n");
}
```

## File: apps/telegram-bot/src/middleware/index.ts
```typescript
import type { Middleware } from "@/router";
import { error } from "@/router";

/**
 * CORS Configuration
 *
 * NOTE: OPTIONS requests are handled by nginx for performance.
 * This middleware only adds CORS headers to actual responses.
 */
const CORS_CONFIG = {
  // Allowed origins - add your domains here
  allowedOrigins: [
    "https://donbass-post.ru",
    "https://donbass-post2.ru",
    "https://workplace-post.ru",
    "https://donbass-post.duckdns.org",

    // For local development
    "http://donbass-post-test.ru:5173",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
  ],

  // Allowed methods
  allowedMethods: ["GET", "POST", "OPTIONS"],

  // Allowed headers
  allowedHeaders: ["Content-Type", "Accept", "Origin", "X-Requested-With"],

  // Allow credentials (cookies, auth headers)
  allowCredentials: true,

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  // Allow requests with no Origin header (e.g., Telegram webhooks, curl, server-to-server)
  if (!origin) {
    return true;
  }

  // Check against allowed origins
  return CORS_CONFIG.allowedOrigins.includes(origin);
}

/**
 * Get appropriate CORS headers for the origin
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Vary: "Origin",
  };

  // Set origin dynamically based on request
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;

    if (CORS_CONFIG.allowCredentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
  } else if (!origin) {
    // No origin header (Telegram, curl, etc.) - allow all
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

/**
 * Handle OPTIONS preflight requests
 *
 * NOTE: Currently handled by nginx for performance.
 * This middleware is kept for development/testing or
 * deployments without a reverse proxy.
 *
 * To enable: router.use(handleOptions) in routes/index.ts
 */
export const handleOptions: Middleware = async (request, next) => {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("Origin");

    // Check if origin is allowed
    if (origin && !isOriginAllowed(origin)) {
      return error("Origin not allowed", {
        status: 403,
      });
    }

    // Return 204 No Content with CORS headers
    return new Response(null, {
      status: 204,
      headers: {
        ...getCorsHeaders(origin),
        "Access-Control-Allow-Methods": CORS_CONFIG.allowedMethods.join(", "),
        "Access-Control-Allow-Headers": CORS_CONFIG.allowedHeaders.join(", "),
        "Access-Control-Max-Age": CORS_CONFIG.maxAge.toString(),
        "Content-Length": "0",
        "Content-Type": "text/plain",
      },
    });
  }

  // Not an OPTIONS request, continue
  return next();
};

/**
 * Add CORS headers to actual responses
 *
 * This middleware adds CORS headers to POST/GET responses.
 * OPTIONS preflight is handled by nginx.
 */
export const cors: Middleware = async (request, next) => {
  const origin = request.headers.get("Origin");

  // Check if origin is allowed (skip for no-origin requests like Telegram)
  if (origin && !isOriginAllowed(origin)) {
    return error("Origin not allowed", {
      status: 403,
    });
  }

  // Get the response from next middleware/handler
  const response = await next();

  // Clone response to add headers (Response is immutable)
  const headers = new Headers(response.headers);

  // Add CORS headers
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Return new response with CORS headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * Middleware to validate request content type
 */
export const requireJSON: Middleware = async (request, next) => {
  const contentType = request.headers.get("Content-Type");

  if (!contentType?.includes("application/json")) {
    return error("Content-Type must be application/json", { status: 415 });
  }

  return next();
};
```

## File: apps/telegram-bot/src/router.ts
```typescript
export type RouteHandler = (request: Request) => Response | Promise<Response>;
export type Middleware = (
  request: Request,
  next: () => Promise<Response>,
) => Promise<Response>;
export interface Route {
  handler: RouteHandler;
  middlewares: Middleware[];
}

export function createRouter() {
  const routes = new Map<string, Map<string, Route>>();
  const globalMiddlewares: Middleware[] = [];

  /**
   * Execute middleware chain
   * This is the "recursive next()" pattern
   */
  async function executeMiddlwares(
    request: Request,
    middlewares: Middleware[],
    handler: RouteHandler,
  ): Promise<Response> {
    let index = 0;

    const next = async (): Promise<Response> => {
      // If we still have middlewares to execute
      if (index < middlewares.length) {
        const middleware = middlewares[index++]!;
        // Call middleware with request and next function
        // The middleware can call next() to continue the chain
        return await middleware(request, next);
      }

      // NO more middlewares, execute the final handler
      return await handler(request);
    };

    return await next();
  }

  function add(
    method: string,
    path: string,
    handler: RouteHandler,
    middlewares: Middleware[] = [],
  ) {
    if (!routes.has(method)) {
      routes.set(method, new Map());
    }
    routes.get(method)!.set(path, { handler, middlewares });

    return router;
  }

  const router = {
    use(middleware: Middleware) {
      globalMiddlewares.push(middleware);
      return router;
    },

    get(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("GET", path, handler, middlewares);
    },

    post(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("POST", path, handler, middlewares);
    },
    put(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("PUT", path, handler, middlewares);
    },

    delete(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("DELETE", path, handler, middlewares);
    },

    patch(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("PATCH", path, handler, middlewares);
    },

    async handle(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const method = request.method;
      const path = url.pathname;

      const methodRoutes = routes.get(method);
      if (!methodRoutes) {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const route = methodRoutes.get(path);
      if (!route) {
        return new Response(
          JSON.stringify({ error: "Not Found", path, method }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      try {
        // Combine global middlewares + route-specific middlewares
        const allMiddlewares = [...globalMiddlewares, ...route.middlewares];

        return await executeMiddlwares(request, allMiddlewares, route.handler);
      } catch (error) {
        console.error("Route handler error:", error);
        return new Response(
          JSON.stringify({
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    },

    getRoutes(): Array<{ method: string; path: string }> {
      const allRoutes: Array<{ method: string; path: string }> = [];

      routes.forEach((paths, method) => {
        paths.forEach((_, path) => {
          allRoutes.push({ method, path });
        });
      });

      return allRoutes;
    },
  };

  return router;
}

export type Router = ReturnType<typeof createRouter>;

export function error(
  message: string,
  init: ResponseInit | undefined = { status: 400 },
) {
  return Response.json({ error: message }, init);
}

export async function parseJSON<T = any>(request: Request): Promise<T> {
  try {
    return await (<T>request.json());
  } catch {
    throw new Error("Invalid JSON body");
  }
}
```

## File: apps/telegram-bot/.env.sample
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=3000
MANAGER_CHAT_IDS=123456789,987654321
ROOT_ADMIN_CHAT_ID=123456789

POSTGRES_USER=donbass_post
POSTGRES_PASSWORD=password
POSTGRES_DB=donbass_post_db

DATABASE_URL=postgresql://donbass_post:password@localhost:5434/donbass_post_db?schema=public

# Secret token for webhook verification (1–256 chars, only A-Z a-z 0-9 _ - allowed)
WEBHOOK_SECRET=your_random_secret_string_here_AtLeast16CharsLong

# Optional: for webhook mode
# WEBHOOK_URL=https://your-domain.com/webhook
# so if it's "true"
# USE_WEBHOOK=true
```

## File: apps/telegram-bot/environments.d.ts
```typescript
export type EnvKeys =
  | "NODE_ENV"
  | "TELEGRAM_BOT_TOKEN"
  | "USE_WEBHOOK"
  | "WEBHOOK_URL"
  | "WEBHOOK_SECRET"
  | "PORT"
  | "MANAGER_CHAT_IDS"
  | "DATABASE_URL"
  | "ROOT_ADMIN_CHAT_ID";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<EnvKeys, string | undefined> {
      NODE_ENV: "development" | "production";
      TELEGRAM_BOT_TOKEN?: string;
      USE_WEBHOOK?: "true";
      WEBHOOK_URL?: string;
      WEBHOOK_SECRET?: string;
      PORT?: string;

      MANAGER_CHAT_IDS?: string;

      DATABASE_URL?: string;
      ROOT_ADMIN_CHAT_ID?: string;
    }
  }
}

export {};
```

## File: apps/telegram-bot/src/commands/index.ts
```typescript
import type { Bot } from "grammy";
import { NotificationTypes } from "@/types/notification-types";
import {
  isActiveManager,
  isRootAdmin,
  getRootAdminChatId,
} from "@/commands/guards";
import { getAllManagers } from "@/services/manager-preferences.service";
import {
  adminCommands,
  managerCommands,
  publicCommands,
} from "@/commands/groups";
import type { TContext } from "@/types";
import { commandNotFound } from "@grammyjs/commands";

import "@/commands/public";
import "@/commands/manager";
import "@/commands/admin";

import { setCommandsForChat, suggestionHandler } from "@/commands/utils";
import { LOCALES } from "@/commands/groups";

export const VALID_SLUGS = Object.values(NotificationTypes);

export async function registerCommands(bot: Bot<TContext>) {
  try {
    // Register command groups as middleware so grammY routes incoming
    // commands to the correct handler. Order matters — public first,
    // then manager, then admin, so more specific groups don't shadow
    // broader ones unexpectedly.
    bot.use(publicCommands);

    const managerRouter = bot.filter(
      async (ctx) => (await isActiveManager(ctx)) || isRootAdmin(ctx),
    );
    managerRouter.use(managerCommands);

    const adminRouter = bot.filter(async (ctx) => isRootAdmin(ctx));
    adminRouter.use(adminCommands);

    bot.filter(commandNotFound([publicCommands])).use(suggestionHandler);

    managerRouter
      .filter(commandNotFound([publicCommands, managerCommands]))
      .use(async (ctx) => {
        const adminSuggestion = ctx.getNearestCommand(adminCommands);
        if (adminSuggestion) {
          // The command exists but requires admin privileges
          await ctx.reply("⛔ Эта команда только для администратора.");
          return;
        }

        await suggestionHandler(ctx);
      });

    adminRouter
      .filter(commandNotFound([publicCommands, managerCommands, adminCommands]))
      .use(suggestionHandler);

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
    for (const chatId of managerIds) {
      await setCommandsForChat(bot, chatId, publicCommands, managerCommands);
    }

    // Set admin commands scoped only to the root admin's chat.
    // ROOT_ADMIN_CHAT_ID is guaranteed to exist in production by validateConfig()
    // which throws on startup if it's missing. Safe to skip only in development.
    const adminId = getRootAdminChatId();
    console.log("adminId:", adminId);
    if (adminId) {
      await setCommandsForChat(
        bot,
        adminId,
        publicCommands,
        managerCommands,
        adminCommands,
      );
    }

    // console.log("elementals ru:", publicCommands.toElementals("ru"));
    // console.log("elementals en:", publicCommands.toElementals("en"));
    // console.log("elementals uk:", publicCommands.toElementals("uk"));
    // console.log("elementals default:", publicCommands.toElementals("default"));

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
```

## File: apps/telegram-bot/src/bot.ts
```typescript
import { Bot, GrammyError, HttpError } from "grammy";
import { formatRussianDateTime } from "@/utils";
import { autoRetry } from "@grammyjs/auto-retry";
import { registerCommands } from "@/commands";
import { config } from "@/config";
import type { Update } from "grammy/types";
import type { TContext } from "@/types";
import { commands } from "@grammyjs/commands";

export type TCustomBot = Bot<TContext>;

export class BotManager {
  private static instance: BotManager | null = null;
  private bot: TCustomBot | null = null;
  private mode: "webhook" | "polling" | null = null;

  private constructor() {}

  static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager();
    }
    return BotManager.instance;
  }

  getBot(): TCustomBot {
    if (!this.bot) {
      // This is a programmer error, not a runtime condition
      throw new Error(
        "BotManager.getBot() called before BotManager.initialize()",
      );
    }
    return this.bot;
  }

  isRunning(): boolean {
    return this.bot !== null && this.mode !== null;
  }

  getMode(): "webhook" | "polling" | null {
    return this.mode;
  }

  async initialize(token: string): Promise<void> {
    if (this.bot) {
      console.warn("Bot already initialized, skipping...");
      return;
    }

    try {
      this.bot = new Bot<TContext>(token);

      this.bot.api.config.use(
        autoRetry({
          maxRetryAttempts: 5,
          maxDelaySeconds: 300,
        }),
      );

      // CRITICAL: Initialize bot info for webhook mode
      // This fetches bot information from Telegram
      await this.bot.init();

      // Register commands flavor middleware — required for commandNotFound /
      // ctx.getNearestCommand to work
      this.bot.use(commands());

      this.setupErrorHandling(this.bot);
      this.setupHandlers(this.bot);

      console.warn("Bot initialized successfully");
    } catch (error) {
      console.error("Failed to initialize bot:", error);
      throw error;
    }
  }

  private setupErrorHandling(bot: TCustomBot): void {
    bot.catch((err) => {
      const ctx = err.ctx;
      const updateId = ctx?.update?.update_id ?? "—";
      console.error(`Error in update ${updateId}:`, err);

      const e = err.error;

      let prefix = "";
      if (ctx?.from) {
        prefix = `from user ${ctx.from.id} (${ctx.from.username || "no username"}) `;
      }
      if (ctx?.chat) {
        prefix += `in chat ${ctx.chat.id} (${ctx.chat.type}) `;
      }

      if (e instanceof GrammyError) {
        const desc = e.description;
        const params = e.parameters ? JSON.stringify(e.parameters) : "";

        switch (e.error_code) {
          // Bot was blocked / kicked / chat not found
          case 403: {
            console.warn(`Bot blocked/kicked/chat not found ${prefix}`);
            break;
          }

          // Flood wait
          case 429: {
            const retryAfter = e.parameters.retry_after ?? "uknown";
            console.warn(
              `Rate limited ${prefix}, retry after ${retryAfter} sec`,
            );
            break;
          }

          // Bad request
          case 400: {
            console.error(`Bad request ${prefix}:${desc}`);
            break;
          }

          default:
            console.error(
              `Other Telegram API error ${prefix} (code ${e.error_code}): ${desc} ${params}`,
            );
        }
      } else if (e instanceof HttpError) {
        console.error(`Network/HTTP error ${prefix}:`, e);
      } else {
        console.error(`Unexpected error ${prefix}:`, e);
      }
    });
  }

  private setupHandlers(bot: TCustomBot): void {
    registerCommands(bot);

    bot.on("callback_query:data", async (ctx) => {
      const payload = ctx.callbackQuery.data;
      console.warn("Unknown button event with payload", {
        payload,
        timestamp: formatRussianDateTime(new Date()),
      });
      await ctx.answerCallbackQuery({
        text: "Необработанное действие 😥",
      });
    });
  }

  async startPolling(bot: TCustomBot): Promise<void> {
    try {
      bot.start();
      this.mode = "polling";
      console.warn("Bot started in polling mode");
    } catch (error) {
      console.error(
        "Startup error:",
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async stop(bot: TCustomBot): Promise<void> {
    if (!this.isRunning) {
      console.error("Bot not running, nothing to stop");
      return;
    }

    try {
      await bot.stop();
      this.mode = null;
      console.warn("Bot stopped gracefully");
    } catch (error) {
      console.error(
        "Error stopping bot:",
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async handleWebhookUpdate(bot: TCustomBot, update: Update): Promise<void> {
    await bot.handleUpdate(update);
  }

  async setWebhook(bot: TCustomBot, url: string): Promise<void> {
    const secret = config.telegram.webhookSecret;

    try {
      await bot.api.setWebhook(url, { secret_token: secret || undefined });
      this.mode = "webhook";
      if (secret) {
        console.warn(
          `✅ Webhook configured: ${url}  (secret token protection enabled)`,
        );
      } else {
        console.warn(
          `⚠ Webhook configured: ${url}  (NO secret token — less secure)`,
        );
      }
    } catch (error) {
      console.error("Failed to set webhook:", error);
      throw error;
    }
  }

  async deleteWebhook(bot: TCustomBot): Promise<void> {
    try {
      await bot.api.deleteWebhook();
      console.warn("Webhook deleted");
    } catch (error) {
      console.error("Failed to delete webhook:", error);
      throw error;
    }
  }

  async getWebhookInfo(bot: TCustomBot) {
    return await bot.api.getWebhookInfo();
  }
}

export const getBotManager = () => BotManager.getInstance();
```

## File: apps/telegram-bot/src/server.ts
```typescript
import "@/env";
import { serve } from "srvx/node";
import { createRoutes } from "@/routes";
import { getBotManager } from "@/bot";
import { config, validateConfig, validateNotificationTypes } from "@/config";

async function startApp() {
  try {
    validateConfig(config);
  } catch (error) {
    console.error("❌ Configuration validation failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const botManager = getBotManager();

  try {
    await botManager.initialize(config.telegram.token);
    await validateNotificationTypes();

    const bot = botManager.getBot();

    if (config.telegram.useWebhook) {
      console.warn("🔗 Setting up webhook mode...");
      try {
        await botManager.deleteWebhook(bot);
        await botManager.setWebhook(bot, config.telegram.webhookUrl);

        const webhookInfo = await botManager.getWebhookInfo(bot);

        if (webhookInfo.url === config.telegram.webhookUrl) {
          console.warn(
            `✅ Webhook verified and active: ${config.telegram.webhookUrl}`,
          );
        } else {
          throw new Error(
            `Webhook verification failed. Expected: ${config.telegram.webhookUrl}, Got: ${webhookInfo.url}`,
          );
        }
      } catch (error) {
        console.error(`❌ Failed to set webhook, switching to polling...`);
        console.error(
          `Error details: ${error instanceof Error ? error.stack : error}`,
        );
        await botManager.startPolling(bot);
      }
    } else {
      console.warn("📡 Using polling mode...");
      await botManager.startPolling(bot);
    }

    const router = createRoutes(bot);
    if (process.env.NODE_ENV === "development") {
      console.log(router.getRoutes());
    }

    const server = serve({
      fetch: (request) => router.handle(request),
      port: config.server.port,
    });

    await server.ready();

    console.warn(`📊 Bot mode: ${botManager.getMode()}`);
    console.warn(`🌍 Environment: ${config.server.nodeEnv}`);
    console.warn(
      `👥 Managers configured: ${config.managers.getChatIds().length}`,
    );

    const shutdown = async () => {
      console.warn("\nShutting down gracefully...");
      await botManager.stop(bot);
      process.exit(0);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startApp();
```

## File: apps/telegram-bot/src/routes/index.ts
```typescript
import { getBotManager } from "@/bot";
import { config } from "@/config";
import { cors, handleOptions, requireJSON } from "@/middleware";
import { createRouter, error, parseJSON, type Router } from "@/router";
import {
  notifyAliParcelPickup,
  notifyOnlinePickup,
  notifyPickUpPointDeliveryOrder,
} from "@/services/notification.service";
import { NotificationTypes } from "@/types/notification-types";
import {
  AliParcelPickupSchema,
  type OnlinePickupPayload,
  type PickUpPointDeliveryOrderPayload,
} from "@/types/notifications";
import type { Update } from "grammy/types";
import { version } from "../../package.json";
import type { Bot } from "grammy";
import { parseBody } from "@/utils/validate";

export function createRoutes(bot: Bot): Router {
  const botManager = getBotManager();
  const router = createRouter();

  /**
   * When to enable:
   * - Local development without nginx
   * - Serverless deployments
   * - Testing CORS without reverse proxy
   *
   * To enable: modify below to `router.use(handleOptions);`
   */
  if (process.env.NODE_ENV === "development") {
    router.use(handleOptions);
  }

  router.use(cors);

  // Logging middleware
  router.use(async (request, next) => {
    const startTime = Date.now();
    const url = new URL(request.url);

    console.warn(`📥 ${request.method} ${url.pathname}`);

    const response = await next();

    const duration = Date.now() - startTime;

    console.warn(
      `📤 ${request.method} ${url.pathname} - ${response.status} (${duration}ms)`,
    );

    return response;
  });

  router.get("/health", (_request) => {
    return Response.json({
      status: "ok",
      bot: botManager.isRunning() ? "running" : "stopped",
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/stats", (_request) => {
    const memoryUsage = process.memoryUsage();

    return Response.json({
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
      node_version: process.version,
      platform: process.platform,
    });
  });

  // Webhook endpoint for Telegram
  // To use this, you need to set webhook URL via Telegram Bot API:
  // https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/webhook
  router.post("/webhook", async (request) => {
    // 1. Only allow webhook mode at all
    if (!config.telegram.useWebhook)
      return new Response("This endpoint is only available in webhook mode", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
        },
      });

    // 2. Getting telegram bot api secret token from headers
    const receivedSecret = request.headers.get(
      "X-Telegram-Bot-Api-Secret-Token",
    );

    if (config.telegram.webhookSecret) {
      if (receivedSecret !== config.telegram.webhookSecret) {
        console.warn(
          `Webhook secret mismatch (possible spoofed request) — received: ${receivedSecret ? "present but wrong" : "missing"}`,
        );
        return new Response("Forbidden", { status: 403 });
      }
    } else {
      // No secret configured → log warning but proceed (not ideal, but graceful)
      console.warn("Webhook secret check skipped — WEBHOOK_SECRET not set");
    }

    try {
      const update = (await request.json()) as Update;

      const bot = botManager.getBot();

      // Handle the update using grammy's handleUpdate method
      await botManager.handleWebhookUpdate(bot, update);

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response("Error processing update", { status: 500 });
    }
  });

  router.get("/webhook/info", async (_request) => {
    try {
      const bot = botManager.getBot();
      const info = await botManager.getWebhookInfo(bot);
      return Response.json(info);
    } catch (error) {
      console.error("Error getting webhook info:", error);
      return new Response("Error getting webhook info", { status: 500 });
    }
  });

  router.get("/", (_request) => {
    return Response.json({
      service: "Telegram Bot Server",
      version,
      endpoints: [
        "GET /health - Health check",
        "GET /stats - Server statistics",
        "POST /webhook - Telegram webhook handler",
        "GET /webhook/info - Get webhook info",
        "GET / - This info",
      ],
    });
  });

  router.post(
    `/api/notify/${NotificationTypes.ONLINE_PICKUP_RF}`,
    async (request) => {
      try {
        const payload = await parseJSON<OnlinePickupPayload>(request);

        const requiredFields = [
          "surnameSender",
          "nameSender",
          "patronymicSender",
          "phoneSender",
          "cityRegion",
          "pickupAddress",
          "pickupTime",
          "totalWeight",
          "cubicMeter",
          "description",
          "surnameRecipient",
          "nameRecipient",
          "patronymicRecipient",
          "phoneRecipient",
          "emailRecipient",
          "shippingPayment",
        ];

        const missingFields = requiredFields.filter(
          (field) => !payload[field as keyof OnlinePickupPayload],
        );

        if (missingFields.length > 0) {
          return error(`Missing required fields: ${missingFields.join(", ")}`);
        }

        const result = await notifyOnlinePickup(bot, payload);

        if (!result.success) {
          console.error("Failed to send notifications:", result.errors);

          // If all failed, return error
          if (result.sent === 0) {
            return error("Failed to send notifications to any manager", {
              status: 500,
            });
          }

          // Partial success
          return Response.json({
            success: true,
            message: "Notification sent with some failures",
            status: {
              sent: result.sent,
              failed: result.failed,
              skipped: result.skipped,
            },
            warnings: result.errors,
          });
        }

        return Response.json({
          success: true,
          message: "Notification sent successfully",
          status: {
            sent: result.sent,
            failed: result.failed,
            skipped: result.skipped,
          },
        });
      } catch (err) {
        console.error("Error in /api/notify/online-pickup:", err);

        if (err instanceof Error && err.message === "Invalid JSON body") {
          return error("Invalid JSON body");
        }

        return error("Internal server error", { status: 500 });
      }
    },
    requireJSON,
  );

  router.post(
    `/api/notify/${NotificationTypes.PICK_UP_POINT_DELIVERY}`,
    async (request) => {
      try {
        const payload =
          await parseJSON<PickUpPointDeliveryOrderPayload>(request);

        // Validate required fields
        const errors: string[] = [];

        // Sender validation
        if (!payload.sender) {
          errors.push("sender is required");
        } else {
          if (!payload.sender.phoneSender)
            errors.push("sender.phoneSender is required");
          if (!payload.sender.pickupAddress)
            errors.push("sender.pickupAddress is required");
          if (!payload.sender.pointFrom)
            errors.push("sender.pointFrom is required");

          // Either physical person OR company fields must be present
          const hasPhysicalFields =
            payload.sender.nameSender && payload.sender.surnameSender;
          const hasCompanyFields =
            payload.sender.companySender && payload.sender.innSender;

          if (!hasPhysicalFields && !hasCompanyFields) {
            errors.push(
              "sender must have either physical person fields (nameSender, surnameSender) or company fields (companySender, innSender)",
            );
          }
        }

        // Recipient validation
        if (!payload.recipient) {
          errors.push("recipient is required");
        } else {
          if (!payload.recipient.phoneRecipient)
            errors.push("recipient.phoneRecipient is required");
          if (!payload.recipient.deliveryAddress)
            errors.push("recipient.deliveryAddress is required");

          // Either physical person OR company fields must be present
          const hasPhysicalFields =
            payload.recipient.nameRecipient &&
            payload.recipient.surnameRecipient;
          const hasCompanyFields =
            payload.recipient.companyRecipient &&
            payload.recipient.innRecipient;

          if (!hasPhysicalFields && !hasCompanyFields) {
            errors.push(
              "recipient must have either physical person fields (nameRecipient, surnameRecipient) or company fields (companyRecipient, innRecipient)",
            );
          }
        }

        // Cargo data validation
        if (!payload.cargoData) {
          errors.push("cargoData is required");
        } else {
          if (!payload.cargoData.shippingPayment)
            errors.push("cargoData.shippingPayment is required");
          if (!payload.cargoData.description)
            errors.push("cargoData.description is required");
          if (payload.cargoData.weightHeaviestPosition === undefined)
            errors.push("cargoData.weightHeaviestPosition is required");
          if (payload.cargoData.totalWeight === undefined)
            errors.push("cargoData.totalWeight is required");
          if (payload.cargoData.declaredPrice === undefined)
            errors.push("cargoData.declaredPrice is required");
          if (payload.cargoData.cubicMeter === undefined)
            errors.push("cargoData.cubicMeter is required");
        }

        // Customer validation (if provided)
        if (payload.customer) {
          if (!payload.customer.phoneCustomer)
            errors.push(
              "customer.phoneCustomer is required when customer is provided",
            );

          const hasPhysicalFields =
            payload.customer.nameCustomer && payload.customer.surnameCustomer;
          const hasCompanyFields =
            payload.customer.companyCustomer && payload.customer.innCustomer;

          if (!hasPhysicalFields && !hasCompanyFields) {
            errors.push(
              "customer must have either physical person fields (nameCustomer, surnameCustomer) or company fields (companyCustomer, innCustomer)",
            );
          }
        }

        if (errors.length > 0) {
          return error(`Validation errors: ${errors.join("; ")}`, {
            status: 400,
          });
        }

        const result = await notifyPickUpPointDeliveryOrder(bot, payload);

        if (!result.success) {
          console.error("Failed to send notifications:", result.errors);

          // If all failed, return error
          if (result.sent === 0) {
            return error("Failed to send notifications to managers", {
              status: 500,
            });
          }

          // Partial success
          return Response.json({
            success: true,
            message: "Notification sent with some failures",
            status: {
              sent: result.sent,
              failed: result.failed,
              skipped: result.skipped,
            },
            warnings: result.errors,
          });
        }

        // Partial success
        return Response.json({
          success: true,
          message: "Notification sent successfully",
          status: {
            sent: result.sent,
            failed: result.failed,
            skipped: result.skipped,
          },
        });
      } catch (err) {
        console.error(
          "Error in /api/notify/pick-up-point-delivery-order:",
          err,
        );

        if (err instanceof Error && err.message === "Invalid JSON body") {
          return error("Invalid JSON body");
        }

        return error("Internal server error", { status: 500 });
      }
    },
    requireJSON,
  );

  router.post(
    `/api/notify/${NotificationTypes.ALI_PARCEL_PICKUP}`,
    async (request) => {
      try {
        const body = await parseJSON(request);
        const result = parseBody(AliParcelPickupSchema, body);

        if (!result.success) {
          return result.response;
        }

        const notifResult = await notifyAliParcelPickup(bot, result.data);

        if (notifResult.sent === 0 && notifResult.failed > 0) {
          console.error("Failed to send notifications:", notifResult.errors);
          return error("Failed to send notifications to any manager", {
            status: 500,
          });
        }

        if (notifResult.failed > 0) {
          console.error("Partial failure:", notifResult.errors);
          return Response.json({
            success: true,
            message: "Notification sent with some failures",
            status: {
              sent: notifResult.sent,
              failed: notifResult.failed,
              skipped: notifResult.skipped,
            },
            warnings: notifResult.errors,
          });
        }

        return Response.json({
          success: true,
          message: "Notification sent successfully",
          status: {
            sent: notifResult.sent,
            failed: notifResult.failed,
            skipped: notifResult.skipped,
          },
        });
      } catch (err) {
        console.error("Error in /api/notify/ali-parcel-pickup:", err);

        if (err instanceof Error && err.message === "Invalid JSON body") {
          return error("Invalid JSON body");
        }

        return error("Internal server error:", { status: 500 });
      }
    },
    requireJSON,
  );

  return router;
}
```

## File: apps/telegram-bot/package.json
```json
{
  "name": "@donbass-post/tg-bot",
  "private": true,
  "version": "1.2.1",
  "type": "module",
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx watch --clear-screen=false src/server.ts",
    "build": "tsup",
    "preview": "cross-env NODE_ENV=production node dist/server.cjs",
    "check-types": "tsc -b",
    "lint": "eslint .",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "yarn dlx prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  },
  "dependencies": {
    "@grammyjs/auto-retry": "^2.0.2",
    "@grammyjs/commands": "^1.3.2",
    "@prisma/adapter-pg": "^7.4.0",
    "@prisma/client": "^7.4.0",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "dotenv": "^17.2.3",
    "dotenv-expand": "^12.0.3",
    "grammy": "^1.39.2",
    "prisma": "^7.4.0",
    "srvx": "^0.11.8",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@donbass-post/eslint-config": "workspace:*",
    "@donbass-post/prettier-config": "workspace:*",
    "@donbass-post/typescript-config": "workspace:*",
    "@eslint/js": "^9.36.0",
    "@types/node": "^25.0.8",
    "@vitest/coverage-v8": "^4.1.2",
    "cross-env": "^10.1.0",
    "eslint": "^9.36.0",
    "globals": "^16.4.0",
    "prettier": "^3.8.0",
    "terser": "^5.44.1",
    "tsup": "^8.5.1",
    "tsx": "^4.21.0",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.44.0",
    "vitest": "^4.1.2"
  }
}
```
