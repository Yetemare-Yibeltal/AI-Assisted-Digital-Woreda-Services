import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { LayoutBreadcrumb } from "./Breadcrumb";
import { Bell, Plus, Download, SlidersHorizontal } from "lucide-react";
import { storage } from "@/utils/storage";

interface HeaderProps {
  title?: string;
  titleAmharic?: string;
  description?: string;
  breadcrumbs?: boolean;
  actions?: React.ReactNode;
  onCreateClick?: () => void;
  onExportClick?: () => void;
  onFilterClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  className?: string;
}

export function Header({
  title,
  titleAmharic,
  description,
  breadcrumbs = true,
  actions,
  onCreateClick,
  onExportClick,
  onFilterClick,
  notificationCount = 0,
  onNotificationClick,
  className,
}: HeaderProps) {
  const language = storage.getLanguage();

  return (
    <div className={cn("flex flex-col gap-2 mb-6", className)}>
      {breadcrumbs && <LayoutBreadcrumb />}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === "am" && titleAmharic ? titleAmharic : title}
            </h1>
          )}
          {titleAmharic && language === "en" && (
            <p className="text-sm text-muted-foreground mt-1 font-amharic">{titleAmharic}</p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {actions || (
            <>
              {onFilterClick && (
                <Button variant="glass" size="sm" onClick={onFilterClick} className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === "am" ? "ማጣሪያ" : "Filter"}</span>
                </Button>
              )}

              {onExportClick && (
                <Button variant="glass" size="sm" onClick={onExportClick} className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === "am" ? "ኤክስፖርት" : "Export"}</span>
                </Button>
              )}

              {onCreateClick && (
                <Button variant="primary" size="sm" onClick={onCreateClick} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === "am" ? "አዲስ ፍጠር" : "Create New"}</span>
                </Button>
              )}

              {onNotificationClick !== undefined && (
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={onNotificationClick}
                  className="relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;