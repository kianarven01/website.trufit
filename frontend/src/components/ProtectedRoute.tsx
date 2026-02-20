import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  console.log("Is the user logged in?", isAuthenticated); // DEBUG: Check your console!

  if (!isAuthenticated) {
    // Kick them out!
    return <Navigate to="/webapp/login" replace />;
  }

  // Let them in
  return <Outlet />;
};

export default ProtectedRoute;
