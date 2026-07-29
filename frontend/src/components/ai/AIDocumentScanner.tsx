import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { validateFile, formatFileSize, readFileAsBase64, ALLOWED_DOCUMENT_TYPES } from "@/utils/file";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ScanLine,
  Image,
  FileWarning,
} from "lucide-react";

interface ScanResult {
  documentType: string;
  confidence: number;
  extractedText: string;
  isValid: boolean;
  warnings: string[];
}

interface AIDocumentScannerProps {
  language?: "en" | "am";
  className?: string;
  onDocumentScanned?: (result: ScanResult, file: File) => void;
  allowedTypes?: string[];
  maxFileSize?: number;
}

export function AIDocumentScanner({
  language = "en",
  className,
  onDocumentScanned,
  allowedTypes = ALLOWED_DOCUMENT_TYPES,
  maxFileSize = 5 * 1024 * 1024,
}: AIDocumentScannerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<"idle" | "camera" | "preview">("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = async () => {
    setError(null);
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError(
        language === "am"
          ? "ካሜራ መክፈት አልተሳካም። እባክዎ ፈቃድ ይስጡ።"
          : "Could not access camera. Please grant permission."
      );
      setMode("idle");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setMode("preview");
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, allowedTypes, maxFileSize);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setMode("preview");
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const base64 = await readFileAsBase64(selectedFile);
      const response = await api.post("/ai/documents/scan", {
        file: base64,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        language,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data?.success && response.data?.data) {
        setScanResult(response.data.data);
        onDocumentScanned?.(response.data.data, selectedFile);
        toast({
          variant: response.data.data.isValid ? "success" : "warning",
          title: language === "am" ? "ቅኝት ተጠናቋል" : "Scan Complete",
          description: response.data.data.isValid
            ? language === "am"
              ? "ሰነዱ ትክክለኛ ነው"
              : "Document appears valid"
            : language === "am"
            ? "ሰነዱን ያረጋግጡ"
            : "Please review the document",
        });
      }
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      const msg = getErrorMessage(err, language === "am" ? "ቅኝት አልተሳካም" : "Scan failed");
      setError(msg);
      toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError(null);
    setProgress(0);
    setMode("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, stopCamera]);

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ScanLine className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "am" ? "ሰነድ ቃኝ" : "Scan Document"}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === "am"
                  ? "ሰነድ ያንሱ ወይም ይላኩ፣ AI ያረጋግጣል"
                  : "Capture or upload a document, AI will verify it"}
              </CardDescription>
            </div>
          </div>
          {mode !== "idle" && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              {language === "am" ? "እንደገና" : "Reset"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        {/* Error */}
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Idle State */}
        {mode === "idle" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={startCamera}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {language === "am" ? "ካሜራ ይጠቀሙ" : "Use Camera"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "am" ? "ሰነድ ያንሱ" : "Capture a photo"}
                </p>
              </div>
            </button>
            <button
              onClick={handleUploadClick}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {language === "am" ? "ፋይል ይላኩ" : "Upload File"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG (max 5MB)
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Camera Mode */}
        {mode === "camera" && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[300px] sm:h-[400px] object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="primary" size="lg" onClick={capturePhoto} className="gap-2">
                <Camera className="h-5 w-5" />
                {language === "am" ? "ፎቶ አንሳ" : "Capture"}
              </Button>
              <Button variant="outline" size="lg" onClick={handleReset}>
                {language === "am" ? "ይቅር" : "Cancel"}
              </Button>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {mode === "preview" && previewUrl && selectedFile && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="w-full h-[300px] sm:h-[400px] object-contain"
                />
              ) : (
                <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-secondary/20">
                  <FileText className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* File info */}
            <div className="flex items-center justify-between text-sm">
              <span className="truncate max-w-[60%] text-muted-foreground">
                {selectedFile.name}
              </span>
              <span className="text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>

            {/* Scan button */}
            {!scanning && !scanResult && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleScan}
                className="w-full gap-2"
              >
                <ScanLine className="h-5 w-5" />
                {language === "am" ? "አሁን ቃኝ" : "Scan Now"}
              </Button>
            )}

            {/* Scanning progress */}
            {scanning && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {language === "am" ? "AI እየተነተነ ነው..." : "AI analyzing document..."}
                </p>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <Alert variant={scanResult.isValid ? "success" : "warning"}>
                  <div className="flex items-start gap-3">
                    {scanResult.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    ) : (
                      <FileWarning className="h-5 w-5 text-yellow-400 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-sm">
                        {scanResult.isValid
                          ? language === "am"
                            ? "ሰነዱ ትክክለኛ ነው"
                            : "Document Verified"
                          : language === "am"
                          ? "ሰነዱን ያረጋግጡ"
                          : "Review Needed"}
                      </p>
                      <p className="text-xs mt-0.5 opacity-80">
                        {language === "am"
                          ? `የሰነድ አይነት: ${scanResult.documentType}`
                          : `Document Type: ${scanResult.documentType}`}
                      </p>
                      <Badge variant="secondary" size="sm" className="mt-1">
                        {scanResult.confidence}% {language === "am" ? "እምነት" : "confidence"}
                      </Badge>
                    </div>
                  </div>
                </Alert>

                {/* Warnings */}
                {scanResult.warnings.length > 0 && (
                  <div className="space-y-1.5">
                    {scanResult.warnings.map((warning, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-yellow-300 p-2 rounded-lg bg-yellow-500/5"
                      >
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extracted Text */}
                {scanResult.extractedText && (
                  <div className="p-3 rounded-lg bg-secondary/10 border border-border/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      {language === "am" ? "የተመረጠ ጽሁፍ" : "Extracted Text"}
                    </p>
                    <p className="text-xs leading-relaxed line-clamp-4">
                      {scanResult.extractedText}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIDocumentScanner;