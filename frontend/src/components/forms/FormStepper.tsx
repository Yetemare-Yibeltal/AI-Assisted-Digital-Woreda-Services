import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Check, type LucideIcon } from "lucide-react";

interface Step {
  id: number;
  label: string;
  labelAmharic: string;
  icon: LucideIcon;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  language?: "en" | "am";
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function FormStepper({
  steps,
  currentStep,
  onStepClick,
  language = "en",
  className,
  orientation = "horizontal",
}: FormStepperProps) {
  if (!steps || steps.length === 0) return null;

  const sortedSteps = [...steps].sort((a, b) => a.id - b.id);

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-0", className)}>
        {sortedSteps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isUpcoming = step.id > currentStep;
          const isLast = index === sortedSteps.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted && onStepClick) onStepClick(step.id);
                  }}
                  disabled={isUpcoming}
                  className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground cursor-pointer hover:brightness-110",
                    isActive && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming && "bg-secondary/30 border-border/50 text-muted-foreground cursor-not-allowed"
                  )}
                  aria-label={`Step ${step.id}: ${language === "am" ? step.labelAmharic : step.label}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </button>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[24px] transition-colors duration-300",
                      isCompleted ? "bg-primary" : "bg-border/50"
                    )}
                  />
                )}
              </div>

              <div className={cn("pb-6", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-semibold mt-2",
                    isCompleted && "text-primary",
                    isActive && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {language === "am" ? step.labelAmharic : step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === "am" ? `ደረጃ ${step.id}` : `Step ${step.id}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between">
        {sortedSteps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isUpcoming = step.id > currentStep;
          const isLast = index === sortedSteps.length - 1;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted && onStepClick) onStepClick(step.id);
                  }}
                  disabled={isUpcoming}
                  className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground cursor-pointer hover:brightness-110",
                    isActive && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg shadow-primary/20",
                    isUpcoming && "bg-secondary/30 border-border/50 text-muted-foreground cursor-not-allowed"
                  )}
                  aria-label={`Step ${step.id}: ${language === "am" ? step.labelAmharic : step.label}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs sm:text-sm font-semibold hidden sm:block",
                      isCompleted && "text-primary",
                      isActive && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {language === "am" ? step.labelAmharic : step.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {language === "am" ? `ደረጃ ${step.id}` : `Step ${step.id}`}
                  </p>
                </div>
              </div>

              {!isLast && (
                <div className="flex-1 mx-2 sm:mx-4 -mt-6">
                  <div
                    className={cn(
                      "h-1 rounded-full transition-colors duration-300",
                      isCompleted ? "bg-primary" : "bg-border/50"
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default FormStepper;