import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, Paperclip, X } from "lucide-react";

interface AIChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  language?: "en" | "am";
  className?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export function AIChatInput({
  onSend,
  onStop,
  loading = false,
  disabled = false,
  placeholder,
  language = "en",
  className,
  maxLength = 2000,
  showCharCount = true,
}: AIChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder =
    language === "am"
      ? "ጥያቄዎን ይጻፉ... (Enter ለመላክ፣ Shift+Enter ለአዲስ መስመር)"
      : "Type your question... (Enter to send, Shift+Enter for new line)";

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || loading || disabled) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  }, [value, loading, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className={cn(
            "resize-none min-h-[44px] max-h-[120px] pr-16",
            "bg-secondary/20 border-border/30 focus:border-primary/50",
            "text-sm leading-relaxed"
          )}
          disabled={disabled || loading}
          maxLength={maxLength}
          rows={1}
        />
        {/* Character count */}
        {showCharCount && (
          <span className="absolute bottom-2 right-12 text-[10px] text-muted-foreground tabular-nums">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {loading ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onStop}
            className="h-11 w-11 rounded-xl"
            title={language === "am" ? "አቁም" : "Stop"}
          >
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="icon"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20"
            title={language === "am" ? "ላክ" : "Send"}
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default AIChatInput;