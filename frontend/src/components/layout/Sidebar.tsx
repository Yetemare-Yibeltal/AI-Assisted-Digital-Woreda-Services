import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/Logo";
import { adminNavigation } from "@/config/navigation.config";
import type { IAdmin } from "@/types/admin.types";

interface SidebarProps {
  user: IAdmin | null;
  collapsed: boolean;
  language: "en" | "am";
  onCloseMobile?: () => void;
}

export function Sidebar({ user, collapsed, language, onCloseMobile }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return location.pathname === "/admin/dashboard";
    return location.pathname.startsWith(path);
  };

  const getUserInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getUserRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: language === "am" ? "ዋና አስተዳዳሪ" : "Super Admin",
      admin: language === "am" ? "አስተዳዳሪ" : "Admin",
      officer: language === "am" ? "ባለስልጣን" : "Officer",
      viewer: language === "am" ? "ተመልካች" : "Viewer",
    };
    return roleMap[role] || role;
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center p-4", collapsed && "justify-center")}>
        <Link to="/admin/dashboard" onClick={onCloseMobile}>
          <Logo
            size="sm"
            showText={!collapsed}
            variant={collapsed ? "icon" : "full"}
          />
        </Link>
      </div>

      <Separator className="opacity-20" />

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {adminNavigation.map((item) => {
          if (!item.showInSidebar) return null;
          if (item.requireRole && user && !item.requireRole.includes(user.role)) return null;

          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                active && "bg-primary/15 text-primary font-semibold",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? (language === "am" ? item.labelAmharic : item.label) : undefined}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {!collapsed && (
                <span className="truncate">
                  {language === "am" ? item.labelAmharic : item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="opacity-20" />

      <div className={cn("p-3", collapsed && "flex justify-center")}>
        {user && !collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {getUserInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {getUserRoleLabel(user.role)}
              </p>
            </div>
          </div>
        ) : collapsed ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {user ? getUserInitials(user.fullName) : "?"}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}

export default Sidebar;