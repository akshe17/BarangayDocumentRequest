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
  Home,
  BadgeCheck,
  X,
} from "lucide-react";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

const VIEWS = {
  PROFILE: "profile",
  EMAIL: "change-email",
  PASSWORD: "change-password",
};

/* ── Toast ───────────────────────────────────────────────────────────────── */
const Toast = ({ show, message, type, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl max-w-sm text-sm font-semibold
        ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}
      >
        {type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-current opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

/* ── Read-only field ─────────────────────────────────────────────────────── */
const InfoField = ({ label, value, note }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-900">
      {value || <span className="text-gray-300 font-normal">—</span>}
    </p>
    {note && <p className="text-[11px] text-gray-300">{note}</p>}
  </div>
);

/* ── Section card ────────────────────────────────────────────────────────── */
const Card = ({ icon: Icon, title, children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}
  >
    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-emerald-600" />
      </div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ── Sub-page header ─────────────────────────────────────────────────────── */
const SubHeader = ({ title, subtitle, onBack }) => (
  <div className="flex items-center gap-3 mb-6">
    <button
      onClick={onBack}
      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all flex-shrink-0"
    >
      <ArrowLeft size={16} />
    </button>
    <div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
const ResidentProfile = () => {
  const { user, setUser } = useAuth();
  const [view, setView] = useState(VIEWS.PROFILE);

  const [editedEmail, setEditedEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

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

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );

  // ── Data resolution — zone is now on resident.zone ────────────────────────
  const resident = user.resident || {};
  const zone = resident.zone || {}; // ← FIXED: was user.zone
  const zoneName = zone.zone_name || user.zone_name || "";
  const middleName = user.middle_name || "";
  const fullName = [user.first_name, middleName, user.last_name]
    .filter(Boolean)
    .join(" ");

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";
  const getGender = (id) =>
    ({ 1: "Male", 2: "Female", 3: "Other" })[id] || "Not specified";
  const getCivil = (id) =>
    ({ 1: "Single", 2: "Married", 3: "Divorced", 4: "Widowed" })[id] ||
    "Not specified";

  const initials =
    `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase();

  // ── Email handler ─────────────────────────────────────────────────────────
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setIsSavingEmail(true);
    try {
      const res = await api.post("/resident/profile/update", {
        email: editedEmail,
      });
      if (res.data.success) {
        setUser((prev) => ({
          ...prev,
          ...(res.data.user ?? {}),
          resident: res.data.user?.resident ?? prev?.resident,
        }));
        triggerToast(res.data.message || "Email updated successfully!");
        goBack();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((arr) =>
          arr.forEach((msg) => triggerToast(msg, "error")),
        );
      } else {
        triggerToast(
          err.response?.data?.message || "Failed to update email",
          "error",
        );
      }
    } finally {
      setIsSavingEmail(false);
    }
  };

  // ── Password handler ──────────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      triggerToast("New passwords do not match", "error");
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await api.post(
        "/resident/profile/change-password",
        passwordData,
      );
      if (res.data.success) {
        triggerToast(res.data.message || "Password changed!");
        goBack();
      }
    } catch (err) {
      triggerToast(
        err.response?.data?.message || "Failed to change password",
        "error",
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: CHANGE EMAIL
  // ══════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.EMAIL)
    return (
      <div className="max-w-lg mx-auto">
        <Toast
          {...toast}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
        />
        <SubHeader
          title="Change Email Address"
          subtitle="Update the email linked to your account"
          onBack={goBack}
        />
        <Card icon={Mail} title="Email Address">
          <form onSubmit={handleSaveEmail} className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Current Email
              </p>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 font-medium">
                {user.email}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                New Email Address
              </p>
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                required
                autoFocus
                placeholder="Enter new email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={goBack}
                disabled={isSavingEmail}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEmail}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingEmail ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Save Email
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    );

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
      <div className="max-w-lg mx-auto">
        <Toast
          {...toast}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
        />
        <SubHeader
          title="Change Password"
          subtitle="Use uppercase, lowercase, and numbers"
          onBack={goBack}
        />
        <Card icon={Lock} title="Account Security">
          <form onSubmit={handleSavePassword} className="space-y-4">
            {pwFields.map(({ label, key, showKey }) => (
              <div key={key}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  {label}
                </p>
                <div className="relative">
                  <input
                    type={showPw[showKey] ? "text" : "password"}
                    value={passwordData[key]}
                    required
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    {showPw[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={goBack}
                disabled={isSavingPassword}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: MAIN PROFILE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Toast
        {...toast}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* ── Hero banner ── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        style={{ minHeight: 200 }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bonbonVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-transparent" />
        <div className="relative z-10 p-8 flex items-end gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-2xl font-black text-white">{initials}</span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white leading-tight truncate">
              {fullName}
            </h1>
            <p className="text-emerald-200 text-sm font-medium mt-0.5">
              Resident ID #{resident.resident_id}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {resident.is_verified ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/30 backdrop-blur-sm text-white border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-bold">
                  <BadgeCheck size={13} /> Verified Resident
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-rose-500/30 backdrop-blur-sm text-white border border-rose-400/40 px-3 py-1 rounded-full text-xs font-bold">
                  <ShieldAlert size={13} /> Not Verified
                </span>
              )}
              {zoneName && (
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1 rounded-full text-xs font-bold">
                  <MapPin size={12} /> {zoneName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top row: email + security ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card icon={Mail} title="Email Address">
          <div className="space-y-4">
            <InfoField label="Current Email" value={user.email} />
            <button
              onClick={() => goTo(VIEWS.EMAIL)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-200"
            >
              <span className="flex items-center gap-2">
                <Mail size={14} /> Change Email
              </span>
              <ChevronRight size={14} />
            </button>
          </div>
        </Card>

        <Card icon={Shield} title="Account Security">
          <div className="space-y-4">
            <InfoField label="Password" value="••••••••" />
            <button
              onClick={() => goTo(VIEWS.PASSWORD)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-200"
            >
              <span className="flex items-center gap-2">
                <Lock size={14} /> Change Password
              </span>
              <ChevronRight size={14} />
            </button>
          </div>
        </Card>
      </div>

      {/* ── Middle row: personal + address ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card icon={User} title="Personal Information">
          <div className="space-y-1 mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={13}
                className="text-amber-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                To update personal info, visit the{" "}
                <strong>Barangay Hall</strong> with a valid ID.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="First Name" value={user.first_name} />
              <InfoField label="Last Name" value={user.last_name} />
            </div>
            <InfoField label="Middle Name" value={middleName || "—"} />
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Gender" value={getGender(resident.gender_id)} />
              <InfoField
                label="Civil Status"
                value={getCivil(resident.civil_status_id)}
              />
            </div>
            <InfoField
              label="Date of Birth"
              value={formatDate(resident.birthdate)}
            />
          </div>
        </Card>

        <Card icon={MapPin} title="Address Information">
          <div className="space-y-1 mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={13}
                className="text-amber-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                To update address details, visit the{" "}
                <strong>Barangay Hall</strong> in person.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="House No." value={resident.house_no} />
              <InfoField label="Zone" value={zoneName || "—"} />
            </div>
            {/* Full address display */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Home size={11} /> Complete Address
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {[resident.house_no, zoneName, "Bonbon, Cagayan de Oro"]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Bottom row: account details ── */}
      <Card icon={Clock} title="Account Details">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <InfoField
            label="Account Created"
            value={formatDate(user.created_at)}
          />
          <InfoField
            label="Last Updated"
            value={formatDate(user.updated_at || user.created_at)}
          />
          <InfoField
            label="Account Status"
            value={user.is_active ? "Active" : "Inactive"}
          />
        </div>
      </Card>
    </div>
  );
};

export default ResidentProfile;
