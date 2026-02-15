import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = Number(user.role_id);
  // Ensure allowedRoles are treated as numbers for strict comparison
  const hasAccess = allowedRoles.map(Number).includes(userRole);

  if (!hasAccess) {
    // Redirect to a safe default based on their actual role
    let homePath = "/login";
    if (userRole === 1) homePath = "/dashboard";
    else if (userRole === 2) homePath = "/resident";
    else if (userRole === 3) homePath = "/clerk/dashboard";
    else if (userRole === 4) homePath = "/zone-leader/dashboard";
    else if (userRole === 5) homePath = "/captain/dashboard";

    return <Navigate to={homePath} replace />;
  }

  return children;
};
export default ProtectedRoute;
