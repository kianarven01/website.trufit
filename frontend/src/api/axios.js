import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// REQUEST INTERCEPTOR: Attach the token to every "outgoing" call
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("trufit_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: Handle the "incoming" 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === "/login";

    if (error.response?.status === 401 && !isLoginPage) {
      console.warn("Unauthorized! Clearing session...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Use replace so the user can't "Go Back" to the broken dashboard
      window.location.replace("/login?reason=expired");
    }
    return Promise.reject(error);
  },
);

export default api;
