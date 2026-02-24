import React, { useState } from "react";
import api from "@/api/axios";

const RoleManager: React.FC = () => {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({
    inventory: ["read"],
    sales: ["read"],
    admin_panel: false,
  });

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev: any) => {
      const currentActions = prev[module] || [];
      const updatedActions = currentActions.includes(action)
        ? currentActions.filter((a: string) => a !== action)
        : [...currentActions, action];
      return { ...prev, [module]: updatedActions };
    });
  };

  const handleSaveRole = async () => {
    if (!roleName) return alert("Please enter a role name");
    try {
      await api.post("/admin/roles", {
        name: roleName,
        permissions: permissions,
      });
      alert("New role added to the system!");
      setRoleName("");
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Failed to create role. Check if name already exists.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <h3 className="text-slate-800 text-lg font-bold mb-4">
        Add New Department Role
      </h3>

      <input
        type="text"
        placeholder="Role Name (e.g., Workshop Lead)"
        className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
      />

      <div className="space-y-4">
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
          Module Permissions
        </p>

        {/* Inventory Permissions */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="text-sm font-semibold text-slate-700">
            Inventory Access
          </span>
          <div className="space-x-4">
            {["read", "write"].map((act) => (
              <label key={act} className="inline-flex items-center text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={permissions.inventory.includes(act)}
                  onChange={() => togglePermission("inventory", act)}
                />
                {act.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Admin Panel Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="text-sm font-semibold text-slate-700">
            Admin Dashboard Access
          </span>
          <input
            type="checkbox"
            checked={permissions.admin_panel}
            onChange={(e) =>
              setPermissions({ ...permissions, admin_panel: e.target.checked })
            }
          />
        </div>
      </div>

      <button
        onClick={handleSaveRole}
        className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all"
      >
        Create Role
      </button>
    </div>
  );
};

export default RoleManager;
