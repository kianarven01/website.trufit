import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import trufit_img1 from "@/assets/trufit_img1.jpg";
import trufit_logo from "@/assets/trufit_logo.png";

const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/webapp/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        navigate("/webapp/dashboard");
      } else {
        alert("Unauthorized: Check your Username or Password.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-trufitBlue flex items-center justify-center overflow-hidden select-none">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col lg:flex-row m-6">
        <section className="lg:w-1/2 hidden lg:block relative">
          <img
            src={trufit_img1}
            alt="Trufit Auto Center"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </section>

        <div className="lg:w-1/2 w-full p-10 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex justify-center pt-6">
            <img
              src={trufit_logo}
              alt="Trufit Auto Center Logo"
              className="w-3/4 mb-6"
            />
          </div>

          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Employee Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the SQS Portal
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-slate-200 focus:ring-trufitBlue focus:border-trufitBlue"
                  />
                </div>

                <div className="space-y-2 mb-2">
                  <Label htmlFor="password">Password</Label>
                  <div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-slate-200 focus:ring-trufitBlue focus:border-trufitBlue"
                    />
                    <span></span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mt-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-blue-900" />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="text-blue-900 hover:text-trufitBlue underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 hover:bg-trufitBlue text-white font-semibold h-11 transition-all mt-8"
                >
                  {isSubmitting ? "Authenticating..." : "Sign In to System"}
                </Button>
              </form>

              <div className="flex items-center justify-between mt-2 mb-4">
                <p className="text-[10px] uppercase tracking-wide text-slate-600">
                  Don't have an account?
                </p>
                <a
                  href="/webapp/register"
                  className="text-[14px] text-blue-900 hover:text-trufitBlue font-bold"
                >
                  Register Account
                </a>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-1 pt-6 border-t-2 border-slate-100">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 text-center">
                Authorized Personnel Only
              </p>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 text-center">
                Unauthorized access is strictly monitored
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/*  
      <Card>
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Employee Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the SQS Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyCode}>
            <div className="space-y-2 mb-4">
              <Label htmlFor="code">Registration Code</Label>
              <Input
                id="registrationCode"
                type="text"
                placeholder="Enter your registration code"
                required
                value={RegistrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                className="border-slate-200 focus:ring-trufitBlue focus:border-trufitBlue"
              />
            </div>
        </CardContent>
      </Card>
    */}
    </main>
  );
};

export default LoginPage;
