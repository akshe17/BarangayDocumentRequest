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
const App = () => {
  // Simple state to track login status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route path="/download" element={<DownloadApp />} />
        <Route path="/register" element={<Register />} />

        {/* Resident Routes */}
        <Route path="/resident" element={<ResidentLayout />}>
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

        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="requests" element={<RequestTable />} />
          <Route path="residents" element={<AdminResidents />} />
          <Route path="documents" element={<Documents />} />
          <Route path="logs" element={<AuditLogs />} />
        </Route>

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
