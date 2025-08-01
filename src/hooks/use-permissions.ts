import { useAuth } from "@/hooks/use-auth";

export const usePermissions = () => {
  const { hasRole, hasPermission } = useAuth();

  const permissions = {
    canReadManagers: hasPermission("manager:read"),
    canCreateManagers: hasPermission("manager:create"),
    canEditManagers: hasPermission("manager:write"),
    canDeleteManagers: hasPermission("manager:delete"),
    isManager: hasRole("manager"),
  };

  return permissions;
};
