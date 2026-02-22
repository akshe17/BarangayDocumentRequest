import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import api from "../axious/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);

  // --- CROSS-TAB LOGOUT LOGIC ---
  useEffect(() => {
    const syncLogout = (event) => {
      // If the 'token' is removed from another tab, logout this tab too
      if (event.key === "token" && !event.newValue) {
        console.log("Logout detected in another tab. Refreshing...");
        // Force redirect to login or home to clear all memory state
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await api.get("/user");
        const userData =
          response.data.data || response.data.user || response.data;

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.access_token;
      const userData = response.data.user ?? response.data;

      localStorage.setItem("token", token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        if (
          data.status === "rejected" ||
          data.status === "pending_verification"
        ) {
          if (data.access_token) {
            localStorage.setItem("token", data.access_token);
          }
        }
        return {
          success: false,
          ...data,
          error: data.message || "Login failed",
        };
      }
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      // 1. Clear local data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 2. Clear state
      setUser(null);
      setIsAuthenticated(false);

      // 3. HARD REFRESH: This ensures all React state is wiped
      // and the user is redirected to the entry point.
      window.location.href = "/login";
    }
  };

  const isAdmin = () => user?.role_id && Number(user.role_id) === 1;
  const isResident = () => user?.role_id && Number(user.role_id) === 2;

  const value = {
    user,
    isAuthenticated,
    loading,
    setUser,
    login,
    logout,
    isAdmin,
    isResident,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
