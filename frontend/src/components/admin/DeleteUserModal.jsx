import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

const DeleteUserModal = ({ isOpen, onClose, onConfirm, user }) => {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex items-end sm:items-center justify-center min-h-screen">
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="relative inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full rounded-t-3xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            <div className="bg-white p-5 sm:p-8 pb-safe">
              {/* Mobile drag handle */}
              <div className="flex justify-center mb-3 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h3
                  id="delete-modal-title"
                  className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight pr-2"
                >
                  Delete User
                </h3>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 -mt-1"
                  aria-label="Close modal"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-5 sm:space-y-6">
                <div className="text-center py-4">
                  {/* Warning Icon */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
                    <AlertTriangle
                      size={32}
                      className="sm:w-10 sm:h-10 text-red-600"
                    />
                  </div>

                  {/* Warning Title */}
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                    Are you absolutely sure?
                  </h4>

                  {/* Warning Message */}
                  <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                    You are about to permanently delete{" "}
                    <span className="font-bold text-gray-900">
                      {user?.name}
                    </span>{" "}
                    ({user?.email}).
                  </p>

                  {/* Danger Alert Box */}
                  <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs sm:text-sm text-red-800 font-semibold">
                      ⚠️ This action cannot be undone
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl text-white font-semibold transition-all  shadow-md bg-gradient-to-r from-red-600 to-red-500 bg-emerald-500 hover:shadow-lg"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
