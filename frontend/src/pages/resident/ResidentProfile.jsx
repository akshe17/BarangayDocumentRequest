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
  FileText,
  Clock,
  X,
  Check,
  Image as ImageIcon,
  Upload,
  Eye,
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
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-600 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  const { resident, email } = user;

  // Initialize edit data when entering edit mode
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
    // TODO: Implement API call to save changes
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
      // TODO: Implement API call to upload ID
      console.log("Uploading ID:", file);
      setShowUploadModal(false);
      alert("Valid ID submitted successfully! Pending verification.");
    }
  };

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get gender label
  const getGenderLabel = (genderId) => {
    const genders = { 1: "Male", 2: "Female", 3: "Other" };
    return genders[genderId] || "Not specified";
  };

  // Get civil status label
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight">
            Account Profile
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Manage your personal information and account settings
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Check size={18} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - Profile Card */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center h-fit">
          {/* Large Profile Icon */}
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 mb-6 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
            <User className="w-24 h-24 text-emerald-600" strokeWidth={1.5} />
          </div>

          <h2 className="text-2xl font-bold text-gray-950">
            {resident.first_name} {resident.last_name}
          </h2>

          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200">
            <Shield size={16} />
            Verified Resident
          </div>

          <div className="mt-8 w-full space-y-4">
            {/* Valid ID Section */}
            <div className="text-left bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <ImageIcon size={18} />
                <span className="font-bold text-sm">Valid ID</span>
              </div>

              {hasValidId ? (
                <button
                  onClick={() => setShowIdModal(true)}
                  className="w-full bg-white text-blue-700 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all border border-blue-200 flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Valid ID
                </button>
              ) : (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Upload Valid ID
                </button>
              )}

              {hasValidId && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full mt-2 text-blue-600 hover:text-blue-700 text-xs font-semibold hover:underline"
                >
                  Resubmit ID
                </button>
              )}
            </div>

            {/* Resident Information */}
            <div className="text-left bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <FileText size={18} />
                <span className="font-bold text-sm">Resident Information</span>
              </div>
              <div className="space-y-2">
                <InfoRow label="Resident ID" value={resident.resident_id} />
                <InfoRow
                  label="Gender"
                  value={getGenderLabel(resident.gender_id)}
                />
                <InfoRow
                  label="Civil Status"
                  value={getCivilStatusLabel(resident.civil_status_id)}
                />
              </div>
            </div>

            {/* Account Details */}
            <div className="text-left bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Clock size={18} />
                <span className="font-bold text-sm">Account Details</span>
              </div>
              <div className="space-y-2">
                <InfoRow label="Created" value={formatDate(user.created_at)} />
                <InfoRow
                  label="Last Updated"
                  value={formatDate(user.updated_at || user.created_at)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Personal Information */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-950 mb-8 flex items-center gap-3">
            <User size={24} className="text-emerald-600" />
            Personal Information
          </h3>

          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              <InputField
                icon={User}
                label="First Name"
                value={displayData.first_name}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("first_name", value)}
              />
              <InputField
                icon={User}
                label="Last Name"
                value={displayData.last_name}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("last_name", value)}
              />
            </div>

            {/* Contact Information */}
            <InputField
              icon={Mail}
              label="Email Address"
              value={displayData.email}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("email", value)}
              type="email"
            />

            {/* Birthdate - Read Only */}
            <InputField
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(resident.birthdate)}
              isEditing={false}
              readOnly
            />

            {/* Address Fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              <InputField
                icon={MapPin}
                label="House Number"
                value={displayData.house_no}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("house_no", value)}
              />
              <InputField
                icon={MapPin}
                label="Street"
                value={displayData.street}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("street", value)}
              />
            </div>

            {/* Security Section */}
            {!isEditing && (
              <div className="pt-8 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-emerald-600" />
                  Account Security
                </h4>
                <button className="text-base text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  Change Password →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info Banner */}
      {!isEditing && (
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-blue-900 mb-2">
              Need to update your government ID or other documents?
            </h4>
            <p className="text-sm text-blue-700">
              Please visit the barangay office or contact support to update
              sensitive information like birthdate, gender, or civil status.
            </p>
          </div>
        </div>
      )}

      {/* Valid ID Modal */}
      {showIdModal && (
        <Modal onClose={() => setShowIdModal(false)} title="Valid ID">
          <div className="p-4">
            <img
              src={`${API_URL}/storage/${resident.id_image_path}`}
              alt="Valid ID"
              className="w-full h-auto rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="16">Image not found</text></svg>';
              }}
            />
          </div>
        </Modal>
      )}

      {/* Upload ID Modal */}
      {showUploadModal && (
        <Modal
          onClose={() => setShowUploadModal(false)}
          title="Upload Valid ID"
        >
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Please upload a clear photo of your valid government-issued ID
              (e.g., National ID, Driver's License, Passport).
            </p>

            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500 font-semibold">
                  <span className="text-emerald-600">Click to upload</span> or
                  drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG or JPEG (MAX. 5MB)
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
        </Modal>
      )}
    </div>
  );
};

// Info Row Component
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-500 font-medium">{label}:</span>
    <span className="text-gray-900 font-semibold">{value}</span>
  </div>
);

// Reusable Input Field Component
const InputField = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  readOnly = false,
}) => {
  return (
    <div className="flex gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:border-gray-200">
      <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <div className="flex-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          {label}
        </label>
        {isEditing && !readOnly ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base font-semibold text-gray-950 bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        ) : (
          <p className="text-base font-semibold text-gray-950">{value}</p>
        )}
        {readOnly && (
          <p className="text-xs text-gray-400 mt-1">Cannot be edited online</p>
        )}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ onClose, title, children }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-950">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-600" />
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
