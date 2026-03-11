import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import { Loader2, Send, Trash2 } from "lucide-react";

interface OnboardingEmployee {
  id: number;
  employee_name: string;
  email: string;
  key_code: string;
  is_used: boolean;
  expires_at: string;
}

const OnboardingTable: React.FC = () => {
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const fetchEmployees = async (status: string = "all") => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/registration-keys?status=${status}`);
      if (res.data && res.data.status === "success") {
        setEmployees(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load registration keys");
    } finally {
      setLoading(false);
    }
  };

  const handleResendKey = async (id: number) => {
    setWorkingId(id);
    try {
      const res = await api.post(`/admin/registration-keys/${id}/regenerate`);
      if (res.data.status === "success") {
        const updatedKey = res.data.key;
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === id
              ? {
                  ...emp,
                  key_code: updatedKey,
                }
              : emp,
          ),
        );
        toast.success("New registration key sent to employee email.");
      }
    } catch (err) {
      toast.error("Failed to resend key");
    } finally {
      setWorkingId(null);
    }
  };

  const handleCancelRegistration = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this onboarding? This will delete the registration key.")) {
      return;
    }
    
    setWorkingId(id);
    try {
      const res = await api.delete(`/admin/registration-keys/${id}`);
      if (res.data.status === "success") {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        toast.success("Onboarding registration cancelled.");
      }
    } catch (err) {
      toast.error("Failed to cancel registration");
    } finally {
      setWorkingId(null);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400">
        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
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
            employees.map((emp) => {
              const isExpired = new Date(emp.expires_at) < new Date();
              let status = "pending";
              if (emp.is_used) {
                status = "registered";
              } else if (isExpired) {
                status = "expired";
              }

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
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleResendKey(emp.id)}
                          disabled={workingId === emp.id}
                          title="Resend Key Email"
                          className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-all"
                        >
                          {workingId === emp.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          Resend
                        </button>
                        <button
                          onClick={() => handleCancelRegistration(emp.id)}
                          disabled={workingId === emp.id}
                          title="Cancel Registration"
                          className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                          Cancel
                        </button>
                      </div>
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