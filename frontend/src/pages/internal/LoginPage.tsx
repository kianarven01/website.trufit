import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth(); // We'll use the login function from our context
  const navigate = useNavigate();

  // States for the form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    // If the bouncer recognizes you, he sends you straight to the party
    if (!loading && user) {
      navigate("/webapp/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calling our custom context function that queries your tables
    const result = await login(username, password);

    if (result.success) {
      navigate("/webapp/dashboard");
    } else {
      alert("Unauthorized: Check your Username or Password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black italic text-red-600 tracking-tighter mb-2">
            TRUFIT
          </h1>
          <p className="text-slate-400 uppercase tracking-widest text-sm">
            Service Quality System
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Employee Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-black"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 active:scale-95"
              }`}
            >
              {isSubmitting ? "Authenticating..." : "Sign In to System"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs italic">
              Authorized Personnel Only. Unauthorized access is monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
