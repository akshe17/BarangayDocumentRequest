import React, { useState, useMemo } from "react";
import {
  Mail,
  Lock,
  MapPin,
  Upload,
  CheckCircle2,
  Home,
  Eye,
  EyeOff,
  X,
  Image as ImageIcon,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

// ─── PASSWORD STRENGTH LOGIC ────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "bg-gray-200" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-400" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-400" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-400" };
  if (score === 4)
    return { score: 4, label: "Strong", color: "bg-emerald-400" };
  return { score: 5, label: "Very Strong", color: "bg-emerald-500" };
}

// ─── STEP PROGRESS BAR ──────────────────────────────────────────────────────
const StepProgress = ({ current }) => {
  const steps = ["Account", "Residency", "Verification"];
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={idx}>
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                  ${
                    done
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : active
                        ? "border-emerald-600 text-emerald-600 bg-white shadow-md shadow-emerald-200"
                        : "border-gray-300 text-gray-400 bg-white"
                  }`}
              >
                {done ? <CheckCircle2 size={18} /> : idx}
              </div>
              <span
                className={`mt-2 text-xs font-semibold tracking-wide uppercase
                ${done ? "text-emerald-600" : active ? "text-emerald-600" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mb-5 rounded-full transition-all duration-300
                ${done ? "bg-emerald-500" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── SECTION CARD WRAPPER ───────────────────────────────────────────────────
const SectionCard = ({ children }) => (
  <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-7 shadow-sm">
    {children}
  </div>
);

// ─── SECTION HEADER ─────────────────────────────────────────────────────────
const StepHeader = ({ number, title, subtitle }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
      <span className="text-emerald-700 font-bold text-sm">{number}</span>
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-800 leading-tight">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

// ─── INPUT FIELD ────────────────────────────────────────────────────────────
const InputField = ({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
  error,
}) => (
  <div className="w-full group">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-0.5 mb-2 block group-focus-within:text-emerald-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      {/* Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      {/* Input */}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-2 rounded-xl py-3.5 pl-12 pr-12 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none transition-all duration-200
          ${error ? "border-red-300 focus:border-red-400 bg-red-50/40" : "border-gray-200 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100"}`}
      />
      {/* Suffix (e.g. eye toggle) */}
      {suffix && (
        <div className="absolute right-0 inset-y-0 flex items-center">
          {suffix}
        </div>
      )}
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1.5 ml-0.5 font-medium">{error}</p>
    )}
  </div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    purok: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const removeImage = (e) => {
    e.preventDefault();
    setSelectedImage(null);
  };

  // ── Derived state ──
  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  const passwordError =
    formData.confirmPassword && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : "";

  const section1Valid =
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  const section2Valid =
    formData.address.trim() !== "" && formData.purok.trim() !== "";

  const isFormValid = section1Valid && section2Valid && selectedImage !== null;

  // auto-advance step indicator (visual only)
  React.useEffect(() => {
    if (section1Valid && section2Valid && selectedImage) setCurrentStep(3);
    else if (section1Valid && section2Valid) setCurrentStep(3);
    else if (section1Valid) setCurrentStep(2);
    else setCurrentStep(1);
  }, [section1Valid, section2Valid, selectedImage]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 font-sans">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT PANEL — FIXED / STICKY
          ═══════════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:block md:w-[38%] shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden relative">
          {/* Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={bonbonVideo} type="video/mp4" />
          </video>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/75 to-gray-950/92" />

          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 40% 60%, rgba(34,197,94,0.15) 0%, transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-10 lg:p-14">
            {/* Logo */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight leading-none">
                  Barangay Bonbon
                </span>
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mt-0.5">
                  Document Request System
                </p>
              </div>
            </div>

            {/* Headline + description */}
            <div className="max-w-sm">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Easily Request
                <br />
                <span className="text-emerald-500">Documents</span>
                <br />
                Digitally.
              </h1>
              <p className="text-emerald-300 text-base leading-relaxed mt-5 font-medium">
                Complete the registration to access barangay document request
                system.
              </p>
            </div>

            {/* Footer note */}
            <p className="text-emerald-300/40 text-xs font-semibold uppercase tracking-widest">
              © 2026 Barangay Bonbon
            </p>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT PANEL — SCROLLABLE FORM
          ═══════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-gray-100">
        {/* Subtle top-edge accent line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

        <div className="max-w-2xl mx-auto px-5 py-12 md:px-8 md:py-16">
          {/* Mobile logo (only on small screens) */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-3">
              Barangay Bonbon
            </h2>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Registration
            </p>
          </div>

          {/* Page heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Create your account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details below to register as a resident.
            </p>
          </div>

          {/* Progress bar */}
          <StepProgress current={currentStep} />

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {/* ── SECTION 1: ACCOUNT ── */}
            <SectionCard>
              <StepHeader
                number="1"
                title="Account Details"
                subtitle="Set up your login credentials."
              />
              <div className="space-y-4">
                <InputField
                  label="Email Address"
                  name="email"
                  icon={<Mail />}
                  placeholder="you@email.com"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Password"
                    name="password"
                    icon={<Lock />}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="pr-4 text-gray-300 hover:text-emerald-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                  />
                  <InputField
                    label="Confirm Password"
                    name="confirmPassword"
                    icon={<Lock />}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={passwordError}
                  />
                </div>

                {/* Password strength bar */}
                {formData.password.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500 font-semibold">
                        Password strength
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          passwordStrength.score <= 2
                            ? "text-red-500"
                            : passwordStrength.score === 3
                              ? "text-yellow-600"
                              : "text-emerald-600"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300
                            ${i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Use 6+ characters with letters, numbers & symbols for a
                      stronger password.
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* ── SECTION 2: RESIDENCY ── */}
            <SectionCard>
              <StepHeader
                number="2"
                title="Residency"
                subtitle="Enter your address within Bonbon."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="House No. & Street"
                  name="address"
                  icon={<MapPin />}
                  placeholder="123 Mabini St."
                  value={formData.address}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Purok / Zone"
                  name="purok"
                  icon={<Home />}
                  placeholder="Purok 4"
                  value={formData.purok}
                  onChange={handleInputChange}
                />
              </div>
            </SectionCard>

            {/* ── SECTION 3: VERIFICATION ── */}
            <SectionCard>
              <StepHeader
                number="3"
                title="Verification"
                subtitle="Upload a valid government-issued ID."
              />

              {!selectedImage ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-xl p-10 cursor-pointer transition-all duration-200 group">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    <Upload size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors">
                    Upload Valid ID
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG or JPG, up to 10 MB
                  </p>
                </label>
              ) : (
                <div className="relative border-2 border-emerald-400 bg-emerald-50/30 rounded-xl overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="ID Preview"
                    className="w-full h-48 object-cover"
                  />
                  {/* Remove button */}
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-500 hover:text-red-600 hover:bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                  {/* Attached badge */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/95">
                    <CheckCircle2 size={14} className="text-white" />
                    <span className="text-white text-xs font-bold">
                      ID successfully attached
                    </span>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ── SUBMIT ── */}
            <div className="pt-3">
              <button
                type="button"
                disabled={!isFormValid}
                className={`w-full py-4 rounded-xl font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2.5
                  ${
                    isFormValid
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
              >
                <CheckCircle2 size={20} />
                Complete Registration
              </button>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <ShieldCheck size={13} className="text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">
                  Your information is secure and encrypted
                </span>
              </div>

              {/* Back to login */}
              <p className="text-center mt-6 text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
