import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

interface AITypingIndicatorProps {
  language?: "en" | "am";
  className?: string;
  showAvatar?: boolean;
  size?: "sm" | "default" | "lg";
}

export function AITypingIndicator({
  language = "en",
  className,
  showAvatar = true,
  size = "default",
}: AITypingIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    default: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const containerSize = {
    sm: "px-3 py-2",
    default: "px-4 py-3",
    lg: "px-5 py-3.5",
  };

  const avatarSize = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const dot = sizeClasses[size];

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {showAvatar && (
        <Avatar className={cn("shrink-0", avatarSize[size])}>
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
            <Bot className={cn(size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "bg-secondary/40 border border-border/20 rounded-2xl rounded-tl-md",
          containerSize[size]
        )}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              dot,
              "rounded-full bg-primary/60 animate-bounce"
            )}
            style={{ animationDelay: "0ms" }}
          />
          <span
            className={cn(
              dot,
              "rounded-full bg-primary/60 animate-bounce"
            )}
            style={{ animationDelay: "150ms" }}
          />
          <span
            className={cn(
              dot,
              "rounded-full bg-primary/60 animate-bounce"
            )}
            style={{ animationDelay: "300ms" }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground mt-1.5">
          {language === "am" ? "AI እየጻፈ ነው..." : "AI is typing..."}
        </p>
      </div>
    </div>
  );
}

export default AITypingIndicator;