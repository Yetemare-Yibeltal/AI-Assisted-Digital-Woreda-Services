import React, { createContext, useContext, useCallback } from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  dismiss: (toastId?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  dismiss: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant = "default", duration = 5000, action } = options;
    const baseStyles = {
      default: {},
      success: { style: { background: "#065f46", border: "1px solid #059669", color: "#d1fae5" } },
      error: { style: { background: "#7f1d1d", border: "1px solid #dc2626", color: "#fee2e2" } },
      warning: { style: { background: "#78350f", border: "1px solid #d97706", color: "#fef3c7" } },
      info: { style: { background: "#1e3a5f", border: "1px solid #2563eb", color: "#dbeafe" } },
    };
    sonnerToast(title || "", {
      description,
      duration,
      action: action ? { label: action.label, onClick: action.onClick } : undefined,
      ...baseStyles[variant],
    });
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) sonnerToast.dismiss(toastId);
    else sonnerToast.dismiss();
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <SonnerToaster
        position="top-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          className: "glass-heavy border border-border/30",
        }}
      />
    </ToastContext.Provider>
  );
}

export default ToastProvider;