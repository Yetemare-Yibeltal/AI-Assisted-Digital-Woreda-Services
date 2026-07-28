import * as React from "react";
import { cn } from "@/lib/shadcn-utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface InputOTPProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}

function InputOTP({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
  className,
  autoFocus = true,
  onComplete,
}: InputOTPProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split("");
    newValue[index] = digit;
    const joined = newValue.join("").slice(0, length);

    while (joined.length < length && digit) {
      const nextIndex = joined.length;
      if (nextIndex < length && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex]?.focus();
        break;
      }
      break;
    }

    onChange(joined);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (joined.length === length && onComplete) {
      onComplete(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        const newValue = value.split("");
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData.padEnd(length, ""));
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 justify-center" onPaste={handlePaste}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={cn(
              "w-12 h-14 text-center text-xl font-bold",
              "glass-input rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              value[index] && "border-primary/50 bg-primary/5"
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-400 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { InputOTP };
export type { InputOTPProps };