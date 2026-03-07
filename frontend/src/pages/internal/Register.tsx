import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

import placeholder from "@/assets/temporary_bg.jpeg";
import trufit_logo from "@/assets/trufit_logo.png";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { employeeName, position, validKey } = location.state || {
    employeeName: "",
    position: "",
    validKey: "",
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        key_code: validKey,
      });
      alert(`Account created! Welcome to the team, ${employeeName}.`);
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

      <div
        className="
          relative z-10 w-full h-[95%] max-w-6xl flex flex-col md:flex-row
          bg-white/10 border border-white/20
          backdrop-blur-xl
          rounded-2xl shadow-[inset_0_0_8px_1px_rgba(255,255,255,0.2)]
          overflow-hidden
        "
      >
        {/* LEFT: Logo and welcome */}
        <section className="relative md:w-1/2 flex flex-col justify-center items-center p-10 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-blue-950 to-gray-800"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-500/30 blur-3xl rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src={trufit_logo}
              alt="Trufit Logo"
              className="w-72 mb-8 drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            />
            <p className="text-sm text-blue-400 tracking-wide font-medium">
              Welcome,{" "}
              <span className="text-sm font-black uppercase">
                {employeeName}!
              </span>
              <span className="font-semibold">({position})</span>
            </p>
          </div>
        </section>

        {/* RIGHT: Registration Form */}
        <section className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="space-y-2 text-center relative z-10">
              <CardTitle className="text-3xl font-bold text-blue-100 tracking-wide">
                Employee Registration
              </CardTitle>
              <CardDescription className="text-gray-200 font-light tracking-wide">
                Set up your account credentials to access the portal
              </CardDescription>
            </CardHeader>

            {/* Welcome Key Message */}
            <div className="p-4 my-2 bg-green-50/20 border border-green-100/40 rounded-xl text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-200" />
                <p className="text-blue-200 font-normal text-sm">
                  Registration Key Verified:
                </p>
              </div>
              <p className="text-sm text-blue-400 tracking-wide font-medium">
                Welcome,{" "}
                <span className="text-sm font-black uppercase">
                  {employeeName}!
                </span>{" "}
                <span className="font-semibold">({position})</span>
              </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <CardContent className="flex flex-col gap-4 p-4 relative z-10">
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="username"
                    className="text-gray-200 font-semibold"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    className="border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="password"
                    className="text-gray-200 font-semibold"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:ring-blue-400 focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-200 font-semibold"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:ring-blue-400 focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold h-11 mt-4"
                >
                  {loading ? "Creating Account..." : "Complete Registration"}
                </Button>
              </form>
              <Button
                type="button"
                className="text-sm text-white/80 bg-transparent border border-white/30 hover:bg-white/10 rounded-md w-full h-11 mt-0 font-normal"
                onClick={() => navigate("/webapp/login")}
              >
                Already have an account? Login
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-1 pt-6 border-t border-white/20 text-center text-[10px] text-gray-200">
              <p>Authorized Personnel Only</p>
              <p>Unauthorized access is strictly monitored</p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Register;
