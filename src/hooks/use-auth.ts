import { setAuthTokenAtom, isAuthenticatedAtom, jwtPayloadAtom } from "@/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { router } from "@/main";

const roles = ["manager"] as const;

// @future reminder: https://tanstack.com/router/latest/docs/framework/react/how-to/setup-rbac#3-using-permission-guards
const definedPermissions = [
  "manager:create",
  "manager:write",
  "manager:read",
  "manager:delete",
] as const;
type Role = (typeof roles)[number];
type Permission = (typeof definedPermissions)[number];

export const useAuth = () => {
  const setToken = useSetAtom(setAuthTokenAtom);
  const user = useAtomValue(jwtPayloadAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  const hasRole = (role: Role) => {
    return user?.[role] ?? false;
  };

  const hasAnyRole = (roles: Role[]) => {
    return roles.some((role) => Object.keys(user ?? []).includes(role));
  };

  const hasPermission = (permission: Permission) => {
    return definedPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]) => {
    return permissions.some((permission) => definedPermissions.includes(permission));
  };

  const permissions = {
    canReadManagers: hasPermission("manager:read"),
    canCreateManagers: hasPermission("manager:create"),
    canEditManagers: hasPermission("manager:write"),
    canDeleteManagers: hasPermission("manager:delete"),
    isManager: hasRole("manager"),
  };

  const login = async (token: string, search: { redirect?: string }) => {
    setToken(token);
    await router.invalidate();
    await router.navigate({ to: search.redirect });
  };

  const logout = async () => {
    setToken(null);
    await router.invalidate();
    await router.navigate({ to: "/auth" });
  };

  return {
    permissions,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    setToken,
    user,
    isAuthenticated,
    login,
    logout,
  };
};
