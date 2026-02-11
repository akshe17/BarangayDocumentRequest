import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = isAdmin() ? "/dashboard" : "/resident";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
