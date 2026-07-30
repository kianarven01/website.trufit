import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  Plus,
  Trash2,
  Save,
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Settings,
  HelpCircle,
  ChevronRight,
  Check,
  AlertTriangle,
  UserCog,
  Package,
  Truck,
  Receipt,
  ClipboardList,
  Wrench,
  BarChart3,
  FileText,
} from "lucide-react";

interface Role {
  id: number;
  name: string;
  permissions: string[];
  employee_count?: number;
}

interface PermissionItem {
  id: string;
  label: string;
  description: string;
}

interface PermissionGroup {
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  permissions: PermissionItem[];
}

const permissionGroups: PermissionGroup[] = [
  {
    title: "Appointments & Calendar",
    icon: Calendar,
    color: "text-blue-500",
    permissions: [
      { id: "appointments.view", label: "View Appointments", description: "Read-only access to calendar schedules and appointment logs" },
      { id: "appointments.manage", label: "Manage Appointments", description: "Create, reschedule, confirm, or cancel appointments" },
    ],
  },
  {
    title: "Customer Management",
    icon: Users,
    color: "text-violet-500",
    permissions: [
      { id: "customers.view", label: "View Customers", description: "Access customer profiles, contact info, and vehicle history" },
      { id: "customers.manage", label: "Manage Customers", description: "Add, edit, or remove customer accounts and vehicles" },
    ],
  },
  {
    title: "Job Orders & Services",
    icon: Wrench,
    color: "text-amber-500",
    permissions: [
      { id: "services.view_job_orders", label: "View Job Orders", description: "Track service tasks, job status, and technician assignments" },
      { id: "services.manage_job_orders", label: "Manage Job Orders", description: "Create, dispatch, update status, and close job orders" },
    ],
  },
  {
    title: "Service Catalog",
    icon: ClipboardList,
    color: "text-orange-500",
    permissions: [
      { id: "services.manage_catalog", label: "Manage Service Catalog", description: "Edit services, pricing, task library, and categories" },
    ],
  },
  {
    title: "Sales & Estimates",
    icon: TrendingUp,
    color: "text-emerald-500",
    permissions: [
      { id: "sales.view", label: "View Sales & Estimates", description: "Read estimates, sales orders, and transaction details" },
      { id: "sales.manage", label: "Manage Sales & Estimates", description: "Draft, issue, convert estimates to sales orders, and manage billing" },
    ],
  },
  {
    title: "Product Catalog",
    icon: Package,
    color: "text-cyan-500",
    permissions: [
      { id: "products.view", label: "View Products", description: "Check parts directory, vehicle variants, and retail catalog" },
      { id: "products.manage", label: "Manage Products", description: "Add, edit, archive, or deprecate stock products and variants" },
    ],
  },
  {
    title: "Purchasing & Suppliers",
    icon: Truck,
    color: "text-rose-500",
    permissions: [
      { id: "purchasing.view", label: "View Purchasing", description: "View purchase orders, goods receipts, supplier bills, and stock movements" },
      { id: "purchasing.manage", label: "Manage Purchasing", description: "Create POs, receive goods, process supplier bills, and manage suppliers" },
    ],
  },
  {
    title: "Employee Management",
    icon: UserCog,
    color: "text-indigo-500",
    permissions: [
      { id: "system.manage_employees", label: "Manage Employees", description: "View employee profiles, update details, and terminate accounts" },
      { id: "system.onboard", label: "Employee Onboarding", description: "Generate registration keys and onboard new employees" },
    ],
  },
  {
    title: "System Administration",
    icon: Settings,
    color: "text-slate-500",
    permissions: [
      { id: "system.manage_roles", label: "Manage Roles & Permissions", description: "Full access to create, edit, and delete user roles and permissions" },
    ],
  },
];

const Preferences: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      const originalPerms: Record<string, boolean> = {};
      selectedRole.permissions.forEach((p) => {
        originalPerms[p] = true;
      });
      const currentActiveCount = Object.keys(rolePermissions).filter((k) => rolePermissions[k]).length;
      const originalActiveCount = Object.keys(originalPerms).filter((k) => originalPerms[k]).length;
      setHasChanges(roleName !== selectedRole.name || currentActiveCount !== originalActiveCount);
    } else {
      setHasChanges(roleName.trim().length > 0);
    }
  }, [roleName, rolePermissions, selectedRole]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/roles");
      if (response.data?.status === "success") {
        const fetchedRoles = response.data.data.map((r: any) => ({
          ...r,
          permissions: Array.isArray(r.permissions)
            ? r.permissions
            : typeof r.permissions === "object" && r.permissions !== null
            ? Object.keys(r.permissions).filter((k) => r.permissions[k])
            : [],
        }));
        setRoles(fetchedRoles);
        
        if (fetchedRoles.length > 0 && !selectedRole) {
          handleSelectRole(fetchedRoles[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to load organizational roles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role: Role) => {
    if (hasChanges && !confirm("You have unsaved changes. Discard them?")) {
      return;
    }
    setSelectedRole(role);
    setRoleName(role.name);
    setHasChanges(false);
    
    const activePerms: Record<string, boolean> = {};
    role.permissions.forEach((p) => {
      activePerms[p] = true;
    });
    setRolePermissions(activePerms);
  };

  const handleCreateNewRole = () => {
    if (hasChanges && !confirm("You have unsaved changes. Discard them?")) {
      return;
    }
    setSelectedRole(null);
    setRoleName("");
    setRolePermissions({});
    setHasChanges(false);
  };

  const handleTogglePermission = (id: string, checked: boolean) => {
    setRolePermissions((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleToggleGroup = (group: PermissionGroup, checked: boolean) => {
    const newPerms = { ...rolePermissions };
    group.permissions.forEach((p) => {
      newPerms[p.id] = checked;
    });
    setRolePermissions(newPerms);
  };

  const getGroupState = (group: PermissionGroup) => {
    const total = group.permissions.length;
    const active = group.permissions.filter((p) => rolePermissions[p.id]).length;
    return { total, active, isAll: active === total, isPartial: active > 0 && active < total };
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      return toast.error("Please enter a valid role name");
    }

    setIsSaving(true);
    const activePermArray = Object.keys(rolePermissions).filter((k) => rolePermissions[k]);

    try {
      if (selectedRole?.id) {
        const res = await api.put(`/admin/roles/${selectedRole.id}`, {
          name: roleName,
          permissions: activePermArray,
        });
        
        if (res.data?.status === "success") {
          toast.success("Role permissions updated successfully!");
          setHasChanges(false);
          await fetchRoles();
        }
      } else {
        const res = await api.post("/admin/roles", {
          name: roleName,
          permissions: activePermArray,
        });

        if (res.data?.status === "success") {
          toast.success("New role registered successfully!");
          setHasChanges(false);
          await fetchRoles();
          if (res.data?.data) {
            handleSelectRole(res.data.data);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving role configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (e: React.MouseEvent, roleId: number) => {
    e.stopPropagation();
    
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (roleToDelete?.name.toLowerCase() === "admin") {
      return toast.error("The system Admin role is immutable and cannot be deleted");
    }

    if (roleToDelete?.employees_count && roleToDelete.employees_count > 0) {
      return toast.error(`Cannot delete role assigned to ${roleToDelete.employees_count} employee(s). Reassign them first.`);
    }

    if (!confirm(`Are you sure you want to delete the "${roleToDelete?.name}" role?`)) {
      return;
    }

    setIsDeleting(roleId);
    try {
      const res = await api.delete(`/admin/roles/${roleId}`);
      if (res.data?.status === "success") {
        toast.success("Role deleted successfully");
        if (selectedRole?.id === roleId) {
          setSelectedRole(null);
          setRoleName("");
          setRolePermissions({});
        }
        await fetchRoles();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove role");
    } finally {
      setIsDeleting(null);
    }
  };

  const totalPermissions = Object.keys(rolePermissions).filter((k) => rolePermissions[k]).length;

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden bg-background">
      <Card className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
        <CardHeader className="pb-4 border-b border-border/40 shrink-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Roles & Access Controls (UAC)
            </CardTitle>
            <CardDescription>
              Configure granular module authorizations and operational scopes across your workforce.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleCreateNewRole}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </CardHeader>
        
        <div className="flex-1 flex overflow-hidden min-h-0 divide-x divide-border/40">
          {/* LEFT SIDE: ROLES LIST */}
          <div className="w-[30%] min-w-[260px] max-w-[340px] flex flex-col h-full bg-accent/5">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-2">
                  System Roles
                </span>
                
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                    <p className="text-xs text-muted-foreground">Loading roles...</p>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="py-20 text-center">
                    <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-xs font-medium text-muted-foreground">No roles configured</p>
                  </div>
                ) : (
                  roles.map((r) => {
                    const isSelected = selectedRole?.id === r.id;
                    const isAdmin = r.name.toLowerCase() === "admin";
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelectRole(r)}
                        className={`group w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-card border-border/40 hover:bg-accent/40 text-foreground"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-sm font-semibold truncate capitalize">
                            {r.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            {r.permissions.length} permissions
                            {r.employees_count !== undefined && (
                              <span className="ml-1">
                                · {r.employees_count} {r.employees_count === 1 ? 'employee' : 'employees'}
                              </span>
                            )}
                          </span>
                        </div>
                        {!isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting === r.id}
                            onClick={(e) => handleDeleteRole(e, r.id)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive h-7 w-7 transition-opacity shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT SIDE: PERMISSIONS BUILDER */}
          <div className="flex-1 flex flex-col h-full bg-card">
            <div className="p-6 border-b border-border/40 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Role Identity
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Service Advisor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full bg-background font-semibold"
                />
                {selectedRole && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {totalPermissions} of {Object.values(permissionGroups).flat().length} permissions enabled
                  </p>
                )}
              </div>
              <Button
                onClick={handleSaveRole}
                disabled={isSaving || (!hasChanges && !!selectedRole)}
                className="shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {selectedRole ? "Save Changes" : "Create Role"}
                  </>
                )}
              </Button>
            </div>

            <ScrollArea className="flex-1 bg-accent/[0.02]">
              <div className="p-6 space-y-6 max-w-5xl">
                {permissionGroups.map((group) => {
                  const Icon = group.icon;
                  const groupState = getGroupState(group);
                  return (
                    <div key={group.title} className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
                      <div className="px-5 py-4 border-b border-border/40 bg-accent/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {group.title}
                          </h3>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            ({groupState.active}/{groupState.total})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={groupState.isAll}
                            onCheckedChange={(checked) => handleToggleGroup(group, checked === true)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {groupState.isAll ? "All" : groupState.isPartial ? "Partial" : "None"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-border/40">
                        {group.permissions.map((perm) => {
                          const isChecked = !!rolePermissions[perm.id];
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start justify-between p-4 transition-colors cursor-pointer select-none hover:bg-accent/5 ${
                                isChecked ? "bg-primary/[0.01]" : ""
                              }`}
                            >
                              <div className="space-y-0.5 max-w-[85%]">
                                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  {perm.label}
                                </span>
                                <span className="text-xs text-muted-foreground block leading-relaxed">
                                  {perm.description}
                                </span>
                              </div>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                  handleTogglePermission(perm.id, checked === true)
                                }
                                className="mt-1"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Preferences;
