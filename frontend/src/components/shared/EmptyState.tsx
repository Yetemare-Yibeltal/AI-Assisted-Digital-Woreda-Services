import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Inbox,
  FileText,
  Search,
  Users,
  MessageSquare,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon?: "inbox" | "file" | "search" | "users" | "chat" | "folder" | React.ReactNode;
  title: string;
  titleAmharic?: string;
  description?: string;
  descriptionAmharic?: string;
  action?: {
    label: string;
    labelAmharic?: string;
    onClick: () => void;
    variant?: "primary" | "outline" | "glass";
  };
  secondaryAction?: {
    label: string;
    labelAmharic?: string;
    onClick: () => void;
  };
  language?: "en" | "am";
  className?: string;
  compact?: boolean;
  bordered?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  inbox: Inbox,
  file: FileText,
  search: Search,
  users: Users,
  chat: MessageSquare,
  folder: FolderOpen,
};

export function EmptyState({
  icon = "inbox",
  title,
  titleAmharic,
  description,
  descriptionAmharic,
  action,
  secondaryAction,
  language = "en",
  className,
  compact = false,
  bordered = false,
}: EmptyStateProps) {
  const displayTitle = language === "am" && titleAmharic ? titleAmharic : title;
  const displayDescription = language === "am" && descriptionAmharic ? descriptionAmharic : description;

  const IconComponent = typeof icon === "string" ? iconMap[icon] || Inbox : null;

  const content = (
    <div className={cn("flex flex-col items-center text-center", compact ? "py-6" : "py-12", className)}>
      {/* Icon */}
      <div className="mb-4 text-muted-foreground/30">
        {typeof icon === "string" && IconComponent ? (
          <IconComponent className={cn(compact ? "h-12 w-12" : "h-16 w-16")} />
        ) : typeof icon !== "string" ? (
          <div className={cn(compact ? "text-3xl" : "text-5xl")}>{icon}</div>
        ) : null}
      </div>

      {/* Title */}
      <h3 className={cn("font-bold", compact ? "text-base" : "text-lg")}>
        {displayTitle}
      </h3>

      {/* Description */}
      {displayDescription && (
        <p className={cn("text-muted-foreground max-w-sm", compact ? "text-xs mt-1" : "text-sm mt-2")}>
          {displayDescription}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className={cn("flex items-center gap-3 flex-wrap justify-center", compact ? "mt-3" : "mt-6")}>
          {action && (
            <Button
              variant={action.variant || "primary"}
              size={compact ? "sm" : "default"}
              onClick={action.onClick}
            >
              {language === "am" && action.labelAmharic ? action.labelAmharic : action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={secondaryAction.onClick}
            >
              {language === "am" && secondaryAction.labelAmharic ? secondaryAction.labelAmharic : secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (bordered) {
    return (
      <Card variant="glass" className={cn("w-full", className)}>
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  return content;
}

export default EmptyState;