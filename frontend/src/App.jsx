import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./authorization/PublicRoute";
import ProtectedRoute from "./authorization/ProtectedRoute";
import { useAuth } from "./context/AuthContext"; // Import useAuth for the catch-all

// Layouts
import MainLayout from "./layout/MainLayout";
import ResidentLayout from "./layout/ResidentLayout";

// Public Pages
import LoginPage from "./pages/LoginPage";
import Register from "./pages/resident/Register";
import DownloadApp from "./pages/Download";
import Practice from "./pages/Practice";

// Admin Pages
import Overview from "./pages/Overview";
import RequestTable from "./pages/RequestTable";
import AdminResidents from "./pages/AdminResidents";
import Documents from "./pages/Documents";
import AuditLogs from "./pages/AuditLogs";
import AuthTest from "./pages/AuthTest";

// Resident Pages
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import NewRequest from "./pages/resident/NewRequest";
import ResidentHistory from "./pages/resident/ResidentHistory";
import ResidentNotification from "./pages/resident/ResidentNotification";
import ResidentProfile from "./pages/resident/ResidentProfile";

//Clerk pages
import ClerkLayout from "./layout/ClerkLayout";
import ClerkDashboard from "./pages/clerk/ClerkDashboard";
import PaymentVerification from "./pages/clerk/PaymentVerification";

//Zone Leader pages
import ZoneLeaderLayout from "./layout/ZoneLeaderLayout";
import ZoneMap from "./pages/zoneLeader/ZoneMap";
import ZoneResidentDirectory from "./pages/zoneLeader/ZoneResidentDirectory";
import ZoneLeaderDashboard from "./pages/zoneLeader/ZoneLeaderDashboard";
const App = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Block ALL routing until auth is verified
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. ROOT LOGIC */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin() ? "/dashboard" : "/resident"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 2. GUEST ONLY (Login/Register) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* 3. UTILITY (Always Public) */}
        <Route path="/download" element={<DownloadApp />} />
        <Route path="/practice" element={<Practice />} />

        {/* 4. ADMIN SECTOR (Role 1) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="test" element={<AuthTest />} />
          <Route path="requests" element={<RequestTable />} />
          <Route path="residents" element={<AdminResidents />} />
          <Route path="documents" element={<Documents />} />
          <Route path="logs" element={<AuditLogs />} />
        </Route>

        {/* 5. RESIDENT SECTOR (Role 2) */}
        <Route
          path="/resident"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <ResidentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ResidentDashboard />} />
          <Route path="new-request" element={<NewRequest />} />
          <Route path="history" element={<ResidentHistory />} />
          <Route path="notifications" element={<ResidentNotification />} />
          <Route path="profile" element={<ResidentProfile />} />
        </Route>

        <Route path="/clerk" element={<ClerkLayout />}>
          <Route path="dashboard" element={<ClerkDashboard />} />
          <Route path="payments" element={<PaymentVerification />} />
        </Route>

        <Route path="/zone-leader" element={<ZoneLeaderLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ZoneLeaderDashboard />} />
          <Route path="residents" element={<ZoneResidentDirectory />} />
          <Route path="zone-map" element={<ZoneMap />} />
        </Route>

        {/* 6. SMART CATCH-ALL */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin() ? "/dashboard" : "/resident"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
