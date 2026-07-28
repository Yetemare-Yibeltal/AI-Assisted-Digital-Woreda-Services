import {
  Home,
  LayoutDashboard,
  FileText,
  Search,
  Users,
  Settings,
  LogIn,
  UserPlus,
  BarChart3,
  Bell,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  labelAmharic: string;
  icon?: LucideIcon;
  children?: NavItem[];
  requireAuth?: boolean;
  requireRole?: string[];
  showInNav?: boolean;
  showInSidebar?: boolean;
  isExternal?: boolean;
  dividerAfter?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  labelAmharic: string;
  path?: string;
}

export const publicNavigation: NavItem[] = [
  {
    path: "/",
    label: "Home",
    labelAmharic: "መነሻ ገጽ",
    icon: Home,
    showInNav: true,
  },
  {
    path: "/services",
    label: "Services",
    labelAmharic: "አገልግሎቶች",
    icon: FileText,
    showInNav: true,
  },
  {
    path: "/track",
    label: "Track Application",
    labelAmharic: "ማመልከቻ ይከታተሉ",
    icon: Search,
    showInNav: true,
  },
  {
    path: "/admin/login",
    label: "Admin Login",
    labelAmharic: "አስተዳዳሪ መግቢያ",
    icon: LogIn,
    showInNav: true,
  },
];

export const adminNavigation: NavItem[] = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    labelAmharic: "ዳሽቦርድ",
    icon: LayoutDashboard,
    showInSidebar: true,
  },
  {
    path: "/admin/applications",
    label: "Applications",
    labelAmharic: "ማመልከቻዎች",
    icon: FileText,
    showInSidebar: true,
  },
  {
    path: "/admin/services",
    label: "Services",
    labelAmharic: "አገልግሎቶች",
    icon: Settings,
    showInSidebar: true,
    requireRole: ["super_admin", "admin"],
  },
  {
    path: "/admin/admins",
    label: "Staff Management",
    labelAmharic: "ሰራተኞች አስተዳደር",
    icon: Users,
    showInSidebar: true,
    requireRole: ["super_admin"],
  },
  {
    path: "/admin/reports",
    label: "Reports",
    labelAmharic: "ሪፖርቶች",
    icon: BarChart3,
    showInSidebar: true,
  },
  {
    path: "/admin/notifications",
    label: "Notifications",
    labelAmharic: "ማሳወቂያዎች",
    icon: Bell,
    showInSidebar: true,
  },
  {
    path: "/admin/settings",
    label: "Settings",
    labelAmharic: "ቅንብሮች",
    icon: Settings,
    showInSidebar: true,
    requireRole: ["super_admin", "admin"],
  },
];

export const routes = {
  home: "/",
  services: "/services",
  serviceDetail: "/services/:slug",
  apply: "/apply/:slug",
  track: "/track",
  admin: {
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    applications: "/admin/applications",
    applicationDetail: "/admin/applications/:id",
    services: "/admin/services",
    serviceCreate: "/admin/services/create",
    serviceEdit: "/admin/services/:id/edit",
    admins: "/admin/admins",
    adminCreate: "/admin/admins/create",
    adminEdit: "/admin/admins/:id/edit",
    reports: "/admin/reports",
    notifications: "/admin/notifications",
    settings: "/admin/settings",
  },
  notFound: "/404",
} as const;

export const breadcrumbs: Record<string, BreadcrumbItem[]> = {
  "/": [{ label: "Home", labelAmharic: "መነሻ ገጽ" }],
  "/services": [
    { label: "Home", labelAmharic: "መነሻ ገጽ", path: "/" },
    { label: "Services", labelAmharic: "አገልግሎቶች" },
  ],
  "/track": [
    { label: "Home", labelAmharic: "መነሻ ገጽ", path: "/" },
    { label: "Track Application", labelAmharic: "ማመልከቻ ይከታተሉ" },
  ],
  "/admin/dashboard": [
    { label: "Admin", labelAmharic: "አስተዳዳሪ", path: "/admin/login" },
    { label: "Dashboard", labelAmharic: "ዳሽቦርድ" },
  ],
  "/admin/applications": [
    { label: "Admin", labelAmharic: "አስተዳዳሪ", path: "/admin/dashboard" },
    { label: "Applications", labelAmharic: "ማመልከቻዎች" },
  ],
  "/admin/services": [
    { label: "Admin", labelAmharic: "አስተዳዳሪ", path: "/admin/dashboard" },
    { label: "Services", labelAmharic: "አገልግሎቶች" },
  ],
  "/admin/admins": [
    { label: "Admin", labelAmharic: "አስተዳዳሪ", path: "/admin/dashboard" },
    { label: "Staff Management", labelAmharic: "ሰራተኞች አስተዳደር" },
  ],
  "/admin/reports": [
    { label: "Admin", labelAmharic: "አስተዳዳሪ", path: "/admin/dashboard" },
    { label: "Reports", labelAmharic: "ሪፖርቶች" },
  ],
  "/admin/settings": [
    { label: "Admin", labelAmharic: "አስተዳዳሪ", path: "/admin/dashboard" },
    { label: "Settings", labelAmharic: "ቅንብሮች" },
  ],
};

export const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const exact = breadcrumbs[path];
  if (exact) return exact;

  for (const [key, value] of Object.entries(breadcrumbs)) {
    if (path.startsWith(key) && key !== "/") {
      return value;
    }
  }

  return [{ label: "Home", labelAmharic: "መነሻ ገጽ", path: "/" }];
};

export const getNavLabel = (
  item: NavItem,
  language: "en" | "am" = "en",
): string => {
  return language === "am" ? item.labelAmharic : item.label;
};
