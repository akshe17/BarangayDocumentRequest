import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading, isAdmin, isResident } = useAuth();
  const location = useLocation();

  // 1. Wait for the server's /api/user check to finish
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  // 2. Not logged in? Go to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Page Authorization logic
  // Normalize both sides to Numbers to prevent "1" vs 1 mismatches
  const userRole = Number(user?.role_id);
  const normalizedAllowedRoles = allowedRoles.map((role) => Number(role));

  const hasAccess = normalizedAllowedRoles.includes(userRole);

  if (!hasAccess) {
    console.warn(
      `[Auth] Access Denied. User Role: ${userRole}, Required: ${normalizedAllowedRoles}`,
    );

    // Role-based "Jailing"
    if (isAdmin()) {
      return <Navigate to="/dashboard" replace />;
    }

    if (isResident()) {
      return <Navigate to="/resident" replace />;
    }

    // If role is unknown, clear session and send to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
