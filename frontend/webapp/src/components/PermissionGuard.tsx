import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle } from "lucide-react";

interface PermissionGuardProps {
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Route guard that checks permissions/roles before rendering children.
 *
 * Usage:
 *   <Route element={<PermissionGuard permissions={["customers.manage"]} />}>
 *     <Route path="customers" element={<Customers />} />
 *   </Route>
 *
 *   <Route element={<PermissionGuard roles={["admin"]} />}>
 *     <Route path="settings" element={<Settings />} />
 *   </Route>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions = [],
  roles = [],
  requireAll = false,
  fallback,
}) => {
  const { user, loading, hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/webapp/login" replace />;
  }

  // Check roles
  if (roles.length > 0 && !hasRole(...roles)) {
    if (fallback) return <>{fallback}</>;
    return <UnauthorizedPage />;
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(...permissions)
      : hasAnyPermission(...permissions);

    if (!hasAccess) {
      if (fallback) return <>{fallback}</>;
      return <UnauthorizedPage />;
    }
  }

  return <Outlet />;
};

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          You don't have the required permissions to access this page.
          Contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

export default PermissionGuard;
