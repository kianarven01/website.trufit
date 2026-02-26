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

import placeholder from "@/assets/placeholder.jpeg";
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
      const result = await login(username, password);
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

  // VERIFY REGISTRATION KEY
  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegKeyError("");
    setLoadingState(true);

    try {
      const response = await api.post("/verify-registration-key", {
        key_code: regKey,
      });
      setAssignedRole({
        id: response.data.role_id,
        name: response.data.role_name,
      });
      navigate("/webapp/register", {
        state: { role: response.data.role_name, key: regKey },
      });
    } catch (err: any) {
      setRegKeyError(
        err.response?.data?.message || "Invalid registration key.",
      );
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <main
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden select-none p-4"
      style={{ backgroundImage: `url(${placeholder})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* LEFT: Logo */}
        <section className="md:w-1/2 flex flex-col justify-center items-center bg-blue-50 p-8 md:p-12">
          <img src={trufit_logo} alt="Trufit Logo" className="w-64 mb-6" />
          <p className="text-center text-slate-700 text-lg">
            Welcome to Trufit Auto Center SQS Portal. Please login to continue.
          </p>
        </section>

        {/* RIGHT: Login Form */}
        <section className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Employee Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the SQS Portal
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 p-4">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {/* Username */}
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-slate-200 focus:ring-trufitBlue focus:border-trufitBlue"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-blue-900" />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="text-blue-900 hover:text-trufitBlue underline hover:text-popover-foreground font-semibold"
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
                    className="text-sm text-blue-900 bg-transparent hover:text-blue-950 hover:bg-slate-50 rounded-md w-full h-11 font-semibold mb-2"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    Register a New Account
                  </Button>
              </form>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex flex-col gap-1 pt-6 border-t-2 border-slate-100">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 text-center">
                Authorized Personnel Only
              </p>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 text-center">
                Unauthorized access is strictly monitored
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>

      {/* Registration Verification Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-96 p-6 bg-white">
            <CardHeader className="text-center">
              <CardTitle>Register New Account</CardTitle>
              <CardDescription>
                Enter your registration key to proceed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyKey} className="flex flex-col gap-4">
                <Label htmlFor="registrationCode">Registration Key</Label>
                <Input
                  id="registrationCode"
                  type="text"
                  placeholder="TRUFIT-XXXXXX"
                  value={regKey}
                  onChange={(e) => setRegKey(e.target.value.toUpperCase())}
                  required
                />

                {/* Registration Key Error */}
                {regKeyError && (
                  <p className="text-red-500 text-sm">{regKeyError}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full mt-4 bg-trufitBlue text-white hover:bg-blue-950"
                  disabled={loadingState}
                >
                  {loadingState ? "VERIFYING..." : "Verify"}
                </Button>
                <Button
                  type="button"
                  className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancel
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
};

export default LoginPage;
