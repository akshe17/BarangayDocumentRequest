import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle responses (optional but useful)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid (401), clear it
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
