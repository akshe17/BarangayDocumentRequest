import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import MainLayout from "./layout/MainLayout";
import Overview from "./pages/Overview";
import Documents from "./pages/Documents";
import AdminResidents from "./pages/AdminResidents";
import RequestTable from "./pages/RequestTable";
import AuditLogs from "./pages/AuditLogs";
import DownloadApp from "./pages/Download";
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import ResidentLayout from "./layout/ResidentLayout";
import NewRequest from "./pages/resident/NewRequest";
import ResidentHistory from "./pages/resident/ResidentHistory";
import ResidentNotification from "./pages/resident/ResidentNotification";
import Register from "./pages/resident/Register";
import Practice from "./pages/Practice";
import PublicRoute from "./authorization/PublicRoute";
import ProtectedRoute from "./authorization/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/download" element={<DownloadApp />} />
          <Route path="/practice" element={<Practice />} />

          {/* Resident Routes (role_id = 2) */}
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
            <Route
              path="settings"
              element={
                <div className="p-10 text-xs font-bold uppercase">
                  Settings Page (Coming Soon)
                </div>
              }
            />
          </Route>

          {/* Admin Routes (role_id = 1) */}
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
            <Route path="residents" element={<AdminResidents />} />
            <Route path="documents" element={<Documents />} />
            <Route path="logs" element={<AuditLogs />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
