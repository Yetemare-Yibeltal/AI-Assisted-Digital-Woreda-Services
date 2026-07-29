import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/admin/StatsCard";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { ActivityLog } from "@/components/admin/ActivityLog";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { ApiResponse, DashboardOverview } from "@/types/api.types";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<DashboardOverview>>("/dashboard/overview");
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(language === "am" ? "ውሂብ መጫን አልተሳካም" : "Failed to load dashboard data");
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.message ||
          (language === "am" ? "ዳሽቦርድ መጫን አልተሳካም። እባክዎ እንደገና ይሞክሩ።" : "Failed to load dashboard. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const overview = stats?.overview;
  const statusBreakdown = stats?.statusBreakdown;
  const performance = stats?.performance;
  const notifications = stats?.notifications;

  return (
    <Container maxWidth="xl" padding="default">
      <Header
        title="Dashboard"
        titleAmharic="ዳሽቦርድ"
        description={
          language === "am"
            ? "የዳንግላ ወረዳ አገልግሎቶች አጠቃላይ እይታ"
            : "Overview of all Dangila Woreda services and applications"
        }
        onExportClick={() => {}}
        onFilterClick={() => {}}
        notificationCount={notifications?.unread || 0}
        onNotificationClick={() => navigate("/admin/notifications")}
      />

      {/* Error State */}
      {error && !loading && (
        <Alert variant="error" className="mb-6" dismissible onDismiss={() => setError(null)}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" size="sm" onClick={fetchDashboard} className="ml-4">
            {language === "am" ? "እንደገና ሞክር" : "Retry"}
          </Button>
        </Alert>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))
        ) : (
          <>
            <StatsCard
              title={language === "am" ? "ጠቅላላ ማመልከቻዎች" : "Total Applications"}
              value={overview?.applications?.total || 0}
              icon={FileText}
              color="blue"
              trend="up"
              trendValue={`+${overview?.applications?.thisMonth || 0}`}
              trendLabel={language === "am" ? "በዚህ ወር" : "this month"}
            />
            <StatsCard
              title={language === "am" ? "ተጠናቀዋል" : "Completed"}
              value={statusBreakdown?.completedToday || 0}
              icon={CheckCircle2}
              color="green"
              trend="up"
              trendValue={`${performance?.approvalRate || 0}%`}
              trendLabel={language === "am" ? "ማጽደቅ" : "approval"}
            />
            <StatsCard
              title={language === "am" ? "በመጠባበቅ ላይ" : "Pending"}
              value={statusBreakdown?.pending || 0}
              icon={Clock}
              color="yellow"
              trend={statusBreakdown?.urgentPending ? "up" : "neutral"}
              trendValue={statusBreakdown?.urgentPending ? `${statusBreakdown.urgentPending} urgent` : undefined}
            />
            <StatsCard
              title={language === "am" ? "ሰነድ ማረጋገጫ" : "Doc Verify"}
              value={statusBreakdown?.pendingDocumentVerifications || 0}
              icon={AlertCircle}
              color={statusBreakdown?.pendingDocumentVerifications ? "red" : "green"}
              trend={statusBreakdown?.pendingDocumentVerifications ? "up" : "down"}
            />
          </>
        )}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton variant="card" className="h-[400px]" />
          ) : (
            <DashboardCharts />
          )}
        </div>
        <div>
          {loading ? (
            <Skeleton variant="card" className="h-[400px]" />
          ) : (
            <ActivityLog limit={8} compact />
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {language === "am" ? "የቅርብ ጊዜ ማመልከቻዎች" : "Recent Applications"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/applications")}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {language === "am" ? "ሁሉንም ይመልከቱ" : "View All"}
          </Button>
        </div>
        <ApplicationsTable />
      </div>
    </Container>
  );
}