import React, { useState } from "react";
import api from "@/api/axios";

interface RoleManagerProps {
  initialData?: any;
  onComplete?: () => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({
  initialData,
  onComplete,
}) => {
  // If initialData exists, we are in EDIT mode
  const [roleName, setRoleName] = useState(initialData?.name || "");
  const [permissions, setPermissions] = useState<any>(
    initialData?.permissions || {
      inventory: [],
      hr_access: [],
      admin_panel: false,
    },
  );

  const handleSaveRole = async () => {
    if (!roleName) return alert("Please enter a role name");

    try {
      if (initialData?.id) {
        // UPDATE existing role (matching your Controller update method)
        await api.put(`/admin/roles/${initialData.id}`, {
          name: roleName,
          permissions: permissions,
        });
      } else {
        // CREATE new role
        await api.post("/admin/roles", {
          name: roleName,
          permissions: permissions,
        });
      }

      if (onComplete) onComplete();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error saving role");
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
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Role Name
        </label>
        <input
          type="text"
          placeholder="e.g., HR Manager"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {/* HR ACCESS MODULE */}
        <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
          <span className="text-sm font-bold text-slate-800 block mb-3 text-slate-400 uppercase text-[10px] tracking-widest">
            HR Access
          </span>
          <div className="grid grid-cols-1 gap-2">
            {hrPermissions.map((perm) => (
              <label
                key={perm.id}
                className="flex items-center space-x-3 text-sm text-slate-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  checked={permissions.hr_access.includes(perm.id)}
                  onChange={() => togglePermission("hr_access", perm.id)}
                />
                <span>{perm.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* INVENTORY ACCESS */}
        <div className="p-4 border border-slate-100 rounded-xl">
          <span className="text-sm font-bold text-slate-800 block mb-3 text-slate-400 uppercase text-[10px] tracking-widest">
            Inventory Access
          </span>
          <div className="flex space-x-6">
            {["read", "write"].map((act) => (
              <label
                key={act}
                className="flex items-center space-x-2 text-sm uppercase font-bold text-slate-500 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={permissions.inventory.includes(act)}
                  onChange={() => togglePermission("inventory", act)}
                />
                <span>{act}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ADMIN DASHBOARD TOGGLE */}
        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
          <span className="text-sm font-bold text-slate-800">
            Can Access Admin Panel
          </span>
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
            checked={permissions.admin_panel}
            onChange={(e) =>
              setPermissions({ ...permissions, admin_panel: e.target.checked })
            }
          />
        </div>
      </div>

      <button
        onClick={handleSaveRole}
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg"
      >
        Create Role
      </button>
    </div>
  );
};

export default RoleManager;
