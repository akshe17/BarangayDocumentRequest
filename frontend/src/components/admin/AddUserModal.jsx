import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Check,
  MapPin,
  Loader2,
} from "lucide-react";
// 1. Import the custom hook from context
import { useZones } from "../../context/ZoneContext";

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  // 2. Consume the context data
  const { zones, loadingZones } = useZones();

  // 1. Updated state to handle first name and last name separately
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role_name: "Clerk",
    zone_id: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const roles = ["Admin", "Clerk", "Zone Leader", "Barangay Captain"];

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      // Reset form on open with updated state structure
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        role: "Clerk",
        zone_id: "",
        password: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Clear zone if role changes to not "Zone Leader"
  useEffect(() => {
    if (formData.role !== "Zone Leader") {
      setFormData((prev) => ({ ...prev, zone_id: "" }));
    }
  }, [formData.role]);

  // Password Utility Functions
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
  };

  // --- Inside AddUserModal.jsx ---

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Format data specifically for the PHP Backend
    const backendData = {
      first_name: formData.first_name, // Based on updated modal state
      last_name: formData.last_name, // Based on updated modal state
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      role_name: formData.role, // PHP expects 'role_name'
      zone_id: formData.zone_id,
    };

    onSubmit(backendData);
  };

  if (!isOpen) return null;

  // Utility to create consistent styling for labels
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex items-end sm:items-center justify-center min-h-screen px-4 py-4 sm:p-0">
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="relative inline-block align-bottom bg-white rounded-t-3xl sm:rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out w-full sm:max-w-lg sm:w-full max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            <div className="bg-white p-6 sm:p-8">
              <div className="flex justify-center mb-3 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    Add New User
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Fill in the details below to create a new account.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 2. Updated Name Fields: First and Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label htmlFor="role" className={labelClass}>
                    Role
                  </label>
                  <div className="relative">
                    <Shield
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      required
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional Zone Selection */}
                {formData.role === "Zone Leader" && (
                  <div className="animate-fade-in">
                    <label htmlFor="zone" className={labelClass}>
                      Assign Zone
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <select
                        id="zone"
                        value={formData.zone_id}
                        onChange={(e) =>
                          setFormData({ ...formData, zone_id: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer disabled:bg-gray-100"
                        required
                        disabled={loadingZones}
                      >
                        <option value="" disabled>
                          {loadingZones ? "Loading zones..." : "Select Zone"}
                        </option>
                        {zones.map((zone) => (
                          <option key={zone.zone_id} value={zone.zone_id}>
                            {zone.zone_name}
                          </option>
                        ))}
                      </select>
                      {loadingZones && (
                        <Loader2
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                          size={18}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">
                        Strength:
                      </span>
                      <span
                        className={`font-bold ${getPasswordStrengthColor() === "bg-red-500" ? "text-red-600" : getPasswordStrengthColor() === "bg-amber-500" ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-3 text-sm rounded-xl text-white font-semibold transition-all shadow-md bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
