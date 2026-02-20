import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inside AuthContext.tsx -> login function
  // Inside AuthContext.tsx

  const login = async (inputUsername: string, inputPass: string) => {
    const { data, error } = await supabase
      .from("UserCredentials")
      .select(
        `
      username,
      password,
      role_id:role ( role_name ),
      employee:employeeID ( name )
    `,
      )
      .eq("username", inputUsername)
      .eq("password", inputPass)
      .single();

    if (error || !data) {
      console.error("Login Error:", error);
      return { success: false };
    }

    // Cast the data or use type assertion to tell TS it's a single object
    const authData = data as any;

    setUser({
      // Using brackets or ensuring we access the object properties
      name: authData.employee?.name,
      role: authData.role_id?.role_name,
    });

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, role, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
