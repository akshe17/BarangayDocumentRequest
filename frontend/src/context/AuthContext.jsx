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

  // FIX: Start loading as TRUE if a token exists, so we don't flash
  // the login page or a white screen while the API is fetching.
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);

  // --- HELPER FUNCTIONS (DEFINED HERE SO THEY CAN BE EXPORTED) ---
  const isAdmin = () => user?.role_id && Number(user.role_id) === 1;
  const isResident = () => user?.role_id && Number(user.role_id) === 2;
  const isClerk = () => user?.role_id && Number(user.role_id) === 3;
  const isZoneLeader = () => user?.role_id && Number(user.role_id) === 4;
  const isCaptain = () => user?.role_id && Number(user.role_id) === 5;

  // --- CROSS-TAB SYNC LOGIC ---
  useEffect(() => {
    const handleSync = (event) => {
      if (event.key === "token" || event.key === "auth_action_logout") {
        console.log("Auth change detected. Synchronizing tabs...");
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, []);

  // --- INITIAL CHECK ON MOUNT ---
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/user");
        const userData =
          response.data.data || response.data.user || response.data;

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getHomeRoute = (targetUser = user) => {
    if (!targetUser) return "/login";
    const role = Number(targetUser.role_id);
    if (role === 1) return "/dashboard";
    if (role === 2) return "/resident";
    if (role === 3) return "/clerk/dashboard";
    if (role === 4) return "/zone-leader/residents";
    if (role === 5) return "/captain/dashboard";
    return "/login";
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.access_token;
      const userData = response.data.user ?? response.data;

      localStorage.setItem("token", token);

      // We use the direct userData here so we don't have to wait for state updates
      window.location.href = getHomeRoute(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Server logout failed", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.setItem("auth_action_logout", Date.now().toString());
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        isAdmin, // Now correctly defined above
        isResident, // Now correctly defined above
        isClerk, // Now correctly defined above
        isZoneLeader,
        isCaptain,
        getHomeRoute,
      }}
    >
      {!loading ? (
        children
      ) : (
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Verifying Session...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
