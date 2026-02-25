import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import KeyGenerator from "../../components/admin/KeyGenerator";
import RoleManager from "@/components/admin/RoleManager";

const Dashboard: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  const isSales = role?.toLowerCase() === "sales";
  const isPurchasing = role?.toLowerCase() === "purchasing";
  const isAdmin = role?.toLowerCase() === "admin";

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

          {/*Settings*/}
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

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isSales && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-blue-500">
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                    Monthly Sales Target
                  </h3>
                  <p className="text-4xl font-black text-slate-800">
                    ₱1,250,000
                  </p>
                  <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              )}

              {isPurchasing && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-500">
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                    Inventory Alerts
                  </h3>
                  <p className="text-4xl font-black text-slate-800">
                    14 Items Low
                  </p>
                  <p className="text-green-600 text-sm mt-2 font-semibold">
                    Requires reorder soon
                  </p>
                </div>
              )}

              <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-red-500">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                  Active Job Orders
                </h3>
                <p className="text-4xl font-black text-slate-800">
                  24 Vehicles
                </p>
                <p className="text-slate-500 text-sm mt-2 italic">
                  In-queue for service
                </p>
              </div>
            </div>

            <div className="mt-12 bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
              <h2 className="text-xl font-bold mb-6 text-slate-800">
                Recent Service Activity
              </h2>
              <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                Vehicle Service Queue Table Component
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">
                    Create Access Key
                  </h3>
                  <span className="bg-slate-100 p-2 rounded-full">🔑</span>
                </div>
                <KeyGenerator />
              </div>
            </section>
          )}

        {/* TAB 3: PREFERENCES / SETTINGS (Admin Only) */}
        {activeTab === "settings" && isAdmin && (
          <section className="animate-in fade-in duration-500">
            <header className="mb-10">
              <h1 className="text-4xl font-extrabold text-slate-800">
                System Preferences
              </h1>
              <p className="text-slate-500 mt-2 text-lg">
                Manage organizational settings and roles.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add New Role Tile (Matches your Preferences design) */}
              <div
                onClick={() => setShowRoleModal(true)}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer flex items-center space-x-4"
              >
                <div className="bg-red-50 p-3 rounded-lg text-red-600 text-xl">
                  👤+
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Add New Department Role
                  </h3>
                  <p className="text-sm text-slate-500">
                    Create new roles and define specific module permissions.
                  </p>
                </div>
              </div>

              {/* Placeholder for other setting tiles (Currency, Branding, etc.) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 opacity-50 flex items-center space-x-4 grayscale">
                <div className="bg-slate-50 p-3 rounded-lg text-slate-400 text-xl">
                  🏦
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Company Details</h3>
                  <p className="text-sm text-slate-500">
                    Manage business info and localized settings.
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL OVERLAY FOR ROLE CREATION */}
            {showRoleModal && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">
                      Configure New Role
                    </h2>
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="text-slate-400 hover:text-slate-600 text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="p-8 max-h-[80vh] overflow-y-auto">
                    <RoleManager />
                    {/*onComplete={() => setShowRoleModal(false)} */}
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
