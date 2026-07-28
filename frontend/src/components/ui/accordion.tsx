import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/shadcn-utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-border/30", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  showChevron?: boolean;
  chevronPosition?: "left" | "right";
  variant?: "default" | "glass";
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    { className, children, showChevron = true, chevronPosition = "right", variant = "default", ...props },
    ref
  ) => {
    const variantStyles: Record<string, string> = {
      default: "hover:bg-secondary/30 data-[state=open]:bg-secondary/20",
      glass: "hover:bg-woreda-glass data-[state=open]:bg-woreda-glass/80",
    };

    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex flex-1 items-center gap-3 py-4 px-4 text-sm font-medium transition-all rounded-lg",
            "text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
            "[&[data-state=open]>svg]:rotate-180",
            variantStyles[variant],
            chevronPosition === "left" ? "flex-row-reverse justify-end" : "justify-between",
            className
          )}
          {...props}
        >
          {children}
          {showChevron && (
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                chevronPosition === "left" ? "mr-0" : "ml-0"
              )}
            />
          )}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  withPadding?: boolean;
}

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, withPadding = true, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", withPadding && "px-4", className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };