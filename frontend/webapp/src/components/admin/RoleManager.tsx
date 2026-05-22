import React, { useState } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface RoleManagerProps {
  initialData?: any;
  onComplete?: () => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({
  initialData,
  onComplete,
}) => {
  const [roleName, setRoleName] = useState(initialData?.name || "");
  const [permissions, setPermissions] = useState<any>(
    initialData?.permissions || {
      inventory: [],
      hr_access: [],
      admin_panel: false,
    },
  );

  const handleSaveRole = async () => {
    if (!roleName) return toast.error("Please enter a role name");

    try {
      if (initialData?.id) {
        await api.put(`/admin/roles/${initialData.id}`, {
          name: roleName,
          permissions: permissions,
        });
        toast.success("Role updated successfully!");
      } else {
        await api.post("/admin/roles", {
          name: roleName,
          permissions: permissions,
        });
        toast.success("Role created successfully!");
      }

      if (onComplete) onComplete();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving role");
    }
  };

  const hrPermissions = [
    { id: "create_employee", label: "Create Employee Record" },
    { id: "manage_employees", label: "Manage Employee Records" },
    { id: "generate_keys", label: "Generate Registration Keys" },
  ];

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev: any) => {
      const currentActions = prev[module] || [];
      const updatedActions = currentActions.includes(action)
        ? currentActions.filter((a: string) => a !== action)
        : [...currentActions, action];
      return { ...prev, [module]: updatedActions };
    });
  };

  return (
    <div className="space-y-8">
      {/* Role Name Input */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          Role Name
        </label>
        <Input
          type="text"
          placeholder="e.g., HR Manager"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full max-w-md bg-background"
        />
      </div>

      <div className="space-y-5">
        {/* HR ACCESS MODULE */}
        <div className="p-5 border border-border/60 rounded-xl bg-accent/10">
          <span className="block mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            HR Access
          </span>
          <div className="flex flex-col gap-3">
            {hrPermissions.map((perm) => (
              <label
                key={perm.id}
                className="flex items-center space-x-3 text-sm font-medium text-foreground cursor-pointer"
              >
                <Checkbox
                  checked={permissions.hr_access.includes(perm.id)}
                  onCheckedChange={() => togglePermission("hr_access", perm.id)}
                  className="rounded"
                />
                <span className="leading-none">{perm.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* INVENTORY ACCESS */}
        <div className="p-5 border border-border/60 rounded-xl bg-accent/10">
          <span className="block mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Inventory Access
          </span>
          <div className="flex items-center gap-6">
            {["read", "write"].map((act) => (
              <label
                key={act}
                className="flex items-center space-x-3 text-sm font-bold uppercase text-foreground cursor-pointer"
              >
                <Checkbox
                  checked={permissions.inventory.includes(act)}
                  onCheckedChange={() => togglePermission("inventory", act)}
                  className="rounded"
                />
                <span className="leading-none">{act}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ADMIN DASHBOARD TOGGLE */}
        <div className="flex items-center justify-between p-5 border border-border/60 rounded-xl bg-accent/10">
          <span className="text-sm font-semibold text-foreground">
            Can Access Admin Panel
          </span>
          <Checkbox
            checked={permissions.admin_panel}
            onCheckedChange={(checked) =>
              setPermissions({ ...permissions, admin_panel: checked === true })
            }
            className="w-5 h-5 rounded"
          />
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSaveRole}
          className="w-full sm:w-auto px-10 py-5 text-sm font-bold tracking-wide"
        >
          {initialData?.id ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </div>
  );
};

export default RoleManager;
