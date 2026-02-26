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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Employee
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Position & Phone
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Role
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Join Date
            </th>
            <th className="p-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-10 text-center text-slate-400 italic"
              >
                No employees found.
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-4">
                  {/* Displays the single 'name' column from your updated schema */}
                  <div className="font-bold text-slate-800">
                    {emp.name || "Unnamed Employee"}
                  </div>
                  <div className="text-[10px] text-slate-400 lowercase font-medium">
                    {emp.email}
                  </div>
                </td>
                <td className="p-4">
                  {/* Matches the 'position' and 'phone' columns in Main.Employees */}
                  <div className="text-xs font-bold text-slate-700">
                    {emp.position}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {emp.phone || "No phone listed"}
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                    {emp.role_name}
                  </span>
                </td>
                <td className="p-4">
                  {/* Displays the join_date column with standard formatting */}
                  <div className="text-xs text-slate-500 font-medium">
                    {emp.join_date
                      ? new Date(emp.join_date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Pending"}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="text-slate-300 hover:text-red-600 transition-colors text-sm font-bold">
                    View Details →
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
