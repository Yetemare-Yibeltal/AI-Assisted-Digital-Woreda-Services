import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/shadcn-utils";
import { motion, AnimatePresence } from "framer-motion";

const Tabs = TabsPrimitive.Root;

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "default" | "glass" | "pills" | "underline";
  fullWidth?: boolean;
  alignment?: "start" | "center" | "end";
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant = "default", fullWidth = false, alignment = "start", children, ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      default: "bg-secondary/30 p-1 rounded-lg",
      glass: "glass-card p-1 rounded-lg",
      pills: "gap-2 bg-transparent p-0",
      underline: "gap-0 bg-transparent p-0 border-b border-border/30 rounded-none",
    };

    const alignmentStyles: Record<string, string> = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
    };

    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "inline-flex items-center text-muted-foreground",
          "overflow-x-auto scrollbar-none",
          variantStyles[variant],
          alignmentStyles[alignment],
          fullWidth && "w-full [&>*]:flex-1",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    );
  }
);
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: "default" | "glass" | "pills" | "underline";
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, variant = "default", icon, badge, badgeColor, children, ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      default: cn(
        "rounded-md px-4 py-2.5 text-sm font-medium",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "hover:text-foreground/80",
        "transition-all duration-200"
      ),
      glass: cn(
        "rounded-md px-4 py-2.5 text-sm font-medium",
        "data-[state=active]:bg-primary/15 data-[state=active]:text-primary",
        "hover:text-foreground/80 data-[state=active]:hover:text-primary",
        "transition-all duration-200"
      ),
      pills: cn(
        "rounded-full px-5 py-2.5 text-sm font-medium border border-border/30",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20",
        "hover:border-primary/50",
        "transition-all duration-200"
      ),
      underline: cn(
        "rounded-none px-5 py-3 text-sm font-medium border-b-2 border-transparent -mb-[1px]",
        "data-[state=active]:border-primary data-[state=active]:text-primary",
        "hover:text-foreground/80 hover:border-border",
        "transition-all duration-200"
      ),
    };

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "select-none",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
        {badge !== undefined && (
          <span
            className={cn(
              "ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold leading-none",
              badgeColor || "bg-primary/20 text-primary"
            )}
          >
            {typeof badge === "number" && badge > 99 ? "99+" : badge}
          </span>
        )}
      </TabsPrimitive.Trigger>
    );
  }
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  animation?: "fade" | "slide" | "none";
}

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  ({ className, animation = "fade", children, ...props }, ref) => {
    const animationClasses: Record<string, string> = {
      fade: "data-[state=inactive]:animate-out data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=inactive]:fade-out-0",
      slide: "data-[state=inactive]:animate-out data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-left-2 data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-right-2",
      none: "",
    };

    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(
          "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          animationClasses[animation],
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Content>
    );
  }
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };