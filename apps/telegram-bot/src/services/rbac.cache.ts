import { getUserPermissions, getUserRoles } from "./rbac.service";

// Module-level cache.
const permCache = new Map<bigint, { perms: Set<string>; expires: number }>();
const roleCache = new Map<bigint, { roles: Set<string>; expires: number }>();
const TTL_MS = 60_000; // 1 minute — short enough that stale grants self-heal

export async function getCachedPermissions(
  userId: bigint,
): Promise<Set<string>> {
  const hit = permCache.get(userId);
  if (hit && hit.expires > Date.now()) return hit.perms;

  const perms = await getUserPermissions(userId);
  permCache.set(userId, { perms, expires: Date.now() + TTL_MS });

  return perms;
}

export async function getCachedRoles(userId: bigint): Promise<Set<string>> {
  const hit = roleCache.get(userId);
  if (hit && hit.expires > Date.now()) return hit.roles;

  const roles = await getUserRoles(userId);
  roleCache.set(userId, { roles, expires: Date.now() + TTL_MS });

  return roles;
}

// When you change a user's roles (addManager/removeManager), invalidate:
export function invalidateUserPermissions(userId: bigint) {
  permCache.delete(userId);
}

export function invalidateUserRoles(userId: bigint) {
  roleCache.delete(userId);
}

export function invalidateUser(userId: bigint) {
  invalidateUserRoles(userId);
  invalidateUserPermissions(userId);
}

