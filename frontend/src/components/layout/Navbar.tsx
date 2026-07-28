import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Menu,
  X,
  Home,
  FileText,
  SearchIcon,
  LogIn,
  Globe,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { SearchInput } from "@/components/shared/SearchInput";
import { publicNavigation } from "@/config/navigation.config";
import { WOREDA_INFO } from "@/utils/constants";

interface NavbarProps {
  language: "en" | "am";
  onLanguageChange: (lang: "en" | "am") => void;
  className?: string;
}

const navItemBaseClasses =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary";

export function Navbar({ language, onLanguageChange, className }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isAuthenticated = !!localStorage.getItem("accessToken");
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageToggle = () => {
    const newLang = language === "en" ? "am" : "en";
    onLanguageChange(newLang);
    localStorage.setItem("language", newLang);
  };

  const renderNavLinks = () => (
    <>
      {publicNavigation.map((item) => {
        if (!item.showInNav) return null;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              navItemBaseClasses,
              isActive(item.path) && "bg-primary/15 text-primary font-semibold"
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{language === "am" ? item.labelAmharic : item.label}</span>
          </Link>
        );
      })}
    </>
  );

  const renderMobileNavLinks = () => (
    <div className="flex flex-col gap-1 mt-6">
      {publicNavigation.map((item) => {
        if (!item.showInNav) return null;
        const Icon = item.icon;
        return (
          <SheetClose asChild key={item.path}>
            <Link
              to={item.path}
              className={cn(
                navItemBaseClasses,
                "py-3 text-base",
                isActive(item.path) && "bg-primary/15 text-primary font-semibold"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{language === "am" ? item.labelAmharic : item.label}</span>
            </Link>
          </SheetClose>
        );
      })}

      <div className="border-t border-border/20 my-3" />

      {isAuthenticated ? (
        <SheetClose asChild>
          <Link
            to="/admin/dashboard"
            className={cn(navItemBaseClasses, "py-3 text-base")}
          >
            <FileText className="h-5 w-5" />
            <span>{language === "am" ? "አስተዳዳሪ ዳሽቦርድ" : "Admin Dashboard"}</span>
          </Link>
        </SheetClose>
      ) : (
        <SheetClose asChild>
          <Link
            to="/admin/login"
            className={cn(navItemBaseClasses, "py-3 text-base")}
          >
            <LogIn className="h-5 w-5" />
            <span>{language === "am" ? "አስተዳዳሪ መግቢያ" : "Admin Login"}</span>
          </Link>
        </SheetClose>
      )}
    </div>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "glass-nav shadow-lg shadow-black/5"
          : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="sm" className="flex-shrink-0" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {renderNavLinks()}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
              className="hidden sm:flex"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="gap-1.5 text-xs font-medium"
              aria-label="Switch language"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {language === "am" ? "EN" : "አማ"}
              </span>
            </Button>

            {/* Admin Link (Desktop) */}
            {isAuthenticated ? (
              <Link to="/admin/dashboard" className="hidden md:block">
                <Button variant="glass" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {language === "am" ? "ዳሽቦርድ" : "Dashboard"}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link to="/admin/login" className="hidden md:block">
                <Button variant="glass" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {language === "am" ? "መግቢያ" : "Login"}
                  </span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex items-center gap-2 mb-6">
                  <Logo size="sm" />
                </div>
                <div className="mb-4">
                  <SearchInput
                    variant="public"
                    size="sm"
                    onResultSelect={() => setMobileMenuOpen(false)}
                  />
                </div>
                {renderMobileNavLinks()}
                <div className="mt-6 pt-4 border-t border-border/20">
                  <p className="text-xs text-muted-foreground text-center">
                    {WOREDA_INFO.name} • {WOREDA_INFO.region} Region
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {showSearch && (
          <div className="pb-4 animate-in slide-in-from-top-2 fade-in-0 duration-200">
            <SearchInput
              variant="public"
              size="default"
              autoFocus
              onResultSelect={() => setShowSearch(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;