import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ArrowDown, CheckCircle2 } from "lucide-react";
import type { IServiceStep } from "@/types/service.types";

interface ServiceStepsProps {
  steps: IServiceStep[];
  language?: "en" | "am";
  currentStep?: number;
  className?: string;
}

export function ServiceSteps({
  steps,
  language = "en",
  currentStep,
  className,
}: ServiceStepsProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {language === "am" ? "ምንም ደረጃዎች አልተገለጹም" : "No steps defined"}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-6 top-8 bottom-4 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

      <div className="space-y-6">
        {steps
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step, index) => {
            const isCurrent = currentStep === step.stepNumber;
            const isPast = currentStep ? step.stepNumber < currentStep : false;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.stepNumber} className="relative flex gap-4">
                {/* Step number circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
                      isPast
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : isCurrent
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20 animate-pulse-glow"
                        : "bg-secondary/50 text-muted-foreground border-2 border-border/50"
                    )}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>
                </div>

                {/* Step content */}
                <Card
                  className={cn(
                    "flex-1 p-4 transition-all duration-300",
                    isCurrent && "border-primary/50 shadow-lg shadow-primary/5",
                    isPast && "opacity-80"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-base font-bold">
                        {language === "am" ? step.titleAmharic : step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {language === "am"
                          ? step.descriptionAmharic
                          : step.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant="warning" size="sm" className="shrink-0">
                        {language === "am" ? "አሁን" : "Current"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    {step.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        {step.estimatedTime}
                      </span>
                    )}
                    {step.officeLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-red-400" />
                        {step.officeLocation}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default ServiceSteps;