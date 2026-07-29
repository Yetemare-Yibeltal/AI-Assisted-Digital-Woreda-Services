import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  ClipboardList,
  Sparkles,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface DocumentItem {
  name: string;
  nameAmharic: string;
  isMandatory: boolean;
  description: string;
  descriptionAmharic: string;
  format?: string;
  maxSize?: number;
}

interface AIDocumentChecklistProps {
  serviceName?: string;
  serviceSlug?: string;
  documents?: DocumentItem[];
  language?: "en" | "am";
  className?: string;
  loading?: boolean;
  onGeneratePDF?: () => void;
}

export function AIDocumentChecklist({
  serviceName,
  serviceSlug,
  documents: initialDocuments,
  language = "en",
  className,
  loading: externalLoading = false,
  onGeneratePDF,
}: AIDocumentChecklistProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments || []);
  const [loading, setLoading] = useState(externalLoading || false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const fetchDocuments = useCallback(async () => {
    if (!serviceSlug && !serviceName) return;
    if (initialDocuments && initialDocuments.length > 0) {
      setDocuments(initialDocuments);
      return;
    }

    setLoading(true);
    try {
      const endpoint = serviceSlug
        ? `/public/services/slug/${serviceSlug}`
        : `/ai/documents/checklist`;
      const body = serviceName ? { serviceName, language } : undefined;
      const method = body ? "post" : "get";

      const response = await api[method]<ApiResponse<any>>(endpoint, body || undefined);

      if (response.data?.success) {
        const docs = response.data.data?.requiredDocuments || response.data.data?.documents || [];
        setDocuments(docs);
      }
    } catch (err) {
      const msg = getErrorMessage(err, language === "am" ? "ሰነዶች መጫን አልተሳካም" : "Failed to load documents");
      toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }, [serviceSlug, serviceName, initialDocuments, language, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const toggleItem = (name: string) => {
    setCheckedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const mandatoryDocs = documents.filter((d) => d.isMandatory);
  const optionalDocs = documents.filter((d) => !d.isMandatory);
  const checkedMandatory = mandatoryDocs.filter((d) => checkedItems[d.name]).length;
  const allMandatoryChecked = checkedMandatory === mandatoryDocs.length;
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;

  if (loading) {
    return (
      <Card variant="glass" className={className}>
        <CardHeader>
          <Skeleton variant="text" className="w-1/2 h-5" />
          <Skeleton variant="text" className="w-3/4 h-4" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" className="flex-1 h-4" />
              <Skeleton variant="text" className="w-16 h-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card variant="glass" className={className}>
        <CardContent className="py-8 text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {language === "am" ? "ምንም ሰነዶች አልተገኙም" : "No documents found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "am" ? "የሚያስፈልጉ ሰነዶች" : "Required Documents"}
              </CardTitle>
              <CardDescription className="text-xs">
                {serviceName
                  ? language === "am"
                    ? `ለ${serviceName}`
                    : `For ${serviceName}`
                  : language === "am"
                  ? "ሁሉንም የሚያስፈልጉ ሰነዶች ያዘጋጁ"
                  : "Prepare all required documents"}
              </CardDescription>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <Badge variant={allMandatoryChecked ? "success" : "warning"} size="sm">
              {totalChecked}/{documents.length}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {language === "am" ? "ተዘጋጅተዋል" : "prepared"}
            </span>
            {onGeneratePDF && (
              <Button variant="glass" size="sm" onClick={onGeneratePDF} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                {language === "am" ? "PDF" : "PDF"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {/* Mandatory Documents */}
        {mandatoryDocs.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              {language === "am" ? "ግዴታ ሰነዶች" : "Mandatory"} ({mandatoryDocs.length})
            </p>
            {mandatoryDocs.map((doc, index) => (
              <div
                key={index}
                onClick={() => toggleItem(doc.name)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "border border-transparent",
                  checkedItems[doc.name]
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "hover:bg-secondary/20 border-border/10"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {checkedItems[doc.name] ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-red-400/50 flex items-center justify-center">
                      <AlertCircle className="h-3 w-3 text-red-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {language === "am" ? doc.nameAmharic : doc.name}
                    </p>
                    <Badge variant="danger" size="sm" className="text-[10px]">
                      {language === "am" ? "ግዴታ" : "Required"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {language === "am" ? doc.descriptionAmharic : doc.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    {doc.format && <span>{doc.format}</span>}
                    {doc.maxSize && <span>Max: {Math.round(doc.maxSize / 1024 / 1024)}MB</span>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Optional Documents */}
        {optionalDocs.length > 0 && (
          <>
            {mandatoryDocs.length > 0 && <Separator className="my-2 opacity-30" />}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              {language === "am" ? "አማራጭ ሰነዶች" : "Optional"} ({optionalDocs.length})
            </p>
            {optionalDocs.map((doc, index) => (
              <div
                key={index}
                onClick={() => toggleItem(doc.name)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "border border-transparent",
                  checkedItems[doc.name]
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "hover:bg-secondary/20 border-border/10"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {checkedItems[doc.name] ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {language === "am" ? doc.nameAmharic : doc.name}
                    </p>
                    <Badge variant="secondary" size="sm" className="text-[10px]">
                      {language === "am" ? "አማራጭ" : "Optional"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {language === "am" ? doc.descriptionAmharic : doc.description}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* AI Tip */}
        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-300 flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              {language === "am"
                ? "እባክዎ ሁሉንም ኦርጅናል ሰነዶች ከቅጂዎቻቸው ጋር ይዘው ይምጡ። ሰነዶች ሲዘጋጁ ላይ ምልክት ያድርጉ።"
                : "Please bring all original documents with photocopies. Check off items as you prepare them."}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIDocumentChecklist;