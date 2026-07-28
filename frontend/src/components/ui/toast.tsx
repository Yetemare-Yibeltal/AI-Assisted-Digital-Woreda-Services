import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/shadcn-utils";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4",
      "sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  cn(
    "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
    "rounded-xl border p-4 shadow-2xl",
    "backdrop-blur-xl transition-all duration-300",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80",
    "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full"
  ),
  {
    variants: {
      variant: {
        default: "bg-woreda-card border-border/20 text-foreground",
        success: "bg-emerald-950/90 border-emerald-500/30 text-emerald-100",
        error: "bg-red-950/90 border-red-500/30 text-red-100",
        warning: "bg-yellow-950/90 border-yellow-500/30 text-yellow-100",
        info: "bg-blue-950/90 border-blue-500/30 text-blue-100",
        loading: "bg-woreda-card border-primary/30 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap: Record<string, React.ReactNode> = {
  default: <Info className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
  loading: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
};

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onDismiss?: () => void;
  showProgress?: boolean;
  duration?: number;
  icon?: React.ReactNode;
}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  (
    {
      className,
      variant = "default",
      title,
      description,
      action,
      onDismiss,
      showProgress = true,
      duration = 5000,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const [progress, setProgress] = React.useState(100);
    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    React.useEffect(() => {
      if (!showProgress || !duration || duration === Infinity) return;

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }, 50);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [showProgress, duration]);

    const variantKey = variant || "default";

    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        duration={duration}
        {...props}
      >
        <div className="shrink-0 mt-0.5">
          {icon || iconMap[variantKey]}
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <ToastPrimitives.Title className="text-sm font-semibold leading-tight">
              {title}
            </ToastPrimitives.Title>
          )}
          {description && (
            <ToastPrimitives.Description className="mt-1 text-sm opacity-90 leading-relaxed">
              {description}
            </ToastPrimitives.Description>
          )}
          {children}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action && (
            <ToastPrimitives.Action altText="Action" asChild>
              {action}
            </ToastPrimitives.Action>
          )}
          <ToastPrimitives.Close
            onClick={onDismiss}
            className="rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <X className="h-4 w-4" />
          </ToastPrimitives.Close>
        </div>

        {showProgress && duration && duration !== Infinity && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </ToastPrimitives.Root>
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-primary/20 px-3 text-xs font-medium text-primary",
      "hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps2 = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps2 as ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};