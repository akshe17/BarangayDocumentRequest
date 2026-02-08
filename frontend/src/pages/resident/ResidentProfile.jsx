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
} from "lucide-react";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

const ResidentProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [videoError, setVideoError] = useState(false);
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

  const handleEditClick = () => {
    setEditedData({
      first_name: resident.first_name,
      last_name: resident.last_name,
      email: email,
      house_no: resident.house_no,
      zone: resident.zone,
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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // TODO: Implement API call to change password
    console.log("Changing password");
    setShowPasswordModal(false);
    alert("Password changed successfully!");
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
        zone: resident.zone,
      };

  const hasValidId =
    resident.id_image_path && resident.id_image_path.trim() !== "";

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* HEADER SECTION - REMOVED SHADOWS */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 mb-8 overflow-hidden border border-gray-100">
        {/* Video Background - FIXED LOADING */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => {
            console.error("Video failed to load");
            setVideoError(true);
          }}
          onLoadedData={() => console.log("Video loaded successfully")}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bonbonVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-700/85 to-emerald-800/90"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {resident.first_name} {resident.last_name}
              </h1>
              <p className="text-emerald-100 text-lg font-medium">
                Resident ID: {resident.resident_id}
              </p>
              {resident.is_verified ? (
                <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold border border-white/30">
                  <Shield size={16} />
                  Verified Resident
                </div>
              ) : (
                <div className="mt-2 inline-flex items-center gap-2 bg-white backdrop-blur-sm text-red-500 px-4 py-1.5 rounded-full text-sm font-semibold border border-red-300/30">
                  <ShieldAlert size={16} />
                  Not Verified
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="bg-white cursor-pointer text-emerald-700 px-6 py-3 rounded-xl text-base font-semibold hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl text-base font-semibold hover:bg-emerald-50 transition-all flex items-center gap-2"
              >
                <Check size={18} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT GRID - REMOVED SHADOWS */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* PERSONAL INFORMATION CARD */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <User size={24} className="text-emerald-600" />
            Personal Information
          </h3>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
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

            <InputField
              icon={Mail}
              label="Email Address"
              value={displayData.email}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("email", value)}
              type="email"
            />

            <InputField
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(resident.birthdate)}
              isEditing={false}
              readOnly
            />

            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white p-5 rounded-xl ">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Gender
                </label>
                <p className="text-base font-semibold text-gray-950">
                  {getGenderLabel(resident.gender_id)}
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl ">
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

        {/* ADDRESS INFORMATION CARD */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <MapPin size={24} className="text-emerald-600" />
            Address Information
          </h3>

          <div className="space-y-5">
            <InputField
              icon={MapPin}
              label="House Number"
              value={displayData.house_no}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("house_no", value)}
            />
            <InputField
              icon={MapPin}
              label="Zone"
              value={displayData.zone}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("zone", value)}
            />

            <div className="mt-8 p-6 bg-white rounded-xl">
              <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                <MapPin size={20} className="text-emerald-600" />
                Complete Address
              </h4>
              <p className=" text-base font-semibold text-gray-950">
                {displayData.zone}, {displayData.house_no}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID - REMOVED SHADOWS */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* VALID ID CARD */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <ImageIcon size={22} className="text-emerald-600" />
            Valid ID
          </h3>

          {hasValidId ? (
            <div className="space-y-3">
              <div className="aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
                <img
                  src={`${API_URL}/storage/${resident.id_image_path}`}
                  alt="Valid ID Thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="16">Image preview</text></svg>';
                  }}
                />
              </div>
              <button
                onClick={() => setShowIdModal(true)}
                className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                View Full Image
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full text-emerald-600 hover:text-emerald-700 text-sm font-semibold hover:underline"
              >
                Resubmit ID
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">
                    No ID uploaded
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                Upload Valid ID
              </button>
            </div>
          )}
        </div>

        {/* ACCOUNT DETAILS CARD */}
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

        {/* ACCOUNT SECURITY CARD */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-950 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <Shield size={22} className="text-emerald-600" />
            Account Security
          </h3>

          <div className="space-y-4">
            <div className="bg-gray-white p-5 rounded-xl ">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Password
              </label>
              <p className="text-base font-semibold text-gray-950 mb-3">
                ••••••••
              </p>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
              >
                Change Password →
              </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-xl border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium">
                Keep your account secure by using a strong password and updating
                it regularly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMATION BANNER - REMOVED SHADOWS */}
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

      {/* Valid ID Modal - REMOVED SHADOWS */}
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

      {/* Upload ID Modal - REMOVED SHADOWS */}
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

      {/* Change Password Modal - REMOVED SHADOWS */}
      {showPasswordModal && (
        <Modal
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <form onSubmit={handlePasswordChange} className="p-6">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full text-base text-gray-950 bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full text-base text-gray-950 bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full text-base text-gray-950 bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-xs text-emerald-800 font-medium">
                  <strong>Password Requirements:</strong>
                  <br />
                  • At least 8 characters long
                  <br />
                  • Include uppercase and lowercase letters
                  <br />• Include at least one number
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-emerald-700 transition-all"
                >
                  Change Password
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

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
    <div className="flex gap-4 p-5 rounded-xl bg-white  transition-all">
      <div className="bg-white p-4 rounded-lg  h-fit">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <div className="flex-1">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
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

// Modal Component - REMOVED SHADOWS
const Modal = ({ onClose, title, children }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
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
