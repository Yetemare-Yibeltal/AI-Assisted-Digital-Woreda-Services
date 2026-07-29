import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  User,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  MessageSquare,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { formatDateTime } from "@/utils/formatters";
import { storage } from "@/utils/storage";

interface TimelineEvent {
  id: string;
  title: string;
  titleAmharic?: string;
  description?: string;
  descriptionAmharic?: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info" | "neutral";
  icon?: "check" | "clock" | "alert" | "cancel" | "file" | "user" | "edit" | "delete" | "login" | "logout" | "message" | "upload";
  actor?: string;
  metadata?: Record<string, string>;
}

interface TimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
  language?: "en" | "am";
  className?: string;
  maxItems?: number;
  showActor?: boolean;
  showMetadata?: boolean;
  emptyTitle?: string;
  emptyTitleAmharic?: string;
  emptyDescription?: string;
  emptyDescriptionAmharic?: string;
}

const iconMap: Record<string, LucideIcon> = {
  check: CheckCircle2,
  clock: Clock,
  alert: AlertCircle,
  cancel: XCircle,
  file: FileText,
  user: User,
  edit: Edit,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
  message: MessageSquare,
  upload: Upload,
};

const statusColors: Record<string, { dot: string; line: string; bg: string; border: string; text: string }> = {
  success: {
    dot: "bg-emerald-400",
    line: "bg-emerald-500/30",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  warning: {
    dot: "bg-yellow-400",
    line: "bg-yellow-500/30",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
  },
  error: {
    dot: "bg-red-400",
    line: "bg-red-500/30",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
  },
  info: {
    dot: "bg-blue-400",
    line: "bg-blue-500/30",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  neutral: {
    dot: "bg-gray-400",
    line: "bg-gray-500/30",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    text: "text-gray-400",
  },
};

export function Timeline({
  events,
  loading = false,
  language = "en",
  className,
  maxItems,
  showActor = true,
  showMetadata = false,
  emptyTitle,
  emptyTitleAmharic,
  emptyDescription,
  emptyDescriptionAmharic,
}: TimelineProps) {
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;

  if (loading) {
    return (
      <div className={cn("relative pl-6 space-y-6", className)}>
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border/30" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative flex gap-4">
            <Skeleton variant="circular" width={16} height={16} className="absolute -left-[22px] top-1" />
            <div className="flex-1 space-y-2 ml-4">
              <Skeleton variant="text" className="w-1/3 h-4" />
              <Skeleton variant="text" className="w-2/3 h-3" />
              <Skeleton variant="text" className="w-1/4 h-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <div className={cn("text-center py-10", className)}>
        <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        <h3 className="text-sm font-bold">
          {language === "am" && emptyTitleAmharic ? emptyTitleAmharic : (emptyTitle || (language === "am" ? "ምንም ክስተቶች የሉም" : "No events"))}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {language === "am" && emptyDescriptionAmharic
            ? emptyDescriptionAmharic
            : (emptyDescription || (language === "am" ? "የሚታዩ ክስተቶች የሉም።" : "There are no events to display."))}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative pl-6", className)}>
      {/* Vertical line */}
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border/30" />

      <div className="space-y-4">
        {displayEvents.map((event, index) => {
          const isLast = index === displayEvents.length - 1;
          const colors = statusColors[event.status || "neutral"];
          const IconComponent = event.icon ? iconMap[event.icon] : null;
          const displayTitle = language === "am" && event.titleAmharic ? event.titleAmharic : event.title;
          const displayDescription = language === "am" && event.descriptionAmharic
            ? event.descriptionAmharic
            : event.description;

          return (
            <div key={event.id} className="relative">
              {/* Dot */}
              <div
                className={cn(
                  "absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background z-10",
                  colors.dot
                )}
              />

              <Card
                variant="glass"
                className={cn(
                  "p-4 transition-all duration-200 hover:border-primary/20",
                  colors.border,
                  isLast && "opacity-100"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Icon */}
                    {IconComponent && (
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colors.bg, colors.text)}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {/* Title */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold truncate">{displayTitle}</h4>
                        {event.status && (
                          <Badge
                            variant={event.status === "success" ? "success" : event.status === "error" ? "danger" : event.status === "warning" ? "warning" : "secondary"}
                            size="sm"
                            className="text-[10px]"
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {displayDescription && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {displayDescription}
                        </p>
                      )}

                      {/* Metadata */}
                      {showMetadata && event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(event.metadata).map(([key, val]) => (
                            <Badge key={key} variant="secondary" size="sm" className="text-[10px]">
                              {key}: {val}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: timestamp & actor */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(event.timestamp, language)}
                    </p>
                    {showActor && event.actor && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">{event.actor}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;