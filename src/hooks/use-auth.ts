import { setAuthTokenAtom, isAuthenticatedAtom, jwtPayloadAtom } from "@/atoms";
import { useAtomValue, useSetAtom } from "jotai";

export const useAuth = () => {
  const setToken = useSetAtom(setAuthTokenAtom);
  const user = useAtomValue(jwtPayloadAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  return {
    setToken,
    user,
    isAuthenticated,
  };
};
