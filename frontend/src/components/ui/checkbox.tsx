import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/shadcn-utils";
import { Label } from "./label";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, error, indeterminate, id, ...props }, ref) => {
  const checkboxId = id || React.useId();
  const errorId = error ? `${checkboxId}-error` : undefined;
  const descriptionId = description ? `${checkboxId}-description` : undefined;

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(
            "peer mt-0.5 h-5 w-5 shrink-0 rounded-md border-2",
            "border-border/50 bg-transparent",
            "ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
            "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground",
            "transition-colors duration-150",
            error && "border-red-500/50 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={errorId || descriptionId}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
          >
            {props.checked === "indeterminate" ? (
              <Minus className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <Label
                htmlFor={checkboxId}
                className="text-sm font-medium leading-tight cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
              >
                {label}
              </Label>
            )}
            {description && (
              <p
                id={descriptionId}
                className="text-xs text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-400 pl-8" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
export type { CheckboxProps };