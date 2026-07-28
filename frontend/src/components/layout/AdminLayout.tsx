import React, { useState, useEffect, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbPage, type BreadcrumbItemData } from "@/components/ui/breadcrumb";
import { Logo } from "@/components/shared/Logo";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  List,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { adminNavigation } from "@/config/navigation.config";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import { useToast } from "@/components/ui/use-toast";
import type { IAdmin } from "@/types/admin.types";

interface AdminLayoutProps {
  className?: string;
}

interface SidebarItem {
  path: string;
  label: string;
  labelAmharic: string;
  icon: LucideIcon;
  requireRole?: string[];
  badge?: string | number;
  children?: SidebarItem[];
}

export function AdminLayout({ className }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<IAdmin | null>(null);
  const [language, setLanguage] = useState<"en" | "am">(storage.getLanguage());
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return location.pathname === "/admin/dashboard";
    return location.pathname.startsWith(path);
  };

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.success) {
        setUser(response.data.data);
        storage.setUser(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      storage.clearAuth();
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchUser();
  }, [fetchUser, navigate]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/admin/notifications/count");
        if (response.data.success) {
          setUnreadNotifications(response.data.data?.count || 0);
        }
      } catch {
        // Silently fail
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Continue with local logout
    }
    storage.clearAuth();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "default",
    });
    navigate("/admin/login");
  };

  const getUserInitials = (name: string) => {
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

  const generateBreadcrumbs = (): BreadcrumbItemData[] => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItemData[] = [
      { label: "Dashboard", labelAmharic: "ዳሽቦርድ", path: "/admin/dashboard" },
    ];

    if (pathParts.length > 2) {
      const section = pathParts[2];
      const sectionMap: Record<string, { en: string; am: string }> = {
        applications: { en: "Applications", am: "ማመልከቻዎች" },
        services: { en: "Services", am: "አገልግሎቶች" },
        admins: { en: "Staff", am: "ሰራተኞች" },
        reports: { en: "Reports", am: "ሪፖርቶች" },
        notifications: { en: "Notifications", am: "ማሳወቂያዎች" },
        settings: { en: "Settings", am: "ቅንብሮች" },
      };

      if (sectionMap[section]) {
        crumbs.push({
          label: sectionMap[section].en,
          labelAmharic: sectionMap[section].am,
          path: `/admin/${section}`,
        });
      }
    }

    return crumbs;
  };

  const renderSidebarContent = (mobile = false) => {
    const closeMobile = () => mobile && setMobileMenuOpen(false);

    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn("flex items-center p-4", sidebarCollapsed && !mobile && "justify-center")}>
          <Link to="/admin/dashboard" onClick={closeMobile}>
            <Logo
              size="sm"
              showText={!sidebarCollapsed || mobile}
              variant={sidebarCollapsed && !mobile ? "icon" : "full"}
            />
          </Link>
        </div>

        <Separator className="opacity-20" />

        {/* Navigation */}
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
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  active && "bg-primary/15 text-primary font-semibold",
                  sidebarCollapsed && !mobile && "justify-center px-2"
                )}
                title={sidebarCollapsed && !mobile ? (language === "am" ? item.labelAmharic : item.label) : undefined}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {(!sidebarCollapsed || mobile) && (
                  <span className="truncate">
                    {language === "am" ? item.labelAmharic : item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <Separator className="opacity-20" />

        {/* User Info */}
        <div className={cn("p-3", sidebarCollapsed && !mobile && "flex justify-center")}>
          {user && (!sidebarCollapsed || mobile) ? (
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
          ) : sidebarCollapsed && !mobile ? (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {user ? getUserInitials(user.fullName) : "?"}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-woreda-dark", className)}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full hidden lg:flex flex-col glass-heavy border-r border-border/20 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {renderSidebarContent(false)}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:brightness-110 transition-all"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          {renderSidebarContent(true)}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          "lg:pl-64",
          sidebarCollapsed && "lg:pl-16"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 glass-nav border-b border-border/20">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu trigger */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumbs */}
              <div className="hidden sm:block">
                <BreadcrumbPage items={generateBreadcrumbs()} language={language} />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative"
                onClick={() => navigate("/admin/notifications")}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="danger"
                    size="sm"
                    className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center px-1 text-[10px] rounded-full"
                  >
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {user ? getUserInitials(user.fullName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                      {user?.fullName || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user?.fullName}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                      <span className="text-xs text-primary mt-0.5">
                        {getUserRoleLabel(user?.role || "")}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;