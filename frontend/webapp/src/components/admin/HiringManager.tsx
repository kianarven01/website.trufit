import React from "react";
import KeyGenerator from "../../components/admin/KeyGenerator";
import RoleManager from "../../components/admin/RoleManager";

const HiringManager: React.FC = () => {
  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800">
          Employee Hiring
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage department roles and generate onboarding keys.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-slate-900">
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
            Staff Onboarding
          </h3>
          <KeyGenerator />
        </div>
      </div>
    </div>
  );
};

export default HiringManager;
