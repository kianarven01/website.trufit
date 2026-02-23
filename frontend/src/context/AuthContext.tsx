import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
  user: any;
  role: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<{ success: boolean }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("trufit_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (inputUsername: string, inputPass: string) => {
    const { data } = await supabase
      .from("UserCredentials")
      .select(
        `
        username,
        employee:"employeeID" ( name, role:"roleID" ( name ) )
      `,
      )
      .eq("username", inputUsername)
      .single();

    if (data) {
      const authData = data as any;
      const userData = {
        name: authData.employee?.name || "Unknown User",
        role: authData.employee?.role?.name || "Staff",
      };

      setUser(userData);
      localStorage.setItem("trufit_user", JSON.stringify(userData));
      console.log("User logged in successfully:", userData);
      return { success: true };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("trufit_user");
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
