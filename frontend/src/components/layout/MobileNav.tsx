import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Home, FileText, Search, MessageSquare, User } from "lucide-react";
import { storage } from "@/utils/storage";

interface MobileNavProps {
  className?: string;
  onAIChatToggle?: () => void;
}

const navItems = [
  { path: "/", label: "Home", labelAmharic: "መነሻ", icon: Home },
  { path: "/services", label: "Services", labelAmharic: "አገልግሎቶች", icon: FileText },
  { path: "/track", label: "Track", labelAmharic: "መከታተያ", icon: Search },
  { path: "/admin/login", label: "Admin", labelAmharic: "አስተዳዳሪ", icon: User },
];

export function MobileNav({ className, onAIChatToggle }: MobileNavProps) {
  const location = useLocation();
  const language = storage.getLanguage();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "glass-nav border-t border-border/20",
        "safe-area-inset-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 px-3 rounded-xl transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">
                {language === "am" ? item.labelAmharic : item.label}
              </span>
            </Link>
          );
        })}

        {/* AI Chat button */}
        {onAIChatToggle && (
          <button
            onClick={onAIChatToggle}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 px-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[10px] font-medium">
              {language === "am" ? "AI ረዳት" : "AI Chat"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default MobileNav;