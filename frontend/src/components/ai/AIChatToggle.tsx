import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Sparkles } from "lucide-react";

interface AIChatToggleProps {
  isOpen: boolean;
  onClick: () => void;
  language?: "en" | "am";
  className?: string;
  unreadCount?: number;
}

export function AIChatToggle({
  isOpen,
  onClick,
  language = "en",
  className,
  unreadCount = 0,
}: AIChatToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-2",
        "transition-all duration-300 ease-in-out",
        isOpen
          ? "bg-woreda-card border border-border/30 text-foreground h-12 px-4 rounded-full shadow-lg hover:shadow-xl"
          : "bg-primary text-primary-foreground h-14 w-14 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110",
        className
      )}
      aria-label={
        isOpen
          ? language === "am"
            ? "ቻት ዝጋ"
            : "Close chat"
          : language === "am"
          ? "ቻት ክፈት"
          : "Open chat"
      }
      title={
        isOpen
          ? language === "am"
            ? "AI ረዳት ዝጋ"
            : "Close AI Assistant"
          : language === "am"
          ? "AI ረዳት ክፈት (Ctrl+/)"
          : "Open AI Assistant (Ctrl+/)"
      }
    >
      {/* Collapsed state: just icon + badge */}
      {!isOpen && (
        <div className="relative">
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="danger"
              size="sm"
              className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center px-1 text-[10px] rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
      )}

      {/* Expanded state: label + close icon */}
      {isOpen && (
        <>
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {language === "am" ? "AI ረዳት" : "AI Assistant"}
          </span>
          <X className="h-4 w-4 ml-1 opacity-70" />
        </>
      )}
    </button>
  );
}

export default AIChatToggle;