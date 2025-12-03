import {
  setAuthTokenAtom,
  isAuthenticatedAtom,
  jwtPayloadAtom,
  isManagerAtom,
} from "@/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { router } from "@/router";

// @future reminder: https://tanstack.com/router/latest/docs/framework/react/how-to/setup-rbac#3-using-permission-guards
export const useAuth = () => {
  const setToken = useSetAtom(setAuthTokenAtom);
  const user = useAtomValue(jwtPayloadAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const isManager = useAtomValue(isManagerAtom);

  const login = async (token: string, search: { redirect?: string }) => {
    setToken(token);
    await router.invalidate();
    await router.navigate({ to: search.redirect });
  };

  const logout = async (search?: { redirect?: string }) => {
    setToken(null);
    await router.invalidate();
    await router.navigate({ to: "/auth", search });
  };

  return {
    setToken,
    user,
    isManager,
    isAuthenticated,
    login,
    logout,
  };
};
