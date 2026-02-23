import React, { useState } from "react";
import api from "@/api/axios"; // Using your specific alias

const KeyGenerator: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState("2");
  const [generatedKey, setGeneratedKey] = useState("");

  const handleGenerate = async () => {
    try {
      const response = await api.post("/admin/generate-key", {
        // Use parseInt to ensure we send a number, not a string
        role_id: parseInt(selectedRole),
      });
      setGeneratedKey(response.data.data.key);
    } catch (error) {
      console.error("Key generation failed", error);
    }
  };

  return (
    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
        Assign Department
      </label>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="w-full p-2 mb-4 border rounded bg-white text-slate-800"
      >
        <option value="1">Admin</option>
        <option value="2">Technician</option>
        <option value="3">Sales</option>
        <option value="4">Purchasing</option>
      </select>

      <button
        onClick={handleGenerate}
        className="w-full bg-red-600 text-white font-bold py-2 rounded shadow-lg hover:bg-red-700 transition-all"
      >
        Generate Registration Key
      </button>

      {generatedKey && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded animate-pulse">
          <p className="text-[10px] text-green-600 font-bold uppercase">
            Copy this key:
          </p>
          <p className="text-xl font-mono font-black text-green-800 tracking-wider">
            {generatedKey}
          </p>
        </div>
      )}
    </div>
  );
};

export default KeyGenerator;
