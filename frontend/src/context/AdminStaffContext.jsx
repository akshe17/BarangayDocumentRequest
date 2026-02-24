import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../axious/api";

const AdminStaffContext = createContext();

export const AdminUserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchUsers = useCallback(
    async (force = false) => {
      // If already loaded and not forcing a refresh, skip
      if (initialized && !force) return;

      try {
        setLoading(true);
        const response = await api.get("/admin/users");
        const mappedUsers = response.data.map((user) => ({
          id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role.role_name
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" "),
          zone: user.zone ? user.zone.zone_name : null,
        }));
        setUsers(mappedUsers);
        setInitialized(true);
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [initialized],
  );

  // Optimized local state updates so we don't have to re-fetch the whole list
  const addUserToState = (newUser) => setUsers((prev) => [newUser, ...prev]);
  const updateUserInState = (updatedUser) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
  const removeUserFromState = (id) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <AdminStaffContext.Provider
      value={{
        users,
        loading,
        fetchUsers,
        addUserToState,
        updateUserInState,
        removeUserFromState,
      }}
    >
      {children}
    </AdminStaffContext.Provider>
  );
};

export const useAdminUsers = () => useContext(AdminStaffContext);
