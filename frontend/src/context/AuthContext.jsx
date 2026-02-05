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
  const [passkey, setPasskey] = useState(null); // ✅ CORRECT
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ CORRECT
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    const checkAuth = async () => {
      // 1. Check if token exists before even trying to call the API
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, skipping auth check.");
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        console.log("Token found. Checking authentication...");

        const response = await api.get("/user");

        console.log("✅ AUTH SUCCESS:", response.data);

        // Adjust based on your custom middleware/route response structure
        const userData =
          response.data.data || response.data.user || response.data;

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ AUTH FAILED");

        // If the token is invalid/expired, clean up localStorage
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
  }, []); // Empty dependency array - runs once

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.access_token;
      const userData = response.data.user ?? response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData)); // Store user
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };
  const logout = async () => {
    try {
      res = await api.post("/logout");
      localStorage.removeItem("token");
      setUser(null);
    } catch (e) {
      console.log(err);
    }
  };

  const isAdmin = () => {
    return user?.role_id && Number(user.role_id) === 1;
  };

  const isResident = () => {
    return user?.role_id && Number(user.role_id) === 2;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
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
