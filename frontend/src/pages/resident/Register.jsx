import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Mail,
  Lock,
  MapPin,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  User,
  Heart,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";
import api from "../../axious/api";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import bonbonVideo from "../../assets/bonbonVideo.mp4";
import { useAuth } from "../../context/AuthContext";

// ─── PASSWORD STRENGTH FUNCTION ─────────────────────────────────────────────
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

// ─── VERIFICATION PENDING PAGE ──────────────────────────────────────────────
const VerificationPending = ({ email, onBackToLogin }) => {
  return (
    <div className="min-h-screen bg-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl  p-6 sm:p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Registration Successful!
          </h2>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-6">
            <Clock className="w-4 h-4" />
            Pending Verification
          </div>

          {/* Message */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600 leading-relaxed">
              Thank you for registering! Your account has been created
              successfully.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3 text-left">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 font-semibold mb-1">
                    What happens next?
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Our admin team will review your information and verify your
                    account. We'll send a confirmation email to{" "}
                    <span className="font-bold">{email}</span> once your account
                    is verified.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              This usually takes 1-2 business days. You'll be able to login
              after verification is complete.
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex flex-col items-center flex-1">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Registered</span>
              </div>

              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>

              <div className="flex flex-col items-center flex-1">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center mb-2 animate-pulse">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Reviewing</span>
              </div>

              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>

              <div className="flex flex-col items-center flex-1">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-gray-500 font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Back to Login Button */}
          <button
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@barangay.gov"
              className="text-emerald-600 hover:underline font-medium"
            >
              support@barangay.gov
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

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
  children,
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
    {children}
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
const SelectField = ({
  label,
  icon,
  name,
  value,
  onChange,
  options,
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
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-gray-50 border-2 rounded-xl py-3.5 pl-12 pr-10 text-sm font-medium text-gray-800 outline-none transition-all duration-200 appearance-none cursor-pointer
          ${
            error
              ? "border-red-300 focus:border-red-400 bg-red-50/40"
              : "border-gray-300 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100"
          }`}
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
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [genders, setGenders] = useState([]);
  const [civilStatus, setCivilStatus] = useState([]);
  const [zones, setZones] = useState([]);

  // ─── NEW STATE FOR VERIFICATION PENDING ───────────────────────────────────
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { isAuthenticated, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fname: "",
    lname: "",
    birthdate: "",
    house_no: "",
    zone: "",
    gender_id: "",
    civil_status_id: "",
  });

  // ─── PASSWORD STRENGTH CALCULATION ───────────────────────────────────────
  const passwordStrength = useMemo(() => {
    return getPasswordStrength(formData.password);
  }, [formData.password]);

  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? "/dashboard" : "/resident"} replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
      if (errors.id_image) {
        setErrors((prev) => ({ ...prev, id_image: null }));
      }
    }
  };

  const removeImage = (e) => {
    e.preventDefault();
    setSelectedImage(null);
    setImageFile(null);
  };

  const handleRegistration = async () => {
    setErrors({});

    if (!imageFile) {
      setErrors({ id_image: "Please upload a valid ID image" });
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "confirmPassword") data.append(key, formData[key]);
    });
    data.append("id_image", imageFile);

    try {
      // Register the user
      const response = await api.post("/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ─── SHOW VERIFICATION PENDING PAGE ─────────────────────────────────
      if (response.data.status === "pending_verification") {
        setRegisteredEmail(response.data.email);
        setShowVerificationPending(true);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.status === 422) {
          setErrors(err.response.data.errors || {});
        } else {
          setErrors({
            general: err.response.data.message || "Something went wrong",
          });
        }
      } else {
        console.error(err);
        setErrors({ general: "An unexpected error occurred." });
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gRes, cRes, zRes] = await Promise.all([
          api.get("/genders"),
          api.get("/civil-status"),
          api.get("/zones"),
        ]);
        setGenders(gRes.data);
        setCivilStatus(cRes.data);
        setZones(zRes.data);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchData();
  }, []);

  const passwordMatchError =
    formData.confirmPassword && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : "";

  const birthdateError = (() => {
    if (!formData.birthdate) return "";
    const birth = new Date(formData.birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age < 18 ? "You must be at least 18 years old" : "";
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
    formData.gender_id !== "";
  const isFormValid = section1Valid && section2Valid && selectedImage !== null;

  useEffect(() => {
    if (section1Valid && section2Valid) setCurrentStep(3);
    else if (section1Valid) setCurrentStep(2);
    else setCurrentStep(1);
  }, [section1Valid, section2Valid]);

  // ─── SHOW VERIFICATION PENDING PAGE IF REGISTERED ────────────────────────
  if (showVerificationPending) {
    return (
      <VerificationPending
        email={registeredEmail}
        onBackToLogin={() => navigate("/login")}
      />
    );
  }

  // ── Render Registration Form ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 font-sans">
      <aside className="hidden md:block md:w-[38%] shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={bonbonVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/75 to-gray-950/92" />
          <div className="relative z-10 flex flex-col justify-between h-full p-10 lg:p-14">
            <div className="flex items-center gap-3.5">
              <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
              <div>
                <span className="text-white font-bold text-lg leading-none">
                  Barangay Bonbon
                </span>
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mt-0.5">
                  Document Request System
                </p>
              </div>
            </div>
            <div className="max-w-sm">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Easily Request <br />
                <span className="text-emerald-400">Documents</span> <br />
                Digitally.
              </h1>
              <p className="text-emerald-50/65 text-base leading-relaxed mt-5 font-medium">
                Complete the registration to access the barangay document
                request system.
              </p>
            </div>
            <p className="text-emerald-300/40 text-xs font-semibold uppercase tracking-widest">
              © 2026 Barangay Bonbon
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-y-auto bg-gray-100">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />
        <div className="max-w-2xl mx-auto px-5 py-12 md:px-8 md:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Create your account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details below to register as a resident.
            </p>
          </div>
          <StepProgress current={currentStep} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegistration();
            }}
            className="space-y-5"
          >
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
                  error={errors.email}
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
                    error={errors.password}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="pr-4 text-gray-300 hover:text-emerald-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                  >
                    {formData.password && (
                      <div className="mt-2 ml-0.5">
                        <div className="flex gap-1.5 h-1.5 mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-colors duration-300 ${
                                i < passwordStrength.score
                                  ? passwordStrength.color
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p
                          className={`text-xs font-semibold ${
                            passwordStrength.score < 3
                              ? "text-red-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </InputField>
                  <InputField
                    label="Confirm Password"
                    name="confirmPassword"
                    icon={<Lock />}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={passwordMatchError}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <StepHeader
                number="2"
                title="Personal & Residency"
                subtitle="Tell us about yourself and where you live."
              />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    name="fname"
                    icon={<User />}
                    placeholder="Juan"
                    value={formData.fname}
                    onChange={handleInputChange}
                    error={errors.fname}
                  />
                  <InputField
                    label="Last Name"
                    name="lname"
                    icon={<User />}
                    placeholder="Dela Cruz"
                    value={formData.lname}
                    onChange={handleInputChange}
                    error={errors.lname}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DateField
                    label="Date of Birth"
                    name="birthdate"
                    icon={<Calendar />}
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    max={today}
                    error={birthdateError || errors.birthdate}
                  />
                  <SelectField
                    label="Gender"
                    name="gender_id"
                    icon={<User />}
                    value={formData.gender_id}
                    onChange={handleInputChange}
                    options={genders.map((g) => ({
                      id: g.gender_id,
                      label: g.gender_name,
                    }))}
                    error={errors.gender_id}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Zone"
                    name="zone"
                    icon={<MapPin />}
                    value={formData.zone}
                    onChange={handleInputChange}
                    options={zones.map((z) => ({
                      id: z.zone_id,
                      label: z.zone_name,
                    }))}
                    error={errors.zone}
                  />
                  <InputField
                    label="House No. "
                    name="house_no"
                    icon={<MapPin />}
                    placeholder="123 Mabini St."
                    value={formData.house_no}
                    onChange={handleInputChange}
                    error={errors.house_no}
                  />
                </div>
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
                  error={errors.civil_status_id}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <StepHeader
                number="3"
                title="Verification"
                subtitle="Upload a valid government-issued ID."
              />
              {!selectedImage ? (
                <label
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 group
                  ${errors.id_image ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40"}`}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4
                    ${errors.id_image ? "bg-red-100" : "bg-emerald-50 group-hover:bg-emerald-100"}`}
                  >
                    <Upload
                      size={24}
                      className={
                        errors.id_image ? "text-red-600" : "text-emerald-600"
                      }
                    />
                  </div>
                  <h3
                    className={`text-sm font-bold ${errors.id_image ? "text-red-700" : "text-gray-700 group-hover:text-emerald-700"}`}
                  >
                    Upload Valid ID
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG or JPG, up to 10 MB
                  </p>
                  {errors.id_image && (
                    <p className="text-xs text-red-500 mt-2 font-medium">
                      {errors.id_image}
                    </p>
                  )}
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

            <div className="pt-3">
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
                  <strong className="font-bold">
                    There were errors with your submission:
                  </strong>
                  <ul className="list-disc list-inside mt-2">
                    {Object.entries(errors).map(([key, value]) => (
                      <li key={key}>
                        {Array.isArray(value) ? value[0] : value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-4 rounded-xl font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2.5
                  ${
                    isFormValid
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-[0.98]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
              >
                <CheckCircle2 size={20} />
                Complete Registration
              </button>
              <p className="text-center mt-6 text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 font-bold hover:text-emerald-700"
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
