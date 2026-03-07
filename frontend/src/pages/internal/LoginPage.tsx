import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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

import temporary_bg from "@/assets/temporary_bg.jpeg";
import trufit_logo from "@/assets/trufit_logo.png";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [remember, setRemember] = useState(false);

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regKey, setRegKey] = useState("");
  const [assignedRole, setAssignedRole] = useState({ id: null, name: "" });
  const [regKeyError, setRegKeyError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate("/webapp/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const result = await login(username, password, remember);
      if (result.success) {
        navigate("/webapp/dashboard");
      } else {
        setLoginError("Unauthorized: Check your Username or Password.");
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(true);

    try {
      const response = await api.post("/verify-registration-key", {
        key_code: regKey,
      });

      if (response.data.status === "success") {
        const employee = response.data.data;

        navigate("/webapp/register", {
          state: {
            validKey: regKey,
            employeeName: employee.employee_name,
            position: employee.position,
          },
        });
      }
    } catch (err: any) {
      setRegKeyError("Key not found or already used.");
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <main
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden select-none p-4"
      style={{ backgroundImage: `url(${temporary_bg})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div
        className="  relative z-10 w-full max-w-6xl flex flex-col md:flex-row
      bg-white/10
        border-[2px] border-white/30
        backdrop-blur-md
        shadow-[inset_0_0_8px_1px_rgba(255,255,255,0.2)]
        rounded-2xl
        overflow-hidden
      "
      >
        {/* LEFT: Logo */}
        <section className="relative md:w-1/2 flex flex-col justify-center items-center p-10 text-white overflow-hidden">
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-blue-950 to-gray-800"></div>

          {/* Blue Glow */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full"></div>

          {/* Red Glow */}
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-500/30 blur-3xl rounded-full"></div>

          {/* Subtle Tech Grid */}
          <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src={trufit_logo}
              alt="Trufit Logo"
              className="w-72 mb-8 drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            />

            <p className="text-blue-100 text-lg max-w-sm leading-relaxed">
              Welcome to the{" "}
              <span className="font-semibold text-white">SQS Portal</span>.
              Manage employees, service quality, and operations in one system.
            </p>
          </div>
        </section>

        {/* RIGHT: Login Form */}
        <section className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold text-blue-100 tracking-wide">
                Employee Login
              </CardTitle>
              <CardDescription className="text-gray-200 font-light tracking-wide">
                Enter your credentials to access the SQS Portal
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 p-4">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {/* Username */}
                <div className="space-y-1">
                  <Label
                    htmlFor="username"
                    className="text-slate-100 font-semibold tracking-wide"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <Label
                    htmlFor="password"
                    className="text-slate-100 font-semibold tracking-wide"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                {/* Login Error */}
                {loginError && (
                  <p className="text-red-600 text-sm font-medium">
                    {loginError}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-50">
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)} // 3. Bind the value
                    />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="text-slate-50 hover:text-blue-400 underline hover:text-popover-foreground font-semibold tracking-wide"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold h-11 transition-all mt-4 "
                >
                  {isSubmitting ? "Authenticating..." : "Sign In to System"}
                </Button>

                <Button
                  type="button"
                  className="text-sm text-slate-100 bg-transparent font-normal border border-white/30 hover:bg-white/10 hover:font-semibold rounded-md w-full h-11 mb-2"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Register a New Account
                </Button>
              </form>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex flex-col gap-1 pt-6 border-t-2 border-slate-100">
              <p className="text-[10px] uppercase tracking-wide text-slate-100 text-center">
                Authorized Personnel Only
              </p>
              <p className="text-[10px] uppercase tracking-wide text-slate-100 text-center">
                Unauthorized access is strictly monitored
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>

      {/* Registration Verification Modal */}

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card
            className="
            relative w-[420px] p-8
            bg-white/10
            border border-white/20
            backdrop-blur-xl
            rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            overflow-hidden
          "
          >
            {/* Glow accents */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-red-500/30 blur-3xl rounded-full"></div>

            <CardHeader className="relative text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-white tracking-wide">
                Verify Registration
              </CardTitle>

              <CardDescription className="text-gray-300 text-sm">
                Enter your employee registration key to create an account.
              </CardDescription>
            </CardHeader>

            <CardContent className="relative">
              <form onSubmit={handleVerifyKey} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="registrationCode"
                    className="text-gray-200 font-semibold"
                  >
                    Registration Key
                  </Label>

                  <Input
                    id="registrationCode"
                    type="text"
                    placeholder="TRUFIT-XXXXXX"
                    value={regKey}
                    onChange={(e) => setRegKey(e.target.value.toUpperCase())}
                    required
                    className="
                      bg-white/10
                      border-white/30
                      text-white
                      placeholder:text-gray-400
                      focus:border-blue-400
                      focus:ring-blue-400
                    "
                  />
                </div>

                {/* Error */}
                {regKeyError && (
                  <p className="text-red-400 text-sm font-medium">
                    {regKeyError}
                  </p>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loadingState}
                    className="
                      w-full
                      bg-blue-900
                      hover:bg-blue-950
                      text-white
                      font-semibold
                      h-11
                    "
                  >
                    {loadingState ? "Verifying..." : "Verify Key"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="
                      w-full
                      border-white/30
                      text-white
                      hover:text-white
                      hover:bg-white/10
                      bg-transparent
                    "
                    onClick={() => setShowRegisterModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
};

export default LoginPage;
