import React, { useState, useEffect } from "react";
import api from "@/api/axios";

interface Role {
  id: number;
  name: string;
}

const KeyGenerator: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Employee Fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role_id: "",
  });

  const [generatedKey, setGeneratedKey] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/admin/roles");
        const data = response.data.data;
        setRoles(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, role_id: data[0].id.toString() }));
        }
      } catch (error) {
        console.error("Failed to load roles", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleOnboard = async () => {
    try {
      // This sends the full resume details + role to the backend
      const response = await api.post("/admin/onboard-employee", {
        ...formData,
        role_id: parseInt(formData.role_id),
      });

      setGeneratedKey(response.data.key);
      // Clear form except key
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        role_id: roles[0]?.id.toString() || "",
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to onboard employee.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
            First Name
          </label>
          <input
            type="text"
            className="w-full p-2 text-sm border rounded bg-white"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
            Last Name
          </label>
          <input
            type="text"
            className="w-full p-2 text-sm border rounded bg-white"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
          Email (For Record)
        </label>
        <input
          type="email"
          className="w-full p-2 text-sm border rounded bg-white"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
          Assign Departmental Role
        </label>
        <select
          value={formData.role_id}
          onChange={(e) =>
            setFormData({ ...formData, role_id: e.target.value })
          }
          className="w-full p-2 text-sm border rounded bg-white text-slate-800"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleOnboard}
        disabled={isLoading || !formData.first_name || !formData.email}
        className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
      >
        Create Record & Generate Key
      </button>

      {generatedKey && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in zoom-in-95">
          <p className="text-[10px] font-black text-green-600 uppercase mb-2">
            Registration Key Created
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-mono font-black text-slate-800 tracking-widest">
              {generatedKey}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(generatedKey)}
              className="text-xs bg-white px-2 py-1 border rounded shadow-sm hover:bg-slate-50"
            >
              Copy
            </button>
          </div>
          <p className="text-[10px] text-green-700 mt-2">
            Provide this key to the hire for their account setup.
          </p>
        </div>
      )}
    </div>
  );
};

export default KeyGenerator;
