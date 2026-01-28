import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import MainLayout from "./layout/MainLayout";
import Overview from "./pages/Overview";
import Documents from "./pages/Documents";
import Residents from "./pages/Residents";
import RequestTable from "./pages/RequestTable";
import AuditLogs from "./pages/AuditLogs";
import DownloadApp from "./pages/Download";

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

        {/* Protected Dashboard Route */}
        {/* We use the MainLayout as the parent wrapper */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          {/* These are the 'Outlets' inside MainLayout */}
          <Route index element={<Overview />} />
          <Route path="requests" element={<RequestTable />} />
          <Route path="residents" element={<Residents />} />
          <Route path="documents" element={<Documents />} />
          <Route path="logs" element={<AuditLogs />} />
        </Route>

        {/* Fallback Redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
