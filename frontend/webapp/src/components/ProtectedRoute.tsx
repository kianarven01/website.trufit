import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import AccessDenied from "./AccessDenied";

interface ProtectedRouteProps {
  permission?: string;
  anyPermission?: string[];
  requiresAdmin?: boolean;
  fallback?: string;
}

const ProtectedRoute = ({
  permission,
  anyPermission,
  requiresAdmin = false,
  fallback = "/webapp/dashboard",
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/webapp/login" replace />;
  }

  // Check admin requirement
  if (requiresAdmin && !isAdmin) {
    return <AccessDenied />;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <AccessDenied />;
  }

  // Check any permission
  if (anyPermission && !hasAnyPermission(...anyPermission)) {
    return <AccessDenied />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
