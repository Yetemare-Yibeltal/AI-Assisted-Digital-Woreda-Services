import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2, Clock, ArrowRight, FileText } from "lucide-react";
import { debounce } from "@/utils/performance";
import api from "@/utils/api";
import type { IService } from "@/types/service.types";
import type { ApiResponse } from "@/types/api.types";

interface SearchInputProps {
  variant?: "public" | "admin";
  placeholder?: string;
  placeholderAmharic?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: IService) => void;
  className?: string;
  size?: "sm" | "default" | "lg";
  autoFocus?: boolean;
}

interface SearchResult {
  services: IService[];
  total: number;
}

export function SearchInput({
  variant = "public",
  placeholder = "Search services...",
  placeholderAmharic = "አገልግሎቶችን ይፈልጉ...",
  onSearch,
  onResultSelect,
  className,
  size = "default",
  autoFocus = false,
}: SearchInputProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IService[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("searchHistory") || "[]").slice(0, 5);
    } catch {
      return [];
    }
  });
  const [language, setLanguage] = useState<"en" | "am">(() => {
    return (localStorage.getItem("language") as "en" | "am") || "en";
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
        const endpoint = variant === "public"
          ? `/public/services/search?q=${encodeURIComponent(searchQuery)}&limit=8`
          : `/services/search?q=${encodeURIComponent(searchQuery)}&limit=8`;

        const response = await api.get<ApiResponse<IService[]>>(endpoint);
        
        if (response.data.success) {
          setResults(response.data.data || []);
          setShowResults(true);
          onSearch?.(searchQuery);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [variant, onSearch]
  );

  const saveToHistory = (queryText: string) => {
    const updated = [queryText, ...searchHistory.filter((h) => h !== queryText)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    performSearch(value);
    
    if (!value) {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  const handleResultClick = (service: IService) => {
    saveToHistory(query.trim());
    setShowResults(false);
    setQuery("");
    setResults([]);
    
    if (onResultSelect) {
      onResultSelect(service);
    } else {
      navigate(`/services/${service.slug}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    performSearch(historyItem);
    inputRef.current?.focus();
  };

  // Keyboard shortcut Ctrl+K
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

  // Close results when clicking outside
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

  const currentPlaceholder = language === "am" ? placeholderAmharic : placeholder;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={currentPlaceholder}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 pr-16",
            size === "sm" && "h-9 text-sm",
            size === "lg" && "h-12 text-base"
          )}
          aria-label={currentPlaceholder}
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/50 bg-secondary/30 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
            <span>Ctrl</span>+<span>K</span>
          </kbd>
        </div>
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className={cn(
            "absolute top-full mt-2 w-full z-50",
            "glass-heavy rounded-xl border border-border/30",
            "shadow-2xl overflow-hidden",
            "animate-in fade-in-0 slide-in-from-top-2 duration-200"
          )}
          role="listbox"
        >
          {/* Search history (when no query) */}
          {!query && searchHistory.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Searches
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

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Services ({results.length})
              </div>
              {results.map((service, index) => (
                <button
                  key={service._id}
                  onClick={() => handleResultClick(service)}
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
                    <div className="font-medium truncate">{service.name}</div>
                    <div className="text-xs text-muted-foreground truncate font-amharic">
                      {service.nameAmharic}
                    </div>
                    {service.shortDescription && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {service.shortDescription}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No services found</p>
              <p className="text-xs opacity-60 mt-1">Try a different search term</p>
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
                View all results
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInput;