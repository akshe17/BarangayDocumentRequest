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
  FileText,
  Shield,
  FileBadge,
  Stamp,
  Download,
} from "lucide-react";
import api from "../../axious/api";

import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import bonbonVideo from "../../assets/bonbonVideo.mp4";
import { useAuth } from "../../context/AuthContext";

// ─── PASSWORD STRENGTH ───────────────────────────────────────────────────────
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

// ─── VERIFICATION PENDING ────────────────────────────────────────────────────
const VerificationPending = ({ email, onBackToLogin }) => (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Registration Successful!
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-6">
          <Clock className="w-4 h-4" /> Pending Verification
        </div>
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
                  Our admin team will review your information. We'll send a
                  confirmation to <span className="font-bold">{email}</span>{" "}
                  once verified.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            This usually takes 1–2 business days.
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            {[
              {
                icon: <CheckCircle2 className="w-5 h-5 text-white" />,
                label: "Registered",
                bg: "bg-emerald-500",
                pulse: false,
              },
              {
                icon: <Clock className="w-5 h-5 text-white" />,
                label: "Reviewing",
                bg: "bg-amber-400",
                pulse: true,
              },
              {
                icon: <Mail className="w-5 h-5 text-gray-500" />,
                label: "Verified",
                bg: "bg-gray-300",
                pulse: false,
              },
            ].map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 ${s.bg} rounded-full flex items-center justify-center mb-2 ${s.pulse ? "animate-pulse" : ""}`}
                  >
                    {s.icon}
                  </div>
                  <span
                    className={`font-medium ${i === 2 ? "text-gray-500" : "text-gray-700"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 bg-gray-300 mx-2" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <button
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
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

// ─── STEP PROGRESS ───────────────────────────────────────────────────────────
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
                className={`mt-2 text-xs font-semibold tracking-wide uppercase ${done || active ? "text-emerald-600" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mb-5 rounded-full transition-all duration-300 ${done ? "bg-emerald-500" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── SECTION CARD ────────────────────────────────────────────────────────────
const SectionCard = ({ children }) => (
  <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-7 shadow-sm">
    {children}
  </div>
);

// ─── STEP HEADER ─────────────────────────────────────────────────────────────
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

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────
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

// ─── DATE FIELD ──────────────────────────────────────────────────────────────
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

// ─── SELECT FIELD ────────────────────────────────────────────────────────────
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
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
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { isAuthenticated, isAdmin } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fname: "",
    mname: "",
    lname: "",
    birthdate: "",
    house_no: "",
    zone: "",
    gender_id: "",
    civil_status_id: "",
  });

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  if (isAuthenticated)
    return <Navigate to={isAdmin() ? "/dashboard" : "/resident"} replace />;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nameOnlyRegex = /^[A-Za-zÀ-ÿ\s.'-]*$/;

    // Block numbers on all name fields
    if (["fname", "mname", "lname"].includes(name)) {
      if (!nameOnlyRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Only letters and spaces are allowed.",
        }));
        return;
      }
    }

    if (name === "house_no") {
      if (!/^[A-Za-z0-9\s]*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          house_no: "Only letters, numbers, and spaces are allowed.",
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
      if (errors.id_image) setErrors((prev) => ({ ...prev, id_image: null }));
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
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "confirmPassword") data.append(key, formData[key]);
    });
    data.append("id_image", imageFile);

    try {
      const response = await api.post("/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.status === "pending_verification") {
        setRegisteredEmail(response.data.email);
        setShowVerificationPending(true);
      }
    } catch (err) {
      if (err.response?.data) {
        if (err.response.status === 422)
          setErrors(err.response.data.errors || {});
        else
          setErrors({
            general: err.response.data.message || "Something went wrong",
          });
      } else {
        setErrors({ general: "An unexpected error occurred." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
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
    })();
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

  if (showVerificationPending)
    return (
      <VerificationPending
        email={registeredEmail}
        onBackToLogin={() => navigate("/login")}
      />
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        .reg-root { font-family: 'DM Sans', sans-serif; }
        .df       { font-family: 'Bricolage Grotesque', sans-serif; }

        @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(-6deg)} 50%{transform:translateY(-14px) rotate(-6deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(4deg)}  50%{transform:translateY(-10px) rotate(4deg)}  }
        @keyframes floatC { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(-2deg)} }
        @keyframes floatD { 0%,100%{transform:translateY(0px) rotate(8deg)}  50%{transform:translateY(-8px)  rotate(8deg)}  }
        @keyframes floatE { 0%,100%{transform:translateY(0px) rotate(-12deg)}50%{transform:translateY(-12px) rotate(-12deg)}}
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @keyframes pulseDot { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.4)} }

        .fa { animation: floatA 6s   ease-in-out infinite; }
        .fb { animation: floatB 7s   ease-in-out infinite  0.5s; }
        .fc { animation: floatC 8s   ease-in-out infinite  1.0s; }
        .fd { animation: floatD 5.5s ease-in-out infinite  1.5s; }
        .fe { animation: floatE 9s   ease-in-out infinite  2.0s; }
        .spin-slow { animation: spinSlow 20s linear infinite; }
        .pdot      { animation: pulseDot  3s ease-in-out infinite; }

       
        .doc-shadow { box-shadow: 0 20px 50px rgba(0,0,0,.28), 0 4px 14px rgba(0,0,0,.14); }
      `}</style>

      <div className="reg-root min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* ══ LEFT PANEL ════════════════════════════════════════════ */}
        <aside className="hidden md:block md:w-[38%] lg:w-[42%] shrink-0">
          <div
            className="sticky top-0 h-screen overflow-hidden relative"
            style={{ background: "#022c22" }}
          >
            {/* Video bg */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: "blur(3px)",
                transform: "scale(1.06)",
                opacity: 0.45,
              }}
            >
              <source src={bonbonVideo} type="video/mp4" />
            </video>

            {/* Colour overlays */}
            <div className="absolute inset-0 bg-emerald-950/55 mix-blend-multiply" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(155deg,rgba(6,78,59,.82) 0%,rgba(6,95,70,.45) 50%,rgba(4,120,87,.72) 100%)",
              }}
            />

            {/* Grid */}
            <div className="absolute inset-0 grid-bg pointer-events-none" />

            {/* Decorative rings */}
            <div
              className="spin-slow absolute top-[14%] right-[7%] w-28 h-28 rounded-full opacity-10"
              style={{ border: "2px dashed #6ee7b7" }}
            />
            <div
              className="spin-slow absolute bottom-[22%] left-[5%] w-20 h-20 rounded-full opacity-10"
              style={{
                border: "2px dashed #34d399",
                animationDirection: "reverse",
              }}
            />

            {/* Dots */}
            {[
              "w-2 h-2 top-[11%] left-[14%]",
              "w-3 h-3 top-[24%] right-[19%]",
              "w-1.5 h-1.5 top-[54%] left-[7%]",
              "w-2 h-2 top-[69%] right-[24%]",
              "w-2.5 h-2.5 top-[84%] left-[39%]",
              "w-1.5 h-1.5 top-[34%] left-[54%]",
              "w-2 h-2 bottom-[9%] right-[9%]",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute rounded-full bg-emerald-400 pdot ${cls}`}
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}

            {/* ── CONTENT COLUMN ── */}
            <div className="relative z-20 flex flex-col h-full p-10 lg:p-12">
              {/* TOP: Logo + headline */}
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-9 h-9 object-contain brightness-110"
                  />
                  <div className="w-px h-5 bg-white/20" />
                  <div>
                    <p className="df text-white text-sm font-bold tracking-tight leading-none">
                      Barangay Bonbon
                    </p>
                    <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-bold mt-0.5">
                      Document Request System
                    </p>
                  </div>
                </div>
                <h2 className="df text-white text-3xl md:text-6xl font-black leading-[1.15] tracking-tight mb-3">
                  Let's get
                  <br />
                  <span className="text-emerald-400">started.</span>
                </h2>
              </div>

              {/* MIDDLE: Floating doc cards */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-[340px] h-[310px]">
                  {/* Card 1 — Brgy. Clearance */}
                  <div
                    className="fa absolute doc-shadow"
                    style={{ top: "0%", left: "0%", width: 180 }}
                  >
                    <div className="bg-white rounded-2xl p-4 border border-white/70">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <Shield size={13} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
                          Brgy. Clearance
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {[90, 75, 82, 68].map((w, i) => (
                          <div
                            key={i}
                            className="h-1.5 bg-gray-100 rounded-full"
                            style={{ width: `${w}%` }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <div className="w-8 h-8 rounded-full border-[2.5px] border-emerald-500 flex items-center justify-center rotate-12 opacity-80">
                          <Stamp size={11} className="text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 — Request Form hero */}
                  <div
                    className="fb absolute doc-shadow"
                    style={{ top: "14%", left: "22%", width: 200, zIndex: 10 }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden border border-emerald-200/30"
                      style={{
                        background:
                          "linear-gradient(135deg,#fff 60%,#ecfdf5 100%)",
                      }}
                    >
                      <div
                        className="h-1.5 w-full"
                        style={{
                          background: "linear-gradient(90deg,#10b981,#059669)",
                        }}
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-500 rounded-xl flex items-center justify-center">
                              <FileText size={12} className="text-white" />
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                Document
                              </p>
                              <p className="text-[10px] font-black text-gray-700">
                                Request Form
                              </p>
                            </div>
                          </div>
                          <CheckCircle2
                            size={13}
                            className="text-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          {[
                            ["Full Name", "h-5"],
                            ["Purpose", "h-5"],
                          ].map(([lbl, h]) => (
                            <div key={lbl}>
                              <div className="h-1.5 bg-gray-200 rounded-full w-14 mb-1" />
                              <div
                                className={`${h} bg-gray-50 rounded-lg border border-gray-200 w-full`}
                              />
                            </div>
                          ))}
                        </div>
                        <div
                          className="mt-3 h-5 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(90deg,#10b981,#059669)",
                          }}
                        >
                          <span className="text-white text-[8px] font-black tracking-widest">
                            SUBMIT REQUEST
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 — Cert. of Residency */}
                  <div
                    className="fc absolute doc-shadow"
                    style={{ bottom: "0%", left: "0%", width: 172 }}
                  >
                    <div className="bg-white rounded-2xl p-4 border border-white/70">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center">
                          <FileBadge size={11} className="text-white" />
                        </div>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                          Cert. of Residency
                        </span>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {[85, 70, 78].map((w, i) => (
                          <div
                            key={i}
                            className="h-1.5 bg-gray-100 rounded-full"
                            style={{ width: `${w}%` }}
                          />
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 rounded-full">
                        <Clock size={8} className="text-amber-600" />
                        <span className="text-[8px] font-bold text-amber-700">
                          PENDING
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4 — Indigency */}
                  <div
                    className="fd absolute doc-shadow"
                    style={{ top: "0%", right: "0%", width: 150 }}
                  >
                    <div className="bg-white rounded-2xl p-4 border border-white/70">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                          <FileBadge size={11} className="text-white" />
                        </div>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                          Indigency
                        </span>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {[90, 72].map((w, i) => (
                          <div
                            key={i}
                            className="h-1.5 bg-gray-100 rounded-full"
                            style={{ width: `${w}%` }}
                          />
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                        <CheckCircle2 size={8} className="text-emerald-600" />
                        <span className="text-[8px] font-bold text-emerald-700">
                          APPROVED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 5 — Good Moral */}
                  <div
                    className="fe absolute doc-shadow"
                    style={{ bottom: "0%", right: "0%", width: 142 }}
                  >
                    <div className="bg-white rounded-2xl p-4 border border-white/70">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-purple-500 rounded-md flex items-center justify-center">
                          <FileText size={9} className="text-white" />
                        </div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                          Good Moral
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {[88, 74].map((w, i) => (
                          <div
                            key={i}
                            className="h-1.5 bg-gray-100 rounded-full"
                            style={{ width: `${w}%` }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                        <div className="h-1 bg-gray-200 rounded-full w-16" />
                        <p className="text-[7px] text-gray-400 mt-0.5">
                          Signature
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM: Download */}
              <div>
                <Link to="/download">
                  <div className="group inline-flex items-center gap-4 text-white hover:text-emerald-400 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/20 group-hover:bg-emerald-500 border border-emerald-500/30 rounded-full transition-all">
                      <Download size={17} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-300/50">
                        Available for Android
                      </p>
                      <p className="text-sm font-bold">Download Official APK</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* ══ RIGHT — Form ══════════════════════════════════════════ */}
        <main className="flex-1 min-h-screen overflow-y-auto bg-gray-100">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />
          <div className="max-w-2xl mx-auto px-5 py-12 md:px-8 md:py-16">
            <div className="text-center mb-8">
              <h2 className="df text-2xl font-bold text-gray-800">
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
              {/* ── Section 1: Account ── */}
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
                                className={`flex-1 rounded-full transition-colors duration-300 ${i < passwordStrength.score ? passwordStrength.color : "bg-gray-200"}`}
                              />
                            ))}
                          </div>
                          <p
                            className={`text-xs font-semibold ${passwordStrength.score < 3 ? "text-red-500" : "text-emerald-600"}`}
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

              {/* ── Section 2: Personal ── */}
              <SectionCard>
                <StepHeader
                  number="2"
                  title="Personal & Residency"
                  subtitle="Tell us about yourself and where you live."
                />
                <div className="space-y-4">
                  {/* First / Middle / Last — 3 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      label={
                        <span className="flex items-center gap-1">
                          Middle Name
                          <span className="text-gray-400 text-[10px] normal-case tracking-normal font-normal">
                            (optional)
                          </span>
                        </span>
                      }
                      name="mname"
                      icon={<User />}
                      placeholder="Santos"
                      value={formData.mname}
                      onChange={handleInputChange}
                      error={errors.mname}
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
                      label="House No."
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
                    options={civilStatus.map((s) => ({
                      id: s.civil_status_id,
                      label: s.status_name,
                    }))}
                    error={errors.civil_status_id}
                  />
                </div>
              </SectionCard>

              {/* ── Section 3: ID Upload ── */}
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
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${errors.id_image ? "bg-red-100" : "bg-emerald-50 group-hover:bg-emerald-100"}`}
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
                  <div className="relative border-2 border-emerald-400 bg-emerald-50/30 rounded-xl overflow-hidden flex flex-col items-center justify-center p-3">
                    <img
                      src={selectedImage}
                      alt="ID Preview"
                      className="max-h-64 w-auto object-contain"
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

              {/* ── Section 4: Security ── */}

              {/* ── Submit ── */}
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
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2.5
                    ${
                      isFormValid && !isSubmitting
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-[0.98]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Complete Registration
                    </>
                  )}
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
    </>
  );
};

export default Register;
