import { useAuth } from "@/context/AuthContext";

/**
 * Hook for checking permissions in components.
 * Admin role automatically has all permissions.
 *
 * Usage:
 *   const { hasPermission, hasAnyPermission, hasRole } = usePermission();
 *
 *   if (hasPermission("customers.manage")) { ... }
 *   if (hasAnyPermission("sales.view", "sales.manage")) { ... }
 *   if (hasRole("admin", "supervisor")) { ... }
 */
export const usePermission = () => {
  const {
    permissions,
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  } = useAuth();

  return {
    permissions,
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
};

export default usePermission;
