import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Copy, CheckCircle2, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language: "en" | "am";
  onCopy?: (content: string) => void;
  onFeedback?: (id: string, type: "positive" | "negative") => void;
  recommendations?: Array<{
    serviceName: string;
    serviceNameAmharic: string;
    serviceSlug: string;
    matchScore: number;
  }>;
}

export function AIChatMessage({
  id,
  role,
  content,
  timestamp,
  language,
  onCopy,
  onFeedback,
  recommendations,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.(content);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type);
    onFeedback?.(id, type);
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 group",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {/* Assistant Avatar */}
      {role === "assistant" && (
        <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-primary/10">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div className={cn("max-w-[80%] space-y-1")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            role === "user"
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md"
              : "bg-secondary/40 text-foreground rounded-tl-md border border-border/20"
          )}
        >
          {/* Message Content */}
          <div className="whitespace-pre-wrap break-words">{content}</div>

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {language === "am" ? "የተመከሩ አገልግሎቶች" : "Recommended Services"}
              </p>
              {recommendations.map((rec, i) => (
                <a
                  key={i}
                  href={`/services/${rec.serviceSlug}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <span className="text-xs font-medium truncate">
                    {language === "am" ? rec.serviceNameAmharic : rec.serviceName}
                  </span>
                  <Badge variant="secondary" size="sm" className="text-[10px]">
                    {rec.matchScore}%
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer: timestamp + actions */}
        <div
          className={cn(
            "flex items-center gap-1 px-1",
            role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(timestamp)}
          </span>

          {/* Actions (visible on hover) */}
          <div className="hidden group-hover:flex items-center gap-0.5 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-0.5 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
              title={language === "am" ? "ቅዳ" : "Copy"}
            >
              {copied ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>

            {role === "assistant" && (
              <>
                <button
                  onClick={() => handleFeedback("positive")}
                  className={cn(
                    "p-0.5 rounded hover:bg-secondary/50 transition-colors",
                    feedback === "positive"
                      ? "text-emerald-400"
                      : "text-muted-foreground hover:text-emerald-400"
                  )}
                  title={language === "am" ? "ጥሩ" : "Helpful"}
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleFeedback("negative")}
                  className={cn(
                    "p-0.5 rounded hover:bg-secondary/50 transition-colors",
                    feedback === "negative"
                      ? "text-red-400"
                      : "text-muted-foreground hover:text-red-400"
                  )}
                  title={language === "am" ? "ጥሩ አይደለም" : "Not helpful"}
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {role === "user" && (
        <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-blue-500/10">
          <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 text-blue-400">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default AIChatMessage;