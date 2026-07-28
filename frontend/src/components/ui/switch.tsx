import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/shadcn-utils";
import { Label } from "./label";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string;
  description?: string;
  error?: string;
  labelPosition?: "left" | "right";
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    {
      className,
      label,
      description,
      error,
      labelPosition = "right",
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || React.useId();
    const errorId = error ? `${switchId}-error` : undefined;
    const descriptionId = description ? `${switchId}-description` : undefined;

    const switchElement = (
      <SwitchPrimitives.Root
        id={switchId}
        ref={ref}
        className={cn(
          "peer inline-flex h-[26px] w-[48px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-primary",
          "data-[state=unchecked]:bg-secondary/60",
          error && "data-[state=unchecked]:bg-red-500/20 border-red-500/30",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={errorId || descriptionId}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-[22px] w-[22px] rounded-full bg-white shadow-lg ring-0",
            "transition-transform duration-200 ease-in-out",
            "data-[state=checked]:translate-x-[22px]",
            "data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitives.Root>
    );

    if (!label && !description) return switchElement;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {labelPosition === "left" && label && (
            <Label
              htmlFor={switchId}
              className="text-sm font-medium cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              {label}
            </Label>
          )}

          {switchElement}

          {labelPosition === "right" && label && (
            <Label
              htmlFor={switchId}
              className="text-sm font-medium cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              {label}
            </Label>
          )}
        </div>

        {description && (
          <p
            id={descriptionId}
            className="text-xs text-muted-foreground ml-[60px]"
          >
            {description}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className="text-xs text-red-400 ml-[60px]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
export type { SwitchProps };