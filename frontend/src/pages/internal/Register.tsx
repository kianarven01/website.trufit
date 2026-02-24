import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

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
    <main
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden select-none p-4"
      style={{ backgroundImage: `url(${placeholder})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Left side with logo */}
        <section className="md:w-1/2 flex flex-col justify-center items-center bg-blue-50 p-8 md:p-12">
          <img src={trufit_logo} alt="Trufit Logo" className="w-64 mb-6" />
          <p className="text-center text-slate-700 text-lg">
            Create a new account to access the SQS Portal.
          </p>
        </section>

        {/* Register form */}
        <section className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Employee Registration
              </CardTitle>
              <CardDescription>
                Fill in your details to create a new account
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 p-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 border border-red-100">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password">Set Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
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
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-black transition-colors mt-4"
                >
                  {loading ? "CREATING ACCOUNT..." : "Create Account"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-1 pt-6 border-t-2 border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/webapp/login"
                  className="text-red-600 font-bold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Register;