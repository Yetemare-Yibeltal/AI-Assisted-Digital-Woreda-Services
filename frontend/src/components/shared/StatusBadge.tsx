import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Search,
  FileWarning,
  CheckCircle,
  XCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { ApplicationStatus } from "@/types/application.types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "default" | "lg";
  withIcon?: boolean;
  withPulse?: boolean;
  className?: string;
}

const statusConfig: Record<
  ApplicationStatus,
  {
    label: string;
    labelAmharic: string;
    variant: "warning" | "info" | "orange" | "success" | "danger" | "default";
    icon: React.ReactNode;
    pulse: boolean;
  }
> = {
  pending: {
    label: "Pending",
    labelAmharic: "በመጠባበቅ ላይ",
    variant: "warning",
    icon: <Clock className="h-3.5 w-3.5" />,
    pulse: true,
  },
  under_review: {
    label: "Under Review",
    labelAmharic: "በግምገማ ላይ",
    variant: "info",
    icon: <Search className="h-3.5 w-3.5" />,
    pulse: true,
  },
  documents_requested: {
    label: "Documents Requested",
    labelAmharic: "ሰነዶች ተጠይቀዋል",
    variant: "orange",
    icon: <FileWarning className="h-3.5 w-3.5" />,
    pulse: false,
  },
  approved: {
    label: "Approved",
    labelAmharic: "ጸድቋል",
    variant: "success",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    pulse: false,
  },
  rejected: {
    label: "Rejected",
    labelAmharic: "ውድቅ ተደርጓል",
    variant: "danger",
    icon: <XCircle className="h-3.5 w-3.5" />,
    pulse: false,
  },
  completed: {
    label: "Completed",
    labelAmharic: "ተጠናቋል",
    variant: "default",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    pulse: false,
  },
};

export function StatusBadge({
  status,
  size = "default",
  withIcon = true,
  withPulse = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={withPulse && config.pulse}
      pulse={withPulse && config.pulse}
      icon={withIcon ? config.icon : undefined}
      className={cn("font-medium", className)}
    >
      <span>{config.label}</span>
      <span className="text-[10px] opacity-60 ml-1 hidden sm:inline">
        {config.labelAmharic}
      </span>
    </Badge>
  );
}

export function getStatusLabel(status: ApplicationStatus, language: "en" | "am" = "en"): string {
  const config = statusConfig[status];
  if (!config) return status;
  return language === "am" ? config.labelAmharic : config.label;
}

export function getStatusVariant(status: ApplicationStatus) {
  return statusConfig[status]?.variant || "default";
}

export default StatusBadge;