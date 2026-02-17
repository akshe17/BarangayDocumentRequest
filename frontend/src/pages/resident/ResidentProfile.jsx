import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../axious/api";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Shield,
  ShieldAlert,
  Clock,
  Check,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

// ── View keys ──────────────────────────────────────────────────────────────────
const VIEWS = {
  PROFILE: "profile",
  EMAIL: "change-email",
  PASSWORD: "change-password",
};

const ResidentProfile = () => {
  const { user, setUser } = useAuth();

  const [view, setView] = useState(VIEWS.PROFILE);

  // Email state
  const [editedEmail, setEditedEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000,
    );
  };

  const goTo = (nextView) => {
    if (nextView === VIEWS.EMAIL) setEditedEmail(user?.email || "");
    if (nextView === VIEWS.PASSWORD)
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    setView(nextView);
  };

  const goBack = () => setView(VIEWS.PROFILE);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const resident = user.resident || {};
  const zone = user.zone || {};
  const email = user.email || "";

  // ── Email handler ──────────────────────────────────────────────────────────
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setIsSavingEmail(true);
    try {
      const response = await api.post("/resident/profile/update", {
        email: editedEmail,
      });
      if (response.data.success) {
        setUser((prev) => ({
          ...prev,
          ...(response.data.user ?? {}),
          resident: response.data.user?.resident ?? prev?.resident,
          zone: response.data.user?.zone ?? prev?.zone,
        }));
        triggerToast(
          response.data.message || "Email updated successfully!",
          "success",
        );
        goBack();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((arr) =>
          arr.forEach((msg) => triggerToast(msg, "error")),
        );
      } else {
        triggerToast(
          error.response?.data?.message || "Failed to update email",
          "error",
        );
      }
    } finally {
      setIsSavingEmail(false);
    }
  };

  // ── Password handler ───────────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      triggerToast("New passwords do not match", "error");
      return;
    }
    setIsSavingPassword(true);
    try {
      const response = await api.post(
        "/resident/profile/change-password",
        passwordData,
      );
      if (response.data.success) {
        triggerToast(
          response.data.message || "Password changed successfully!",
          "success",
        );
        goBack();
      }
    } catch (error) {
      triggerToast(
        error.response?.data?.message || "Failed to change password",
        "error",
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const getGenderLabel = (id) =>
    ({ 1: "Male", 2: "Female", 3: "Other" })[id] || "Not specified";
  const getCivilStatusLabel = (id) =>
    ({ 1: "Single", 2: "Married", 3: "Divorced", 4: "Widowed" })[id] ||
    "Not specified";

  // ── Shared header banner ───────────────────────────────────────────────────
  const ProfileHeader = () => (
    <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 mb-8 overflow-hidden border border-gray-100">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={bonbonVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-700/85 to-emerald-800/90" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          {user.first_name} {user.last_name}
        </h1>
        <p className="text-emerald-100 text-lg font-medium">
          Resident ID: {resident.resident_id}
        </p>
        {resident.is_verified ? (
          <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold border border-white/30">
            <Shield size={16} /> Verified Resident
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-2 bg-white backdrop-blur-sm text-red-500 px-4 py-1.5 rounded-full text-sm font-semibold border border-red-300/30">
            <ShieldAlert size={16} /> Not Verified
          </div>
        )}
      </div>
    </div>
  );

  // ── Sub-page header with back button ──────────────────────────────────────
  const SubPageHeader = ({ title, subtitle }) => (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={goBack}
        className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft size={20} className="text-gray-600" />
      </button>
      <div>
        <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: CHANGE EMAIL
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.EMAIL) {
    return (
      <div className="animate-in fade-in duration-300 max-w-2xl mx-auto relative">
        <CustomToast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
        />

        <SubPageHeader
          title="Change Email Address"
          subtitle="Update the email linked to your account"
        />

        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <form onSubmit={handleSaveEmail} className="space-y-6">
            {/* Current email (read-only) */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Current Email
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-500 font-medium">
                {email}
              </div>
            </div>

            {/* New email */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                New Email Address
              </label>
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                required
                autoFocus
                placeholder="Enter new email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={isSavingEmail}
                className="flex-1 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEmail}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingEmail ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Save Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: CHANGE PASSWORD
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.PASSWORD) {
    const pwFields = [
      {
        label: "Current Password",
        key: "current_password",
        showKey: "current",
      },
      { label: "New Password", key: "new_password", showKey: "new" },
      {
        label: "Confirm New Password",
        key: "new_password_confirmation",
        showKey: "confirm",
      },
    ];

    return (
      <div className="animate-in fade-in duration-300 max-w-2xl mx-auto relative">
        <CustomToast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
        />

        <SubPageHeader
          title="Change Password"
          subtitle="Choose a strong password with uppercase, lowercase, and numbers"
        />

        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <form onSubmit={handleSavePassword} className="space-y-5">
            {pwFields.map(({ label, key, showKey }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={showPw[showKey] ? "text" : "password"}
                    value={passwordData[key]}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        [key]: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((prev) => ({
                        ...prev,
                        [showKey]: !prev[showKey],
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw[showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={isSavingPassword}
                className="flex-1 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: MAIN PROFILE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="animate-in fade-in duration-300 max-w-7xl mx-auto relative">
      <CustomToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <ProfileHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 ">
        {/* CHANGE EMAIL */}
        <div className="bg-white w-full p-8 rounded-2xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <Mail size={22} className="text-emerald-600" />
            Email Address
          </h3>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Current Email
            </label>
            <p className="text-base font-semibold text-gray-950 truncate">
              {email}
            </p>
          </div>
          <button
            onClick={() => goTo(VIEWS.EMAIL)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            <span className="flex items-center gap-2">
              <Mail size={16} /> Change Email
            </span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-white p-8 rounded-2xl w-full border border-gray-100">
          <h3 className="text-xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <Shield size={22} className="text-emerald-600" />
            Account Security
          </h3>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Password
            </label>
            <p className="text-base font-semibold text-gray-950 tracking-widest">
              ••••••••
            </p>
          </div>
          <button
            onClick={() => goTo(VIEWS.PASSWORD)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            <span className="flex items-center gap-2">
              <Lock size={16} /> Change Password
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* PERSONAL INFORMATION */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <User size={24} className="text-emerald-600" />
            Personal Information
          </h3>

          <div className="flex gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl mb-5">
            <AlertTriangle
              className="text-amber-500 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-sm text-amber-800 font-medium">
              To update your name, birthdate, gender, or civil status, please
              visit the <span className="font-bold">Barangay Hall</span> in
              person with a valid ID.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <ReadOnlyField
                icon={User}
                label="First Name"
                value={user.first_name}
              />
              <ReadOnlyField
                icon={User}
                label="Last Name"
                value={user.last_name}
              />
            </div>

            <ReadOnlyField
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(resident.birthdate)}
            />
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Gender
                </label>
                <p className="text-base font-semibold text-gray-950">
                  {getGenderLabel(resident.gender_id)}
                </p>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Civil Status
                </label>
                <p className="text-base font-semibold text-gray-950">
                  {getCivilStatusLabel(resident.civil_status_id)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ADDRESS INFORMATION */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <MapPin size={24} className="text-emerald-600" />
            Address Information
          </h3>

          <div className="flex gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl mb-5">
            <AlertTriangle
              className="text-amber-500 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-sm text-amber-800 font-medium">
              To update your house number or zone, please visit the{" "}
              <span className="font-bold">Barangay Hall</span> in person.
            </p>
          </div>

          <div className="space-y-5">
            <ReadOnlyField
              icon={MapPin}
              label="House Number"
              value={resident.house_no}
            />
            <ReadOnlyField
              icon={MapPin}
              label="Zone"
              value={zone.zone_name || ""}
            />
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                <MapPin size={20} className="text-emerald-600" /> Complete
                Address
              </h4>
              <p className="text-base font-semibold text-gray-950">
                {resident.house_no}, {zone.zone_name || ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="grid lg:grid-cols-1 gap-8">
        {/* ACCOUNT DETAILS */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <Clock size={22} className="text-emerald-600" />
            Account Details
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Account Created
              </label>
              <p className="text-base font-semibold text-gray-950">
                {formatDate(user.created_at)}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Last Updated
              </label>
              <p className="text-base font-semibold text-gray-950">
                {formatDate(user.updated_at || user.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helper Components ──────────────────────────────────────────────────────────

const ReadOnlyField = ({ icon: Icon, label, value }) => (
  <div className="flex gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
    <div className="bg-white p-4 rounded-lg h-fit border border-gray-100 flex-shrink-0">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>
    <div className="flex-1 min-w-0">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
        {label}
      </label>
      <p className="text-base font-semibold text-gray-950 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-1">
        Visit the Barangay Hall to update
      </p>
    </div>
  </div>
);

const CustomToast = ({ show, message, type, onClose }) => {
  if (!show) return null;
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };
  const icons = {
    success: <Check className="w-5 h-5 text-emerald-600" />,
    error: <AlertTriangle className="w-5 h-5 text-red-600" />,
  };
  return (
    <div className="fixed top-20 right-6 z-50 animate-fade-in-down">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-sm ${styles[type]}`}
      >
        {icons[type]}
        <p className="text-sm font-semibold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2 text-lg font-bold leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ResidentProfile;
