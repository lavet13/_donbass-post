import type { TContext } from "@/types/context";
import { config } from "@/config";
import type { Permission, Role } from "@/rbac/types";
import { getCachedPermissions, getCachedRoles } from "@/rbac/cache";

/**
 * Returns the root admin chat ID from env.
 * This is the single operator/owner who can manage the team.
 */
export function getRootAdminChatId(): number | undefined {
  return config.telegram.rootAdminChatId;
}

export async function userHasRole(ctx: TContext, role: Role) {
  const userId = ctx.from?.id;
  if (!userId) return false;

  try {
    const roles = await getCachedRoles(BigInt(userId));
    return roles.has(role);
  } catch (err) {
    console.error(`Error checking user roles:`, err);
    return false;
  }
}

export async function userHasPermission(
  ctx: TContext,
  perm: Permission,
): Promise<boolean> {
  const userId = ctx.from?.id;
  if (!userId) return false;

  try {
    const perms = await getCachedPermissions(BigInt(userId));
    return perms.has(perm);
  } catch (err) {
    console.error(`Error checking user permission:`, err);
    return false; // fail closed — on error, deny. Safer than fail-open.
  }
}

export async function userHasSomePermission(ctx: TContext, ...perms: Permission[]): Promise<boolean> {
  for (const perm of perms) {
    const hasPerm = await userHasPermission(ctx, perm);
    if (hasPerm) return true;
  }

  return false;
}

export async function userHasEveryPermission(ctx: TContext, ...perms: Permission[]) {
  for (const perm of perms) {
    const hasPerm = await userHasPermission(ctx, perm);
    if (!hasPerm) return false;
  }
  return true;
}

export async function userHasSomeRole(ctx: TContext, ...roles: Role[]): Promise<boolean> {
  for (const role of roles) {
    const hasRole = await userHasRole(ctx, role);
    if (hasRole) return true;
  }

  return false;
}

export async function userHasEveryRole(ctx: TContext, ...roles: Role[]) {
  for (const role of roles) {
    const hasRole = await userHasRole(ctx, role);
    if (!hasRole) return false;
  }
  return true;
}

