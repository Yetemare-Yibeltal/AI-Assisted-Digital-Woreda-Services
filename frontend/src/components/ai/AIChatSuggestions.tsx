import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, HelpCircle } from "lucide-react";

interface Suggestion {
  text: string;
  textAmharic: string;
  icon?: React.ReactNode;
}

interface AIChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
  language?: "en" | "am";
  className?: string;
  variant?: "chips" | "list";
}

export function AIChatSuggestions({
  onSelect,
  language = "en",
  className,
  variant = "chips",
}: AIChatSuggestionsProps) {
  const suggestions: Suggestion[] = [
    {
      text: "How do I get a birth certificate?",
      textAmharic: "የልደት ሰርተፍኬት እንዴት ማግኘት እችላለሁ?",
      icon: <HelpCircle className="h-3 w-3" />,
    },
    {
      text: "What documents do I need for marriage registration?",
      textAmharic: "ለጋብቻ ምዝገባ ምን ሰነዶች ያስፈልጋሉ?",
      icon: <HelpCircle className="h-3 w-3" />,
    },
    {
      text: "How much is the business license fee?",
      textAmharic: "የንግድ ፈቃድ ክፍያ ስንት ነው?",
      icon: <HelpCircle className="h-3 w-3" />,
    },
    {
      text: "How long does land registration take?",
      textAmharic: "የመሬት ምዝገባ ምን ያህል ጊዜ ይወስዳል?",
      icon: <HelpCircle className="h-3 w-3" />,
    },
    {
      text: "Where is the woreda office located?",
      textAmharic: "የወረዳ ቢሮ የት ነው የሚገኘው?",
      icon: <HelpCircle className="h-3 w-3" />,
    },
    {
      text: "Can I track my application status?",
      textAmharic: "የማመልከቻዬን ሁኔታ መከታተል እችላለሁ?",
      icon: <HelpCircle className="h-3 w-3" />,
    },
  ];

  if (variant === "list") {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center gap-2 mb-2 px-1">
          <Sparkles className="h-3.5 w-3.5 text-ethiopia-yellow" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {language === "am" ? "የተጠቆሙ ጥያቄዎች" : "Suggested Questions"}
          </span>
        </div>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(language === "am" ? suggestion.textAmharic : suggestion.text)}
            className="w-full text-left p-2.5 rounded-lg text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
          >
            {suggestion.icon}
            <span className="line-clamp-2">
              {language === "am" ? suggestion.textAmharic : suggestion.text}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {suggestions.slice(0, 5).map((suggestion, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-xs py-1.5 px-3"
          onClick={() => onSelect(language === "am" ? suggestion.textAmharic : suggestion.text)}
        >
          {language === "am" ? suggestion.textAmharic : suggestion.text}
        </Badge>
      ))}
    </div>
  );
}

export default AIChatSuggestions;