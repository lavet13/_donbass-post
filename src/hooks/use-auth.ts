import { authTokenAtom, isAuthenticatedAtom, jwtPayloadAtom } from "@/atoms";
import { useAtomValue, useSetAtom } from "jotai";

export const useAuth = () => {
  const setToken = useSetAtom(authTokenAtom);
  const user = useAtomValue(jwtPayloadAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  return {
    setToken,
    user,
    isAuthenticated,
  };
};
