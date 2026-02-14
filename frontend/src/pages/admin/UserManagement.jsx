import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  Edit2,
  Trash2,
  KeyRound,
  AlertTriangle,
  X,
} from "lucide-react";
// 1. IMPORT YOUR API CONFIG
import api from "../../axious/api";
import AddUserModal from "../../components/admin/AddUserModal";
import EditUserModal from "../../components/admin/EditUserModal";
import DeleteUserModal from "../../components/admin/DeleteUserModal";
import ChangePasswordModal from "../../components/admin/ChangePasswordModal";
// 2. Import the Toast Component
import Toast from "../../components/toast";

const UserManagement = () => {
  // 3. Start with an empty list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 4. Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const roles = ["All", "Admin", "Clerk", "Zone Leader", "Captain"];

  const roleColors = {
    Admin: "bg-purple-100 text-purple-700 border-purple-200",
    Clerk: "bg-blue-100 text-blue-700 border-blue-200",
    "Zone Leader": "bg-amber-100 text-amber-700 border-amber-200",
    Captain: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  // 5. Toast Utility Function
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    // Automatically hide after 4 seconds
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  }, []);

  // 6. Fetch users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");

      // MAPPED DATA UPDATED FOR NEW SCHEMA AND ZONE INFORMATION
      const mappedUsers = response.data.map((user) => ({
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        // Normalize role name
        role: user.role.role_name
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" "),
        // Extract zone name string for display
        zone: user.zone ? user.zone.zone_name : null,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 7. CRUD handlers
  const handleAddUser = async (formData) => {
    try {
      await api.post("/admin/users", formData);
      showToast("User added successfully!", "success");
      setIsAddModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error adding user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add user.";
      showToast(errorMessage, "error");
    }
  };

  const handleEditUser = async (formData) => {
    try {
      await api.put(`/admin/users/${currentUser.id}`, formData);
      showToast("User updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update user.";
      showToast(errorMessage, "error");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/users/${currentUser.id}`);
      showToast("User deleted successfully!", "success");
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Failed to delete user.", "error");
    }
  };

  const handleChangePassword = async (formData) => {
    try {
      await api.put(`/admin/users/${currentUser.id}/change-password`, formData);
      showToast("Password updated successfully!", "success");
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update password.";
      showToast(errorMessage, "error");
    }
  };

  // --- Filtering & Searching Logic ---
  const filteredUsers = users.filter((user) => {
    if (!user) return false;

    const matchesRole = filter === "All" || user.role === filter;

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const email = user.email || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(searchLower) ||
      email.toLowerCase().includes(searchLower);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* 8. Render Toast Component */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Header UI */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Manage system users, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
        >
          <UserPlus
            size={18}
            className="group-hover:rotate-12 transition-transform"
          />
          Add New User
        </button>
      </div>

      {/* Search & Filter UI */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between">
          <div className="relative w-full md:w-80 group">
            <Search
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 gap-1 overflow-x-auto">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  filter === role
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-20">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-left border-b-2 border-gray-200">
                <tr>
                  <th className="p-3 sm:p-5 font-bold uppercase text-xs tracking-wider">
                    Name
                  </th>
                  <th className="p-3 sm:p-5 font-bold uppercase text-xs tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 sm:p-5 font-bold uppercase text-xs tracking-wider">
                    Role / Zone
                  </th>
                  <th className="p-3 sm:p-5 font-bold uppercase text-xs tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-200 group"
                  >
                    <td className="p-3 sm:p-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md group-hover:scale-110 transition-transform">
                          {user.first_name ? user.first_name.charAt(0) : "?"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-900 block truncate">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs text-gray-500 sm:hidden block truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-5 text-gray-600 font-medium hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="p-3 sm:p-5">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center justify-center text-center gap-1 sm:gap-2 ${roleColors[user.role] || "bg-gray-100 text-gray-700"} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border w-fit`}
                        >
                          <ShieldCheck size={12} className="hidden sm:inline" />

                          {/* Wrap role text */}
                          <span className="truncate">{user.role}</span>

                          {user.role === "Zone Leader" && user.zone && (
                            <span className="text-xs text-amber-700 flex items-center gap-1 pl-1 whitespace-nowrap">
                              <span className="text-xs text-yellow-600">
                                {" "}
                                /{" "}
                              </span>
                              {user.zone}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-5">
                      <div className="flex gap-1 sm:gap-1.5 justify-end">
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-200 hover:scale-110"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setIsPasswordModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- Empty State --- */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle
                size={24}
                className="sm:w-8 sm:h-8 text-gray-400"
              />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? `No results match "${searchQuery}". Try a different search term.`
                : "Try adjusting your filters or add a new user."}
            </p>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditUser}
        user={currentUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        user={currentUser}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
        user={currentUser}
      />
    </div>
  );
};

export default UserManagement;
