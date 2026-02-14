import React, { useState, useEffect } from "react";
import { X, User, Mail, Shield, MapPin, Loader2 } from "lucide-react";
// 1. Import the custom hook from context
import { useZones } from "../../context/ZoneContext";

const EditUserModal = ({ isOpen, onClose, onSubmit, user }) => {
  // 2. Consume the context data
  const { zones, loadingZones } = useZones();

  // Available roles - using strings to match AddUserModal and backend
  const roles = ["Admin", "Clerk", "Zone Leader", "Barangay Captain"];

  // Updated state to handle role_name (string) to match AddUserModal
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role_name: "Clerk", // Default - using role_name string
    zone_id: "",
  });

  // Handle ESC key and scroll lock
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

  // 2. Update form data with current values when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      // Find the zone_id based on the zone_name string passed in the user object
      const matchedZone = zones.find(
        (z) => z.zone_name === user.zone, // user.zone is the string "Zone Name"
      );

      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        // Set role_name directly as string (e.g., "Clerk", "Zone Leader", etc.)
        role_name: user.role || "Clerk",
        // Set zone_id
        zone_id: matchedZone ? matchedZone.zone_id : "",
      });
    }
  }, [isOpen, user, zones]); // Added zones to dependencies

  // Clear zone if role changes to not "Zone Leader"
  useEffect(() => {
    if (formData.role_name !== "Zone Leader") {
      setFormData((prev) => ({ ...prev, zone_id: "" }));
    }
  }, [formData.role_name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Utility to create consistent styling for labels
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex items-end sm:items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="relative inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full rounded-t-3xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh]"
          role="dialog"
          aria-modal="true"
        >
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            <div className="bg-white p-5 sm:p-8">
              {/* Mobile drag handle */}
              <div className="flex justify-center mb-3 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight pr-2">
                  Edit User Details
                </h3>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 -mt-1"
                  aria-label="Close modal"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                    <span className="font-semibold">
                      Update information for{" "}
                    </span>
                    <span className="font-bold">
                      {user?.first_name} {user?.last_name}
                    </span>
                  </p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        id="firstName"
                        type="text"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Role Field - Updated to use role_name strings */}
                <div>
                  <label htmlFor="role" className={labelClass}>
                    Role
                  </label>
                  <div className="relative">
                    <Shield
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      id="role"
                      value={formData.role_name}
                      onChange={(e) =>
                        setFormData({ ...formData, role_name: e.target.value })
                      }
                      className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      required
                    >
                      {/* Dynamically generate options from roles array */}
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
                </div>

                {/* Conditional Zone Selection */}
                {formData.role_name === "Zone Leader" && (
                  <div className="animate-fade-in">
                    <label htmlFor="zone" className={labelClass}>
                      Assign Zone
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <select
                        id="zone"
                        value={formData.zone_id}
                        onChange={(e) =>
                          setFormData({ ...formData, zone_id: e.target.value })
                        }
                        className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:bg-gray-100"
                        required={formData.role_name === "Zone Leader"}
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
                  </div>
                )}

                {/* Action Buttons */}
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
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-md bg-emerald-500 hover:shadow-lg"
                  >
                    Save Changes
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

export default EditUserModal;
