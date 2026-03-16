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
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const { login, user, loading, finalizeLogin } = useAuth();
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
  const [regKeyError, setRegKeyError] = useState("");

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Identity Challenge State
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeCode, setChallengeCode] = useState("");
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeEmail, setChallengeEmail] = useState("");
  const [challengePassed, setChallengePassed] = useState(false);
  const [authPayload, setAuthPayload] = useState<any>(null);

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
      // We manually call API here because our login flow now has multiple outcomes
      const response = await api.post("auth/login", {
        username,
        password,
        remember
      });

      if (response.data.status === "success") {
        // Use the auth context logic to save session
        finalizeLogin(response.data.data);
        navigate("/webapp/dashboard");
      } else if (response.data.status === "requires_verification") {
        setChallengeEmail(response.data.email);
        setShowChallengeModal(true);
        toast.warning("Identity verification required due to multiple failed attempts.");
      } else if (response.data.status === "account_locked") {
        toast.error(response.data.message, { duration: 10000 });
      } else if (response.data.status === "contact_admin") {
        toast.error(response.data.message, { duration: 10000 });
      } else if (response.data.status === "error") {
        setLoginError(response.data.message || "Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setLoginError(err.response.data.message || "Invalid credentials. Please try again.");
      } else if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setChallengeLoading(true);
    try {
      const response = await api.post("auth/login/verify-challenge", {
        username,
        code: challengeCode,
        remember
      });

      if (response.data.status === "success") {
        setChallengePassed(true);
        setAuthPayload(response.data.auth_payload);
        if (response.data.can_reset) {
          setResetCode(response.data.recovery_code);
          setForgotEmail(challengeEmail || "");
        }
        toast.success("Identity Verified!");
      } else {
        toast.error(response.data.message || "Verification failed.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid verification code.");
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(true);

    try {
      const response = await api.post("/verify-registration-key", {
        key_code: regKey,
      });

      const employeeData = response.data.data.data || response.data.data;

      if (response.data.status === "success" || response.status === 200) {
        navigate("/webapp/register", {
          state: {
            validKey: regKey,
            employeeName: employeeData.employee_name,
            position: employeeData.position,
          },
        });
      }
    } catch (err: any) {
      setRegKeyError("Key not found or already used.");
    } finally {
      setLoadingState(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email: forgotEmail });
      if (response.data.status === "success") {
        toast.success(response.data.message);
        setShowForgotModal(false);
        setShowResetModal(true);
      } else if (response.data.status === "unverified") {
        toast.error(response.data.message, { duration: 6000 });
      } else {
        toast.error(response.data.message || "Something went wrong.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error requesting password reset.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        email: forgotEmail,
        code: resetCode,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      if (response.data.status === "success") {
        toast.success(response.data.message);
        setShowResetModal(false);
        setForgotEmail("");
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error resetting password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden select-none p-4"
      style={{ backgroundImage: `url(${temporary_bg})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div
        className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row bg-white/10 border-[2px] border-white/30 backdrop-blur-md shadow-[inset_0_0_8px_1px_rgba(255,255,255,0.2)] rounded-2xl overflow-hidden"
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
                    onClick={() => setShowForgotModal(true)}
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

      {/* Identity Challenge Modal (Google-like verification) */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="relative w-[420px] p-8 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-600/20 blur-3xl rounded-full"></div>
            <CardHeader className="relative text-center space-y-2 pb-6">
              <div className="flex justify-center mb-2">
                <ShieldAlert className="h-12 w-12 text-amber-400 animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold text-white tracking-wide">
                {challengePassed ? "Identity Verified" : "Identity Verification"}
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                {challengePassed 
                  ? "Your account is unblocked. Since there were multiple failures, we recommend updating your password."
                  : `We've noticed unusual activity on your account. Please enter the code sent to ${challengeEmail} to continue.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {!challengePassed ? (
                <form onSubmit={handleVerifyChallenge} className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="challengeCode" className="text-gray-200 font-semibold">Verification Code</Label>
                    <Input 
                      id="challengeCode" 
                      placeholder="000000" 
                      value={challengeCode} 
                      onChange={(e) => setChallengeCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      required 
                      className="bg-white/10 border-white/30 text-white text-center tracking-widest font-bold h-12 text-xl" 
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Button type="submit" disabled={challengeLoading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold h-11 transition-all">
                      {challengeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Identity"}
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-white/30 text-white hover:text-white hover:bg-white/10 bg-transparent" onClick={() => {
                      setShowChallengeModal(false);
                      setChallengePassed(false);
                      setAuthPayload(null);
                    }}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
                    onClick={() => {
                      if (authPayload) {
                        finalizeLogin(authPayload);
                        navigate("/webapp/dashboard");
                      }
                      setShowChallengeModal(false);
                      setChallengePassed(false);
                    }}
                  >
                    Enter Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-white/30 text-white hover:text-white hover:bg-white/10 bg-transparent"
                    onClick={() => {
                      setShowChallengeModal(false);
                      setChallengePassed(false);
                      setShowResetModal(true);
                    }}
                  >
                    Reset Password Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Registration Verification Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="relative w-[420px] p-8 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-red-500/30 blur-3xl rounded-full"></div>
            <CardHeader className="relative text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-white tracking-wide">Verify Registration</CardTitle>
              <CardDescription className="text-gray-300 text-sm">Enter your employee registration key to create an account.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleVerifyKey} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="registrationCode" className="text-gray-200 font-semibold">Registration Key</Label>
                  <Input id="registrationCode" type="text" placeholder="TRUFIT-XXXXXX" value={regKey} onChange={(e) => setRegKey(e.target.value.toUpperCase())} required className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400" />
                </div>
                {regKeyError && <p className="text-red-400 text-sm font-medium">{regKeyError}</p>}
                <div className="flex flex-col gap-3 pt-2">
                  <Button type="submit" disabled={loadingState} className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold h-11 transition-all">{loadingState ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Key"}</Button>
                  <Button type="button" variant="outline" className="w-full border-white/30 text-white hover:text-white hover:bg-white/10 bg-transparent" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="relative w-[420px] p-8 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-red-500/30 blur-3xl rounded-full"></div>
            <CardHeader className="relative text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-white tracking-wide">Forgot Password</CardTitle>
              <CardDescription className="text-gray-300 text-sm">Enter your email address to receive a 6-digit reset code.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail" className="text-gray-200 font-semibold">Email Address</Label>
                  <Input id="forgotEmail" type="email" placeholder="email@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400" />
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button type="submit" disabled={forgotLoading} className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold h-11 transition-all">{forgotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Code"}</Button>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      if (!forgotEmail) {
                        toast.error("Please enter your email first.");
                        return;
                      }
                      setShowForgotModal(false);
                      setShowResetModal(true);
                    }}
                    className="text-xs text-blue-300 hover:text-white underline"
                  >
                    Already have a reset code?
                  </button>

                  <Button type="button" variant="outline" className="w-full border-white/30 text-white hover:text-white hover:bg-white/10 bg-transparent" onClick={() => setShowForgotModal(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="relative w-[420px] p-8 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-red-500/30 blur-3xl rounded-full"></div>
            <CardHeader className="relative text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-white tracking-wide">Reset Password</CardTitle>
              <CardDescription className="text-gray-300 text-sm">Enter the code sent to {forgotEmail} and your new password.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="resetCode" className="text-gray-200 font-semibold">Verification Code</Label>
                  <Input id="resetCode" placeholder="000000" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required className="bg-white/10 border-white/30 text-white text-center tracking-widest font-bold h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-gray-200 font-semibold">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="bg-white/10 border-white/30 text-white h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-gray-200 font-semibold">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-white/10 border-white/30 text-white h-11" />
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <Button type="submit" disabled={resetLoading} className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold h-11 transition-all">{resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}</Button>
                  <Button type="button" variant="outline" className="w-full border-white/30 text-white hover:text-white hover:bg-white/10 bg-transparent" onClick={() => setShowResetModal(false)}>Cancel</Button>
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