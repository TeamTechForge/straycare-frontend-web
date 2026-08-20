
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// All dashboard requests use the backend URL configured for this environment.
const api = axios.create({
  baseURL: API_URL,
});

// Attach the signed-in admin token to protected API requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Clear invalid sessions when the backend rejects an authenticated request.
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      localStorage.getItem("token")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminId");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
