import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Define the shape of our context so TypeScript knows what functions are available
interface AuthContextType {
  user: any;
  role: string | null;
  loading: boolean;
  login: (
    inputUsername: string,
    inputPass: string,
  ) => Promise<{ success: boolean }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial app load
  useEffect(() => {
    const savedUser = localStorage.getItem("trufit_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (inputUsername: string, inputPass: string) => {
    interface TrufitAuthResponse {
      username: string;
      employee: {
        name: string;
        role: {
          name: string;
        } | null;
      } | null;
    }

    const { data } = await supabase
      .from("UserCredentials")
      .select(
        `
      username,
      employee:"employeeID" ( 
        name, 
        role:"roleID" ( name ) 
      )
    `,
      )
      .eq("username", inputUsername)
      .single();

    if (data) {
      const authData = data as unknown as TrufitAuthResponse;

      const userData = {
        name: authData.employee?.name || "Unknown User",
        role: authData.employee?.role?.name || "Staff",
      };

      setUser(userData);
      localStorage.setItem("trufit_user", JSON.stringify(userData));

      console.log("Login Successful for:", userData.name);
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
