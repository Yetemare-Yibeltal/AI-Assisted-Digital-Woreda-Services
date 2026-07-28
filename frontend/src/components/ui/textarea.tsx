import * as React from "react";
import { cn } from "@/lib/shadcn-utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, showCharCount, maxLength, id, value, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(typeof value === "string" ? value.length : 0);
    const textareaId = id || React.useId();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={textareaId} className="text-sm font-medium text-foreground/80">{label}</label>}
        <textarea
          id={textareaId}
          className={cn(
            "glass-input w-full min-h-[100px] resize-y",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex justify-between min-h-[20px]">
          {error ? <p className="text-xs text-red-400">{error}</p> : <span />}
          {showCharCount && maxLength && <p className="text-xs text-muted-foreground">{charCount}/{maxLength}</p>}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };
