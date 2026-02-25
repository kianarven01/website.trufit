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
    email: "",
    position: "",
    roleID: "",
    phone: "",
    join_date: "",
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
    try {
      // Mapping local state to your specific DB columns
      const payload = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        position: formData.position,
        roleID: parseInt(formData.roleID),
        phone: formData.phone,
        join_date: formData.join_date,
        status: true,
      };

      const response = await api.post("/admin/onboard-employee", payload);
      setGeneratedKey(response.data.key);

      // Clear form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        roleID: roles[0]?.id.toString() || "",
        phone: "",
        join_date: "",
      });

      if (onComplete) onComplete(); // Refresh Dashboard lists
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to onboard employee.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
            First Name
          </label>
          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            placeholder="Sarah"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
            Last Name
          </label>
          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            placeholder="Johnson"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
          Company Email
        </label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          placeholder="s.johnson@trufit.com"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
          Phone Number
        </label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
          Join Date
        </label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          placeholder="+1 (555) 123-4567"
          value={formData.join_date}
          onChange={(e) =>
            setFormData({ ...formData, join_date: e.target.value })
          }
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
          Job Title
        </label>
        <input
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          placeholder="Senior Technician"
          value={formData.position}
          onChange={(e) =>
            setFormData({ ...formData, position: e.target.value })
          }
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
          Access Level
        </label>
        <select
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none appearance-none"
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
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
      >
        Create Record & Generate Key
      </button>

      {generatedKey && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in zoom-in-95">
          <p className="text-[10px] font-black text-green-600 uppercase mb-2 text-center tracking-widest">
            Key Generated Successfully
          </p>
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-green-100">
            <code className="text-lg font-mono font-black text-slate-800 tracking-wider">
              {generatedKey}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(generatedKey)}
              className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold"
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
