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

      // Successful login (status 200)
      const token = response.data.access_token;
      const userData = response.data.user ?? response.data;

      localStorage.setItem("token", token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      // 1. Check if the server responded (403, 401, etc.)
      if (error.response) {
        const data = error.response.data;

        // --- CRITICAL FIX: SAVE TOKEN FOR REJECTED/PENDING USERS ---
        if (
          data.status === "rejected" ||
          data.status === "pending_verification"
        ) {
          if (data.access_token) {
            localStorage.setItem("token", data.access_token);
          }
        }
        // -----------------------------------------------------------

        return {
          success: false,
          ...data,
          error: data.message || "Login failed",
        };
      }

      // 2. Network error or other unexpected issues
      return {
        success: false,
        error: "Network error or server unreachable",
      };
    }
  };
  const logout = async () => {
    try {
      // This will now find the route correctly
      await api.post("/logout");
    } catch (error) {
      // Changed 'err' to 'error' to match the catch variable
      console.error("Server logout failed:", error);
    } finally {
      // ALWAYS clear these, even if the server is offline
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      console.log("Logged out locally.");
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
