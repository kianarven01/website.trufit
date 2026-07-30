import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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

// RESPONSE INTERCEPTOR: Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname.includes("/login");
    const requestUrl = error.config?.url || "";

    // Skip redirect for auth verify - let AuthContext handle it
    const isAuthVerify = requestUrl.includes("/auth/verify");

    // Handle 401 - session expired (only for non-login, non-verify routes)
    if (error.response?.status === 401 && !isLoginPage && !isAuthVerify) {
      console.warn("Unauthorized! Clearing session...");

      localStorage.removeItem("trufit_token");
      localStorage.removeItem("trufit_user");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.replace("/webapp/login?session=expired");
      }
    }

    // Handle 403 - forbidden (don't clear session, just reject)
    if (error.response?.status === 403) {
      console.warn("Forbidden: Insufficient permissions for", requestUrl);
      // Don't clear session or redirect - just let the component handle the error
    }

    return Promise.reject(error);
  },
);

export default api;
