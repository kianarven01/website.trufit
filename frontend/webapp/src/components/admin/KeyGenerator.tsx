import React, { useState, useEffect } from "react";
import api from "@/api/axios";

interface Role {
  id: number;
  name: string;
}

interface KeyGeneratorProps {
  onComplete?: () => void;
}

const KeyGenerator: React.FC<KeyGeneratorProps> = ({ onComplete }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedKey, setGeneratedKey] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "", // Match SQL
    email: "",
    address: "", //added attribute
    position: "", // Match SQL
    roleID: "", // Match SQL roleID bigint
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/admin/roles");
        const data = response.data.data;
        setRoles(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, roleID: data[0].id.toString() }));
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
    setIsLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        position: formData.position, // Required by SQL
        phone: formData.phone, // Required by SQL
        role_id: parseInt(formData.roleID), // Matches controller validation key
      };

      const response = await api.post("/admin/onboard-employee", payload);

      if (response.data.key) {
        setGeneratedKey(response.data.key);
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          address: "",
          position: "",
          roleID: roles[0]?.id.toString() || ""  
        });
        if (onComplete) onComplete();
      }
    } catch (error: any) {
      console.error("Error generating key:", error.response?.data);
      alert(error.response?.data?.message || "Check database configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            First Name
          </label>
          <input
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            Last Name
          </label>
          <input
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
          Phone Number
        </label>
        <input
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
          Job Position
        </label>
        <input
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          placeholder="Service Technician"
          value={formData.position}
          onChange={(e) =>
            setFormData({ ...formData, position: e.target.value })
          }
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
          Email
        </label>
        <input
          type="email"
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
          System Role
        </label>
        <select
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none"
          value={formData.roleID}
          onChange={(e) => setFormData({ ...formData, roleID: e.target.value })}
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleOnboard}
        disabled={isLoading || !formData.email || !formData.position}
        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-red-600 transition-all shadow-lg active:scale-[0.98]"
      >
        Generate Registration Key
      </button>

      {generatedKey && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in zoom-in-95">
          <p className="text-[10px] font-black text-green-600 uppercase mb-2">
            Key Created
          </p>
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-green-100">
            <code className="text-lg font-mono font-black text-slate-800 tracking-tighter">
              {generatedKey}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(generatedKey)}
              className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-md font-bold hover:bg-green-600 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyGenerator;
