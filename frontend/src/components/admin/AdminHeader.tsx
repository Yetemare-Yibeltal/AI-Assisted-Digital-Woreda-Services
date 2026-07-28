import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  HelpCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { storage } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";
import api from "@/utils/api";
import type { IAdmin } from "@/types/admin.types";
import type { ApiResponse } from "@/types/api.types";

interface AdminHeaderProps {
  user: IAdmin | null;
  language: "en" | "am";
  onMobileMenuToggle: () => void;
  className?: string;
}

export function AdminHeader({
  user,
  language,
  onMobileMenuToggle,
  className,
}: AdminHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>("/admin/notifications/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.data?.count || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    storage.clearAuth();
    toast({
      title: language === "am" ? "ወጥተዋል" : "Logged Out",
      description: language === "am" ? "በተሳካ ሁኔታ ወጥተዋል" : "You have been logged out successfully.",
    });
    navigate("/admin/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/applications?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
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

  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path.includes("/applications")) return language === "am" ? "ማመልከቻዎች" : "Applications";
    if (path.includes("/services")) return language === "am" ? "አገልግሎቶች" : "Services";
    if (path.includes("/admins")) return language === "am" ? "ሰራተኞች" : "Staff";
    if (path.includes("/reports")) return language === "am" ? "ሪፖርቶች" : "Reports";
    if (path.includes("/settings")) return language === "am" ? "ቅንብሮች" : "Settings";
    if (path.includes("/notifications")) return language === "am" ? "ማሳወቂያዎች" : "Notifications";
    return language === "am" ? "ዳሽቦርድ" : "Dashboard";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 glass-nav border-b border-border/20",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-1 animate-in slide-in-from-right-4 duration-200">
              <Input
                type="text"
                placeholder={language === "am" ? "ፈልግ..." : "Search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 h-9 text-sm"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            onClick={() => navigate("/admin/notifications")}
            aria-label={`${unreadCount} unread notifications`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="danger"
                size="sm"
                className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center px-1 text-[10px] rounded-full"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {user ? getUserInitials(user.fullName) : "??"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                  {user?.fullName || "User"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user?.fullName}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                  <span className="text-xs text-primary mt-0.5 capitalize">{user?.role?.replace("_", " ")}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="gap-2">
                <User className="h-4 w-4" />
                {language === "am" ? "ፕሮፋይል" : "Profile"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="gap-2">
                <Settings className="h-4 w-4" />
                {language === "am" ? "ቅንብሮች" : "Settings"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/help")} className="gap-2">
                <HelpCircle className="h-4 w-4" />
                {language === "am" ? "እርዳታ" : "Help"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                {language === "am" ? "ውጣ" : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;