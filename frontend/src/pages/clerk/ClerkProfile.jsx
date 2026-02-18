import React, { useState } from "react";
import {
  Mail,
  Lock,
  UserPen,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Save,
} from "lucide-react";
import api from "../../axious/api";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/toast";
export const ClerkProfile = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {activeView === "dashboard" && (
        <ProfileDashboard setActiveView={setActiveView} user={user} />
      )}
      {activeView === "email" && (
        <ChangeEmailPage
          setActiveView={setActiveView}
          user={user}
          showToast={showToast}
        />
      )}
      {activeView === "password" && (
        <ChangePasswordPage
          setActiveView={setActiveView}
          showToast={showToast}
        />
      )}
      {activeView === "name" && (
        <ChangeNamePage
          setActiveView={setActiveView}
          user={user}
          showToast={showToast}
        />
      )}
    </div>
  );
};

// ==========================================
// 1. MAIN PROFILE DASHBOARD
// ==========================================
const ProfileDashboard = ({ setActiveView, user }) => {
  const options = [
    {
      title: "Full Name",
      description: `${user?.first_name || ""} ${user?.last_name || ""}`,
      icon: UserPen,
      view: "name",
    },
    {
      title: "Email Address",
      description: user?.email || "N/A",
      icon: Mail,
      view: "email",
    },
    {
      title: "Password",
      description: "Update security credentials",
      icon: Lock,
      view: "password",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-950">
          Account Settings
        </h1>
        <p className="text-sm text-gray-600">
          Manage your credentials and profile information.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.view}
            onClick={() => setActiveView(option.view)}
            className="w-full cursor-pointer hover:bg-gray-100 text-left bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all flex justify-between items-center"
          >
            <div className="flex gap-4 items-center">
              <div className="text-gray-500">
                <option.icon size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {option.title}
                </h3>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400" size={16} />
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. FORM COMPONENTS
// ==========================================

const FormWrapper = ({ children, title, setActiveView }) => (
  <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-100">
    <button
      onClick={() => setActiveView("dashboard")}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
    >
      <ArrowLeft size={16} /> Back
    </button>
    <h2 className="text-lg font-semibold mb-6 text-gray-950">{title}</h2>
    {children}
  </div>
);

// --- Change Name ---
const ChangeNamePage = ({ setActiveView, user, showToast }) => {
  const { setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/update-name", {
        first_name: firstName,
        last_name: lastName,
      });
      setUser({ ...user, first_name: firstName, last_name: lastName });
      showToast("Name updated successfully!");
      setTimeout(() => setActiveView("dashboard"), 1500);
    } catch (error) {
      showToast("Failed to update name. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper title="Change Full Name" setActiveView={setActiveView}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-600 flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}{" "}
            Save Changes
          </button>
        </div>
      </form>
    </FormWrapper>
  );
};

// --- Change Email ---
const ChangeEmailPage = ({ setActiveView, user, showToast }) => {
  const { setUser } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/update-email", { email });
      setUser({ ...user, email });
      showToast("Email updated successfully!");
      setTimeout(() => setActiveView("dashboard"), 1500);
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      showToast(
        serverMessage || "Failed to update email. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper title="Change Email Address" setActiveView={setActiveView}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="New Email"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-600 flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}{" "}
            Save Changes
          </button>
        </div>
      </form>
    </FormWrapper>
  );
};

// --- Change Password ---
const ChangePasswordPage = ({ setActiveView, showToast }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showToast("Password updated successfully!");
      setTimeout(() => setActiveView("dashboard"), 1500);
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      showToast(
        serverMessage || "Failed to update password. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      name: "currentPassword",
      label: "Current Password",
      placeholder: "Enter current password",
    },
    {
      name: "newPassword",
      label: "New Password",
      placeholder: "Enter new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      placeholder: "Re-enter new password",
    },
  ];

  return (
    <FormWrapper title="Change Password" setActiveView={setActiveView}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ name, label, placeholder }) => (
          <div key={name}>
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
            </label>
            <input
              id={name}
              type="password"
              name={name}
              placeholder={placeholder}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              required
            />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-600 flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}{" "}
            Update Password
          </button>
        </div>
      </form>
    </FormWrapper>
  );
};
