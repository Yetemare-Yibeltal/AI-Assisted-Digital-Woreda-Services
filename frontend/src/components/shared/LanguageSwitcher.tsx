import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { storage } from "@/utils/storage";

interface LanguageSwitcherProps {
  language?: "en" | "am";
  onLanguageChange?: (lang: "en" | "am") => void;
  variant?: "button" | "minimal" | "badge" | "inline";
  className?: string;
  size?: "sm" | "default" | "lg";
}

const languages = [
  {
    code: "en" as const,
    label: "English",
    labelNative: "English",
    flag: "🇬🇧",
    short: "EN",
  },
  {
    code: "am" as const,
    label: "Amharic",
    labelNative: "አማርኛ",
    flag: "🇪🇹",
    short: "አማ",
  },
];

export function LanguageSwitcher({
  language: propLanguage,
  onLanguageChange,
  variant = "button",
  className,
  size = "default",
}: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<"en" | "am">(
    propLanguage || storage.getLanguage()
  );

  const handleSelect = useCallback(
    (lang: "en" | "am") => {
      setCurrentLang(lang);
      storage.setLanguage(lang);
      onLanguageChange?.(lang);
      // Force a page reload to reflect language changes everywhere
      // window.location.reload();
    },
    [onLanguageChange]
  );

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1 bg-secondary/20 rounded-lg p-0.5", className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              currentLang === lang.code
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {lang.flag} {size === "sm" ? lang.short : lang.labelNative}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {languages.map((lang) => (
          <Badge
            key={lang.code}
            variant={currentLang === lang.code ? "default" : "secondary"}
            className="cursor-pointer hover:opacity-80 transition-opacity text-xs gap-1"
            onClick={() => handleSelect(lang.code)}
          >
            <span>{lang.flag}</span>
            <span>{size === "sm" ? lang.short : lang.labelNative}</span>
          </Badge>
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={() => handleSelect(currentLang === "en" ? "am" : "en")}
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground",
          className
        )}
        title={currentLang === "en" ? "Switch to Amharic" : "Switch to English"}
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage.short}</span>
      </button>
    );
  }

  // Default: button variant
  const sizeClasses = {
    sm: "h-8 text-xs gap-1.5",
    default: "h-9 text-sm gap-2",
    lg: "h-10 text-base gap-2",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="glass"
          size={size === "lg" ? "default" : size === "sm" ? "sm" : "default"}
          className={cn(sizeClasses[size], className)}
        >
          <span className="text-base">{currentLanguage.flag}</span>
          <span>{size === "sm" ? currentLanguage.short : currentLanguage.labelNative}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              "flex items-center justify-between py-2.5 cursor-pointer",
              currentLang === lang.code && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div>
                <p className="text-sm font-medium">{lang.labelNative}</p>
                <p className="text-xs text-muted-foreground">{lang.label}</p>
              </div>
            </span>
            {currentLang === lang.code && <Check className="h-4 w-4 text-primary ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;