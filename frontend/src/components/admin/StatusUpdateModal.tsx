import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  AlertTriangle,
  CheckCircle,
  Send,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/shadcn-utils";
import api from "@/utils/api";
import { storage } from "@/utils/storage";
import type { IApplication, ApplicationStatus } from "@/types/application.types";
import type { ApiResponse } from "@/types/api.types";

interface StatusUpdateModalProps {
  application: IApplication;
  open: boolean;
  onClose: () => void;
  onUpdated?: (updatedApplication: IApplication) => void;
  language?: "en" | "am";
}

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ["under_review", "documents_requested", "rejected"],
  under_review: ["documents_requested", "approved", "rejected"],
  documents_requested: ["under_review", "rejected"],
  approved: ["completed", "rejected"],
  rejected: ["pending"],
  completed: [],
};

const STATUS_LABELS: Record<ApplicationStatus, { en: string; am: string }> = {
  pending: { en: "Pending", am: "በመጠባበቅ ላይ" },
  under_review: { en: "Under Review", am: "በግምገማ ላይ" },
  documents_requested: { en: "Documents Requested", am: "ሰነዶች ተጠይቀዋል" },
  approved: { en: "Approved", am: "ጸድቋል" },
  rejected: { en: "Rejected", am: "ውድቅ ተደርጓል" },
  completed: { en: "Completed", am: "ተጠናቋል" },
};

export function StatusUpdateModal({
  application,
  open,
  onClose,
  onUpdated,
  language = "en",
}: StatusUpdateModalProps) {
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState<ApplicationStatus | "">("");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const availableTransitions = VALID_TRANSITIONS[application.status] || [];

  const isRejecting = newStatus === "rejected";
  const isApproving = newStatus === "approved";
  const isCompleting = newStatus === "completed";

  const needsConfirmation = isRejecting || isApproving || isCompleting;

  const handleSubmit = async () => {
    if (!newStatus) return;

    if (needsConfirmation && !confirmVisible) {
      setConfirmVisible(true);
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        status: newStatus,
        notes: notes || `Status updated from ${application.status} to ${newStatus}`,
      };

      if (isRejecting && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await api.patch<ApiResponse<IApplication>>(
        `/applications/${application._id}/status`,
        payload
      );

      if (response.data.success) {
        toast({
          variant: "success",
          title: language === "am" ? "ሁኔታ ዘምኗል" : "Status Updated",
          description: language === "am"
            ? `ማመልከቻ ${application.trackingNumber} ወደ "${STATUS_LABELS[newStatus as ApplicationStatus]?.am || newStatus}" ተቀይሯል።`
            : `Application ${application.trackingNumber} status changed to "${STATUS_LABELS[newStatus as ApplicationStatus]?.en || newStatus}".`,
        });

        onUpdated?.(response.data.data);
        handleClose();
      }
    } catch (error: any) {
      console.error("Status update error:", error);
      const message = error?.message || (language === "am" ? "ሁኔታ ማዘመን አልተሳካም" : "Failed to update status");
      toast({
        variant: "error",
        title: language === "am" ? "ስህተት" : "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewStatus("");
    setNotes("");
    setRejectionReason("");
    setConfirmVisible(false);
    setLoading(false);
    onClose();
  };

  const canSubmit = !!newStatus && !!notes.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {language === "am" ? "ሁኔታ አዘምን" : "Update Application Status"}
          </DialogTitle>
          <DialogDescription>
            {language === "am"
              ? `ማመልከቻ ${application.trackingNumber} - ${application.applicantInfo.fullNameAmharic || application.applicantInfo.fullName}`
              : `Application ${application.trackingNumber} - ${application.applicantInfo.fullName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Current Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <span className="text-sm text-muted-foreground">
              {language === "am" ? "አሁን ያለው ሁኔታ:" : "Current Status:"}
            </span>
            <StatusBadge status={application.status} />
            {newStatus && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <StatusBadge status={newStatus as ApplicationStatus} />
              </>
            )}
          </div>

          {/* Select New Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "am" ? "አዲስ ሁኔታ ይምረጡ" : "Select New Status"}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setNewStatus(status);
                    setConfirmVisible(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                    newStatus === status
                      ? "border-primary bg-primary/15 text-primary shadow-sm"
                      : "border-border/30 bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {language === "am"
                    ? STATUS_LABELS[status]?.am || status
                    : STATUS_LABELS[status]?.en || status}
                </button>
              ))}
              {availableTransitions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {language === "am"
                    ? "ምንም የሚፈቀድ ሽግግር የለም።"
                    : "No valid transitions available."}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "am" ? "ማስታወሻዎች" : "Notes"}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <Textarea
              placeholder={
                language === "am"
                  ? "ለምን እንደሆነ ያብራሩ..."
                  : "Explain the reason for this status change..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              showCharCount
              maxLength={2000}
            />
          </div>

          {/* Rejection Reason */}
          {isRejecting && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === "am" ? "የተቀባይነት ማጣት ምክንያት" : "Rejection Reason"}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <Textarea
                placeholder={
                  language === "am"
                    ? "ማመልከቻው ለምን ውድቅ እንደተደረገ ያብራሩ..."
                    : "Explain why this application is being rejected..."
                }
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                showCharCount
                maxLength={500}
              />
            </div>
          )}

          {/* Confirmation Warning */}
          {confirmVisible && needsConfirmation && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">
                  {language === "am" ? "እርግጠኛ ነዎት?" : "Are you sure?"}
                </p>
                <p className="text-xs text-yellow-300 mt-1">
                  {isRejecting
                    ? language === "am"
                      ? "ይህ ማመልከቻ ውድቅ ይደረጋል። ይህን ተግባር መቀልበስ አይችሉም።"
                      : "This application will be rejected. This action can be undone by moving back to pending."
                    : isApproving
                    ? language === "am"
                      ? "ይህ ማመልከቻ ጸድቋል። ሰርተፍኬት ለማተም ዝግጁ ይሆናል።"
                      : "This application will be approved and a certificate can be generated."
                    : language === "am"
                    ? "ይህ ማመልከቻ እንደተጠናቀቀ ምልክት ይደረጋል።"
                    : "This application will be marked as completed."}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {language === "am" ? "ይቅር" : "Cancel"}
          </Button>
          <Button
            variant={isRejecting ? "destructive" : "primary"}
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            loading={loading}
            leftIcon={loading ? undefined : <Send className="h-4 w-4" />}
          >
            {confirmVisible && needsConfirmation
              ? language === "am"
                ? "አረጋግጥና አዘምን"
                : "Confirm & Update"
              : language === "am"
              ? "ሁኔታ አዘምን"
              : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StatusUpdateModal;