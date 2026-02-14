import React from "react";
import { Mail, Clock, ShieldCheck } from "lucide-react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const PendingVerification = ({ email }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 ">
          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-emerald-950 text-xl font-black tracking-tight">
              Barangay Bonbon
            </h1>
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mt-1">
              Document Request System
            </p>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock size={48} className="text-amber-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <ShieldCheck size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Account Pending Verification
            </h2>
            <p className="text-gray-600 text-xs leading-relaxed mb-6">
              Your account is currently awaiting verification by our
              administrators. We'll notify you shortly once your account has
              been verified.
            </p>

            {/* Email Display */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200">
              <div className="flex items-center justify-center gap-3">
                <Mail size={20} className="text-emerald-700" />
                <span className="text-emerald-900 font-bold text-sm">
                  {email}
                </span>
              </div>
              <p className="text-emerald-700 text-xs mt-2 font-medium">
                We'll send updates to this email address
              </p>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4 mb-6">
            <h3 className="text-blue-900 font-bold text-sm mb-2 flex items-center gap-2">
              <ShieldCheck size={16} />
              What happens next?
            </h3>
            <ul className="text-blue-800 text-xs space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Our team will review your registration details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>You'll receive an email notification once verified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Verification typically takes 24-48 hours</span>
              </li>
            </ul>
          </div>

          {/* Back to Login Button */}
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95"
          >
            Back to Login
          </Link>

          {/* Help Text */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Need help?{" "}
            <a
              href="mailto:support@barangaybonbon.gov.ph"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingVerification;
