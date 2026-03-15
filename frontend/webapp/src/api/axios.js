import axios from "axios";

// When we use just `/api`, Axios will send requests to whatever domain the frontend is on
// (e.g., https://app.trufitautocenter.com/api or http://localhost:5173/api)
// Vercel and Vite will then PROXY that request to the real Render backend.
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

// RESPONSE INTERCEPTOR: Handle the "incoming" 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname.includes("/login");

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
