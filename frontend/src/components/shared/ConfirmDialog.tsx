import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  titleAmharic?: string;
  description?: string;
  descriptionAmharic?: string;
  confirmLabel?: string;
  confirmLabelAmharic?: string;
  cancelLabel?: string;
  cancelLabelAmharic?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  language?: "en" | "am";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  titleAmharic,
  description = "This action cannot be undone.",
  descriptionAmharic,
  confirmLabel = "Confirm",
  confirmLabelAmharic,
  cancelLabel = "Cancel",
  cancelLabelAmharic,
  variant = "default",
  loading = false,
  language = "en",
}: ConfirmDialogProps) {
  const displayTitle = language === "am" && titleAmharic ? titleAmharic : title;
  const displayDescription = language === "am" && descriptionAmharic ? descriptionAmharic : description;
  const displayConfirm = language === "am" && confirmLabelAmharic ? confirmLabelAmharic : confirmLabel;
  const displayCancel = language === "am" && cancelLabelAmharic ? cancelLabelAmharic : cancelLabel;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${variant === "destructive" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{displayDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{displayCancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            variant={variant === "destructive" ? "destructive" : "default"}
            loading={loading}
          >
            {displayConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;