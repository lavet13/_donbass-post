import { useAuth } from "./use-auth";

export const usePermissions = () => {
  const { hasRole, hasAnyRole, hasPermission, hasAnyPermission } = useAuth();

  return {
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
  };
};
