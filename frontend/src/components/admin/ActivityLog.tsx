import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  UserPlus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  Filter,
  ChevronDown,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/utils/formatters";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { ApiResponse, PaginatedResponse, PaginationMeta } from "@/types/api.types";

interface AuditLogEntry {
  _id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  resourceName: string;
  details: string;
  status: "success" | "failure" | "warning";
  ipAddress: string;
  timestamp: string;
}

interface ActivityLogProps {
  className?: string;
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

const actionIcons: Record<string, React.ReactNode> = {
  create: <FileText className="h-4 w-4 text-emerald-400" />,
  update: <Edit className="h-4 w-4 text-blue-400" />,
  delete: <Trash2 className="h-4 w-4 text-red-400" />,
  status_change: <CheckCircle2 className="h-4 w-4 text-purple-400" />,
  login: <LogIn className="h-4 w-4 text-green-400" />,
  logout: <LogOut className="h-4 w-4 text-gray-400" />,
  export: <FileText className="h-4 w-4 text-yellow-400" />,
  assign: <UserPlus className="h-4 w-4 text-orange-400" />,
  verify: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
};

const actionLabels: Record<string, { en: string; am: string }> = {
  create: { en: "Created", am: "ፈጠረ" },
  update: { en: "Updated", am: "አዘመነ" },
  delete: { en: "Deleted", am: "ሰረዘ" },
  status_change: { en: "Changed Status", am: "ሁኔታ ቀየረ" },
  login: { en: "Logged In", am: "ገባ" },
  logout: { en: "Logged Out", am: "ወጣ" },
  export: { en: "Exported", am: "ኤክስፖርት አደረገ" },
  assign: { en: "Assigned", am: "መደበ" },
  verify: { en: "Verified", am: "አረጋገጠ" },
};

const resourceLabels: Record<string, { en: string; am: string }> = {
  application: { en: "Application", am: "ማመልከቻ" },
  service: { en: "Service", am: "አገልግሎት" },
  admin: { en: "Admin", am: "አስተዳዳሪ" },
  document: { en: "Document", am: "ሰነድ" },
  report: { en: "Report", am: "ሪፖርት" },
};

const statusBadges: Record<string, { variant: "success" | "danger" | "warning"; icon: React.ReactNode }> = {
  success: { variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  failure: { variant: "danger", icon: <XCircle className="h-3 w-3" /> },
  warning: { variant: "warning", icon: <AlertTriangle className="h-3 w-3" /> },
};

export function ActivityLog({
  className,
  limit = 20,
  showFilters = true,
  compact = false,
}: ActivityLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [language] = useState<"en" | "am">(storage.getLanguage());

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: String(limit) };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;

      const queryString = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&");

      const response = await api.get<ApiResponse<AuditLogEntry[]>>(
        `/dashboard/recent-activity?${queryString}`
      );

      if (response.data.success) {
        setLogs(Array.isArray(response.data.data) ? response.data.data : (response.data.data as any)?.logs || []);
      }
    } catch (err) {
      console.error("Failed to load activity log:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, search, actionFilter, resourceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const clearFilters = () => {
    setSearch("");
    setActionFilter("");
    setResourceFilter("");
  };

  const hasFilters = search || actionFilter || resourceFilter;

  if (loading) {
    return (
      <Card variant="glass" className={className}>
        <CardHeader>
          <CardTitle>{language === "am" ? "የቅርብ ጊዜ እንቅስቃሴ" : "Recent Activity"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" className="w-3/4 h-3" />
                <Skeleton variant="text" className="w-1/2 h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {language === "am" ? "የቅርብ ጊዜ እንቅስቃሴ" : "Recent Activity"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="glass" size="sm" onClick={fetchLogs} disabled={loading} className="gap-1.5">
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              {language === "am" ? "አድስ" : "Refresh"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === "am" ? "በተጠቃሚ ወይም ዝርዝር ፈልግ..." : "Search by user or details..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder={language === "am" ? "ተግባር" : "Action"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === "am" ? "ሁሉም" : "All"}</SelectItem>
                {Object.entries(actionLabels).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{language === "am" ? val.am : val.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder={language === "am" ? "ምንጭ" : "Resource"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{language === "am" ? "ሁሉም" : "All"}</SelectItem>
                {Object.entries(resourceLabels).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{language === "am" ? val.am : val.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                {language === "am" ? "አጽዳ" : "Clear"}
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {language === "am" ? "ምንም የቅርብ ጊዜ እንቅስቃሴ የለም" : "No recent activity"}
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const statusBadge = statusBadges[log.status] || statusBadges.success;
            const actionLabel = actionLabels[log.action] || { en: log.action, am: log.action };
            const resourceLabel = resourceLabels[log.resource] || { en: log.resource, am: log.resource };

            return (
              <div
                key={log._id}
                className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center">
                  {actionIcons[log.action] || <FileText className="h-4 w-4 text-muted-foreground" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{log.userEmail}</span>
                    <Badge variant={statusBadge.variant} size="sm" className="gap-0.5">
                      {statusBadge.icon}
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground/70">
                      {language === "am" ? actionLabel.am : actionLabel.en}
                    </span>
                    {" "}
                    {language === "am" ? resourceLabel.am : resourceLabel.en}
                    {log.resourceName ? ` "${log.resourceName}"` : ""}
                    {log.details && ` — ${log.details}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDateTime(log.timestamp)} • {log.ipAddress}
                  </p>
                </div>

                {!compact && (
                  <Badge variant="secondary" size="sm" className="shrink-0">
                    {log.userRole?.replace("_", " ")}
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityLog;