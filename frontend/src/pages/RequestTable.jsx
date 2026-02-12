import React, { useState, useEffect } from "react";
import StatsCards from "../components/Request/StatsCard";
import SearchFilters from "../components/Request/SearchFilters";
import RequestsTable from "../components/Request/RequestsTable";
import ViewModal from "../components/Request/ViewModal";
import api from "../axious/api";

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const DOCUMENT_PRICE = 50; // Price per document in pesos

  // ========================================
  // API FUNCTIONS
  // ========================================

  /**
   * Fetch all document requests
   */
  const fetchDocumentRequests = async (status = "all") => {
    try {
      const params = {};
      if (status !== "all") params.status = status;

      const response = await api.get("/admin/document-requests", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching document requests:", error);
      throw error;
    }
  };

  /**
   * Fetch statistics
   */
  const fetchStats = async () => {
    try {
      console.log("Fetching stats from: /admin/document-requests/stats");
      const response = await api.get("/admin/document-requests/stats");
      console.log("Stats response:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
      });
      throw error;
    }
  };

  /**
   * Approve a document request
   */
  const approveRequest = async (id) => {
    try {
      const response = await api.put(`/admin/document-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving request:", error);
      throw error;
    }
  };

  /**
   * Reject a document request
   */
  const rejectRequest = async (id, rejectionReason) => {
    try {
      const response = await api.put(`/admin/document-requests/${id}/reject`, {
        rejection_reason: rejectionReason,
      });
      return response.data;
    } catch (error) {
      console.error("Error rejecting request:", error);
      throw error;
    }
  };

  /**
   * Complete a document request
   */
  const completeRequest = async (id) => {
    try {
      const response = await api.put(`/admin/document-requests/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error("Error completing request:", error);
      throw error;
    }
  };

  /**
   * Toggle payment status
   */
  const togglePaymentStatusAPI = async (id) => {
    try {
      const response = await api.put(`/document-requests/${id}/toggle-payment`);
      return response.data;
    } catch (error) {
      console.error("Error toggling payment status:", error);
      throw error;
    }
  };

  /**
   * Extract numeric ID from "REQ-001" format
   */
  const extractNumericId = (id) => {
    return parseInt(id.replace("REQ-", ""));
  };

  // ========================================
  // COMPONENT LOGIC
  // ========================================

  // Fetch requests on component mount
  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  // Fetch requests when filter status changes
  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  // Client-side search filtering
  useEffect(() => {
    filterRequestsLocally();
  }, [searchTerm, requests]);

  /**
   * Load all document requests from the API
   */
  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDocumentRequests(filterStatus);

      if (data.success) {
        setRequests(data.data);
        setFilteredRequests(data.data);
      } else {
        setError(data.message || "Failed to fetch requests");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error connecting to server. Please try again.",
      );
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load statistics for dashboard cards
   */
  const loadStats = async () => {
    try {
      const data = await fetchStats();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  /**
   * Client-side filtering for search
   */
  const filterRequestsLocally = () => {
    if (!searchTerm.trim()) {
      setFilteredRequests(requests);
      return;
    }

    const filtered = requests.filter((req) => {
      const matchesSearch =
        req.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.documents.some((doc) =>
          doc.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    setFilteredRequests(filtered);
  };

  /**
   * Calculate total payment for a request
   */
  const calculateTotal = (documents) => {
    return documents.length * DOCUMENT_PRICE;
  };

  /**
   * Handle approve request
   */
  const handleApprove = async (id) => {
    try {
      const numericId = extractNumericId(id);
      const data = await approveRequest(numericId);

      if (data.success) {
        await loadRequests();
        await loadStats();
        alert("✅ Request approved successfully!");
      } else {
        alert(`❌ Failed to approve request: ${data.message}`);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert(
        `❌ ${error.response?.data?.message || "Failed to approve request. Please try again."}`,
      );
    }
  };

  /**
   * Handle reject request
   */
  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");

    if (!reason || !reason.trim()) {
      return; // User cancelled or entered empty reason
    }

    try {
      const numericId = extractNumericId(id);
      const data = await rejectRequest(numericId, reason);

      if (data.success) {
        await loadRequests();
        await loadStats();
        alert("✅ Request rejected successfully!");
      } else {
        alert(`❌ Failed to reject request: ${data.message}`);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(
        `❌ ${error.response?.data?.message || "Failed to reject request. Please try again."}`,
      );
    }
  };

  /**
   * Handle complete request
   */
  const handleComplete = async (id) => {
    try {
      const numericId = extractNumericId(id);
      const data = await completeRequest(numericId);

      if (data.success) {
        await loadRequests();
        await loadStats();
        alert("✅ Request marked as completed!");
      } else {
        alert(`❌ Failed to complete request: ${data.message}`);
      }
    } catch (error) {
      console.error("Error completing request:", error);
      alert(
        `❌ ${error.response?.data?.message || "Failed to complete request. Please try again."}`,
      );
    }
  };

  /**
   * Handle view request details
   */
  const handleView = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  /**
   * Toggle payment status between Paid/Unpaid
   */
  const togglePaymentStatus = async (id) => {
    try {
      const numericId = extractNumericId(id);
      const data = await togglePaymentStatusAPI(numericId);

      if (data.success) {
        // Update local state optimistically
        const updatePaymentStatus = (req) =>
          req.id === id
            ? {
                ...req,
                paymentStatus: req.paymentStatus === "Paid" ? "Unpaid" : "Paid",
              }
            : req;

        setRequests((prev) => prev.map(updatePaymentStatus));
        setFilteredRequests((prev) => prev.map(updatePaymentStatus));

        // Update selected request if it's open in modal
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest({
            ...selectedRequest,
            paymentStatus:
              selectedRequest.paymentStatus === "Paid" ? "Unpaid" : "Paid",
          });
        }
      } else {
        alert(`❌ Failed to update payment status: ${data.message}`);
      }
    } catch (error) {
      console.error("Error toggling payment status:", error);
      alert(
        `❌ ${error.response?.data?.message || "Failed to update payment status. Please try again."}`,
      );
    }
  };

  /**
   * Refresh all data
   */
  const refreshData = () => {
    loadRequests();
    loadStats();
  };

  // ========================================
  // RENDER
  // ========================================

  // Loading state
  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">
            Loading requests...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <div className="bg-red-100 text-red-600 p-6 rounded-lg mb-4">
            <p className="font-bold text-lg mb-2">⚠️ Error Loading Data</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={loadRequests}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-lg"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Document Requests
        </h1>
        <p className="text-gray-500">
          Review and manage resident document requests
        </p>

        {/* Refresh button */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "⏳ Refreshing..." : "🔄 Refresh Data"}
        </button>
      </div>

      {/* STATS CARDS */}
      <StatsCards stats={stats} setFilterStatus={setFilterStatus} />

      {/* MAIN TABLE CARD */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* SEARCH & FILTERS BAR */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          stats={stats}
        />

        {/* TABLE */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <RequestsTable
            filteredRequests={filteredRequests}
            calculateTotal={calculateTotal}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleComplete={handleComplete}
            handleView={handleView}
          />
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedRequest && (
        <ViewModal
          selectedRequest={selectedRequest}
          setShowViewModal={setShowViewModal}
          handleApprove={handleApprove}
          handleReject={handleReject}
          handleComplete={handleComplete}
          togglePaymentStatus={togglePaymentStatus}
          calculateTotal={calculateTotal}
          DOCUMENT_PRICE={DOCUMENT_PRICE}
        />
      )}
    </div>
  );
};

export default RequestTable;
