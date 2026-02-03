import React, {
  createContext, // <--- 1. Make sure this is imported
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import api from "../axious/api";

// 2. THIS IS THE MISSING PIECE:
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: "",
    role_id: "",
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const userRef = useRef(null);
  // ... inside AuthProvider
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/user");
      userRef.current = response.data;
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("CheckAuth Error:", error);
      // If server is unreachable or CORS fails, we must stop loading
      setIsAuthenticated(false);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false); // ALWAYS stop loading
    }
  }, []);

  // Fix helper functions to handle null user safely
  const isAdmin = () => Number(userRef.current?.role_id) === 1;
  const isResident = () => Number(userRef.current?.role_id) === 2;
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.access_token;
      const userData = response.data.user ?? response.data;

      localStorage.setItem("token", token);
      userRef.current = userData;
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

  const logout = () => {
    localStorage.removeItem("token");
    userRef.current = null;
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
    isAdmin,
    isResident,
  };

  // This refers to the 'const AuthContext' we created at the top
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext); // <--- This must match the variable at the top
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
