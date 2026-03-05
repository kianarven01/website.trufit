import React, { useEffect, useState } from "react";
import api from "@/api/axios";

const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/admin/employees");
      if (res.data && res.data.status === "success") {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400">
        Loading Directory...
      </div>
    );

  return (
    <div className="space-y-2">

      {/* Column Header */}
      <div className="hidden md:grid grid-cols-6 gap-6 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <div>Employee</div>
        <div>Contact & Address</div>
        <div>Position</div>
        <div>Role</div>
        <div>Join Date</div>
        <div className="text-right">Action</div>
      </div>

      {/* Rows */}
      {employees.length === 0 ? (
        <div className="p-10 text-center text-slate-400 italic border rounded-xl">
          No employees found.
        </div>
      ) : (
        employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">

              <div>
                <div className="font-bold text-slate-800">
                  {emp.name || "Unnamed Employee"}
                </div>
                <div className="text-[10px] text-slate-400 lowercase font-medium">
                  {emp.email}
                </div>
              </div>
          
              <div>
                <div className="text-xs text-slate-400">
                  {emp.address || "No address listed"}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700">
                  {emp.position}
                </div>
              </div>

              <div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  {emp.role_name}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-medium">
                  {emp.join_date
                    ? new Date(emp.join_date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Pending"}
                </div>
              </div>

              <div className="text-right">
                <button className="text-slate-400 hover:text-red-600 transition-colors text-sm font-bold">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeTable;