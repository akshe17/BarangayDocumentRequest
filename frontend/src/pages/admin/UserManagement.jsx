import React, { useState, useCallback } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  Edit2,
  Trash2,
  KeyRound,
  AlertTriangle,
  X,
  RefreshCw,
} from "lucide-react";

import AddUserModal from "../../components/admin/AddUserModal";
import EditUserModal from "../../components/admin/EditUserModal";
import DeleteUserModal from "../../components/admin/DeleteUserModal";
import ChangePasswordModal from "../../components/admin/ChangePasswordModal";
import Toast from "../../components/toast";
import Skeleton from "../../components/Skeleton";
import {
  UserManagementProvider,
  useUserManagement,
} from "../../context/UserManagementContext";
/* ─────────────────────────────────────────────────────────────
   ROLE BADGE COLOURS
   ───────────────────────────────────────────────────────────── */
const roleColors = {
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  Clerk: "bg-blue-100 text-blue-700 border-blue-200",
  "Zone Leader": "bg-amber-100 text-amber-700 border-amber-200",
  "Barangay Captain": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ROLES = ["All", "Admin", "Clerk", "Zone Leader"];

/* ─────────────────────────────────────────────────────────────
   SKELETON — matches the 4-column table layout
   ───────────────────────────────────────────────────────────── */
const UserTableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
    {/* thead placeholder */}
    <div className="flex gap-4 px-5 py-3.5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
      {["w-32", "w-48", "w-24", "w-16 ml-auto"].map((w, i) => (
        <Skeleton.Block key={i} className={`h-3 ${w}`} />
      ))}
    </div>
    {/* tbody rows */}
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0"
      >
        {/* avatar + name */}
        <div className="flex items-center gap-3 flex-1">
          <Skeleton.Circle size="w-10 h-10" />
          <div className="space-y-1.5">
            <Skeleton.Block className="w-32 h-3" />
            <Skeleton.Block className="w-20 h-2.5" />
          </div>
        </div>
        {/* email */}
        <Skeleton.Block className="hidden sm:block w-44 h-3" />
        {/* role badge */}
        <Skeleton.Block className="w-24 h-6 rounded-full" />
        {/* action buttons */}
        <div className="flex gap-1.5 ml-auto">
          <Skeleton.Block className="w-8 h-8 rounded-lg" />
          <Skeleton.Block className="w-8 h-8 rounded-lg" />
          <Skeleton.Block className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   INNER COMPONENT — consumes context
   ───────────────────────────────────────────────────────────── */
const UserManagementInner = () => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    refresh,
    addUser,
    editUser,
    deleteUser,
    changePassword,
  } = useUserManagement();

  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 4000);
  }, []);

  /* ── CRUD handlers — delegate to context, show toast ─── */
  const handleAddUser = async (formData) => {
    try {
      await addUser(formData);
      showToast("User added successfully!");
      setAddModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add user.", "error");
    }
  };

  const handleEditUser = async (formData) => {
    try {
      await editUser(currentUser.id, formData);
      showToast("User updated successfully!");
      setEditModalOpen(false);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update user.",
        "error",
      );
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(currentUser.id);
      showToast("User deleted successfully!");
      setDeleteModalOpen(false);
    } catch (err) {
      console.log(err);
      showToast("Failed to delete user.", "error");
    }
  };

  const handleChangePassword = async (formData) => {
    try {
      await changePassword(currentUser.id, formData);
      showToast("Password updated successfully!");
      setPasswordModalOpen(false);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update password.",
        "error",
      );
    }
  };

  /* ── Filtering ─────────────────────────────────────────── */
  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const matchesRole = filter === "All" || user.role === filter;
    const fullName =
      `${user.first_name ?? ""} ${user.last_name ?? ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      (user.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh — always visible so admin can manually re-sync */}
          <button
            onClick={refresh}
            disabled={loading}
            title="Refresh users"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-40"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
          >
            <UserPlus
              size={18}
              className="group-hover:rotate-12 transition-transform"
            />
            Add User
          </button>
        </div>
      </div>

      {/* ── Search + role filters ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative w-full md:w-80 group">
          <Search
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 gap-1 overflow-x-auto">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                filter === role
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────── */}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <AlertTriangle size={16} className="flex-shrink-0" />
          {error}
          <button
            onClick={refresh}
            className="ml-auto text-xs underline hover:no-underline font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table / Skeleton ───────────────────────────────── */}
      {loading ? (
        <UserTableSkeleton />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
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
                          {user.first_name?.charAt(0) ?? "?"}
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
                      <span
                        className={`inline-flex items-center gap-1 sm:gap-2 ${
                          roleColors[user.role] ?? "bg-gray-100 text-gray-700"
                        } px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border w-fit`}
                      >
                        <ShieldCheck size={12} className="hidden sm:inline" />
                        <span className="truncate">{user.role}</span>
                        {user.role === "Zone Leader" && user.zone && (
                          <span className="text-xs text-amber-700 pl-1 whitespace-nowrap">
                            <span className="text-yellow-600"> / </span>
                            {user.zone}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="p-3 sm:p-5">
                      <div className="flex gap-1 sm:gap-1.5 justify-end">
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setEditModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all hover:scale-110"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setPasswordModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all hover:scale-110"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all hover:scale-110"
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

          {/* Empty state */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-16 sm:py-20 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-gray-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : "Try adjusting your filters or add a new user."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddUser}
      />
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditUser}
        user={currentUser}
      />
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        user={currentUser}
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
        user={currentUser}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DEFAULT EXPORT — wraps itself in the provider so you can
   drop <UserManagement /> anywhere without a separate wrapper
   ───────────────────────────────────────────────────────────── */
const UserManagement = () => (
  <UserManagementProvider>
    <UserManagementInner />
  </UserManagementProvider>
);

export default UserManagement;
