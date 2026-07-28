import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateFile, formatFileSize, isImageFile } from "@/utils/file";
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  File,
  Eye,
  Trash2,
} from "lucide-react";
import type { IRequiredDocument } from "@/types/service.types";

interface UploadedFile {
  file: File;
  documentType: string;
  preview?: string;
}

interface DocumentUploadFieldsProps {
  requiredDocuments: IRequiredDocument[];
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  language?: "en" | "am";
  className?: string;
  maxFileSize?: number;
}

export function DocumentUploadFields({
  requiredDocuments,
  uploadedFiles,
  onFilesChange,
  language = "en",
  className,
  maxFileSize = 5 * 1024 * 1024,
}: DocumentUploadFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocumentType, setActiveDocumentType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const getUploadedFileForDoc = (documentType: string) => {
    return uploadedFiles.find((f) => f.documentType === documentType);
  };

  const handleUploadClick = (documentType: string) => {
    setActiveDocumentType(documentType);
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeDocumentType) return;

      const validation = validateFile(file, ["application/pdf", "image/jpeg", "image/png", "image/webp"], maxFileSize);

      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      setError(null);

      const newFile: UploadedFile = {
        file,
        documentType: activeDocumentType,
      };

      if (isImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newFile.preview = event.target?.result as string;
          const updated = [
            ...uploadedFiles.filter((f) => f.documentType !== activeDocumentType),
            newFile,
          ];
          onFilesChange(updated);
        };
        reader.readAsDataURL(file);
      } else {
        const updated = [
          ...uploadedFiles.filter((f) => f.documentType !== activeDocumentType),
          newFile,
        ];
        onFilesChange(updated);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [activeDocumentType, uploadedFiles, onFilesChange, maxFileSize]
  );

  const handleRemoveFile = (documentType: string) => {
    const updated = uploadedFiles.filter((f) => f.documentType !== documentType);
    onFilesChange(updated);
    if (previewFile?.documentType === documentType) {
      setPreviewUrl(null);
      setPreviewFile(null);
    }
  };

  const handlePreview = (uploadedFile: UploadedFile) => {
    if (uploadedFile.preview) {
      setPreviewUrl(uploadedFile.preview);
      setPreviewFile(uploadedFile);
    } else if (uploadedFile.file.type === "application/pdf") {
      const url = URL.createObjectURL(uploadedFile.file);
      setPreviewUrl(url);
      setPreviewFile(uploadedFile);
    }
  };

  const closePreview = () => {
    if (previewUrl && previewFile?.file.type === "application/pdf") {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFile(null);
  };

  if (!requiredDocuments || requiredDocuments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Paperclip className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>
          {language === "am"
            ? "ለዚህ አገልግሎት ምንም ሰነድ ማያያዝ አያስፈልግም።"
            : "No document uploads required for this service."}
        </p>
      </div>
    );
  }

  const mandatoryDocs = requiredDocuments.filter((d) => d.isMandatory);
  const optionalDocs = requiredDocuments.filter((d) => !d.isMandatory);
  const uploadedMandatory = mandatoryDocs.filter((d) => getUploadedFileForDoc(d.name));
  const allMandatoryUploaded = uploadedMandatory.length === mandatoryDocs.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Upload progress */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant={allMandatoryUploaded ? "success" : "warning"} size="sm">
            {uploadedMandatory.length}/{mandatoryDocs.length}
          </Badge>
          <span className="text-muted-foreground">
            {language === "am" ? "ግዴታ ሰነዶች" : "Mandatory documents"}
          </span>
        </div>
        {optionalDocs.length > 0 && (
          <span className="text-xs text-muted-foreground">
            + {optionalDocs.length} {language === "am" ? "አማራጭ" : "optional"}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Document list */}
      <div className="space-y-2">
        {requiredDocuments.map((doc, index) => {
          const uploaded = getUploadedFileForDoc(doc.name);

          return (
            <Card
              key={index}
              className={cn(
                "flex items-center justify-between p-4 transition-all duration-200",
                doc.isMandatory
                  ? "border-l-2 border-l-ethiopia-red"
                  : "border-l-2 border-l-muted-foreground/30",
                uploaded && "border-l-emerald-400"
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                    uploaded
                      ? "bg-emerald-500/10 text-emerald-400"
                      : doc.isMandatory
                      ? "bg-red-500/10 text-red-400"
                      : "bg-muted/20 text-muted-foreground"
                  )}
                >
                  {uploaded ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : doc.isMandatory ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold truncate">
                      {language === "am" ? doc.nameAmharic : doc.name}
                    </p>
                    <Badge
                      variant={doc.isMandatory ? "danger" : "secondary"}
                      size="sm"
                    >
                      {doc.isMandatory
                        ? language === "am" ? "ግዴታ" : "Required"
                        : language === "am" ? "አማራጭ" : "Optional"}
                    </Badge>
                  </div>

                  {uploaded ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="truncate max-w-[150px]">{uploaded.file.name}</span>
                      <span>({formatFileSize(uploaded.file.size)})</span>
                      <button
                        onClick={() => handlePreview(uploaded)}
                        className="text-primary hover:underline ml-1"
                      >
                        {language === "am" ? "ይመልከቱ" : "View"}
                      </button>
                      <button
                        onClick={() => handleRemoveFile(doc.name)}
                        className="text-red-400 hover:text-red-300 ml-1"
                        aria-label="Remove file"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {doc.format && `${doc.format} • `}
                      {doc.maxSize > 0 && `Max ${formatFileSize(doc.maxSize)}`}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant={uploaded ? "ghost" : "primary"}
                size="sm"
                className="ml-3 shrink-0 gap-1.5"
                onClick={() => uploaded ? handleRemoveFile(doc.name) : handleUploadClick(doc.name)}
              >
                {uploaded ? (
                  <>
                    <X className="h-3.5 w-3.5" />
                    {language === "am" ? "አስወግድ" : "Remove"}
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    {language === "am" ? "ሰነድ ያያይዙ" : "Upload"}
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* File preview modal */}
      {previewUrl && previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-modal max-w-2xl w-full max-h-[90vh] overflow-auto p-4 relative">
            <button
              onClick={closePreview}
              className="absolute top-3 right-3 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              <span className="truncate">{previewFile.file.name}</span>
              <span>({formatFileSize(previewFile.file.size)})</span>
            </div>

            {previewFile.file.type === "application/pdf" ? (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] rounded-lg border border-border/20"
                title="Document preview"
              />
            ) : (
              <img
                src={previewUrl}
                alt={previewFile.file.name}
                className="w-full rounded-lg border border-border/20"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentUploadFields;