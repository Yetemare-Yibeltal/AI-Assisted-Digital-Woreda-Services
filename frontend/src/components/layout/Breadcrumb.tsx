import React from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { ChevronRight, Home } from "lucide-react";
import { storage } from "@/utils/storage";

interface BreadcrumbProps {
  className?: string;
  homeLabel?: string;
  homeLabelAmharic?: string;
}

const routeLabels: Record<string, { en: string; am: string }> = {
  admin: { en: "Admin", am: "አስተዳዳሪ" },
  dashboard: { en: "Dashboard", am: "ዳሽቦርድ" },
  applications: { en: "Applications", am: "ማመልከቻዎች" },
  services: { en: "Services", am: "አገልግሎቶች" },
  admins: { en: "Staff", am: "ሰራተኞች" },
  reports: { en: "Reports", am: "ሪፖርቶች" },
  notifications: { en: "Notifications", am: "ማሳወቂያዎች" },
  settings: { en: "Settings", am: "ቅንብሮች" },
  track: { en: "Track", am: "መከታተያ" },
  login: { en: "Login", am: "መግቢያ" },
  create: { en: "Create", am: "ፍጠር" },
  edit: { en: "Edit", am: "አስተካክል" },
};

export function LayoutBreadcrumb({
  className,
  homeLabel = "Home",
  homeLabelAmharic = "መነሻ",
}: BreadcrumbProps) {
  const location = useLocation();
  const language = storage.getLanguage();

  const pathParts = location.pathname.split("/").filter(Boolean);
  if (pathParts.length === 0) return null;

  const crumbs = pathParts.map((part, index) => {
    const path = "/" + pathParts.slice(0, index + 1).join("/");
    const label = routeLabels[part] || {
      en: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      am: part.replace(/-/g, " "),
    };
    const isLast = index === pathParts.length - 1;
    const isId = /^[a-f0-9]{24}$/i.test(part);

    return {
      path: isLast || isId ? undefined : path,
      label: language === "am" ? label.am : label.en,
      isLast,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li className="flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">{language === "am" ? homeLabelAmharic : homeLabel}</span>
          </Link>
          {crumbs.length > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
        </li>

        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                {crumb.label}
              </Link>
            ) : (
              <span className={cn("truncate max-w-[200px]", crumb.isLast && "text-foreground font-medium")}>
                {crumb.label}
              </span>
            )}
            {!crumb.isLast && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default LayoutBreadcrumb;