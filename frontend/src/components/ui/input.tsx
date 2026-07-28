import * as React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      label,
      leftIcon,
      rightIcon,
      showCharCount,
      maxLength,
      containerClassName,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [charCount, setCharCount] = React.useState(
      typeof value === "string" ? value.length : 0
    );
    const inputId = id || React.useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground/80"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={inputType}
            className={cn(
              "glass-input w-full",
              "text-foreground placeholder:text-muted-foreground/50",
              "transition-all duration-200",
              leftIcon && "pl-10",
              (rightIcon || type === "password") && "pr-10",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
          {type === "password" ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          ) : null}
        </div>
        <div className="flex justify-between min-h-[20px]">
          {error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : (
            <span />
          )}
          {showCharCount && maxLength && (
            <p className="text-xs text-muted-foreground">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };