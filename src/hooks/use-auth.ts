import { authTokenAtom, isAuthenticatedAtom, userPayloadAtom } from "@/atoms";
import { useAtomValue, useSetAtom } from "jotai";

export const useAuth = () => {
  const setToken = useSetAtom(authTokenAtom);
  const user = useAtomValue(userPayloadAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  return {
    setToken,
    user,
    isAuthenticated,
  };
};
