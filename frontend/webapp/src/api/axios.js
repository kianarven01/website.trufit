import axios from "axios";

let baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Ensure baseURL always ends with /api
if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
}

const api = axios.create({
  baseURL,
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
    const isLoginPage = window.location.pathname === "/webapp/login";

    if (error.response?.status === 401 && !isLoginPage) {
      console.warn("Unauthorized! Clearing session...");

      // Use the standardized trufit_ keys
      localStorage.removeItem("trufit_token");
      localStorage.removeItem("trufit_user");

      // Use replace so the user can't "Go Back" to the broken dashboard
      window.location.replace("/webapp/login?session=expired");
    }
    return Promise.reject(error);
  },
);

export default api;
