import React, { useState } from "react";
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
import AddUserModal from "../../components/admin/AddUserModal";
import EditUserModal from "../../components/admin/EditUserModal";
import DeleteUserModal from "../../components/admin/DeleteUserModal";
import ChangePasswordModal from "../../components/admin/ChangePasswordModal";

const initialUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@brgy.gov",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Clerk User",
    email: "clerk@brgy.gov",
    role: "Clerk",
    status: "Active",
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Separate modal states for each action
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const roles = [
    "All",
    "Admin",
    "Clerk",
    "Zone Leader",
    "Captain",
    "Residents",
  ];

  const roleColors = {
    Admin: "bg-purple-100 text-purple-700 border-purple-200",
    Clerk: "bg-blue-100 text-blue-700 border-blue-200",
    "Zone Leader": "bg-amber-100 text-amber-700 border-amber-200",
    Captain: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  // Modal handlers
  const handleAddUser = (formData) => {
    console.log("Adding user:", formData);
    // API call here
    setIsAddModalOpen(false);
  };

  const handleEditUser = (formData) => {
    console.log("Editing user:", currentUser.id, formData);
    // API call here
    setIsEditModalOpen(false);
  };

  const handleDeleteUser = () => {
    console.log("Deleting user:", currentUser.id);
    // API call here
    setIsDeleteModalOpen(false);
  };

  const handleChangePassword = (formData) => {
    console.log("Changing password for user:", currentUser.id);
    // API call here
    setIsPasswordModalOpen(false);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesRole = filter === "All" || user.role === filter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* HEADER */}
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

      {/* SEARCH AND FILTER */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between">
          {/* Search Input */}
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

          {/* Role Filter Pills */}
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

      {/* TABLE */}
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
                  Role
                </th>
                <th className="p-3 sm:p-5 font-bold uppercase text-xs tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="p-3 sm:p-5 font-bold uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-3 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md group-hover:scale-110 transition-transform">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 block truncate">
                          {user.name}
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
                      className={`inline-flex items-center gap-1 sm:gap-2 ${roleColors[user.role] || "bg-gray-100 text-gray-700"} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border`}
                    >
                      <ShieldCheck size={12} className="hidden sm:inline" />
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 sm:p-5 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.status === "Active"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`}
                      ></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 sm:p-5">
                    <div className="flex gap-1 sm:gap-1.5 justify-end">
                      <button
                        onClick={() => {
                          setCurrentUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 sm:p-2.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-200 hover:scale-110"
                        title="Edit user"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentUser(user);
                          setIsPasswordModalOpen(true);
                        }}
                        className="p-1.5 sm:p-2.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                        title="Change password"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 sm:p-2.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110"
                        title="Delete user"
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

        {/* Empty State */}
        {filteredUsers.length === 0 && (
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
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        )}
      </div>

      {/* MODALS - 4 Separate Components */}
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
