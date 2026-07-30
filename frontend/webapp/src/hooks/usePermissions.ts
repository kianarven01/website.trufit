import { useAuth } from "@/context/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions: string[] = user?.permissions || [];
  const role: string = user?.role || "";
  const roleLower = role.toLowerCase();
  const isAdmin = roleLower === "admin";

  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (...perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (...perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.every((p) => permissions.includes(p));
  };

  const hasRole = (...roles: string[]): boolean => {
    return roles.some((r) => r.toLowerCase() === roleLower);
  };

  // Permission group checks
  const canViewAppointments = hasPermission("appointments.view");
  const canManageAppointments = hasPermission("appointments.manage");
  const canViewCustomers = hasPermission("customers.view");
  const canManageCustomers = hasPermission("customers.manage");
  const canViewJobOrders = hasPermission("services.view_job_orders");
  const canManageJobOrders = hasPermission("services.manage_job_orders");
  const canManageServiceCatalog = hasPermission("services.manage_catalog");
  const canViewSales = hasPermission("sales.view");
  const canManageSales = hasPermission("sales.manage");
  const canViewProducts = hasPermission("products.view");
  const canManageProducts = hasPermission("products.manage");
  const canViewPurchasing = hasPermission("purchasing.view");
  const canManagePurchasing = hasPermission("purchasing.manage");
  const canManageEmployees = hasPermission("system.manage_employees");
  const canOnboard = hasPermission("system.onboard");
  const canManageRoles = hasPermission("system.manage_roles");

  return {
    permissions,
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isSupervisor: roleLower === "supervisor",
    isServiceAdvisor: roleLower === "service advisor" || roleLower === "sa",
    isTechnician: roleLower === "technician",
    // Role-based helpers
    isHumanResource: roleLower === "human resource",
    isAccountingHead: roleLower === "accounting head",
    isAccountingStaff: roleLower === "accounting staff",
    isPurchasingHead: roleLower === "purchasing head",
    isPurchasingStaff: roleLower === "purchasing staff",
    isSalesHead: roleLower === "sales head",
    isSalesStaff: roleLower === "sales staff",
    isWarehouseStaff: roleLower === "warehouse staff",
    isReceptionist: roleLower === "receptionist",
    isForeman: roleLower === "foreman",
    isTechnicianSupervisor: roleLower === "technician supervisor",

    // Individual permission checks
    canViewAppointments,
    canManageAppointments,
    canViewCustomers,
    canManageCustomers,
    canViewJobOrders,
    canManageJobOrders,
    canManageServiceCatalog,
    canViewSales,
    canManageSales,
    canViewProducts,
    canManageProducts,
    canViewPurchasing,
    canManagePurchasing,
    canManageEmployees,
    canOnboard,
    canManageRoles,
  };
};
