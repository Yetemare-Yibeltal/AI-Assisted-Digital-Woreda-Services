import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/shadcn-utils";
import { X } from "lucide-react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary border border-primary/30",
        secondary: "bg-secondary text-secondary-foreground border border-border",
        success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        warning: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
        danger: "bg-red-500/15 text-red-400 border border-red-500/30",
        info: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
        purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
        orange: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
        outline: "border border-border text-foreground bg-transparent",
        glass: "glass-card-interactive text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  pulse?: boolean;
}

const dotColors: Record<string, string> = {
  default: "bg-primary",
  success: "bg-emerald-400",
  warning: "bg-yellow-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
  purple: "bg-purple-400",
  orange: "bg-orange-400",
  secondary: "bg-gray-400",
  outline: "bg-foreground",
  glass: "bg-primary",
};

function Badge({
  className,
  variant,
  size,
  dot = false,
  dotColor,
  removable = false,
  onRemove,
  icon,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full",
              dotColor || dotColors[variant || "default"] || "bg-primary"
            )}
          />
          {pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                dotColor || dotColors[variant || "default"] || "bg-primary"
              )}
            />
          )}
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
          tabIndex={-1}
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };