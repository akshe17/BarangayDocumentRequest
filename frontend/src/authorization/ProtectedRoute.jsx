import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading, isAdmin, isResident } = useAuth();
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
  const hasAccess = allowedRoles.map(Number).includes(userRole);

  if (!hasAccess) {
    const homePath = isAdmin() ? "/dashboard" : "/resident";
    return <Navigate to={homePath} replace />;
  }

  return children;
};
export default ProtectedRoute;
