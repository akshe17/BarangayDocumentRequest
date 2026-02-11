import React, { useState, useMemo } from "react";
import StatsCards from "../components/Request/StatsCard";
import SearchFilters from "../components/Request/SearchFilters";
import RequestsTable from "../components/Request/RequestsTable";
import ViewModal from "../components/Request/ViewModal";
const RequestTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const DOCUMENT_PRICE = 50; // Price per document in pesos

  const [requests, setRequests] = useState([
    {
      id: "REQ-001",
      resident: "Juan Luna",
      email: "juan@example.com",
      documents: [
        "Certificate of Indigency",
        "Barangay Clearance",
        "Certificate of Residency",
      ],
      date: "2 mins ago",
      dateCreated: "Jan 29, 2026",
      status: "Pending",
      purpose: "Medical assistance and employment requirements",
      avatar: "JL",
      paymentStatus: "Unpaid",
    },
    {
      id: "REQ-002",
      resident: "Andres Bonifacio",
      email: "andres@example.com",
      documents: ["Barangay Clearance"],
      date: "1 hour ago",
      dateCreated: "Jan 29, 2026",
      status: "Approved",
      purpose: "Employment requirement",
      avatar: "AB",
      paymentStatus: "Unpaid",
    },
    {
      id: "REQ-003",
      resident: "Maria Clara",
      email: "maria@example.com",
      documents: ["Certificate of Residency", "Barangay ID"],
      date: "3 hours ago",
      dateCreated: "Jan 29, 2026",
      status: "Completed",
      purpose: "School enrollment",
      avatar: "MC",
      paymentStatus: "Paid",
    },
    {
      id: "REQ-004",
      resident: "Jose Rizal",
      email: "jose@example.com",
      documents: ["Business Permit", "Barangay Clearance"],
      date: "5 hours ago",
      dateCreated: "Jan 28, 2026",
      status: "Pending",
      purpose: "New business application",
      avatar: "JR",
      paymentStatus: "Unpaid",
    },
    {
      id: "REQ-005",
      resident: "Gabriela Silang",
      email: "gabriela@example.com",
      documents: ["Barangay ID"],
      date: "1 day ago",
      dateCreated: "Jan 28, 2026",
      status: "Rejected",
      purpose: "Government transaction",
      rejectionReason: "Incomplete requirements",
      avatar: "GS",
      paymentStatus: "Unpaid",
    },
  ]);

  // Calculate total payment for a request
  const calculateTotal = (documents) => {
    return documents.length * DOCUMENT_PRICE;
  };

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.documents.some((doc) =>
          doc.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        req.status.toLowerCase().replace(" ", "") ===
          filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, requests]);

  // Handle actions
  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "Approved" } : req)),
    );
  };

  const handleReject = (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason && reason.trim()) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: "Rejected", rejectionReason: reason }
            : req,
        ),
      );
    }
  };

  const handleComplete = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Completed" } : req,
      ),
    );
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const togglePaymentStatus = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              paymentStatus: req.paymentStatus === "Paid" ? "Unpaid" : "Paid",
            }
          : req,
      ),
    );
  };

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    completed: requests.filter((r) => r.status === "Completed").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  };

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
        <RequestsTable
          filteredRequests={filteredRequests}
          calculateTotal={calculateTotal}
          handleApprove={handleApprove}
          handleReject={handleReject}
          handleComplete={handleComplete}
          handleView={handleView}
        />
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
