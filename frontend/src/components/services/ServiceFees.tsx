import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, Banknote, CreditCard, Receipt, AlertCircle, Info } from "lucide-react";
import type { IFee } from "@/types/service.types";

interface ServiceFeesProps {
  fees: IFee[];
  language?: "en" | "am";
  className?: string;
  compact?: boolean;
}

export function ServiceFees({
  fees,
  language = "en",
  className,
  compact = false,
}: ServiceFeesProps) {
  const totalFee = (fees || []).reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const hasMultipleFees = fees && fees.length > 1;

  if (!fees || fees.length === 0) {
    return (
      <Card variant="glass" className={cn("p-6", className)}>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircleIcon className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground">
              {language === "am" ? "ነጻ አገልግሎት" : "Free Service"}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "am"
                ? "ይህ አገልግሎት ምንም ክፍያ አያስፈልገውም።"
                : "This service does not require any payment."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {!compact && (
        <div className="flex items-center gap-3 mb-2">
          <Banknote className="h-5 w-5 text-ethiopia-yellow" />
          <h3 className="text-lg font-bold">
            {language === "am" ? "የአገልግሎት ክፍያዎች" : "Service Fees"}
          </h3>
        </div>
      )}

      <div className="space-y-2">
        {fees.map((fee, index) => (
          <Card
            key={index}
            variant="glass"
            className={cn(
              "flex items-center justify-between p-4 transition-all duration-200",
              "hover:border-primary/20"
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-ethiopia-yellow/10 flex items-center justify-center shrink-0">
                <Coins className="h-4 w-4 text-ethiopia-yellow" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {language === "am" ? fee.nameAmharic : fee.name}
                </p>
                {fee.description && !compact && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {fee.description}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0 ml-3">
              <p className="text-lg font-extrabold text-foreground tabular-nums">
                {fee.amount.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                {fee.currency || "ETB"}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Total */}
      <Card
        variant="glass"
        className={cn(
          "flex items-center justify-between p-4",
          "border-primary/30 bg-primary/5"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">
              {language === "am" ? "ጠቅላላ ክፍያ" : "Total Fee"}
            </p>
            {hasMultipleFees && !compact && (
              <p className="text-xs text-muted-foreground">
                {language === "am"
                  ? `${fees.length} ክፍያዎች`
                  : `${fees.length} fee items`}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-primary tabular-nums">
            {totalFee.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase text-primary/70 font-semibold tracking-wider">
            ETB
          </p>
        </div>
      </Card>

      {/* Payment instructions */}
      {!compact && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">
              {language === "am" ? "የክፍያ መመሪያ" : "Payment Instructions"}
            </p>
            <ul className="space-y-1 text-xs">
              <li>
                {language === "am"
                  ? "ክፍያ የሚከፈለው በወረዳው ፋይናንስ ቢሮ ብቻ ነው።"
                  : "Payment must be made at the Woreda Finance Office only."}
              </li>
              <li>
                {language === "am"
                  ? "ደረሰኝዎን ይዘው ይቆዩ። ለማመልከቻዎ ማስረጃ ያስፈልጋል።"
                  : "Keep your receipt. It will be required as proof of payment."}
              </li>
              <li>
                {language === "am"
                  ? "ክፍያዎች ተመላሽ አይደረጉም።"
                  : "Fees are non-refundable."}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default ServiceFees;