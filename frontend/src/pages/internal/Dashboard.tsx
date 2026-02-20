import React from "react";
import { useAuth } from "../../context/AuthContext";

const Dashboard: React.FC = () => {
  // role should now be a string (e.g., 'Sales') fetched from your Roles table join
  const { user, role, logout } = useAuth();

  // Helper to check roles (matching your DB role_name values)
  const isSales = role?.toLowerCase() === "sales";
  const isPurchasing = role?.toLowerCase() === "purchasing";
  const isAdmin = role?.toLowerCase() === "admin";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl">
        <h2 className="text-2xl font-black mb-10 italic text-red-600 tracking-tighter">
          TRUFIT SQS
        </h2>

        <nav className="flex-1 space-y-4">
          <p className="opacity-40 text-[10px] uppercase font-bold tracking-[0.2em]">
            Main Menu
          </p>

          <div className="flex items-center space-x-3 text-red-400 font-semibold cursor-pointer p-2 rounded-lg bg-slate-800">
            <span>🏠</span>
            <span>Dashboard</span>
          </div>

          {/* Settings only visible to ADMIN */}
          {isAdmin && (
            <div className="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer p-2 transition-colors">
              <span>⚙️</span>
              <span>Settings</span>
            </div>
          )}
        </nav>

        {/* User Info & Logout at bottom */}
        <div className="pt-6 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 text-gray-400 hover:text-red-400 transition-colors p-2 text-sm"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800">
              System Dashboard
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Welcome back,{" "}
              <span className="font-bold text-blue-600">{user?.name}</span>
              <span className="ml-2 px-2 py-1 bg-slate-200 rounded text-xs text-slate-600 font-mono uppercase">
                {role}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </header>

        {/* Dynamic Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* SALES ONLY VIEW */}
          {isSales && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-blue-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">
                  Monthly Sales Target
                </h3>
                <span className="text-blue-500 text-xl">📈</span>
              </div>
              <p className="text-4xl font-black text-slate-800">₱1,250,000</p>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          )}

          {/* PURCHASING/INVENTORY ONLY VIEW */}
          {isPurchasing && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">
                  Inventory Alerts
                </h3>
                <span className="text-green-500 text-xl">📦</span>
              </div>
              <p className="text-4xl font-black text-slate-800">14 Items Low</p>
              <p className="text-green-600 text-sm mt-2 font-semibold">
                Requires reorder soon
              </p>
            </div>
          )}

          {/* GLOBAL VIEW (Everyone sees this) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Active Job Orders
              </h3>
              <span className="text-red-500 text-xl">🚗</span>
            </div>
            <p className="text-4xl font-black text-slate-800">24 Vehicles</p>
            <p className="text-slate-500 text-sm mt-2 italic">
              In-queue for service
            </p>
          </div>
        </div>

        {/* Placeholder for the main SQS Table your devs will build */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
          <h2 className="text-xl font-bold mb-6 text-slate-800">
            Recent Service Activity
          </h2>
          <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
            Vehicle Service Queue Table will be rendered here
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
