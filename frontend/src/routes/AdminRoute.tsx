import React from "react";
import { Navigate } from "react-router-dom";
import { storage } from "@/utils/storage";

export function AdminRoute({ children }: { children?: React.ReactNode }) {
  const user = storage.getUser<{ role: string }>();

  if (!user || !["super_admin", "admin", "officer", "viewer"].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;