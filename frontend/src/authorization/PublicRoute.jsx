import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  // 1. Wait for checkAuth to finish
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  // 2. If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? "/dashboard" : "/resident"} replace />;
  }

  // 3. If NOT logged in, show the Login/Register page
  return <Outlet />;
};

export default PublicRoute;
