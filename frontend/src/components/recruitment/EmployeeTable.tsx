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
              Department
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Status
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="p-10 text-center text-slate-400 italic"
              >
                No employee records found.
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-4">
                  <div className="font-bold text-slate-800">
                    {emp.first_name} {emp.last_name}
                  </div>
                  <div className="text-xs text-slate-400 lowercase">
                    {emp.email}
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                    {emp.role_name}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center text-[10px] font-black uppercase text-green-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Active
                  </span>
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
