import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/Logo";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { adminNavigation } from "@/config/navigation.config";
import { storage } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";
import api from "@/utils/api";
import type { IAdmin } from "@/types/admin.types";

interface AdminSidebarProps {
  user: IAdmin | null;
  collapsed: boolean;
  language: "en" | "am";
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BarChart3,
  Bell,
  MessageSquare,
};

export function AdminSidebar({
  user,
  collapsed,
  language,
  onToggleCollapse,
  onCloseMobile,
  className,
}: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return location.pathname === "/admin/dashboard";
    return location.pathname.startsWith(path);
  };

  const getUserInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "danger"> = {
      super_admin: "danger",
      admin: "purple" as any,
      officer: "info" as any,
      viewer: "secondary" as any,
    };
    const labels: Record<string, string> = {
      super_admin: language === "am" ? "ዋና" : "Super",
      admin: language === "am" ? "አስተዳዳሪ" : "Admin",
      officer: language === "am" ? "ባለስልጣን" : "Officer",
      viewer: language === "am" ? "ተመልካች" : "Viewer",
    };
    return { variant: variants[role] || "default", label: labels[role] || role };
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    storage.clearAuth();
    toast({
      title: language === "am" ? "ወጥተዋል" : "Logged out",
      description: language === "am" ? "በተሳካ ሁኔታ ወጥተዋል" : "Successfully logged out",
    });
    navigate("/admin/login");
  };

  const roleInfo = user ? getRoleBadge(user.role) : { variant: "default" as const, label: "" };

  const filteredNav = adminNavigation.filter((item) => {
    if (!item.showInSidebar) return false;
    if (item.requireRole && user && !item.requireRole.includes(user.role)) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        "flex flex-col h-full glass-heavy border-r border-border/20 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo & Collapse Toggle */}
      <div className={cn("flex items-center p-4", collapsed && "justify-center")}>
        {!collapsed && (
          <Link to="/admin/dashboard" className="flex-1" onClick={onCloseMobile}>
            <Logo size="sm" />
          </Link>
        )}
        {collapsed && (
          <Link to="/admin/dashboard" onClick={onCloseMobile}>
            <Logo size="sm" variant="icon" />
          </Link>
        )}
      </div>

      <Separator className="opacity-20" />

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-none">
        {filteredNav.map((item) => {
          const Icon = item.icon ? iconMap[item.icon as any] || FileText : FileText;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                active && "bg-primary/15 text-primary font-semibold shadow-sm",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? (language === "am" ? item.labelAmharic : item.label) : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
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

      {/* User Info & Logout */}
      <div className={cn("p-3", collapsed && "flex flex-col items-center gap-2")}>
        {user && !collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {getUserInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={roleInfo.variant as any} size="sm">
                  {roleInfo.label}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">{user.department}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-400 shrink-0"
              title={language === "am" ? "ውጣ" : "Logout"}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : collapsed ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {user ? getUserInitials(user.fullName) : "?"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-400"
              title={language === "am" ? "ውጣ" : "Logout"}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:brightness-110 transition-all hidden lg:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}

export default AdminSidebar;