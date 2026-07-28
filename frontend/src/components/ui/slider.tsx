import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/shadcn-utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean;
  formatValue?: (value: number) => string;
  label?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showValue = false, formatValue, label, value, ...props }, ref) => {
  const displayValue = value ?? props.defaultValue ?? [0];

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          {showValue && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatValue
                ? formatValue(displayValue[0])
                : displayValue[0]}
              {props.range && displayValue.length > 1 && (
                <> &mdash; {formatValue ? formatValue(displayValue[1]) : displayValue[1]}</>
              )}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        value={value}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/50">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#009A44] to-[#00C853]" />
        </SliderPrimitive.Track>
        {displayValue.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };