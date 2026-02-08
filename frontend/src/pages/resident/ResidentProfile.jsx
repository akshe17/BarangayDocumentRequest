import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Loader2,
  Edit2,
  Shield,
  ShieldAlert,
  FileText,
  Clock,
  X,
  Check,
  Image as ImageIcon,
  Upload,
  Eye,
  AlertCircle,
  Building2,
} from "lucide-react";

const ResidentProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const API_URL = "http://localhost:8000";

  if (!user || !user.resident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
          <p className="text-sm text-gray-700 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  const { resident, email } = user;

  const handleEditClick = () => {
    setEditedData({
      first_name: resident.first_name,
      last_name: resident.last_name,
      email: email,
      house_no: resident.house_no,
      street: resident.street,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedData(null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    console.log("Saving changes:", editedData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Uploading ID:", file);
      setShowUploadModal(false);
      alert("Valid ID submitted successfully! Pending verification.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGenderLabel = (genderId) => {
    const genders = { 1: "Male", 2: "Female", 3: "Other" };
    return genders[genderId] || "Not specified";
  };

  const getCivilStatusLabel = (statusId) => {
    const statuses = {
      1: "Single",
      2: "Married",
      3: "Divorced",
      4: "Widowed",
    };
    return statuses[statusId] || "Not specified";
  };

  const displayData = isEditing
    ? editedData
    : {
        first_name: resident.first_name,
        last_name: resident.last_name,
        email: email,
        house_no: resident.house_no,
        street: resident.street,
      };

  const hasValidId =
    resident.id_image_path && resident.id_image_path.trim() !== "";

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* OFFICIAL GOVERNMENT HEADER */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b-4 border-yellow-500 mb-8 -mx-4 px-4 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white p-3 rounded-full shadow-md">
              <Building2 className="w-8 h-8 text-blue-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">
                BARANGAY RESIDENT INFORMATION SYSTEM
              </h1>
              <p className="text-blue-200 text-sm font-medium mt-1">
                Republic of the Philippines | Official Government Portal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            RESIDENT PROFILE
          </h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Official record and account information
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-bold hover:bg-blue-800 transition-colors shadow-md border border-blue-800 flex items-center gap-2 uppercase tracking-wide"
          >
            <Edit2 size={16} />
            Edit Information
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-md text-sm font-bold hover:bg-gray-300 transition-colors border border-gray-400 flex items-center gap-2 uppercase tracking-wide"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-bold hover:bg-blue-800 transition-colors shadow-md border border-blue-800 flex items-center gap-2 uppercase tracking-wide"
            >
              <Check size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Official Profile Card */}
        <div className="bg-white border-2 border-gray-300 shadow-lg h-fit">
          {/* Official Header Stripe */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 h-3"></div>

          <div className="p-8 flex flex-col items-center text-center">
            {/* Official Photo Frame */}
            <div className="relative mb-6">
              <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-blue-900 shadow-xl flex items-center justify-center">
                <User className="w-24 h-24 text-blue-900" strokeWidth={2} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 p-2 rounded-full border-2 border-white shadow-md">
                <Shield size={20} className="text-blue-900" />
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              {resident.first_name} {resident.last_name}
            </h2>

            {/* Verification Badge */}
            {resident.is_verified ? (
              <div className="mt-4 bg-green-50 border-2 border-green-600 text-green-800 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} />
                Verified Resident
              </div>
            ) : (
              <div className="mt-4 bg-red-50 border-2 border-red-600 text-red-800 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={16} />
                Pending Verification
              </div>
            )}

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            <div className="w-full space-y-4">
              {/* Valid ID Section */}
              <div className="text-left bg-blue-50 border-2 border-blue-300 p-4">
                <div className="flex items-center gap-2 text-blue-900 mb-3 pb-2 border-b border-blue-200">
                  <ImageIcon size={16} />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Government-Issued ID
                  </span>
                </div>

                {hasValidId ? (
                  <>
                    <button
                      onClick={() => setShowIdModal(true)}
                      className="w-full bg-white text-blue-900 px-4 py-2.5 text-xs font-bold hover:bg-blue-50 transition-colors border-2 border-blue-400 flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <Eye size={14} />
                      View Document
                    </button>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="w-full mt-2 text-blue-800 hover:text-blue-900 text-xs font-bold hover:underline uppercase tracking-wide"
                    >
                      Resubmit Document
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full bg-blue-700 text-white px-4 py-2.5 text-xs font-bold hover:bg-blue-800 transition-colors border-2 border-blue-900 flex items-center justify-center gap-2 uppercase tracking-wide shadow-md"
                  >
                    <Upload size={14} />
                    Upload Document
                  </button>
                )}
              </div>

              {/* Resident Information */}
              <div className="text-left bg-gray-50 border-2 border-gray-300 p-4">
                <div className="flex items-center gap-2 text-gray-800 mb-3 pb-2 border-b border-gray-300">
                  <FileText size={16} />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Resident Data
                  </span>
                </div>
                <div className="space-y-2.5">
                  <OfficialInfoRow
                    label="Resident ID"
                    value={resident.resident_id}
                  />
                  <OfficialInfoRow
                    label="Gender"
                    value={getGenderLabel(resident.gender_id)}
                  />
                  <OfficialInfoRow
                    label="Civil Status"
                    value={getCivilStatusLabel(resident.civil_status_id)}
                  />
                </div>
              </div>

              {/* Account Details */}
              <div className="text-left bg-gray-50 border-2 border-gray-300 p-4">
                <div className="flex items-center gap-2 text-gray-800 mb-3 pb-2 border-b border-gray-300">
                  <Clock size={16} />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Record Metadata
                  </span>
                </div>
                <div className="space-y-2.5">
                  <OfficialInfoRow
                    label="Created"
                    value={formatDate(user.created_at)}
                  />
                  <OfficialInfoRow
                    label="Last Modified"
                    value={formatDate(user.updated_at || user.created_at)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Official Footer Stripe */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2"></div>
        </div>

        {/* RIGHT COLUMN - Personal Information */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-300 shadow-lg">
          {/* Official Header Stripe */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 h-3"></div>

          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-300 flex items-center gap-3 uppercase tracking-wide">
              <User size={22} className="text-blue-900" />
              Personal Information
            </h3>

            <div className="space-y-5">
              {/* Name Fields */}
              <div className="grid sm:grid-cols-2 gap-5">
                <OfficialInputField
                  icon={User}
                  label="First Name"
                  value={displayData.first_name}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange("first_name", value)}
                />
                <OfficialInputField
                  icon={User}
                  label="Last Name"
                  value={displayData.last_name}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange("last_name", value)}
                />
              </div>

              {/* Contact Information */}
              <OfficialInputField
                icon={Mail}
                label="Email Address"
                value={displayData.email}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("email", value)}
                type="email"
              />

              {/* Birthdate - Read Only */}
              <OfficialInputField
                icon={Calendar}
                label="Date of Birth"
                value={formatDate(resident.birthdate)}
                isEditing={false}
                readOnly
              />

              {/* Address Fields */}
              <div className="grid sm:grid-cols-2 gap-5">
                <OfficialInputField
                  icon={MapPin}
                  label="House Number"
                  value={displayData.house_no}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange("house_no", value)}
                />
                <OfficialInputField
                  icon={MapPin}
                  label="Street"
                  value={displayData.street}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange("street", value)}
                />
              </div>

              {/* Security Section */}
              {!isEditing && (
                <div className="pt-6 mt-6 border-t-2 border-gray-300">
                  <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Shield size={18} className="text-blue-900" />
                    Account Security
                  </h4>
                  <button className="text-sm text-blue-700 hover:text-blue-900 font-bold hover:underline uppercase tracking-wide">
                    Change Password →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Official Footer Stripe */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2"></div>
        </div>
      </div>

      {/* Official Notice Banner */}
      {!isEditing && (
        <div className="mt-6 bg-amber-50 border-l-4 border-amber-600 p-5 flex items-start gap-4 shadow-md">
          <div className="bg-amber-100 p-2.5 rounded">
            <AlertCircle size={20} className="text-amber-700" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900 mb-1.5 uppercase tracking-wide">
              Important Notice
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              To update sensitive information such as birthdate, gender, civil
              status, or government-issued documents, please visit the barangay
              office in person with valid identification. For assistance,
              contact the Records Management Office.
            </p>
          </div>
        </div>
      )}

      {/* Valid ID Modal */}
      {showIdModal && (
        <OfficialModal
          onClose={() => setShowIdModal(false)}
          title="Government-Issued ID"
        >
          <div className="p-6">
            <img
              src={`${API_URL}/storage/${resident.id_image_path}`}
              alt="Valid ID"
              className="w-full h-auto border-2 border-gray-300 shadow-lg"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="16">Image not found</text></svg>';
              }}
            />
          </div>
        </OfficialModal>
      )}

      {/* Upload ID Modal */}
      {showUploadModal && (
        <OfficialModal
          onClose={() => setShowUploadModal(false)}
          title="Upload Government-Issued ID"
        >
          <div className="p-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium">
                Please upload a clear, legible photograph or scan of your valid
                government-issued identification document (e.g., National ID,
                Driver's License, Passport, PhilHealth ID).
              </p>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-gray-400 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-16 h-16 text-blue-700 mb-4" />
                <p className="mb-2 text-sm text-gray-700 font-bold uppercase tracking-wide">
                  <span className="text-blue-700">
                    Click to Upload Document
                  </span>
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Accepted formats: PNG, JPG, JPEG (Maximum file size: 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleIdUpload}
              />
            </label>
          </div>
        </OfficialModal>
      )}
    </div>
  );
};

// Official Info Row Component
const OfficialInfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start text-xs border-b border-gray-200 pb-2">
    <span className="text-gray-600 font-bold uppercase tracking-wider w-1/2">
      {label}:
    </span>
    <span className="text-gray-900 font-semibold text-right w-1/2">
      {value}
    </span>
  </div>
);

// Official Input Field Component
const OfficialInputField = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  readOnly = false,
}) => {
  return (
    <div className="border-2 border-gray-300 bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-white" />
        <label className="text-xs font-bold text-white uppercase tracking-wider">
          {label}
        </label>
      </div>
      <div className="p-4 bg-white">
        {isEditing && !readOnly ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm font-semibold text-gray-900 bg-white border-2 border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
          />
        ) : (
          <p className="text-sm font-semibold text-gray-900">{value}</p>
        )}
        {readOnly && (
          <p className="text-xs text-red-700 mt-2 font-medium uppercase tracking-wide">
            ⚠ Cannot be modified online
          </p>
        )}
      </div>
    </div>
  );
};

// Official Modal Component
const OfficialModal = ({ onClose, title, children }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-4 border-blue-900">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center justify-between border-b-4 border-yellow-500">
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResidentProfile;
