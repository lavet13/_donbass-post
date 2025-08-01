import { setAuthTokenAtom, isAuthenticatedAtom, jwtPayloadAtom } from "@/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { router } from "@/main";

const roles = ["manager"] as const;
const permissions = [
  "manager:write",
  "manager:read",
  "manager:delete",
] as const;
type Role = (typeof roles)[number];
type Permission = (typeof permissions)[number];

export const useAuth = () => {
  const setToken = useSetAtom(setAuthTokenAtom);
  const user = useAtomValue(jwtPayloadAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  const hasRole = (role: Role) => {
    return roles.includes(role);
  };

  const hasAnyRole = (roles: Role[]) => {
    return roles.some((role) => roles.includes(role));
  };

  const hasPermission = (permission: Permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]) => {
    return permissions.some((permission) => permissions.includes(permission));
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
