import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { validateFile, formatFileSize, readFileAsBase64 } from "@/utils/file";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  ShieldCheck,
  ShieldX,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  FileCheck,
  FileWarning,
  Eye,
  Clock,
  FileText,
} from "lucide-react";

interface VerificationResult {
  documentId: string;
  isVerified: boolean;
  confidence: number;
  notes: string;
  verifiedAt: string;
  checks: VerificationCheck[];
}

interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
  messageAmharic: string;
}

interface AIDocumentVerifierProps {
  language?: "en" | "am";
  className?: string;
  onVerificationComplete?: (result: VerificationResult) => void;
  documentId?: string;
  applicationId?: string;
}

export function AIDocumentVerifier({
  language = "en",
  className,
  onVerificationComplete,
  documentId,
  applicationId,
}: AIDocumentVerifierProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      setError(null);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    },
    []
  );

  const handleVerify = useCallback(async () => {
    if (!file) return;

    setVerifying(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);

    try {
      const base64 = await readFileAsBase64(file);

      const endpoint = documentId
        ? `/applications/${applicationId}/documents/${documentId}/verify`
        : "/ai/documents/verify";

      const response = await api.post(endpoint, {
        file: base64,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        language,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data?.success && response.data?.data) {
        const verificationResult = response.data.data as VerificationResult;
        setResult(verificationResult);
        onVerificationComplete?.(verificationResult);

        toast({
          variant: verificationResult.isVerified ? "success" : "warning",
          title: verificationResult.isVerified
            ? language === "am"
              ? "ሰነድ ተረጋግጧል"
              : "Document Verified"
            : language === "am"
            ? "ሰነድ ማረጋገጫ አላለፈም"
            : "Verification Failed",
          description: verificationResult.notes,
        });
      }
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      const msg = getErrorMessage(
        err,
        language === "am" ? "ማረጋገጥ አልተሳካም" : "Verification failed"
      );
      setError(msg);
      toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
    } finally {
      setVerifying(false);
    }
  }, [file, documentId, applicationId, language, toast, onVerificationComplete]);

  const handleReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "am" ? "ሰነድ አረጋግጥ" : "Verify Document"}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === "am"
                  ? "ሰነድ ይላኩ እና AI ትክክለኛነቱን ያረጋግጣል"
                  : "Upload a document and AI will verify its authenticity"}
              </CardDescription>
            </div>
          </div>
          {file && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              {language === "am" ? "እንደገና" : "Reset"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!file && (
          <button
            onClick={handleUploadClick}
            className="w-full flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">
                {language === "am" ? "ሰነድ ይላኩ" : "Upload Document"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG, WebP (max 5MB)
              </p>
            </div>
          </button>
        )}

        {file && previewUrl && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black/50">
              {file.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Document"
                  className="w-full h-[250px] object-contain"
                />
              ) : (
                <div className="w-full h-[250px] flex items-center justify-center">
                  <FileText className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white bg-black/50 rounded-lg px-3 py-1.5">
                <span className="truncate max-w-[60%]">{file.name}</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>

            {!verifying && !result && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleVerify}
                className="w-full gap-2"
              >
                <ShieldCheck className="h-5 w-5" />
                {language === "am" ? "አሁን አረጋግጥ" : "Verify Now"}
              </Button>
            )}

            {verifying && (
              <div className="space-y-2">
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {language === "am" ? "AI ሰነዱን እያረጋገጠ ነው..." : "AI is verifying the document..."}
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {/* Overall Result */}
                <Alert variant={result.isVerified ? "success" : "warning"}>
                  <div className="flex items-start gap-3">
                    {result.isVerified ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    ) : (
                      <FileWarning className="h-5 w-5 text-yellow-400 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-sm">
                        {result.isVerified
                          ? language === "am"
                            ? "ሰነድ ተረጋግጧል"
                            : "Document Verified"
                          : language === "am"
                          ? "ሰነድ አልተረጋገጠም"
                          : "Document Not Verified"}
                      </p>
                      <p className="text-xs mt-0.5 opacity-80">{result.notes}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" size="sm">
                          {result.confidence}% {language === "am" ? "እምነት" : "confidence"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(result.verifiedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Alert>

                {/* Individual Checks */}
                {result.checks && result.checks.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                      {language === "am" ? "የማረጋገጫ ደረጃዎች" : "Verification Checks"}
                    </p>
                    {result.checks.map((check, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 rounded-lg text-xs",
                          check.passed
                            ? "bg-emerald-500/5 border border-emerald-500/15"
                            : "bg-red-500/5 border border-red-500/15"
                        )}
                      >
                        {check.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {language === "am" ? check.messageAmharic : check.message}
                          </p>
                        </div>
                      </div>
                    ))}
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

export default AIDocumentVerifier;