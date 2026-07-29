import React, { useState, useRef, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { GradientHeading } from "@/components/shared/GradientText";
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
  Trash2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/shadcn-utils";
import type { ApiResponse } from "@/types/api.types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language: "en" | "am";
}

export default function AIChatPage() {
  const { toast } = useToast();
  const language = storage.getLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        language === "am"
          ? "ሰላም! እኔ የዳንግላ ወረዳ አገልግሎቶች AI ረዳት ነኝ። እንዴት ልረዳዎት እችላለሁ?"
          : "Hello! I'm the Dangila Woreda Services AI assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
      language: language,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
      language: language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
      const errorMsg = getErrorMessage(
        err,
        language === "am" ? "ምላሽ ማግኘት አልተሳካም" : "Failed to get response"
      );
      toast({ variant: "error", title: "Error", description: errorMsg });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          language === "am"
            ? "ይቅርታ፣ አሁን ምላሽ መስጠት አልቻልኩም። እባክዎ እንደገና ይሞክሩ።"
            : "Sorry, I couldn't process that right now. Please try again.",
        timestamp: new Date().toISOString(),
        language: language,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          language === "am"
            ? "ሰላም! እንዴት ልረዳዎት እችላለሁ?"
            : "Hello! How can I help you?",
        timestamp: new Date().toISOString(),
        language: language,
      },
    ]);
    setSessionId(null);
    toast({ title: language === "am" ? "ቻት ጸድቷል" : "Chat cleared" });
  };

  const suggestedQuestions = language === "am"
    ? [
        "የልደት ሰርተፍኬት እንዴት ማግኘት እችላለሁ?",
        "ለጋብቻ ምዝገባ ምን ሰነዶች ያስፈልጋሉ?",
        "የንግድ ፈቃድ ክፍያ ስንት ነው?",
        "የመሬት ይዞታ ማረጋገጫ ምን ያህል ጊዜ ይወስዳል?",
      ]
    : [
        "How do I get a birth certificate?",
        "What documents do I need for marriage registration?",
        "How much is the business license fee?",
        "How long does land registration take?",
      ];

  return (
    <Container maxWidth="3xl" padding="default" className="py-8">
      <GradientHeading
        title="AI Assistant"
        titleAmharic="AI ረዳት"
        subtitle={
          language === "am"
            ? "ስለ ዳንግላ ወረዳ አገልግሎቶች ማንኛውንም ጥያቄ ይጠይቁ።"
            : "Ask any question about Dangila Woreda services."
        }
        size="lg"
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card variant="glass" className="h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {language === "am" ? "AI ረዳት" : "AI Assistant"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-muted-foreground">
                      {language === "am" ? "በመስመር ላይ" : "Online"}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleClearChat} title="Clear chat">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-1">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-secondary/40 rounded-tl-md"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[10px] opacity-50 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-1">
                      <AvatarFallback className="bg-blue-500/20 text-blue-400">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
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

            {/* Input */}
            <div className="p-4 border-t border-border/20">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    language === "am"
                      ? "ጥያቄዎን ይጻፉ..."
                      : "Type your question..."
                  }
                  rows={2}
                  className="resize-none"
                  disabled={loading}
                  maxLength={2000}
                  showCharCount
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  variant="primary"
                  size="icon"
                  className="h-auto shrink-0"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-ethiopia-yellow" />
                {language === "am" ? "የተጠቆሙ ጥያቄዎች" : "Suggested Questions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                    handleSend();
                  }}
                  className="w-full text-left text-sm p-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                >
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm">
                {language === "am" ? "ሌሎች አገናኞች" : "Quick Links"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <a href="/services" className="block p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                {language === "am" ? "አገልግሎቶችን ይመልከቱ" : "Browse Services"}
              </a>
              <a href="/track" className="block p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                {language === "am" ? "ማመልከቻ ይከታተሉ" : "Track Application"}
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}