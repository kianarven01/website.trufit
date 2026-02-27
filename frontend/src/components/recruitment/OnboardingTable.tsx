import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { toast } from "sonner";

interface OnboardingEmployee {
  id: number;
  name: string;
  email: string;
  position: string;
  role_name: string;
  registration_key: string;
  account_status: "pending" | "expired";
}

const OnboardingTable: React.FC = () => {
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<number | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/registration-keys");
      if (res.data && res.data.status === "success") {
        setEmployees(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load keys");
    } finally {
      setLoading(false);
    }
  };

  const regenerateKey = async (employeeId: number) => {
    setRegenerating(employeeId);
    try {
      const res = await api.post(
        `/admin/onboarding-employees/${employeeId}/regenerate`,
      );
      const updatedKey = res.data.key;

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId
            ? {
                ...emp,
                registration_key: updatedKey,
                account_status: "pending",
              }
            : emp,
        ),
      );
      toast.success("Registration key regenerated");
    } catch (err) {
      console.error("Error regenerating key:", err);
      toast.error("Failed to regenerate key");
    } finally {
      setRegenerating(null);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400">
        Loading onboarding employees...
      </div>
    );

  return (
    <div className="overflow-x-auto mt-8">
      <h1 className="text-md font-bold mb-4 uppercase tracking-tight text-slate-800">
        Onboarding Employees
      </h1>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Employee
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Key Code
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Account Status
            </th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Expires At
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
                No registration records found.
              </td>
            </tr>
          ) : (
            employees.map((emp: any) => {
              const isExpired = new Date(emp.expires_at) < new Date();
              let status = "pending";
              if (emp.is_used) status = "registered";
              else if (isExpired) status = "expired";

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-800 uppercase tracking-tight">
                      {emp.employee_name || "Unknown"}
                    </div>
                    <div className="text-[10px] text-slate-400 lowercase font-medium">
                      {emp.email}
                    </div>
                  </td>

                  <td className="p-4">
                    <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {emp.key_code}
                    </code>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        status === "registered"
                          ? "bg-blue-100 text-blue-700"
                          : status === "pending"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  <td className="p-4 text-[10px] text-slate-500 font-medium">
                    {new Date(emp.expires_at).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-right">
                    {!emp.is_used ? (
                      <button
                        onClick={() => regenerateKey(emp.id)}
                        disabled={regenerating === emp.id}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {regenerating === emp.id ? "Working..." : "Regenerate"}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 italic">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OnboardingTable;
