import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import KeyGenerator from "../../components/admin/KeyGenerator";
import RoleManager from "@/components/admin/RoleManager";

const Dashboard: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

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
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </div>

          {/* Hiring Tab - Only visible to ADMIN */}
          {isAdmin && (
            <>
              <p className="opacity-40 text-[10px] uppercase font-bold tracking-[0.2em] pt-4 mb-2">
                Administration
              </p>
              <div
                onClick={() => setActiveTab("hiring")}
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all ${
                  activeTab === "hiring"
                    ? "bg-red-600 text-white font-bold shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>👤</span>
                <span>Employee Hiring</span>
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
        {/* TAB 1: DASHBOARD VIEW */}
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

        {/* TAB 2: EMPLOYEE HIRING VIEW (ADMIN ONLY) */}
        {activeTab === "hiring" && isAdmin && (
          <section animate-in="slide-up">
            <header className="mb-10">
              <h1 className="text-4xl font-extrabold text-slate-800">
                Employee Hiring
              </h1>
              <p className="text-slate-500 mt-2 text-lg">
                Manage department roles and generate secure onboarding keys.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Key Generator Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-slate-900">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">
                    Onboarding Key Generator
                  </h3>
                  <span className="bg-slate-100 p-2 rounded-full">🔑</span>
                </div>
                <KeyGenerator />
              </div>

              {/* Role Manager Component */}
              <RoleManager />
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
