import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const HomePage = lazy(() => import("@/app/HomePage"));
const ServicesPage = lazy(() => import("@/app/ServicesPage"));
const ServiceDetailPage = lazy(() => import("@/app/ServiceDetailPage"));
const ApplyPage = lazy(() => import("@/app/ApplyPage"));
const TrackPage = lazy(() => import("@/app/TrackPage"));
const AdminLoginPage = lazy(() => import("@/app/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("@/app/AdminDashboardPage"));
const AdminApplicationsPage = lazy(() => import("@/app/AdminApplicationsPage"));
const AdminApplicationDetailPage = lazy(() => import("@/app/AdminApplicationDetailPage"));
const AdminServicesPage = lazy(() => import("@/app/AdminServicesPage"));
const AdminSettingsPage = lazy(() => import("@/app/AdminSettingsPage"));
const NotFoundPage = lazy(() => import("@/app/NotFoundPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" />
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/apply/:slug" element={<ApplyPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/applications/:id" element={<AdminApplicationDetailPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;