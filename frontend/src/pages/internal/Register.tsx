import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "@/api/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import placeholder from "@/assets/placeholder.jpeg";
import trufit_logo from "@/assets/trufit_logo.png";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { validKey, employeeName, position } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!validKey) {
      navigate("/webapp/login");
    }
  }, [validKey, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/register", {
        username: formData.username,
        password: formData.password,
        key_code: validKey, // FIXED: Use validKey instead of verifiedKey
      });

      alert(`Account created! Welcome to the team, ${employeeName}.`);
      navigate("/webapp/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!validKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black italic text-slate-400 uppercase tracking-widest">
        Redirecting to Login...
      </div>
    );
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 font-sans">
      {/* Visual Side */}
      <section className="hidden lg:block relative overflow-hidden">
        <img
          src={placeholder}
          alt="Trufit"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col justify-end p-12 text-white">
          <img
            src={trufit_logo}
            alt="Logo"
            className="w-32 mb-6 brightness-0 invert"
          />
          <h1 className="text-5xl font-black tracking-tighter mb-4 italic uppercase">
            Create Your <span className="text-red-600">Identity.</span>
          </h1>
          <p className="max-w-md text-slate-300 font-medium uppercase text-xs tracking-[0.2em]">
            Staff Credential Setup
          </p>
        </div>
      </section>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <section className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex justify-between items-center mb-6">
                <CardTitle className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
                  Register
                </CardTitle>
                <span className="text-[10px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-full uppercase tracking-widest border border-green-100">
                  Key Validated
                </span>
              </div>

              {/* Identity Display Box */}
              <div className="p-5 bg-slate-900 rounded-[1.5rem] border border-slate-800 shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                  Employee Record Found
                </p>
                <h3 className="text-xl font-black text-white uppercase italic leading-tight">
                  {employeeName || "User Record"}
                </h3>
                <p className="text-xs text-red-500 font-bold uppercase tracking-wider mt-1">
                  {position || "Authorized Staff"}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    <p className="text-xs text-red-600 font-bold italic uppercase tracking-tight">
                      {error}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                    Desired Username
                  </Label>
                  <Input
                    placeholder="Enter username"
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-bold text-slate-800"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                    Secure Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-bold text-slate-800"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all font-bold text-slate-800"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-black py-8 rounded-[1.5rem] hover:bg-red-600 transition-all shadow-xl active:scale-[0.98] mt-4 italic text-lg uppercase tracking-tight"
                >
                  {loading ? "Creating Profile..." : "Complete Registration →"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="py-6 border-t border-slate-50 text-center bg-slate-50/30 flex flex-col items-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-3 italic">
                Security Token: {validKey}
              </p>
              <Link
                to="/webapp/login"
                className="text-slate-400 text-[10px] font-black hover:text-red-600 uppercase transition-colors tracking-widest"
              >
                Return to Login
              </Link>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Register;
