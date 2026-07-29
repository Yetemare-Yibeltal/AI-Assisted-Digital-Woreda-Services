import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Bot,
  User,
  Send,
  X,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language: "en" | "am";
}

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "am";
}

export function AIChatBot({ isOpen, onClose, language }: AIChatBotProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        language === "am"
          ? "ሰላም! የዳንግላ ወረዳ AI ረዳት ነኝ። እንዴት ልረዳዎት?"
          : "Hi! I'm the Dangila Woreda AI assistant. How can I help?",
      timestamp: new Date().toISOString(),
      language: language,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
      language: language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat/message", {
        sessionId,
        message: trimmed,
        language,
      });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        if (data.sessionId) setSessionId(data.sessionId);

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || "",
          timestamp: new Date().toISOString(),
          language: data.language || language,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      const errorMsg = getErrorMessage(
        err,
        language === "am" ? "ምላሽ ማግኘት አልተሳካም" : "Failed to get response"
      );
      toast({ variant: "error", description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          language === "am"
            ? "ሰላም! እንዴት ልረዳዎት?"
            : "Hi! How can I help?",
        timestamp: new Date().toISOString(),
        language: language,
      },
    ]);
    setSessionId(null);
  };

  const suggestions =
    language === "am"
      ? [
          "የልደት ሰርተፍኬት እንዴት ማውጣት እችላለሁ?",
          "ለጋብቻ ምን ሰነዶች ያስፈልጋሉ?",
          "የንግድ ፈቃድ ክፍያ ስንት ነው?",
        ]
      : [
          "How do I get a birth certificate?",
          "What documents for marriage?",
          "Business license fee?",
        ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <Card variant="glass" className="shadow-2xl border-primary/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {language === "am" ? "AI ረዳት" : "AI Assistant"}
              </p>
              <span className="text-[10px] text-emerald-400">
                {language === "am" ? "በመስመር ላይ" : "Online"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={handleClear} title="Clear chat">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setMinimized(!minimized)}>
              <ChevronDown className={cn("h-4 w-4 transition-transform", minimized && "rotate-180")} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div className="h-[350px] overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-7 w-7 shrink-0 mt-1">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        <Bot className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-secondary/40 rounded-tl-md"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[9px] opacity-50 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-7 w-7 shrink-0 mt-1">
                      <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                        <User className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/20"><Bot className="h-3.5 w-3.5 text-primary" /></AvatarFallback></Avatar>
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

            {/* Suggestions (when few messages) */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                    onClick={() => { setInput(s); }}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 pt-0 flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={language === "am" ? "ጥያቄ ይጻፉ..." : "Ask something..."}
                rows={1}
                className="resize-none min-h-[40px] h-[40px] text-sm"
                disabled={loading}
                maxLength={2000}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                variant="primary"
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AIChatBot;