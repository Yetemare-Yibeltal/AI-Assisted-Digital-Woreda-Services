import React, { useState, useRef, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { GradientHeading } from "@/components/shared/GradientText";
import { ServiceCard } from "@/components/services/ServiceCard";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Search,
  FileText,
  Languages,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  Copy,
  CheckCircle2,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/shadcn-utils";
import type { ApiResponse } from "@/types/api.types";
import type { IService } from "@/types/service.types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language: "en" | "am";
}

interface RecommendationResult {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
  confidenceScore: number;
  reasoning: string;
  totalFee: number;
  processingTime: string;
  processingTimeAmharic: string;
}

export default function AIAssistantPage() {
  const { toast } = useToast();
  const language = storage.getLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        language === "am"
          ? "ሰላም! እኔ የዳንግላ ወረዳ AI ረዳት ነኝ። ጥያቄዎችን መመለስ፣ አገልግሎቶችን መምከር፣ እና ሰነዶችን መተርጎም እችላለሁ። እንዴት ልረዳዎት?"
          : "Hello! I'm the Dangila Woreda AI assistant. I can answer questions, recommend services, and translate documents. How can I help you?",
      timestamp: new Date().toISOString(),
      language: language,
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Recommendation state
  const [recommendQuery, setRecommendQuery] = useState("");
  const [recommendResults, setRecommendResults] = useState<RecommendationResult[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(false);

  // Translation state
  const [translationText, setTranslationText] = useState("");
  const [translationResult, setTranslationResult] = useState("");
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationLang, setTranslationLang] = useState<"en" | "am">("am");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chat handlers
  const handleChatSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
      language: language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatLoading(true);

    try {
      const response = await api.post<ApiResponse<any>>("/ai/chat/message", {
        sessionId,
        message: trimmed,
        language,
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        if (data.sessionId) setSessionId(data.sessionId);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || "",
          timestamp: new Date().toISOString(),
          language: data.language || language,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, "Failed to get response");
      toast({ variant: "error", title: "Error", description: errorMsg });
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  // Recommendation handlers
  const handleRecommend = async () => {
    const trimmed = recommendQuery.trim();
    if (!trimmed || recommendLoading) return;

    setRecommendLoading(true);
    setRecommendResults([]);

    try {
      const response = await api.post<ApiResponse<{ recommendations: RecommendationResult[] }>>(
        "/ai/recommendations",
        { query: trimmed, language, maxResults: 3 }
      );

      if (response.data.success && response.data.data) {
        setRecommendResults(response.data.data.recommendations || []);
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to get recommendations");
      toast({ variant: "error", title: "Error", description: msg });
    } finally {
      setRecommendLoading(false);
    }
  };

  // Translation handlers
  const handleTranslate = async () => {
    const trimmed = translationText.trim();
    if (!trimmed || translationLoading) return;

    setTranslationLoading(true);
    setTranslationResult("");

    try {
      const response = await api.post<ApiResponse<{ translatedText: string }>>(
        "/ai/translations/translate",
        {
          text: trimmed,
          sourceLanguage: translationLang === "am" ? "en" : "am",
          targetLanguage: translationLang,
        }
      );

      if (response.data.success && response.data.data) {
        setTranslationResult(response.data.data.translatedText || "");
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Translation failed");
      toast({ variant: "error", title: "Error", description: msg });
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleCopyTranslation = async () => {
    if (translationResult) {
      await navigator.clipboard.writeText(translationResult);
      toast({ title: language === "am" ? "ተቀድቷል" : "Copied!" });
    }
  };

  const suggestedQuestions = language === "am"
    ? [
        "የልደት ሰርተፍኬት ለማውጣት ምን ያስፈልጋል?",
        "የንግድ ፈቃድ ለማደስ ምን ማድረግ አለብኝ?",
        "የመሬት ይዞታ ማረጋገጫ ሂደት ምን ይመስላል?",
      ]
    : [
        "What do I need to get a birth certificate?",
        "How do I renew my business license?",
        "What is the process for land title registration?",
      ];

  return (
    <Container maxWidth="5xl" padding="default" className="py-8">
      <GradientHeading
        title="AI Assistant Hub"
        titleAmharic="AI ረዳት ማዕከል"
        subtitle={
          language === "am"
            ? "የዳንግላ ወረዳ አገልግሎቶችን በተመለከተ ሁሉንም አይነት እርዳታ ያግኙ።"
            : "Get all kinds of help about Dangila Woreda services."
        }
        size="lg"
        className="mb-8"
      />

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="chat" icon={<MessageSquare className="h-4 w-4" />}>
            {language === "am" ? "ቻት" : "Chat"}
          </TabsTrigger>
          <TabsTrigger value="recommend" icon={<Lightbulb className="h-4 w-4" />}>
            {language === "am" ? "ምክር" : "Recommend"}
          </TabsTrigger>
          <TabsTrigger value="translate" icon={<Languages className="h-4 w-4" />}>
            {language === "am" ? "ተርጉም" : "Translate"}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card variant="glass" className="h-[550px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{language === "am" ? "AI ረዳት" : "AI Assistant"}</p>
                      <span className="text-[10px] text-emerald-400">{language === "am" ? "በመስመር ላይ" : "Online"}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setMessages([messages[0]])}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <Avatar className="h-8 w-8 shrink-0 mt-1">
                          <AvatarFallback className="bg-primary/20 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm", msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-md" : "bg-secondary/40 rounded-tl-md")}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-[10px] opacity-50 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                      {msg.role === "user" && (
                        <Avatar className="h-8 w-8 shrink-0 mt-1">
                          <AvatarFallback className="bg-blue-500/20 text-blue-400"><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20 text-primary"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>
                      <div className="bg-secondary/40 rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border/20">
                  <div className="flex gap-2">
                    <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleChatKeyDown} placeholder={language === "am" ? "ጥያቄዎን ይጻፉ..." : "Type your question..."} rows={2} className="resize-none" disabled={chatLoading} maxLength={2000} />
                    <Button onClick={handleChatSend} disabled={!input.trim() || chatLoading} variant="primary" size="icon" className="h-auto shrink-0">
                      {chatLoading ? <RotateCcw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-3">
              <Card variant="glass"><CardHeader><CardTitle className="text-sm"><Sparkles className="h-4 w-4 inline mr-1 text-ethiopia-yellow" />{language === "am" ? "የተጠቆሙ" : "Suggested"}</CardTitle></CardHeader><CardContent className="space-y-2">{suggestedQuestions.map((q, i) => (<button key={i} onClick={() => { setInput(q); }} className="w-full text-left text-sm p-2.5 rounded-lg hover:bg-primary/10 text-muted-foreground">{q}</button>))}</CardContent></Card>
            </div>
          </div>
        </TabsContent>

        {/* Recommend Tab */}
        <TabsContent value="recommend">
          <div className="max-w-3xl">
            <Card variant="glass" className="mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Input value={recommendQuery} onChange={(e) => setRecommendQuery(e.target.value)} placeholder={language === "am" ? "ምን አገልግሎት ይፈልጋሉ?" : "What service do you need?"} className="h-12" onKeyDown={(e) => e.key === "Enter" && handleRecommend()} />
                  <Button onClick={handleRecommend} loading={recommendLoading} variant="primary" size="lg"><Sparkles className="h-5 w-5 mr-2" />{language === "am" ? "ምክር አግኝ" : "Recommend"}</Button>
                </div>
              </CardContent>
            </Card>
            {recommendResults.map((rec, i) => (
              <Card key={i} variant="glass" className="mb-4 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-extrabold">{language === "am" ? rec.serviceNameAmharic : rec.serviceName}</h3>
                      <Badge variant="secondary" size="sm" className="mt-1">{rec.confidenceScore}% match</Badge>
                    </div>
                    <a href={`/services/${rec.serviceSlug}`}><Button variant="primary" size="sm"><FileText className="h-4 w-4 mr-1" />{language === "am" ? "ዝርዝር" : "Details"}</Button></a>
                  </div>
                  <p className="text-sm text-muted-foreground">{language === "am" ? rec.reasoning : rec.reasoning}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    {rec.totalFee > 0 && <span className="font-semibold">{rec.totalFee.toLocaleString()} ETB</span>}
                    <span className="text-muted-foreground">{language === "am" ? rec.processingTimeAmharic : rec.processingTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Translate Tab */}
        <TabsContent value="translate">
          <div className="max-w-3xl">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5" />{language === "am" ? "ተርጉም" : "Translate"}</CardTitle>
                <CardDescription>{language === "am" ? "ጽሁፍ በእንግሊዘኛ እና በአማርኛ መካከል ይተርጉሙ።" : "Translate text between English and Amharic."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant={translationLang === "am" ? "primary" : "glass"} size="sm" onClick={() => setTranslationLang("am")}>{language === "am" ? "እንግሊዘኛ → አማርኛ" : "English → Amharic"}</Button>
                  <Button variant={translationLang === "en" ? "primary" : "glass"} size="sm" onClick={() => setTranslationLang("en")}>{language === "am" ? "አማርኛ → እንግሊዘኛ" : "Amharic → English"}</Button>
                </div>
                <Textarea value={translationText} onChange={(e) => setTranslationText(e.target.value)} placeholder={language === "am" ? "ለመተርጎም ጽሁፍ ያስገቡ..." : "Enter text to translate..."} rows={4} maxLength={2000} showCharCount />
                <Button onClick={handleTranslate} loading={translationLoading} variant="primary">{language === "am" ? "ተርጉም" : "Translate"}</Button>
                {translationResult && (
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/20 relative">
                    <p className="text-sm whitespace-pre-wrap">{translationResult}</p>
                    <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2" onClick={handleCopyTranslation}><Copy className="h-4 w-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
}