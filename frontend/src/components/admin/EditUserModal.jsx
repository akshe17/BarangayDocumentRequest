import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Shield,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useZones } from "../../context/ZoneContext";

const SubmitButton = ({ status }) => {
  const base =
    "w-full sm:w-auto px-5 py-3 text-sm rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 min-w-[130px]";
  if (status === "loading")
    return (
      <button
        type="submit"
        disabled
        className={`${base} bg-emerald-400 text-white cursor-not-allowed opacity-80`}
      >
        <Loader2 size={16} className="animate-spin" /> Saving…
      </button>
    );
  if (status === "success")
    return (
      <button
        type="submit"
        disabled
        className={`${base} bg-emerald-500 text-white cursor-not-allowed`}
      >
        <CheckCircle2 size={16} /> Saved
      </button>
    );
  if (status === "error")
    return (
      <button
        type="submit"
        className={`${base} bg-red-500 hover:bg-red-600 text-white`}
      >
        Retry
      </button>
    );
  return (
    <button
      type="submit"
      className={`${base} bg-emerald-500 hover:bg-emerald-600 text-white`}
    >
      Save Changes
    </button>
  );
};

const EditUserModal = ({ isOpen, onClose, onSubmit, user }) => {
  const { zones, loadingZones } = useZones();
  const [submitStatus, setSubmitStatus] = useState("idle");
  const roles = ["Admin", "Clerk", "Zone Leader"];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role_name: "Clerk",
    zone_id: "",
  });

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

  useEffect(() => {
    if (isOpen && user) {
      const matchedZone = zones.find((z) => z.zone_name === user.zone);
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role_name: user.role || "Clerk",
        zone_id: matchedZone ? matchedZone.zone_id : "",
      });
      setSubmitStatus("idle");
    }
  }, [isOpen, user, zones]);

  useEffect(() => {
    if (formData.role_name !== "Zone Leader")
      setFormData((p) => ({ ...p, zone_id: "" }));
  }, [formData.role_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus("loading");
    try {
      await onSubmit(formData);
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
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="flex items-end sm:items-center justify-center min-h-screen p-4 sm:p-0">
        <div
          className="relative bg-white rounded-t-3xl sm:rounded-3xl text-left overflow-hidden shadow-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh]"
          role="dialog"
          aria-modal="true"
        >
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            <div className="p-5 sm:p-8">
              <div className="flex justify-center mb-3 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight pr-2">
                  Edit User Details
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-900">
                    <span className="font-semibold">
                      Update information for{" "}
                    </span>
                    <span className="font-bold">
                      {user?.first_name} {user?.last_name}
                    </span>
                  </p>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ["firstName", "First Name", "first_name"],
                    ["lastName", "Last Name", "last_name"],
                  ].map(([id, label, key]) => (
                    <div key={id}>
                      <label htmlFor={id} className={labelClass}>
                        {label}
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          id={id}
                          type="text"
                          value={formData[key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                          className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Zone (conditional) */}
                {formData.role_name === "Zone Leader" && (
                  <div>
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

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitStatus === "loading"}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <SubmitButton status={submitStatus} />
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
