import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import KeyGenerator from "../../components/admin/KeyGenerator";
import RoleManager from "@/components/admin/RoleManager";
import api from "@/api/axios";

const Dashboard: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [expandedSetting, setExpandedSetting] = useState<string | null>(
    "roles",
  ); // Default to 'roles' open

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  const isSales = role?.toLowerCase() === "sales";
  const isPurchasing = role?.toLowerCase() === "purchasing";
  const isAdmin = role?.toLowerCase() === "admin";
  const [roles, setRoles] = useState<any[]>([]);
  const [editingRole, setEditingRole] = React.useState<any>(null);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/admin/roles");
      if (res.data && res.data.status === "success") {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setRoles([]);
    }
  };

  useEffect(() => {
    if (activeTab === "settings") fetchRoles();
  }, [activeTab]);

  const handleDeleteRole = async (id: any) => {
    if (
      window.confirm(
        "Are you sure? This will affect employees assigned to this role.",
      )
    ) {
      try {
        await api.delete(`/admin/roles/${id}`);
        fetchRoles();
      } catch (err) {
        alert("Cannot delete role while employees are assigned to it.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/webapp/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl sticky top-0 h-screen">
        <h2 className="text-2xl font-black mb-10 italic text-red-600 tracking-tighter">
          TRUFIT SQS
        </h2>

        <nav className="flex-1 space-y-4">
          <p className="opacity-40 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
            Main Menu
          </p>

          {/* Dashboard Tab */}
          <div
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all ${
              activeTab === "dashboard"
                ? "bg-red-600 text-white font-bold shadow-lg"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </div>

          {/* Recruitment Tab - Visible to Admin and HR */}
          {(isAdmin || role?.toLowerCase() === "hr") && (
            <div
              onClick={() => setActiveTab("recruitment")}
              className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all ${
                activeTab === "recruitment"
                  ? "bg-red-600 text-white font-bold shadow-lg"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span>📋</span>
              <span>Recruitment</span>
            </div>
          )}

          {/* Settings Tab - Admin Only */}
          {isAdmin && (
            <>
              <p className="opacity-40 text-[10px] uppercase font-bold tracking-[0.2em] pt-4 mb-2">
                Administration
              </p>
              <div
                onClick={() => setActiveTab("settings")}
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all ${
                  activeTab === "settings"
                    ? "bg-slate-800 text-white font-bold shadow-lg border-l-4 border-red-600"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>⚙️</span>
                <span>Preferences</span>
              </div>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="pt-6 border-t border-slate-700">
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-500 uppercase font-bold">{role}</p>
            <p className="text-sm font-medium truncate">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-slate-800 text-red-400 border border-red-900/30 rounded font-bold hover:bg-red-600 hover:text-white transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        {/* TAB 1: DASHBOARD VIEW (Everyone) */}
        {activeTab === "dashboard" && (
          <section animate-in="fade">
            {/* ... Your existing Dashboard Header and Analytics Grid ... */}
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-800">
                  System Dashboard
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  Welcome back, {user?.name}
                </p>
              </div>
              <div className="text-right text-sm text-slate-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* ... Sales/Purchasing cards ... */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-red-500">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                  Active Job Orders
                </h3>
                <p className="text-4xl font-black text-slate-800">
                  24 Vehicles
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: RECRUITMENT VIEW (Admin & HR Manager) */}
        {activeTab === "recruitment" &&
          (isAdmin || role?.toLowerCase() === "hr") && (
            <section animate-in="slide-up">
              <header className="mb-10">
                <h1 className="text-4xl font-extrabold text-slate-800">
                  Recruitment Portal
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  Generate onboarding keys for new staff members.
                </p>
              </header>

              <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border-t-8 border-red-600">
                <KeyGenerator />
              </div>
            </section>
          )}

        {/* TAB 3: PREFERENCES / SETTINGS (Admin Only) */}
        {activeTab === "settings" && isAdmin && (
          <section className="animate-in fade-in duration-500 max-w-5xl">
            <header className="mb-10">
              <h1 className="text-4xl font-extrabold text-slate-800">
                System Preferences
              </h1>
              <p className="text-slate-500 mt-2 text-lg">
                Configure the core engine of your organization.
              </p>
            </header>

            <div className="space-y-4">
              {/* SECTION: ROLE MANAGEMENT */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedSetting(
                      expandedSetting === "roles" ? null : "roles",
                    )
                  }
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 text-red-600 p-3 rounded-xl text-xl">
                      🛡️
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800">
                        Role & Access Control
                      </h3>
                      <p className="text-sm text-slate-500">
                        Manage department permissions and CRUD rights.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-slate-400 transition-transform duration-300 ${expandedSetting === "roles" ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {expandedSetting === "roles" && (
                  <div className="p-6 pt-0 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-6 pt-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Active Roles
                      </h4>
                      <button
                        onClick={() => {
                          setEditingRole(null);
                          setShowRoleModal(true);
                        }}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-all flex items-center space-x-2"
                      >
                        <span>+</span> <span>Create New Role</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roles.map((r: any) => (
                        <div
                          key={r.id}
                          className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-red-200 transition-colors"
                        >
                          <div>
                            <h5 className="font-bold text-slate-700">
                              {r.name}
                            </h5>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              ID: {r.id}
                            </p>
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingRole(r);
                                setShowRoleModal(true);
                              }}
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteRole(r.id)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: COMPANY BRANDING (Placeholder for design consistency) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden opacity-60">
                <button className="w-full flex items-center justify-between p-6 cursor-not-allowed">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl text-xl">
                      🏢
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800">
                        Company Identity
                      </h3>
                      <p className="text-sm text-slate-500">
                        Update logo, contact info, and tax settings.
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-300">▼</span>
                </button>
              </div>

              {/* SECTION: AUDIT LOGS (Placeholder) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden opacity-60">
                <button className="w-full flex items-center justify-between p-6 cursor-not-allowed">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 text-green-600 p-3 rounded-xl text-xl">
                      📜
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800">System Logs</h3>
                      <p className="text-sm text-slate-500">
                        Track every change made to the system records.
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-300">▼</span>
                </button>
              </div>
            </div>

            {/* SHARED MODAL FOR CREATE/EDIT */}
            {showRoleModal && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">
                      {editingRole
                        ? `Edit Role: ${editingRole.name}`
                        : "Configure New Role"}
                    </h2>
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="text-slate-400 hover:text-slate-600 text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-8 max-h-[80vh] overflow-y-auto">
                    <RoleManager
                      initialData={editingRole}
                      onComplete={() => {
                        setShowRoleModal(false);
                        fetchRoles(); // Refresh the list after save
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
