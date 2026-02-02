// Add useEffect here inside the curly braces
import React, { useState, useEffect, useMemo } from "react";
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
  ShieldCheck,
  User,
  Heart,
  Calendar,
} from "lucide-react";
import api from "../../axious/api";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

// ─── PASSWORD STRENGTH ──────────────────────────────────────────────────────
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

// ─── STEP PROGRESS ──────────────────────────────────────────────────────────
const StepProgress = ({ current }) => {
  const steps = ["Account", "Personal", "Verification"];
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={idx}>
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
                  ${done || active ? "text-emerald-600" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
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

// ─── SECTION CARD ───────────────────────────────────────────────────────────
const SectionCard = ({ children }) => (
  <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-7 shadow-sm">
    {children}
  </div>
);

// ─── STEP HEADER ────────────────────────────────────────────────────────────
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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-2 rounded-xl py-3.5 pl-12 pr-12 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200
          ${
            error
              ? "border-red-300 focus:border-red-400 bg-red-50/40"
              : "border-gray-300 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100"
          }`}
      />
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

// ─── DATE FIELD ─────────────────────────────────────────────────────────────
const DateField = ({ label, icon, name, value, onChange, max, error }) => (
  <div className="w-full group">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-0.5 mb-2 block group-focus-within:text-emerald-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        max={max}
        className={`w-full bg-gray-50 border-2 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-gray-800 outline-none transition-all duration-200 appearance-none cursor-pointer
          ${
            error
              ? "border-red-300 focus:border-red-400 bg-red-50/40"
              : "border-gray-300 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100"
          }`}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1.5 ml-0.5 font-medium">{error}</p>
    )}
  </div>
);

// ─── SELECT FIELD ───────────────────────────────────────────────────────────
const SelectField = ({ label, icon, name, value, onChange, options }) => (
  <div className="w-full group">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-0.5 mb-2 block group-focus-within:text-emerald-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-50 border-2 border-gray-300 rounded-xl py-3.5 pl-12 pr-10 text-sm font-medium text-gray-800 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100 appearance-none cursor-pointer"
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-4 h-4"
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
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const today = new Date().toISOString().split("T")[0];
  const [genders, setGenders] = useState([]);
  const [civilStatus, setCivilStatus] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fname: "",
    lname: "",
    birthdate: "",
    address: "",
    purok: "",
    gender_id: "",
    civil_status_id: "",
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

  const handleRegistration = async () => {
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("fname", formData.fname);
    data.append("lname", formData.lname);
    data.append("birthdate", formData.birthdate);
    data.append("address", formData.address);
    data.append("purok", formData.purok);
    data.append("gender_id", formData.gender_id);
    data.append("civil_status_id", formData.civil_status_id);

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput && fileInput.files[0]) {
      data.append("id_image", fileInput.files[0]);
    }

    try {
      const res = await api.post("/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("token", res.data.access_token);
      alert("Account created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };
  // Fetch genders from Laravel on component mount
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const response = await api.get("/genders");
        setGenders(response.data); // Assuming response.data is an array of objects
      } catch (err) {
        console.error("Failed to fetch genders:", err);
      }
    };

    const fetchCivilStatus = async () => {
      try {
        const response = await api.get("/civil-status");
        setCivilStatus(response.data); // Assuming response.data is an array of objects
        console.log(response.data);
      } catch (err) {
        console.error("Failed to fetch genders:", err);
      }
    };
    fetchGenders();
    fetchCivilStatus();
  }, []);
  // ── Validation ──────────────────────────────────────────────────────────
  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  const passwordError =
    formData.confirmPassword && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : "";

  const birthdateError = (() => {
    if (!formData.birthdate) return "";
    const birth = new Date(formData.birthdate + "T00:00:00");
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    if (age < 18) return "You must be at least 18 years old";
    return "";
  })();

  const section1Valid =
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  const section2Valid =
    formData.fname.trim() !== "" &&
    formData.lname.trim() !== "" &&
    formData.birthdate !== "" &&
    !birthdateError &&
    formData.address.trim() !== "" &&
    formData.purok.trim() !== "" &&
    formData.gender_id !== "" &&
    formData.civil_status_id !== "";

  const isFormValid = section1Valid && section2Valid && selectedImage !== null;

  React.useEffect(() => {
    if (section1Valid && section2Valid && selectedImage) setCurrentStep(3);
    else if (section1Valid && section2Valid) setCurrentStep(3);
    else if (section1Valid) setCurrentStep(2);
    else setCurrentStep(1);
  }, [section1Valid, section2Valid, selectedImage]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 font-sans">
      {/* ════════════════════════════════════════════════════════════════════
          LEFT — STICKY PANEL
          ════════════════════════════════════════════════════════════════════ */}
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

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/75 to-gray-950/92" />

          {/* Subtle green glow */}
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
              <div className="w-12  rounded-xl flex items-center justify-center ">
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
                <span className="text-emerald-400">Documents</span>
                <br />
                Digitally.
              </h1>
              <p className="text-emerald-50/65 text-base leading-relaxed mt-5 font-medium">
                Complete the registration to access the barangay document
                request system.
              </p>

              {/* Trust badges */}
              <div className="mt-8 flex flex-col gap-3">
                {[
                  "Data is encrypted end-to-end",
                  "Government-grade security",
                  "Your privacy is protected",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <ShieldCheck
                      size={15}
                      className="text-emerald-400 shrink-0"
                    />
                    <span className="text-emerald-200/70 text-xs font-semibold">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-emerald-300/40 text-xs font-semibold uppercase tracking-widest">
              © 2026 Barangay Bonbon
            </p>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT — SCROLLABLE FORM
          ════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-gray-100">
        {/* Top accent line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

        <div className="max-w-2xl mx-auto px-5 py-12 md:px-8 md:py-16">
          {/* Mobile logo */}
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

          {/* Progress */}
          <StepProgress current={currentStep} />

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegistration();
            }}
            className="space-y-5"
          >
            {/* ── SECTION 1: ACCOUNT ──────────────────────────────────── */}
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

                {/* Password strength meter */}
                {formData.password.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500 font-semibold">
                        Password strength
                      </span>
                      <span
                        className={`text-xs font-bold ${passwordStrength.score <= 2 ? "text-red-500" : passwordStrength.score === 3 ? "text-yellow-600" : "text-emerald-600"}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Use 6+ characters with letters, numbers &amp; symbols.
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* ── SECTION 2: PERSONAL & RESIDENCY ─────────────────────── */}
            <SectionCard>
              <StepHeader
                number="2"
                title="Personal & Residency"
                subtitle="Tell us about yourself and where you live."
              />
              <div className="space-y-4">
                {/* Row 1 — First name · Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    name="fname"
                    icon={<User />}
                    placeholder="Juan"
                    value={formData.fname}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Last Name"
                    name="lname"
                    icon={<User />}
                    placeholder="Dela Cruz"
                    value={formData.lname}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Row 2 — Date of Birth · Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DateField
                    label="Date of Birth"
                    name="birthdate"
                    icon={<Calendar />}
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    max={today}
                    error={birthdateError}
                  />
                  <SelectField
                    label="Gender"
                    name="gender_id"
                    icon={<User />}
                    value={formData.gender_id}
                    onChange={handleInputChange}
                    // Map the DB data to your options
                    options={genders.map((g) => ({
                      id: g.id,
                      label: g.name, // Adjust 'name' if your DB column is named differently (e.g., 'gender_name')
                    }))}
                  />
                </div>

                {/* Row 3 — Address · Purok */}
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

                {/* Row 4 — Marital Status (full width) */}
                <SelectField
                  label="Marital Status"
                  name="civil_status_id"
                  icon={<Heart />}
                  value={formData.civil_status_id}
                  onChange={handleInputChange}
                  options={civilStatus.map((status) => ({
                    id: status.civil_status_id,
                    label: status.status_name,
                  }))}
                />
              </div>
            </SectionCard>

            {/* ── SECTION 3: VERIFICATION ─────────────────────────────── */}
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
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-500 hover:text-red-600 hover:bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/95">
                    <CheckCircle2 size={14} className="text-white" />
                    <span className="text-white text-xs font-bold">
                      ID successfully attached
                    </span>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ── SUBMIT ──────────────────────────────────────────────── */}
            <div className="pt-3">
              <button
                type="submit"
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

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <ShieldCheck size={13} className="text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">
                  Your information is secure and encrypted
                </span>
              </div>

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
