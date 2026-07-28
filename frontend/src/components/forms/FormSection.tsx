import React, { useState } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  titleAmharic?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  completed?: boolean;
  hasError?: boolean;
  language?: "en" | "am";
  className?: string;
  action?: React.ReactNode;
}

export function FormSection({
  title,
  titleAmharic,
  description,
  icon: Icon,
  children,
  defaultOpen = true,
  collapsible = false,
  completed = false,
  hasError = false,
  language = "en",
  className,
  action,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const displayTitle = language === "am" && titleAmharic ? titleAmharic : title;

  const StatusIcon = completed ? CheckCircle2 : hasError ? AlertCircle : null;
  const statusColor = completed
    ? "text-emerald-400"
    : hasError
    ? "text-red-400"
    : "";

  const content = (
    <Card
      className={cn(
        "transition-all duration-300",
        completed && "border-emerald-500/30",
        hasError && "border-red-500/30",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  completed
                    ? "bg-emerald-500/10 text-emerald-400"
                    : hasError
                    ? "bg-red-500/10 text-red-400"
                    : "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base lg:text-lg">{displayTitle}</CardTitle>
                {completed && (
                  <Badge variant="success" size="sm" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {language === "am" ? "ተጠናቋል" : "Complete"}
                  </Badge>
                )}
                {hasError && !completed && (
                  <Badge variant="danger" size="sm" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {language === "am" ? "ስህተቶች አሉ" : "Has errors"}
                  </Badge>
                )}
              </div>
              {description && (
                <CardDescription className="mt-0.5">{description}</CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {action}
            {collapsible && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label={isOpen ? "Collapse section" : "Expand section"}
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>
      </CardHeader>

      {isOpen && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  );

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {content}
      </Collapsible>
    );
  }

  return content;
}

export default FormSection;