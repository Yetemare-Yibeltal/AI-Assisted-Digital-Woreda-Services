import React, { useState } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Globe, Check, ChevronDown } from "lucide-react";
import { storage } from "@/utils/storage";

interface AILanguageSelectorProps {
  language?: "en" | "am";
  onLanguageChange?: (lang: "en" | "am") => void;
  className?: string;
  variant?: "button" | "minimal" | "badge";
}

const languages = [
  { code: "en" as const, label: "English", labelNative: "English", flag: "🇬🇧" },
  { code: "am" as const, label: "Amharic", labelNative: "አማርኛ", flag: "🇪🇹" },
];

export function AILanguageSelector({
  language = "en",
  onLanguageChange,
  className,
  variant = "button",
}: AILanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<"en" | "am">(
    language || storage.getLanguage()
  );

  const handleSelect = (lang: "en" | "am") => {
    setCurrentLang(lang);
    storage.setLanguage(lang);
    onLanguageChange?.(lang);
  };

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  if (variant === "minimal") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              className
            )}
          >
            <Globe className="h-4 w-4" />
            <span>{currentLang === "am" ? "አማ" : "EN"}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.labelNative}</span>
              </span>
              {currentLang === lang.code && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "badge") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {languages.map((lang) => (
          <Badge
            key={lang.code}
            variant={currentLang === lang.code ? "default" : "secondary"}
            className="cursor-pointer hover:opacity-80 transition-opacity text-xs"
            onClick={() => handleSelect(lang.code)}
          >
            {lang.flag} {lang.labelNative}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="glass"
          size="sm"
          className={cn("gap-2", className)}
        >
          <Globe className="h-4 w-4" />
          <span>{currentLanguage.flag} {currentLanguage.labelNative}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              "flex items-center justify-between py-2",
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
            {currentLang === lang.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AILanguageSelector;