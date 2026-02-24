import React, { useState, useEffect } from "react";
import api from "@/api/axios";

interface Role {
  id: number;
  name: string;
  permissions: any;
}

const KeyGenerator: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/admin/roles");
        setRoles(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedRole(response.data.data[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to load roles", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleGenerate = async () => {
    try {
      const response = await api.post("/admin/generate-key", {
        role_id: parseInt(selectedRole),
      });
      setGeneratedKey(response.data.data.key);
    } catch (error) {
      alert("Failed to generate key. Ensure role still exists.");
    }
  };

  return (
    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
        Assign Dynamic Role
      </label>

      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        disabled={isLoading}
        className="w-full p-2 mb-4 border rounded bg-white text-slate-800"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !selectedRole}
        className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition-all"
      >
        {isLoading ? "Loading Roles..." : "Generate Registration Key"}
      </button>

      {/* ... Generated Key Display ... */}
    </div>
  );
};

export default KeyGenerator;
