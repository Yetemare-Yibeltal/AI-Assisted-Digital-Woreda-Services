import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/shadcn-utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 flex items-start gap-3",
  {
    variants: {
      variant: {
        default: "bg-secondary/30 border-border/50 text-foreground",
        success:
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-100",
        error:
          "bg-red-500/10 border-red-500/30 text-red-100",
        warning:
          "bg-yellow-500/10 border-yellow-500/30 text-yellow-100",
        info:
          "bg-blue-500/10 border-blue-500/30 text-blue-100",
        glass:
          "glass-card border-border/30 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap: Record<string, LucideIcon> = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  glass: Info,
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      icon,
      onDismiss,
      dismissible = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantKey = variant || "default";
    const IconComponent = iconMap[variantKey];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="shrink-0 mt-0.5">
          {icon || <IconComponent className="h-5 w-5" />}
        </div>

        <div className="flex-1 min-w-0 text-sm">{children}</div>

        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 font-semibold leading-tight tracking-tight",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("opacity-90 leading-relaxed [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };