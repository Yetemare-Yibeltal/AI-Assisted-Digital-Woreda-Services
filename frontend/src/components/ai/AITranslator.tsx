import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Languages,
  ArrowRightLeft,
  Copy,
  CheckCircle2,
  Volume2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: "en" | "am";
  targetLanguage: "en" | "am";
  confidence: number;
  fromCache: boolean;
}

interface AITranslatorProps {
  language?: "en" | "am";
  className?: string;
  initialText?: string;
  onTranslationComplete?: (result: TranslationResult) => void;
}

export function AITranslator({
  language = "en",
  className,
  initialText = "",
  onTranslationComplete,
}: AITranslatorProps) {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<"en-to-am" | "am-to-en">("en-to-am");
  const [confidence, setConfidence] = useState<number | null>(null);

  const sourceLang = direction === "en-to-am" ? "en" : "am";
  const targetLang = direction === "en-to-am" ? "am" : "en";

  const handleTranslate = useCallback(async () => {
    const trimmed = sourceText.trim();
    if (!trimmed) return;

    setLoading(true);
    setTranslatedText("");
    setConfidence(null);

    try {
      const response = await api.post<ApiResponse<TranslationResult>>("/ai/translations/translate", {
        text: trimmed,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });

      if (response.data?.success && response.data?.data) {
        const result = response.data.data;
        setTranslatedText(result.translatedText || "");
        setConfidence(result.confidence || null);
        onTranslationComplete?.(result);
      }
    } catch (err) {
      const msg = getErrorMessage(
        err,
        language === "am" ? "ትርጉም አልተሳካም" : "Translation failed"
      );
      toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, language, toast, onTranslationComplete]);

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSwap = () => {
    setDirection((prev) => (prev === "en-to-am" ? "am-to-en" : "en-to-am"));
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setConfidence(null);
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "am" ? "am-ET" : "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {language === "am" ? "ተርጉም" : "Translate"}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === "am"
                  ? "ጽሁፍ በእንግሊዘኛ እና በአማርኛ መካከል ይተርጉሙ"
                  : "Translate text between English and Amharic"}
              </CardDescription>
            </div>
          </div>

          {/* Direction Toggle */}
          <div className="flex items-center gap-1 bg-secondary/20 rounded-lg p-0.5">
            <Button
              variant={direction === "en-to-am" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setDirection("en-to-am")}
              className="text-xs h-8"
            >
              EN → አማ
            </Button>
            <Button
              variant={direction === "am-to-en" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setDirection("am-to-en")}
              className="text-xs h-8"
            >
              አማ → EN
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSwap}
              title={language === "am" ? "ቀያይር" : "Swap languages"}
              className="ml-1"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Source Text */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Badge variant="secondary" size="sm">
              {sourceLang === "en" ? "English" : "አማርኛ"}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {sourceText.length}/2000
            </span>
          </div>
          <Textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={
              sourceLang === "en"
                ? "Enter English text to translate..."
                : "የአማርኛ ጽሁፍ ያስገቡ..."
            }
            rows={4}
            maxLength={2000}
            className="resize-none"
            disabled={loading}
          />
          <div className="flex items-center gap-2 mt-2">
            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || loading}
              variant="primary"
              size="sm"
              loading={loading}
              leftIcon={loading ? undefined : <Languages className="h-4 w-4" />}
            >
              {loading
                ? language === "am" ? "በመተርጎም ላይ..." : "Translating..."
                : language === "am" ? "ተርጉም" : "Translate"}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleSpeak(sourceText, sourceLang)}
              disabled={!sourceText.trim()}
              title={language === "am" ? "ድምጽ አጫውት" : "Listen"}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Translated Text */}
        {(translatedText || loading) && (
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <Badge variant="default" size="sm">
                {targetLang === "en" ? "English" : "አማርኛ"}
              </Badge>
              {confidence !== null && (
                <span className="text-[10px] text-muted-foreground">
                  {confidence}% {language === "am" ? "እምነት" : "confidence"}
                </span>
              )}
            </div>
            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center py-8 bg-secondary/10 rounded-xl border border-border/20">
                  <LoadingSpinner size="sm" text={language === "am" ? "በመተርጎም ላይ..." : "Translating..."} />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-secondary/10 border border-border/20 min-h-[80px]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
              {translatedText && !loading && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCopy}
                    title={language === "am" ? "ቅዳ" : "Copy"}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleSpeak(translatedText, targetLang)}
                    title={language === "am" ? "ድምጽ አጫውት" : "Listen"}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick phrases */}
        {!translatedText && !loading && (
          <div className="border-t border-border/20 pt-4 mt-2">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" />
              {language === "am" ? "ፈጣን ሀረጎች" : "Quick Phrases"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { en: "Birth Certificate", am: "የልደት ሰርተፍኬት" },
                { en: "How much does it cost?", am: "ዋጋው ስንት ነው?" },
                { en: "What documents do I need?", am: "ምን ሰነዶች ያስፈልጋሉ?" },
                { en: "How long does it take?", am: "ምን ያህል ጊዜ ይወስዳል?" },
              ].map((phrase, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                  onClick={() => {
                    setSourceText(direction === "en-to-am" ? phrase.en : phrase.am);
                    setDirection(direction === "en-to-am" ? "en-to-am" : "am-to-en");
                  }}
                >
                  {direction === "en-to-am" ? phrase.en : phrase.am}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AITranslator;