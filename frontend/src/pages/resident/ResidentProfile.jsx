import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
// --- IMPORT YOUR CONFIGURED API INSTANCE HERE ---
import api from "../../axious/api";
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
  AlertTriangle,
} from "lucide-react";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

const ResidentProfile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

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
  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/resident/profile/update", editedData);

      if (response.data.success) {
        const userData = response.data.user ?? response.data;

        setUser(userData);
        setIsEditing(false);
        setEditedData(null);
        triggerToast(
          response.data.message || "Profile updated successfully!",
          "success",
        );
      }
    } catch (error) {
      // --- ADD THIS LOGGING ---
      console.error("API Error Object:", error);
      if (error.response) {
        console.error("Error Data:", error.response.data);
        console.error("Error Status:", error.response.status);
      }
      // -------------------------

      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((errorArray) => {
          errorArray.forEach((errorMessage) => {
            triggerToast(errorMessage, "error");
          });
        });
      } else {
        triggerToast(
          error.response?.data?.message || "Failed to update profile",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewId(URL.createObjectURL(file));
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("File size must be less than 5MB", "error");
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      triggerToast("Only JPG, JPEG, and PNG files are allowed", "error");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("id_image", file);

    try {
      // --- USING YOUR API INSTANCE ---
      const response = await api.post("/resident/profile/upload-id", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          resident: {
            ...prevUser.resident,
            id_image_path: response.data.id_image_path,
            is_verified: response.data.is_verified,
          },
        }));
        setShowUploadModal(false);
        triggerToast(response.data.message, "success");
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((errorArray) => {
          errorArray.forEach((errorMessage) => {
            triggerToast(errorMessage, "error");
          });
        });
      } else {
        triggerToast(
          error.response?.data?.message || "Failed to upload ID",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      triggerToast("New passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      // --- USING YOUR API INSTANCE ---
      const response = await api.post(
        "/resident/profile/change-password",
        passwordData,
      );

      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
        triggerToast(response.data.message, "success");
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((errorArray) => {
          errorArray.forEach((errorMessage) => {
            triggerToast(errorMessage, "error");
          });
        });
      } else {
        triggerToast(
          error.response?.data?.message || "Failed to change password",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
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
        zone: resident.zone,
      };

  const hasValidId =
    resident.id_image_path && resident.id_image_path.trim() !== "";

  // Assumes API instance handles the base URL
  const STORAGE_URL = "http://localhost:8000";

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto relative">
      <CustomToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* HEADER SECTION */}
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

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-700/85 to-emerald-800/90"></div>

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
                disabled={isLoading}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2 disabled:opacity-50"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl text-base font-semibold hover:bg-emerald-50 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
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

      {/* BOTTOM GRID */}
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
                  src={`${STORAGE_URL}/storage/${resident.id_image_path}`}
                  alt="Valid ID Thumbnail"
                  className="w-full h-full object-cover"
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
          </div>
        </div>
      </div>

      {/* Modals and other components remain the same as previous response */}
      {showIdModal && (
        <Modal onClose={() => setShowIdModal(false)} title="Valid ID">
          <div className="p-4">
            <img
              src={`${STORAGE_URL}/storage/${resident.id_image_path}`}
              alt="Valid ID"
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
        </Modal>
      )}

      {showUploadModal && (
        <Modal
          onClose={() => {
            setShowUploadModal(false);
            setPreviewId(null);
          }}
          title="Submit Valid ID"
        >
          <div className="p-6 space-y-5">
            {/* Info */}
            <div className="flex gap-3 bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
              <AlertTriangle className="text-yellow-600" />
              <p className="text-sm text-yellow-800 font-medium">
                Please upload a clear photo of a government-issued ID.
              </p>
            </div>

            {/* Preview */}
            {previewId && (
              <img
                src={previewId}
                alt="ID Preview"
                className="w-full rounded-xl border"
              />
            )}

            {/* Upload */}
            <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition">
              {isLoading ? (
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-emerald-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">
                    Click to upload or drag image here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG • Max 5MB
                  </p>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleIdUpload}
                disabled={isLoading}
              />
            </label>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 border px-6 py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showPasswordModal && (
        <Modal
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
            {/* Current Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      current: !showPassword.current,
                    })
                  }
                  className="absolute right-3 top-3 text-gray-400"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({ ...showPassword, new: !showPassword.new })
                  }
                  className="absolute right-3 top-3 text-gray-400"
                >
                  <Eye size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.new_password_confirmation}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password_confirmation: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      confirm: !showPassword.confirm,
                    })
                  }
                  className="absolute right-3 top-3 text-gray-400"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border px-6 py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ... InputField, Modal, CustomToast components remain the same ...
const InputField = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  readOnly = false,
}) => (
  <div className="flex gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100 transition-all">
    <div className="bg-white p-4 rounded-lg h-fit border border-gray-100">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>
    <div className="flex-1">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
        {label}
      </label>
      {isEditing && !readOnly ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-base font-semibold text-gray-950 bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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

const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 shadow-xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-950">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
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
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ResidentProfile;
