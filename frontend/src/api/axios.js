import axios from "axios";

// In local dev, VITE_API_URL is unset, so this falls back to "/api",
// which Vite's dev server proxies to localhost:8081 (see vite.config.js).
// In production, set VITE_API_URL to your deployed backend's full URL,
// e.g. https://my-resources-backend.up.railway.app/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mr_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("mr_token");
      localStorage.removeItem("mr_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
