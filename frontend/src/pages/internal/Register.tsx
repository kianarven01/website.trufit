import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/api/axios";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 State
  const [regKey, setRegKey] = useState("");
  const [assignedRole, setAssignedRole] = useState({ id: null, name: "" });

  // Step 2 State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    employeeID: "", // We can link this to their record later
  });

  // Action: Verify the Registration Key
  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/verify-registration-key", {
        key_code: regKey,
      });
      setAssignedRole({
        id: response.data.role_id,
        name: response.data.role_name,
      });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid registration key.");
    } finally {
      setLoading(false);
    }
  };

  // Action: Create the Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await api.post("/register", {
        ...formData,
        role_id: assignedRole.id,
        key_code: regKey,
      });
      alert("Registration successful! You can now log in.");
      navigate("/webapp/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-black italic text-red-600 tracking-tighter mb-2">
            TRUFIT SQS
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            {step === 1
              ? "Verify your employee access key"
              : `Joining as ${assignedRole.name}`}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-6 border border-red-100">
              ⚠️ {error}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: KEY VERIFICATION */
            <form onSubmit={handleVerifyKey} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Registration Key
                </label>
                <input
                  type="text"
                  placeholder="TRUFIT-XXXXXX"
                  className="w-full p-4 bg-slate-100 border-none rounded-xl font-mono text-lg focus:ring-2 focus:ring-red-600 outline-none transition-all"
                  value={regKey}
                  onChange={(e) => setRegKey(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "VERIFYING..." : "CONTINUE"}
              </button>
            </form>
          ) : (
            /* STEP 2: ACCOUNT DETAILS */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-black transition-colors mt-4"
              >
                {loading ? "CREATING ACCOUNT..." : "FINISH REGISTRATION"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-slate-400 text-xs font-bold hover:text-slate-600"
              >
                Back to Key Entry
              </button>
            </form>
          )}
        </div>
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/webapp/login"
              className="text-red-600 font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
