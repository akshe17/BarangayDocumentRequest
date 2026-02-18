import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./authorization/PublicRoute";
import ProtectedRoute from "./authorization/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./layout/MainLayout";
import ResidentLayout from "./layout/ResidentLayout";
import ClerkLayout from "./layout/ClerkLayout";
import ZoneLeaderLayout from "./layout/ZoneLeaderLayout";
import BarangayCaptainLayout from "./layout/BarangayCaptainLayout";
// Public Pages
import LoginPage from "./pages/LoginPage";
import Register from "./pages/resident/Register";
import DownloadApp from "./pages/Download";
import Practice from "./pages/Practice";

// Pages
import Overview from "./pages/Overview";
import UserManagement from "./pages/admin/UserManagement";
import RequestTable from "./pages/RequestTable";
import AdminResidents from "./pages/AdminResidents";
import Documents from "./pages/Documents";
import AuditLogs from "./pages/AuditLogs";
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import NewRequest from "./pages/resident/NewRequest";
import ResidentHistory from "./pages/resident/ResidentHistory";
import ResidentNotification from "./pages/resident/ResidentNotification";
import ResidentProfile from "./pages/resident/ResidentProfile";
import ClerkDashboard from "./pages/clerk/ClerkDashboard";
import ZoneMap from "./pages/zoneLeader/ZoneMap";
import ZoneResidentDirectory from "./pages/zoneLeader/ZoneResidentDirectory";
import ZoneLeaderDashboard from "./pages/zoneLeader/ZoneLeaderDashboard";
import ZoneLeaderLogs from "./pages/zoneLeader/ZoneLeaderLogs";
import CaptainDashboard from "./pages/barangayCaptain/CaptainDashboard";
import CaptainDocumentRequests from "./pages/barangayCaptain/CaptainDocumentRequest";
import { AdminProfile } from "./pages/admin/AdminProfile";
const App = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  const getHomeRoute = () => {
    if (!isAuthenticated) return "/login";

    const role = Number(user?.role_id);
    if (role === 1) return "/dashboard";
    if (role === 2) return "/resident";
    if (role === 3) return "/clerk/dashboard";
    if (role === 4) return "/zone-leader/dashboard";
    if (role === 5) return "/captain/dashboard";

    return "/login";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/download" element={<DownloadApp />} />
        <Route path="/practice" element={<Practice />} />

        {/* Admin Routes (role_id: 1) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="requests" element={<RequestTable />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="residents" element={<AdminResidents />} />
          <Route path="documents" element={<Documents />} />
          <Route path="logs" element={<AuditLogs />} />
          <Route path="profile/*" element={<AdminProfile />} />
        </Route>

        {/* Resident Routes (role_id: 2) */}
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

        {/* Clerk Routes (role_id: 3) */}
        <Route
          path="/clerk"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <ClerkLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClerkDashboard />} />
          <Route path="requests" element={<RequestTable />} />
          <Route path="logs" element={<AuditLogs />} />
        </Route>

        {/* Zone Leader Routes (role_id: 4) */}
        <Route
          path="/zone-leader"
          element={
            <ProtectedRoute allowedRoles={[4]}>
              <ZoneLeaderLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ZoneLeaderDashboard />} />
          <Route path="residents" element={<ZoneResidentDirectory />} />
          <Route path="logs" element={<ZoneLeaderLogs />} />
          <Route path="zone-map" element={<ZoneMap />} />
        </Route>

        {/* Captain Routes (role_id: 5) */}
        <Route
          path="/captain"
          element={
            <ProtectedRoute allowedRoles={[5]}>
              <BarangayCaptainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CaptainDashboard />} />
          <Route path="requests" element={<CaptainDocumentRequests />} />
          {/* Add other captain routes here */}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
