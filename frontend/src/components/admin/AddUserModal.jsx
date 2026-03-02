import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useZones } from "../../context/ZoneContext";

// ── Reusable submit button with loading / success / error states ─────────────
const SubmitButton = ({
  status,
  label,
  loadingLabel = "Saving…",
  color = "emerald",
}) => {
  const base =
    "w-full sm:w-auto px-5 py-3 text-sm rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 min-w-[130px]";
  if (status === "loading") {
    return (
      <button
        type="submit"
        disabled
        className={`${base} bg-${color}-400 text-white cursor-not-allowed opacity-80`}
      >
        <Loader2 size={16} className="animate-spin" /> {loadingLabel}
      </button>
    );
  }
  if (status === "success") {
    return (
      <button
        type="submit"
        disabled
        className={`${base} bg-${color}-500 text-white cursor-not-allowed`}
      >
        <CheckCircle2 size={16} /> Done
      </button>
    );
  }
  if (status === "error") {
    return (
      <button
        type="submit"
        className={`${base} bg-red-500 hover:bg-red-600 text-white`}
      >
        Retry
      </button>
    );
  }
  return (
    <button
      type="submit"
      className={`${base} bg-${color}-600 hover:bg-${color}-700 text-white`}
    >
      {label}
    </button>
  );
};

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const { zones, loadingZones } = useZones();
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | loading | success | error

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "Clerk",
    zone_id: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");

  const roles = ["Admin", "Clerk", "Zone Leader"];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
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
      setSubmitStatus("idle");
      setPasswordError("");
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (formData.role !== "Zone Leader")
      setFormData((p) => ({ ...p, zone_id: "" }));
  }, [formData.role]);

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s += 25;
    if (pw.length >= 12) s += 25;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 25;
    if (/[0-9]/.test(pw)) s += 15;
    if (/[^a-zA-Z0-9]/.test(pw)) s += 10;
    return Math.min(s, 100);
  };

  const strengthColor =
    passwordStrength < 40
      ? "bg-red-500"
      : passwordStrength < 70
        ? "bg-amber-500"
        : "bg-emerald-500";
  const strengthText =
    passwordStrength < 40
      ? "Weak"
      : passwordStrength < 70
        ? "Medium"
        : "Strong";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    setSubmitStatus("loading");
    try {
      await onSubmit({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role_name: formData.role,
        zone_id: formData.zone_id,
      });
      setSubmitStatus("success");
      setTimeout(onClose, 800);
    } catch {
      setSubmitStatus("error");
    }
  };

  if (!isOpen) return null;
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex items-end sm:items-center justify-center min-h-screen px-4 py-4 sm:p-0">
        <div
          className="relative bg-white rounded-t-3xl sm:rounded-3xl text-left overflow-hidden shadow-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh]"
          role="dialog"
          aria-modal="true"
        >
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            <div className="p-6 sm:p-8">
              <div className="flex justify-center mb-3 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
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
                  className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ["firstName", "First Name", "first_name", "John"],
                    ["lastName", "Last Name", "last_name", "Doe"],
                  ].map(([id, label, key, ph]) => (
                    <div key={id}>
                      <label htmlFor={id} className={labelClass}>
                        {label}
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          id={id}
                          type="text"
                          placeholder={ph}
                          value={formData[key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Email */}
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

                {/* Role */}
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
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Zone (conditional) */}
                {formData.role === "Zone Leader" && (
                  <div>
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
                          {loadingZones ? "Loading zones…" : "Select Zone"}
                        </option>
                        {zones.map((z) => (
                          <option key={z.zone_id} value={z.zone_id}>
                            {z.zone_name}
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

                {/* Password */}
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
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setPasswordStrength(calcStrength(e.target.value));
                      }}
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
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Strength:</span>
                        <span
                          className={
                            passwordStrength < 40
                              ? "text-red-600 font-bold"
                              : passwordStrength < 70
                                ? "text-amber-600 font-bold"
                                : "text-emerald-600 font-bold"
                          }
                        >
                          {strengthText}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
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
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        });
                        if (passwordError) setPasswordError("");
                      }}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:ring-2 transition-all ${passwordError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"}`}
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
                  {passwordError && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitStatus === "loading"}
                    className="w-full sm:w-auto px-5 py-3 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <SubmitButton
                    status={submitStatus}
                    label="Create User"
                    loadingLabel="Creating…"
                  />
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
