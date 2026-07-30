import { Outlet } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import AccessDenied from "./AccessDenied";

interface PermissionRouteProps {
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
}

const PermissionRoute = ({
  permissions = [],
  roles = [],
  requireAll = false,
}: PermissionRouteProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isAdmin } = usePermissions();

  if (isAdmin) return <Outlet />;

  let hasAccess = false;

  if (roles.length > 0) {
    hasAccess = hasRole(...roles);
  }

  if (!hasAccess && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(...permissions)
      : hasAnyPermission(...permissions);
  }

  if (roles.length === 0 && permissions.length === 0) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return <Outlet />;
};

export default PermissionRoute;
