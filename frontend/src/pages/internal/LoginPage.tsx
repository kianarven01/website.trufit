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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Branding Section */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black italic text-trufitRed tracking-tighter mb-2">
            TRUFIT
          </h1>
          <p className="text-slate-400 uppercase tracking-widest text-sm font-semibold">
            Service Quality System
          </p>
        </div>

        {/* Professional Login Card */}
        <Card className="border-slate-800 bg-white shadow-2xl rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-slate-900">
              Employee Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the SQS portal
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="j.doe"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-slate-200 focus:ring-trufitRed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-200 focus:ring-trufitRed"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-trufitRed hover:bg-red-700 text-white font-bold h-11 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Authenticating..." : "Sign In to System"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-slate-100 mt-4 pt-6">
            <p className="text-slate-400 text-[10px] uppercase tracking-tighter text-center">
              Authorized Personnel Only
            </p>
            <p className="text-slate-400 text-[10px] uppercase tracking-tighter text-center">
              Unauthorized access is strictly monitored
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
