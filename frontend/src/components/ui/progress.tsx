import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/shadcn-utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorColor?: string;
  showValue?: boolean;
  size?: "sm" | "default" | "lg";
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, indicatorColor, showValue = false, size = "default", ...props }, ref) => {
    const sizeClasses = { sm: "h-1.5", default: "h-2.5", lg: "h-4" };
    return (
      <div className="space-y-1.5">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn("relative w-full overflow-hidden rounded-full bg-secondary/50", sizeClasses[size], className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn("h-full w-full flex-1 rounded-full transition-all duration-500 ease-out", indicatorColor || "bg-gradient-to-r from-[#009A44] to-[#00C853]")}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        {showValue && <p className="text-xs text-muted-foreground text-right">{Math.round(value || 0)}%</p>}
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };
