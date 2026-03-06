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
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
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

          setUser({
            ...serverUser,
            role: serverUser.role || "Admin", // Use fallback or server data
          });
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
  }, []); // Keep this empty array

  /*useEffect(() => {
    const savedUser = localStorage.getItem("trufit_user");
    const token = localStorage.getItem("trufit_token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);*/

  const login = async (inputUsername: string, inputPass: string) => {
    try {
      const response = await api.post("auth/login", {
        username: inputUsername,
        password: inputPass,
      });

      const apiResponse = response.data.data;

      const userData = {
        username: apiResponse.user.username,
        employeeID: apiResponse.user.employeeID,
        name: apiResponse.user.name || apiResponse.user.username,
        role: apiResponse.role,
      };

      setUser(userData);
      localStorage.setItem("trufit_user", JSON.stringify(userData));
      localStorage.setItem("trufit_token", apiResponse.token);

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
    console.log("User logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        login,
        logout,
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
