import { createContext, useContext, useEffect, useState, useRef } from "react";
import api from "@/api/axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface AuthContextType {
  user: any;
  role: string | null;
  loading: boolean;
  login: (
    u: string,
    p: string,
    remember: boolean,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: any) => void;
  finalizeLogin: (authPayload: any) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      const token = localStorage.getItem("trufit_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/verify");

        if (
          response.data.status === "success" ||
          response.data.status === "authenticated"
        ) {
          const serverUser = response.data.data.user;

          const userData = {
            ...serverUser,
            role: serverUser.role || "Admin",
          };
          setUser(userData);
          localStorage.setItem("trufit_user", JSON.stringify(userData));
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          logout();
          window.location.replace("/login?reason=session_expired");
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (
    inputUsername: string,
    inputPass: string,
    rememberMe: boolean = false,
  ) => {
    try {
      const response = await api.post("auth/login", {
        username: inputUsername,
        password: inputPass,
        remember: rememberMe,
      });

      const apiResponse = response.data.data;
      finalizeLogin(apiResponse);

      return { success: true };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "Wrong username or password",
        };
      }

      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || "Login failed",
        };
      }

      return { success: false, message: "Server unreachable." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("trufit_user");
    localStorage.removeItem("trufit_token");
    //console.log("User logged out successfully");
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem("trufit_user", JSON.stringify(userData));
  };

  const finalizeLogin = (authPayload: any) => {
    const userData = {
      ...authPayload.user,
      role: authPayload.role,
    };

    setUser(userData);
    localStorage.setItem("trufit_user", JSON.stringify(userData));
    localStorage.setItem("trufit_token", authPayload.token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        login,
        logout,
        updateUser,
        finalizeLogin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
