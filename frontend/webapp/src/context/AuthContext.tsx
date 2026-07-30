import { createContext, useContext, useEffect, useState, useRef } from "react";
import api from "@/api/axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface AuthContextType {
  user: any;
  role: string | null;
  permissions: string[];
  loading: boolean;
  login: (
    u: string,
    p: string,
    remember: boolean,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: any) => void;
  refreshUser: () => Promise<void>;
  finalizeLogin: (authPayload: any) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  hasAllPermissions: (...permissions: string[]) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hasInitialized = useRef(false);

  const permissions: string[] = user?.permissions ?? [];
  const isRoleAdmin = user?.role?.toLowerCase() === "admin";

  const hasPermission = (permission: string): boolean => {
    if (isRoleAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (...perms: string[]): boolean => {
    if (isRoleAdmin) return true;
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (...perms: string[]): boolean => {
    if (isRoleAdmin) return true;
    return perms.every((p) => permissions.includes(p));
  };

  const hasRole = (...roles: string[]): boolean => {
    if (!user?.role) return false;
    return roles.some((r) => r.toLowerCase() === user.role.toLowerCase());
  };

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
        // Only clear token on 401 - don't force redirect here
        // The ProtectedRoute component will handle the redirect
        if (error.response?.status === 401) {
          localStorage.removeItem("trufit_token");
          localStorage.removeItem("trufit_user");
          setUser(null);
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

  const refreshUser = async () => {
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
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
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
        permissions,
        login,
        logout,
        updateUser,
        refreshUser,
        finalizeLogin,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
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
