import type { Context } from "grammy";
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
export function isRootAdmin(ctx: Context): boolean {
  const adminId = getRootAdminChatId();
  if (!adminId) return false;
  return ctx.from?.id === adminId;
}

export async function isActiveManager(ctx: Context): Promise<boolean> {
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
export async function requireRootAdmin(ctx: Context): Promise<boolean> {
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
export async function requireManager(ctx: Context): Promise<boolean> {
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
