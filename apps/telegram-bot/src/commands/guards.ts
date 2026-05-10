import type { TContext } from "@/types";
import { prisma } from "@/prisma";
import { config } from "@/config";

/**
 * Returns the root admin chat ID from env.
 * This is the single operator/owner who can manage the team.
 */
export function getRootAdminChatId(): number | undefined {
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
