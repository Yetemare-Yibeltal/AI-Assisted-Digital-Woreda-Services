import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { storage } from "@/utils/storage";

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = !!storage.getAccessToken();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;