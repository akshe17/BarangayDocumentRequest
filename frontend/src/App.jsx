import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./authorization/PublicRoute";
import ProtectedRoute from "./authorization/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// ─── Layouts ─────────────────────────────────────────────────────────────────
import MainLayout from "./layout/MainLayout";
import ResidentLayout from "./layout/ResidentLayout";
import ClerkLayout from "./layout/ClerkLayout";
import ZoneLeaderLayout from "./layout/ZoneLeaderLayout";
import BarangayCaptainLayout from "./layout/BarangayCaptainLayout";

// ─── Role-scoped Context Providers ───────────────────────────────────────────
// Admin (role 1)
import { OverviewProvider } from "./context/OverViewContext";
import { UserManagementProvider } from "./context/UserManagementContext";
import { AdminResidentProvider } from "./context/AdminResidentContext";
import { AdminUserProvider } from "./context/AdminStaffContext";
import { ZoneProvider } from "./context/ZoneContext";

// Resident (role 2)
import { ResidentSyncProvider } from "./context/ResidentSyncContext";
import { ResidentDashboardProvider } from "./context/ResidentDashboardContext";
import { ResidentHistoryProvider } from "./context/ResidentHistoryContext";
import { ResidentNotificationsProvider } from "./context/ResidentNotificationsContext";
import { NewRequestProvider } from "./context/NewRequestContext";

// Clerk (role 3)
import { DocumentRequestProvider } from "./context/DocumentRequestContext";

// Zone Leader (role 4)
import { ZoneResidentProvider } from "./context/ZoneResidentContext";
import { ZoneClearanceProvider } from "./context/ZoneClearanceContext";

// ─── Public Pages ─────────────────────────────────────────────────────────────
import LoginPage from "./pages/LoginPage";
import Register from "./pages/resident/Register";
import DownloadApp from "./pages/Download";
import Practice from "./pages/Practice";

// ─── Admin Pages ─────────────────────────────────────────────────────────────
import Overview from "./pages/Overview";
import UserManagement from "./pages/admin/UserManagement";
import RequestTable from "./pages/RequestTable";
import AdminResidents from "./pages/AdminResidents";
import Documents from "./pages/Documents";
import AuditLogs from "./pages/AuditLogs";
import ArchivedUsers from "./pages/admin/ArchievedUsers";
import ResidentManagement from "./pages/admin/ResidentManagement";
import DocumentsManagement from "./pages/admin/DocumentsManagement";
import { AdminProfile } from "./pages/admin/AdminProfile";

// ─── Resident Pages ───────────────────────────────────────────────────────────
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import NewRequest from "./pages/resident/NewRequest";
import ResidentHistory from "./pages/resident/ResidentHistory";
import ResidentNotification from "./pages/resident/ResidentNotification";
import ResidentProfile from "./pages/resident/ResidentProfile";

// ─── Clerk Pages ──────────────────────────────────────────────────────────────
import ClerkDashboard from "./pages/clerk/ClerkDashboard";
import IncomingQueue from "./pages/clerk/IncomingQueue";
import ApprovedQueue from "./pages/clerk/ApprovedQueue";
import PickupQueue from "./pages/clerk/PickupQueue";
import CompletedRequests from "./pages/clerk/CompletedRequest";
import RejectedRequests from "./pages/clerk/RejectedRequests";
import ResidentDirectory from "./pages/clerk/ResidentDirectory";
import ClerkLogs from "./pages/clerk/ClerkLogs";
import { ClerkProfile } from "./pages/clerk/ClerkProfile";

// ─── Zone Leader Pages ────────────────────────────────────────────────────────
import ZoneLeaderDashboard from "./pages/zoneLeader/ZoneLeaderDashboard";
import PendingResidents from "./pages/zoneLeader/PendingResidents";
import VerifiedResidents from "./pages/zoneLeader/VerifiedResidents";
import RejectedResidents from "./pages/zoneLeader/RejectedResidents";
import ZoneLeaderLogs from "./pages/zoneLeader/ZoneLeaderLogs";
import ZoneMap from "./pages/zoneLeader/ZoneMap";
import ZoneClearanceQueue from "./pages/zoneLeader/ZoneClearanceQueue";
import ZoneResidentDirectory from "./pages/zoneLeader/ZoneResidentDirectory";
import { ZoneLeaaderProfile } from "./pages/zoneLeader/ZoneLeaderProfile";

// ─── Captain Pages ────────────────────────────────────────────────────────────
import CaptainDashboard from "./pages/barangayCaptain/CaptainDashboard";
import CaptainDocumentRequests from "./pages/barangayCaptain/CaptainDocumentRequest";
import { CaptainProfile } from "./pages/barangayCaptain/CaptainProfile";

// ─────────────────────────────────────────────────────────────────────────────
// Role-scoped provider wrappers
// Each wrapper only mounts (and therefore only fetches) when a user navigates
// to that role's protected section. Unauthenticated users and other roles
// never trigger these contexts.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin — wraps Overview, UserManagement, AdminResidents, Staff, and Zone data.
 * Only mounts when role_id === 1 reaches /dashboard.
 */
const AdminProviders = ({ children }) => (
  <ZoneProvider>
    <OverviewProvider>
      <UserManagementProvider>
        <AdminUserProvider>
          <AdminResidentProvider>{children}</AdminResidentProvider>
        </AdminUserProvider>
      </UserManagementProvider>
    </OverviewProvider>
  </ZoneProvider>
);

/**
 * Resident — wraps the sync orchestrator first, then each data context.
 * ResidentSyncProvider must be the outermost so the inner contexts can
 * call registerRefresh() on mount.
 * Only mounts when role_id === 2 reaches /resident.
 */
const ResidentProviders = ({ children }) => (
  <ResidentSyncProvider>
    <ResidentDashboardProvider>
      <ResidentHistoryProvider>
        <ResidentNotificationsProvider>
          <NewRequestProvider>{children}</NewRequestProvider>
        </ResidentNotificationsProvider>
      </ResidentHistoryProvider>
    </ResidentDashboardProvider>
  </ResidentSyncProvider>
);

/**
 * Clerk — only the document-request context is needed here.
 * Only mounts when role_id === 3 reaches /clerk.
 */
const ClerkProviders = ({ children }) => (
  <DocumentRequestProvider>{children}</DocumentRequestProvider>
);

/**
 * Zone Leader — resident directory + clearance queue contexts.
 * Only mounts when role_id === 4 reaches /zone-leader.
 */
const ZoneLeaderProviders = ({ children }) => (
  <ZoneResidentProvider>
    <ZoneClearanceProvider>{children}</ZoneClearanceProvider>
  </ZoneResidentProvider>
);

// Captain currently has no dedicated context — add one here when needed.
const CaptainProviders = ({ children }) => <>{children}</>;

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
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

        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/download" element={<DownloadApp />} />
        <Route path="/practice" element={<Practice />} />

        {/* ── Admin (role_id: 1) ─────────────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminProviders>
                <MainLayout />
              </AdminProviders>
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="requests" element={<RequestTable />} />
          <Route path="users-staff" element={<UserManagement />} />
          <Route path="residents" element={<ResidentManagement />} />
          <Route path="documents" element={<DocumentsManagement />} />
          <Route path="archived" element={<ArchivedUsers />} />
          <Route path="logs" element={<AuditLogs />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* ── Resident (role_id: 2) ──────────────────────────────────────── */}
        <Route
          path="/resident"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <ResidentProviders>
                <ResidentLayout />
              </ResidentProviders>
            </ProtectedRoute>
          }
        >
          <Route index element={<ResidentDashboard />} />
          <Route path="new-request" element={<NewRequest />} />
          <Route path="history" element={<ResidentHistory />} />
          <Route path="notifications" element={<ResidentNotification />} />
          <Route path="profile" element={<ResidentProfile />} />
        </Route>

        {/* ── Clerk (role_id: 3) ─────────────────────────────────────────── */}
        <Route
          path="/clerk"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <ClerkProviders>
                <ClerkLayout />
              </ClerkProviders>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClerkDashboard />} />
          <Route path="pending" element={<IncomingQueue />} />
          <Route path="approved" element={<ApprovedQueue />} />
          <Route path="pickup" element={<PickupQueue />} />
          <Route path="completed" element={<CompletedRequests />} />
          <Route path="rejected" element={<RejectedRequests />} />
          <Route path="residents" element={<ResidentDirectory />} />
          <Route path="requests" element={<RequestTable />} />
          <Route path="logs" element={<ClerkLogs />} />
          <Route path="profile" element={<ClerkProfile />} />
        </Route>

        {/* ── Zone Leader (role_id: 4) ───────────────────────────────────── */}
        <Route
          path="/zone-leader"
          element={
            <ProtectedRoute allowedRoles={[4]}>
              <ZoneLeaderProviders>
                <ZoneLeaderLayout />
              </ZoneLeaderProviders>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ZoneLeaderDashboard />} />
          <Route path="pending" element={<PendingResidents />} />
          <Route path="verified" element={<VerifiedResidents />} />
          <Route path="rejected" element={<RejectedResidents />} />
          <Route path="logs" element={<ZoneLeaderLogs />} />
          <Route path="zone-map" element={<ZoneMap />} />
          <Route path="clearance-queue" element={<ZoneClearanceQueue />} />
          <Route path="profile" element={<ZoneLeaaderProfile />} />
        </Route>

        {/* ── Captain (role_id: 5) ───────────────────────────────────────── */}
        <Route
          path="/captain"
          element={
            <ProtectedRoute allowedRoles={[5]}>
              <CaptainProviders>
                <BarangayCaptainLayout />
              </CaptainProviders>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CaptainDashboard />} />
          <Route path="requests" element={<CaptainDocumentRequests />} />
          <Route path="profile" element={<CaptainProfile />} />
        </Route>

        {/* ── Catch-all ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
