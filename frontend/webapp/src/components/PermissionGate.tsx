import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  role?: string;
  anyRole?: string[];
  requiresAdmin?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGate = ({
  permission,
  anyPermission,
  allPermissions,
  role,
  anyRole,
  requiresAdmin = false,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
  } = usePermissions();

  // Admin bypass
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check admin requirement
  if (requiresAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check any permission
  if (anyPermission && !hasAnyPermission(...anyPermission)) {
    return <>{fallback}</>;
  }

  // Check all permissions
  if (allPermissions && !hasAllPermissions(...allPermissions)) {
    return <>{fallback}</>;
  }

  // Check single role
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check any role
  if (anyRole && !hasRole(...anyRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
