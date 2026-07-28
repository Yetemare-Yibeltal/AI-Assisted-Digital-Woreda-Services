import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  Save,
  Check,
} from "lucide-react";

interface FormActionsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  language?: "en" | "am";
  className?: string;
  disableNext?: boolean;
  showSaveDraft?: boolean;
  onSaveDraft?: () => void;
}

export function FormActions({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  loading = false,
  language = "en",
  className,
  disableNext = false,
  showSaveDraft = false,
  onSaveDraft,
}: FormActionsProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div
      className={cn(
        "flex items-center justify-between pt-6 mt-8 border-t border-border/20",
        className
      )}
    >
      {/* Left side */}
      <div>
        {!isFirstStep && onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={loading}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            {language === "am" ? "ተመለስ" : "Previous"}
          </Button>
        )}
      </div>

      {/* Center - Step indicator */}
      <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{currentStep}</span>
        <span>/</span>
        <span>{totalSteps}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {showSaveDraft && onSaveDraft && !isLastStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSaveDraft}
            disabled={loading}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {language === "am" ? "ረቂቅ አስቀምጥ" : "Save Draft"}
          </Button>
        )}

        {!isLastStep ? (
          <Button
            type="button"
            variant="primary"
            onClick={onNext}
            disabled={disableNext || loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {language === "am" ? "ቀጣይ" : "Next"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            disabled={loading}
            loading={loading}
            size="lg"
            leftIcon={<Send className="h-4 w-4" />}
            className="min-w-[160px]"
          >
            {loading
              ? language === "am"
                ? "በመላክ ላይ..."
                : "Submitting..."
              : language === "am"
              ? "ማመልከቻ ያስገቡ"
              : "Submit Application"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FormActions;