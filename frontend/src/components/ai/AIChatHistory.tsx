import React, { useState, useEffect } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import {
  MessageSquare,
  Trash2,
  RefreshCw,
  Clock,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface ChatSession {
  sessionId: string;
  firstMessage: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AIChatHistoryProps {
  onSelectSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
  language?: "en" | "am";
  className?: string;
}

export function AIChatHistory({
  onSelectSession,
  onDeleteSession,
  activeSessionId,
  language = "en",
  className,
}: AIChatHistoryProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<ChatSession[]>>("/ai/chat/sessions");
      if (response.data.success && Array.isArray(response.data.data)) {
        setSessions(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch chat sessions:", err);
      // Use local storage as fallback
      const localSessions = storage.get<ChatSession[]>("chatSessions") || [];
      setSessions(localSessions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/chat/session/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      onDeleteSession?.(sessionId);
      toast({
        title: language === "am" ? "ተሰርዟል" : "Deleted",
        description: language === "am" ? "የቻት ታሪክ ተሰርዟል" : "Chat history deleted",
      });
    } catch {
      // Fallback: remove from local
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      storage.set("chatSessions", sessions.filter((s) => s.sessionId !== sessionId));
    }
  };

  const filteredSessions = search
    ? sessions.filter(
        (s) =>
          s.firstMessage?.toLowerCase().includes(search.toLowerCase()) ||
          s.lastMessage?.toLowerCase().includes(search.toLowerCase())
      )
    : sessions;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return language === "am" ? "ዛሬ" : "Today";
      if (diffDays === 1) return language === "am" ? "ትናንት" : "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <Card variant="glass" className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            {language === "am" ? "የቻት ታሪክ" : "Chat History"}
          </CardTitle>
          <Button variant="ghost" size="icon-sm" onClick={fetchSessions} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        </div>
        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "am" ? "ቻቶችን ይፈልጉ..." : "Search chats..."}
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-secondary/20 border border-border/30 text-xs focus:outline-none focus:border-primary/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" className="w-3/4 h-3" />
                <Skeleton variant="text" className="w-1/2 h-2" />
              </div>
            </div>
          ))
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">
              {language === "am" ? "ምንም የቻት ታሪክ የለም" : "No chat history"}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <button
              key={session.sessionId}
              onClick={() => onSelectSession?.(session.sessionId)}
              className={cn(
                "w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors group",
                activeSessionId === session.sessionId
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary/20"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {session.firstMessage || (language === "am" ? "አዲስ ቻት" : "New chat")}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {session.lastMessage || ""}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">
                    {formatDate(session.updatedAt)}
                  </span>
                  <Badge variant="secondary" size="sm" className="ml-auto text-[9px]">
                    {session.messageCount || 0}
                  </Badge>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(session.sessionId, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 shrink-0"
                title={language === "am" ? "ሰርዝ" : "Delete"}
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-2.5" />
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default AIChatHistory;