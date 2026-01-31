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
import ResidentHome from "./pages/ResidentHome";
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
        <Route path="/home" element={<ResidentHome />} />

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
