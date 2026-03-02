import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api from "../axious/api";
const UserManagementContext = createContext(null);

// ── Store data outside React so it survives unmount/remount ──────────────────
// This is the key fix: a module-level cache means navigating away and back
// never triggers a refetch — the data is already there.
let _cachedUsers = null;
let _fetchPromise = null; // deduplicate concurrent fetches

const mapUser = (user) => ({
  id: user.user_id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role.role_name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" "),
  zone: user.zone ? user.zone.zone_name : null,
});

export const UserManagementProvider = ({ children }) => {
  const [users, setUsers] = useState(_cachedUsers ?? []);
  const [loading, setLoading] = useState(_cachedUsers === null); // only show skeleton on first load
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (force = false) => {
    // Return cached data immediately unless forced
    if (_cachedUsers !== null && !force) {
      setUsers(_cachedUsers);
      setLoading(false);
      return;
    }

    // Deduplicate: if a fetch is already in flight, wait for it
    if (_fetchPromise) {
      await _fetchPromise;
      setUsers(_cachedUsers ?? []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    _fetchPromise = api
      .get("/admin/users")
      .then((res) => {
        _cachedUsers = res.data.map(mapUser);
        setUsers(_cachedUsers);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
      })
      .finally(() => {
        _fetchPromise = null;
        setLoading(false);
      });

    await _fetchPromise;
  }, []);

  // On first mount — only hits network if cache is empty
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── CRUD — mutate cache + state together ──────────────────────────────────

  const addUser = useCallback(
    async (formData) => {
      await api.post("/admin/users", formData);
      // Invalidate cache and refetch so new user's full data (role object etc.) is correct
      _cachedUsers = null;
      await fetchUsers(true);
    },
    [fetchUsers],
  );

  const editUser = useCallback(
    async (userId, formData) => {
      await api.put(`/admin/users/${userId}`, formData);
      _cachedUsers = null;
      await fetchUsers(true);
    },
    [fetchUsers],
  );

  const deleteUser = useCallback(async (userId) => {
    await api.put(`/admin/users/${userId}/archive`);
    // Optimistic: remove locally and update cache immediately
    _cachedUsers = (_cachedUsers ?? []).filter((u) => u.id !== userId);
    setUsers([..._cachedUsers]);
  }, []);

  const changePassword = useCallback(async (userId, formData) => {
    await api.put(`/admin/users/${userId}/change-password`, formData);
    // No state change needed
  }, []);

  // Manual refresh — busts cache
  const refresh = useCallback(() => {
    _cachedUsers = null;
    return fetchUsers(true);
  }, [fetchUsers]);

  return (
    <UserManagementContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        refresh,
        addUser,
        editUser,
        deleteUser,
        changePassword,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = () => {
  const ctx = useContext(UserManagementContext);
  if (!ctx)
    throw new Error(
      "useUserManagement must be used inside <UserManagementProvider>",
    );
  return ctx;
};
