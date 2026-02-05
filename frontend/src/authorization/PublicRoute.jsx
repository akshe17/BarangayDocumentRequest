import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  // 1. MUST BE FIRST: Don't redirect or show the page until checkAuth is done
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  // 2. If authenticated, move them away from Login/Register
  if (isAuthenticated) {
    const destination = isAdmin() ? "/dashboard" : "/resident";
    return <Navigate to={destination} replace />;
  }

  // 3. Otherwise, show Login/Register
  return <Outlet />;
};

export default PublicRoute;
