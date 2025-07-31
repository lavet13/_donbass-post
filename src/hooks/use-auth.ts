import { setAuthTokenAtom, isAuthenticatedAtom, jwtPayloadAtom } from "@/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { router } from "@/main";

export const useAuth = () => {
  const setToken = useSetAtom(setAuthTokenAtom);
  const user = useAtomValue(jwtPayloadAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  console.log({ user, isAuthenticated });

  const handleLogout = async () => {
    setToken(null);
    await router.invalidate();
    await router.navigate({ to: "/auth" });
  };

  return {
    setToken,
    user,
    isAuthenticated,
    handleLogout,
  };
};
