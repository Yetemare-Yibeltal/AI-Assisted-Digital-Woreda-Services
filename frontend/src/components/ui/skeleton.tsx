import { cn } from "@/lib/shadcn-utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
}

function Skeleton({ className, circle = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary/50",
        circle && "rounded-full",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };