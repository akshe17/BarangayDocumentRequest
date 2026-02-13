import React, { useState, useEffect } from "react";
import { X, User, Mail, Shield, Lock, Eye, EyeOff, Check } from "lucide-react";

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Clerk",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const roles = ["Admin", "Clerk", "Zone Leader", "Captain"];

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        role: "Clerk",
        password: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex items-end sm:items-center justify-center min-h-screen">
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="relative inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full rounded-t-3xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            <div className="bg-white p-5 sm:p-8 pb-safe">
              {/* Mobile drag handle */}
              <div className="flex justify-center mb-3 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight pr-2">
                  Add New User
                </h3>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 -mt-1"
                  aria-label="Close modal"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                    <span className="font-semibold">
                      Create a new user account
                    </span>{" "}
                    with full credentials
                  </p>
                </div>

                <div className="relative">
                  <User
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Shield
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    required
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min. 8 characters)"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">
                        Password Strength:
                      </span>
                      <span
                        className={`font-bold ${passwordStrength < 40 ? "text-red-600" : passwordStrength < 70 ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Lock
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {formData.confirmPassword && (
                  <div
                    className={`flex items-center gap-2 text-xs font-semibold ${formData.password === formData.confirmPassword ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check size={16} />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Passwords do not match
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-md bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-lg"
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
