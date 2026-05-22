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
  Sliders,
  Settings,
  HelpCircle
} from "lucide-react";

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

interface PermissionItem {
  id: string;
  label: string;
  description: string;
}

interface PermissionGroup {
  title: string;
  icon: React.ComponentType<any>;
  permissions: PermissionItem[];
}

const permissionGroups: PermissionGroup[] = [
  {
    title: "Appointments & Customers",
    icon: Calendar,
    permissions: [
      { id: "appointments.view", label: "View Appointments", description: "Read-only access to calendar schedules and logs" },
      { id: "appointments.manage", label: "Manage Appointments", description: "Create, reschedule, or cancel appointments" },
      { id: "customers.view", label: "View Customers", description: "Access customer profile lists and vehicle history" },
      { id: "customers.manage", label: "Manage Customers", description: "Add, edit, or remove customer accounts" },
    ],
  },
  {
    title: "Sales & Services",
    icon: TrendingUp,
    permissions: [
      { id: "services.view_job_orders", label: "View Job Orders", description: "Track service tasks and job status" },
      { id: "services.manage_job_orders", label: "Manage Job Orders", description: "Create, dispatch, and close job orders" },
      { id: "services.manage_catalog", label: "Manage Service Catalog", description: "Edit services, pricing, and categories" },
      { id: "sales.view", label: "View Sales & Estimates", description: "Read estimates and transaction details" },
      { id: "sales.manage", label: "Manage Sales & Estimates", description: "Draft, issue, and convert sales orders" },
    ],
  },
  {
    title: "Operations & Inventory",
    icon: ShoppingBag,
    permissions: [
      { id: "products.view", label: "View Product Catalog", description: "Check parts directory and retail catalog" },
      { id: "products.manage", label: "Manage Product Catalog", description: "Add, edit, or deprecate stock products" },
      { id: "purchasing.view", label: "View Purchasing", description: "View purchase orders and suppliers list" },
      { id: "purchasing.manage", label: "Manage Purchasing", description: "Issue POs and manage supplier relations" },
    ],
  },
  {
    title: "System Administration",
    icon: Settings,
    permissions: [
      { id: "system.manage_employees", label: "Manage Employees", description: "View employee profiles and soft-delete" },
      { id: "system.onboard", label: "Employee Onboarding", description: "Generate new employee registration keys" },
      { id: "system.manage_roles", label: "Manage Roles & UAC", description: "Full access to modify user roles and permissions" },
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

  useEffect(() => {
    fetchRoles();
  }, []);

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
        
        // Auto-select first role if available
        if (fetchedRoles.length > 0) {
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
    setSelectedRole(role);
    setRoleName(role.name);
    
    // Set active checkboxes
    const activePerms: Record<string, boolean> = {};
    role.permissions.forEach((p) => {
      activePerms[p] = true;
    });
    setRolePermissions(activePerms);
  };

  const handleCreateNewRole = () => {
    setSelectedRole(null);
    setRoleName("");
    setRolePermissions({});
  };

  const handleTogglePermission = (id: string, checked: boolean) => {
    setRolePermissions((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      return toast.error("Please enter a valid role name");
    }

    setIsSaving(true);
    const activePermArray = Object.keys(rolePermissions).filter((k) => rolePermissions[k]);

    try {
      if (selectedRole?.id) {
        // Update Role
        const res = await api.put(`/admin/roles/${selectedRole.id}`, {
          name: roleName,
          permissions: activePermArray,
        });
        
        if (res.data?.status === "success") {
          toast.success("Role permissions updated successfully!");
          await fetchRoles();
        }
      } else {
        // Create Role
        const res = await api.post("/admin/roles", {
          name: roleName,
          permissions: activePermArray,
        });

        if (res.data?.status === "success") {
          toast.success("New role registered successfully!");
          await fetchRoles();
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
                            {r.permissions.length} modules granted
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
              </div>
              <Button
                onClick={handleSaveRole}
                disabled={isSaving}
                className="shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : selectedRole ? "Save Configurations" : "Register New Role"}
              </Button>
            </div>

            <ScrollArea className="flex-1 bg-accent/[0.02]">
              <div className="p-6 space-y-6 max-w-5xl">
                {permissionGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.title} className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
                      <div className="px-5 py-4 border-b border-border/40 bg-accent/5 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {group.title}
                        </h3>
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
