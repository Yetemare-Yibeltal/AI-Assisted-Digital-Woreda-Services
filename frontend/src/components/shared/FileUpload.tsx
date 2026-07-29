import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { validateFile, formatFileSize, readFileAsBase64 } from "@/utils/file";
import api from "@/utils/api";
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  url?: string;
}

interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadUrl?: string;
  language?: "en" | "am";
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export function FileUpload({
  onUpload,
  onFileRemove,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024,
  allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  uploadUrl,
  language = "en",
  className,
  disabled = false,
  multiple = true,
}: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (selectedFiles: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(selectedFiles);

      if (files.length + fileArray.length > maxFiles) {
        setError(
          language === "am"
            ? `ቢበዛ ${maxFiles} ፋይሎች ብቻ ነው ማያያዝ የሚችሉት።`
            : `You can only upload up to ${maxFiles} files.`
        );
        return;
      }

      const newFiles: UploadedFile[] = [];

      for (const file of fileArray) {
        const validation = validateFile(file, allowedTypes, maxFileSize);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          continue;
        }

        const uploadedFile: UploadedFile = {
          file,
          progress: 0,
          status: "uploading",
        };

        if (file.type.startsWith("image/")) {
          try {
            uploadedFile.preview = await readFileAsBase64(file);
          } catch {}
        }

        newFiles.push(uploadedFile);
      }

      if (newFiles.length === 0) return;

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);

      // Upload to server if uploadUrl provided
      if (uploadUrl) {
        for (let i = 0; i < newFiles.length; i++) {
          const index = files.length + i;
          await uploadFile(newFiles[i], index);
        }
      } else {
        // Mark as done immediately if no upload URL
        setFiles((prev) =>
          prev.map((f) => (f.status === "uploading" ? { ...f, status: "done", progress: 100 } : f))
        );
        onUpload?.(newFiles.map((f) => f.file));
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [files, maxFiles, maxFileSize, allowedTypes, uploadUrl, language, onUpload]
  );

  const uploadFile = async (uploadedFile: UploadedFile, index: number) => {
    try {
      const base64 = await readFileAsBase64(uploadedFile.file);
      const response = await api.post(uploadUrl!, {
        file: base64,
        fileName: uploadedFile.file.name,
        fileType: uploadedFile.file.type,
        fileSize: uploadedFile.file.size,
      });

      if (response.data?.success) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, status: "done", progress: 100, url: response.data.data?.url }
              : f
          )
        );
        onUpload?.(files.map((f) => f.file));
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: "error", error: "Upload failed", progress: 0 }
            : f
        )
      );
      toast({
        variant: "error",
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am"
          ? `${uploadedFile.file.name} መላክ አልተሳካም።`
          : `Failed to upload ${uploadedFile.file.name}`,
      });
    }
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    onFileRemove?.(index);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.file.type.startsWith("image/")) {
      return file.preview ? (
        <img src={file.preview} alt="" className="h-8 w-8 object-cover rounded" />
      ) : (
        <Image className="h-5 w-5" />
      );
    }
    if (file.file.type === "application/pdf") return <FileText className="h-5 w-5 text-red-400" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        multiple={multiple}
        className="hidden"
        aria-hidden="true"
      />
      <div
        ref={dropZoneRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
          dragging
            ? "border-primary/50 bg-primary/5 scale-[1.02]"
            : "border-border/50 hover:border-primary/30 hover:bg-secondary/10",
          disabled && "opacity-50 cursor-not-allowed hover:border-border/50 hover:bg-transparent",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">
            {language === "am" ? "ፋይሎች ይላኩ" : "Upload Files"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {language === "am"
              ? "ጎትተው ይጣሉ ወይም ጠቅ ያድርጉ"
              : "Drag & drop or click to browse"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {allowedTypes.map((t) => t.split("/")[1]?.toUpperCase()).join(", ")} • Max {Math.round(maxFileSize / 1024 / 1024)}MB each
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                uploadedFile.status === "error"
                  ? "bg-red-500/5 border-red-500/20"
                  : uploadedFile.status === "done"
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-secondary/10 border-border/20"
              )}
            >
              {/* File icon/preview */}
              <div className="shrink-0">{getFileIcon(uploadedFile)}</div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{uploadedFile.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </span>
                  {uploadedFile.status === "uploading" && (
                    <span className="text-[10px] text-blue-400 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      {language === "am" ? "በመላክ ላይ..." : "Uploading..."}
                    </span>
                  )}
                  {uploadedFile.status === "done" && (
                    <Badge variant="success" size="sm" className="text-[10px] gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {language === "am" ? "ተልኳል" : "Done"}
                    </Badge>
                  )}
                  {uploadedFile.status === "error" && (
                    <span className="text-[10px] text-red-400">
                      {uploadedFile.error || (language === "am" ? "አልተሳካም" : "Failed")}
                    </span>
                  )}
                </div>
                {uploadedFile.status === "uploading" && (
                  <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {uploadedFile.preview && (
                  <a
                    href={uploadedFile.preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                    title={language === "am" ? "ይመልከቱ" : "Preview"}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                  title={language === "am" ? "አስወግድ" : "Remove"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {files.length < maxFiles && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className="w-full gap-1.5 text-xs"
              disabled={disabled}
            >
              <Upload className="h-3.5 w-3.5" />
              {language === "am" ? "ተጨማሪ ፋይሎች ያክሉ" : "Add more files"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;