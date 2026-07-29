import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { storage } from "@/utils/storage";
import { debounce } from "@/utils/performance";
import api from "@/utils/api";
import {
  Search,
  Sparkles,
  X,
  Clock,
  ArrowRight,
  FileText,
  Loader2,
  TrendingUp,
  Hash,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface SearchResult {
  _id: string;
  name: string;
  nameAmharic: string;
  slug: string;
  category: string;
  shortDescription: string;
  shortDescriptionAmharic: string;
  totalFee?: number;
}

interface AISearchBarProps {
  language?: "en" | "am";
  className?: string;
  placeholder?: string;
  variant?: "default" | "hero" | "compact";
  onResultSelect?: (result: SearchResult) => void;
}

export function AISearchBar({
  language = "en",
  className,
  placeholder,
  variant = "default",
  onResultSelect,
}: AISearchBarProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dangila_searchHistory") || "[]").slice(0, 5);
    } catch {
      return [];
    }
  });

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get<ApiResponse<SearchResult[]>>(
          `/public/services/search?q=${encodeURIComponent(searchQuery)}&limit=8`
        );

        if (response.data?.success) {
          const data = response.data.data || [];
          setResults(data);
          setShowResults(data.length > 0);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error("AI search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const saveToHistory = (queryText: string) => {
    const updated = [queryText, ...searchHistory.filter((h) => h !== queryText)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("dangila_searchHistory", JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
    if (!value) {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      } else if (query.trim()) {
        saveToHistory(query.trim());
        navigate(`/services?search=${encodeURIComponent(query.trim())}`);
        setShowResults(false);
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveToHistory(query.trim());
    setShowResults(false);
    setQuery("");
    setResults([]);
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      navigate(`/services/${result.slug}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    performSearch(historyItem);
    inputRef.current?.focus();
  };

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close results on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultPlaceholder =
    placeholder ||
    (language === "am"
      ? "አገልግሎቶችን ይፈልጉ... (Ctrl+K)"
      : "Search services... (Ctrl+K)");

  const variantClasses = {
    hero: "h-14 text-lg rounded-2xl shadow-2xl shadow-primary/5",
    default: "h-11 rounded-xl",
    compact: "h-9 text-sm rounded-lg",
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5 text-ethiopia-yellow" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder={defaultPlaceholder}
          className={cn(
            "pl-12 pr-20 w-full bg-secondary/10 border-border/30 focus:border-primary/50",
            variantClasses[variant]
          )}
          aria-label={language === "am" ? "አገልግሎቶችን ይፈልጉ" : "Search services"}
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/40 bg-secondary/30 px-2 py-1 text-[10px] text-muted-foreground font-mono">
            <span>Ctrl</span>+<span>K</span>
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <Card
          ref={resultsRef}
          className="absolute top-full mt-2 w-full z-50 glass-heavy border border-border/30 shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {/* Search History (when no query) */}
          {!query && searchHistory.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {language === "am" ? "የቅርብ ጊዜ ፍለጋዎች" : "Recent Searches"}
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-primary/10 transition-colors text-left"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 truncate">{item}</span>
                </button>
              ))}
              <div className="border-t border-border/30 my-1" />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <LoadingSpinner size="sm" text={language === "am" ? "በመፈለግ ላይ..." : "Searching..."} />
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" />
                {language === "am"
                  ? `${results.length} አገልግሎቶች ተገኝተዋል`
                  : `${results.length} services found`}
              </div>
              {results.map((result, index) => (
                <button
                  key={result._id}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-3 rounded-lg text-sm transition-colors text-left",
                    "hover:bg-primary/10",
                    selectedIndex === index && "bg-primary/10 border border-primary/20"
                  )}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {language === "am" ? result.nameAmharic : result.name}
                      </span>
                      {result.totalFee !== undefined && result.totalFee > 0 && (
                        <Badge variant="secondary" size="sm" className="text-[10px] shrink-0">
                          {result.totalFee.toLocaleString()} ETB
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {language === "am"
                        ? result.shortDescriptionAmharic || result.nameAmharic
                        : result.shortDescription || result.name}
                    </p>
                    <Badge variant="secondary" size="sm" className="mt-1 text-[10px]">
                      {result.category?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">
                {language === "am" ? "ምንም ውጤት አልተገኘም" : "No results found"}
              </p>
              <p className="text-xs opacity-60 mt-1">
                {language === "am"
                  ? "በተለየ ቃል ይሞክሩ"
                  : "Try a different search term"}
              </p>
            </div>
          )}

          {/* Footer */}
          {query && results.length > 0 && (
            <div className="border-t border-border/30 px-4 py-2">
              <button
                onClick={() => {
                  saveToHistory(query.trim());
                  navigate(`/services?search=${encodeURIComponent(query.trim())}`);
                  setShowResults(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {language === "am" ? "ሁሉንም ውጤቶች ይመልከቱ" : "View all results"}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default AISearchBar;