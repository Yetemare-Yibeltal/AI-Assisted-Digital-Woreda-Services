import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  FileText,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Image,
  File,
} from "lucide-react";
import type { IRequiredDocument } from "@/types/service.types";
import { formatFileSize } from "@/utils/formatters";

interface ServiceRequirementsProps {
  documents: IRequiredDocument[];
  language?: "en" | "am";
  className?: string;
  compact?: boolean;
}

export function ServiceRequirements({
  documents,
  language = "en",
  className,
  compact = false,
}: ServiceRequirementsProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>
          {language === "am"
            ? "ምንም የሚያስፈልጉ ሰነዶች አልተገለጹም"
            : "No required documents specified"}
        </p>
      </div>
    );
  }

  const mandatoryDocs = documents.filter((d) => d.isMandatory);
  const optionalDocs = documents.filter((d) => !d.isMandatory);

  return (
    <div className={cn("space-y-4", className)}>
      {!compact && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="danger" size="sm">
              {mandatoryDocs.length}
            </Badge>
            <span className="text-muted-foreground">
              {language === "am" ? "ግዴታ" : "Mandatory"}
            </span>
          </div>
          {optionalDocs.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm">
                {optionalDocs.length}
              </Badge>
              <span className="text-muted-foreground">
                {language === "am" ? "አማራጭ" : "Optional"}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {documents.map((doc, index) => (
          <Card
            key={index}
            className={cn(
              "flex items-start gap-4 p-4 transition-all duration-200",
              doc.isMandatory
                ? "border-l-2 border-l-ethiopia-red"
                : "border-l-2 border-l-muted-foreground/30"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                doc.isMandatory
                  ? "bg-red-500/10 text-red-400"
                  : "bg-muted/20 text-muted-foreground"
              )}
            >
              {doc.isMandatory ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <HelpCircle className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-sm font-bold">
                    {language === "am" ? doc.nameAmharic : doc.name}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {language === "am"
                      ? doc.descriptionAmharic
                      : doc.description}
                  </p>
                </div>
                <Badge
                  variant={doc.isMandatory ? "danger" : "secondary"}
                  size="sm"
                  className="shrink-0"
                >
                  {doc.isMandatory
                    ? language === "am"
                      ? "ግዴታ"
                      : "Required"
                    : language === "am"
                    ? "አማራጭ"
                    : "Optional"}
                </Badge>
              </div>

              {!compact && (
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  {doc.format && (
                    <span className="flex items-center gap-1">
                      <File className="h-3.5 w-3.5" />
                      {doc.format}
                    </span>
                  )}
                  {doc.maxSize > 0 && (
                    <span className="flex items-center gap-1">
                      <Image className="h-3.5 w-3.5" />
                      Max: {formatFileSize(doc.maxSize)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!compact && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300">
            {language === "am"
              ? "እባክዎ ሁሉንም ኦርጅናል ሰነዶች ከቅጂዎቻቸው ጋር ይዘው ይምጡ።"
              : "Please bring all original documents along with their copies."}
          </p>
        </div>
      )}
    </div>
  );
}

export default ServiceRequirements;