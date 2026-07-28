import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableLoading,
  TableEmpty,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  ChevronRight,
  Clock,
  AlertCircle,
  X,
  RotateCcw,
} from "lucide-react";
import { storage } from "@/utils/storage";
import { formatDate, formatTrackingNumber } from "@/utils/formatters";
import { APPLICATION_STATUSES } from "@/utils/enums";
import api from "@/utils/api";
import type { IApplication, ApplicationStatus } from "@/types/application.types";
import type { PaginatedResponse, PaginationMeta } from "@/types/api.types";

interface ApplicationsTableProps {
  className?: string;
  defaultStatus?: ApplicationStatus | "";
  defaultSearch?: string;
  onViewApplication?: (application: IApplication) => void;
  onStatusChange?: (application: IApplication, newStatus: ApplicationStatus) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function ApplicationsTable({
  className,
  defaultStatus = "",
  defaultSearch = "",
  onViewApplication,
  onStatusChange,
}: ApplicationsTableProps) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState(defaultSearch);
  const [status, setStatus] = useState<ApplicationStatus | "">(defaultStatus);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchInput, setSearchInput] = useState(defaultSearch);
  const [language] = useState<"en" | "am">(storage.getLanguage());

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (status) params.status = status;

      const queryString = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join("&");

      const response = await api.get<PaginatedResponse<IApplication>>(
        `/applications?${queryString}`
      );

      if (response.data.success) {
        setApplications(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      }
    } catch (err: any) {
      console.error("Failed to fetch applications:", err);
      setError(
        language === "am"
          ? "ማመልከቻዎችን መጫን አልተሳካም።"
          : "Failed to load applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, sortBy, sortOrder, language]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleRowClick = (application: IApplication) => {
    if (onViewApplication) {
      onViewApplication(application);
    } else {
      navigate(`/admin/applications/${application._id}`);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return (
      <span className="text-primary">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const columns = 8;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              language === "am"
                ? "በስም፣ ስልክ ወይም የመከታተያ ቁጥር ይፈልጉ..."
                : "Search by name, phone, or tracking number..."
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v as ApplicationStatus | ""); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={language === "am" ? "ሁኔታ" : "Status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{language === "am" ? "ሁሉም" : "All Statuses"}</SelectItem>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  <StatusBadge status={s} size="sm" withIcon={false} withPulse={false} className="bg-transparent border-0 p-0" />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="glass" size="sm" onClick={fetchApplications} disabled={loading} className="gap-2">
            <RotateCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            {language === "am" ? "አድስ" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="text-center py-16">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-400" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="primary" onClick={fetchApplications}>
            {language === "am" ? "እንደገና ሞክር" : "Retry"}
          </Button>
        </div>
      ) : (
        <Table containerClassName="rounded-xl border border-border/20">
          <TableHeader>
            <TableRow>
              <TableHead
                sortable
                sortDirection={sortBy === "trackingNumber" ? sortOrder : null}
                onSort={() => handleSort("trackingNumber")}
              >
                {language === "am" ? "የመከታተያ ቁጥር" : "Tracking #"}
              </TableHead>
              <TableHead
                sortable
                sortDirection={sortBy === "applicantInfo.fullName" ? sortOrder : null}
                onSort={() => handleSort("applicantInfo.fullName")}
              >
                {language === "am" ? "አመልካች" : "Applicant"}
              </TableHead>
              <TableHead>{language === "am" ? "አገልግሎት" : "Service"}</TableHead>
              <TableHead
                sortable
                sortDirection={sortBy === "status" ? sortOrder : null}
                onSort={() => handleSort("status")}
              >
                {language === "am" ? "ሁኔታ" : "Status"}
              </TableHead>
              <TableHead
                sortable
                sortDirection={sortBy === "priority" ? sortOrder : null}
                onSort={() => handleSort("priority")}
              >
                {language === "am" ? "ቅድሚያ" : "Priority"}
              </TableHead>
              <TableHead
                sortable
                sortDirection={sortBy === "createdAt" ? sortOrder : null}
                onSort={() => handleSort("createdAt")}
              >
                {language === "am" ? "ቀን" : "Date"}
              </TableHead>
              <TableHead>{language === "am" ? "ሰራተኛ" : "Officer"}</TableHead>
              <TableHead className="w-[50px]">{language === "am" ? "ይመልከቱ" : "View"}</TableHead>
            </TableRow>
          </TableHeader>

          {loading ? (
            <TableLoading columns={columns} rows={8} />
          ) : applications.length === 0 ? (
            <TableEmpty
              columns={columns}
              title={language === "am" ? "ምንም ማመልከቻ አልተገኘም" : "No applications found"}
              description={
                language === "am"
                  ? "ማጣሪያዎችዎን ይቀይሩ ወይም አዲስ ማመልከቻ ይፍጠሩ።"
                  : "Try adjusting your filters or create a new application."
              }
            />
          ) : (
            <TableBody>
              {applications.map((app) => (
                <TableRow
                  key={app._id}
                  hover
                  clickable
                  onClick={() => handleRowClick(app)}
                >
                  <TableCell className="font-mono font-bold text-primary text-sm">
                    {formatTrackingNumber(app.trackingNumber)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px]">
                        {app.applicantInfo.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {app.applicantInfo.phoneNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm truncate max-w-[150px]">{app.serviceName}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={app.priority} language={language} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatDate(app.createdAt)}</p>
                      {app.daysSinceSubmission !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {app.daysSinceSubmission === 0
                            ? language === "am"
                              ? "ዛሬ"
                              : "Today"
                            : language === "am"
                            ? `${app.daysSinceSubmission} ቀናት`
                            : `${app.daysSinceSubmission} days ago`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm truncate max-w-[120px]">
                      {(app as any).assignedToName || (app as any).assignedTo?.fullName || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(app);
                      }}
                      aria-label="View application"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={meta}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      )}
    </div>
  );
}

function PriorityBadge({
  priority,
  language,
}: {
  priority: string;
  language: "en" | "am";
}) {
  const config: Record<string, { variant: "success" | "warning" | "danger" | "secondary"; en: string; am: string }> = {
    low: { variant: "secondary", en: "Low", am: "ዝቅተኛ" },
    medium: { variant: "info" as any, en: "Medium", am: "መካከለኛ" },
    high: { variant: "warning", en: "High", am: "ከፍተኛ" },
    urgent: { variant: "danger", en: "Urgent", am: "አስቸኳይ" },
  };
  const c = config[priority] || config.low;
  return (
    <Badge variant={c.variant} size="sm">
      {language === "am" ? c.am : c.en}
    </Badge>
  );
}

export default ApplicationsTable;