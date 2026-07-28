import { cn } from "@/lib/shadcn-utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "table-row" | "form";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  count?: number;
}

function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
  count = 1,
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-secondary/50 relative overflow-hidden";

  const animationClasses: Record<string, string> = {
    pulse: "animate-pulse",
    wave: cn(
      "before:absolute before:inset-0",
      "before:-translate-x-full",
      "before:animate-[shimmer_2s_infinite]",
      "before:bg-gradient-to-r",
      "before:from-transparent before:via-white/5 before:to-transparent"
    ),
    none: "",
  };

  const variantClasses: Record<string, string> = {
    text: "rounded-md h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl h-48 w-full",
    "table-row": "rounded-md h-12 w-full",
    form: "rounded-lg h-10 w-full",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  if (count > 1) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant={variant}
            width={width}
            height={height}
            animation={animation}
            count={1}
            className={i === count - 1 && variant === "text" ? "w-3/4" : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
}

function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton variant="table-row" />
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              className="h-8 flex-1"
              animation="wave"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton variant="text" className="w-3/4" animation="wave" />
      <Skeleton variant="text" count={3} animation="wave" />
      <div className="flex gap-4 pt-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
      </div>
    </div>
  );
}

function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="w-1/4 h-3" />
          <Skeleton variant="form" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton variant="rectangular" width={120} height={44} />
        <Skeleton variant="rectangular" width={100} height={44} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-28" animation="wave" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="card" className="h-80" animation="wave" />
        <Skeleton variant="card" className="h-80" animation="wave" />
      </div>
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}

export { Skeleton, TableSkeleton, CardSkeleton, FormSkeleton, DashboardSkeleton };