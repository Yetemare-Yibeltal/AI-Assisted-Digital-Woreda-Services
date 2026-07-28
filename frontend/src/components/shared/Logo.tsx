import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Building2, Landmark } from "lucide-react";

interface LogoProps {
  size?: "xs" | "sm" | "default" | "lg" | "xl" | "2xl";
  variant?: "full" | "icon" | "text" | "horizontal" | "vertical";
  showIcon?: boolean;
  showText?: boolean;
  showSubtitle?: boolean;
  linkTo?: string;
  onClick?: () => void;
  className?: string;
  animated?: boolean;
  glowEffect?: boolean;
}

const sizeConfig = {
  xs: { container: "text-sm gap-1", icon: "h-4 w-4", text: "text-sm", subtitle: "text-[8px]" },
  sm: { container: "text-base gap-1.5", icon: "h-5 w-5", text: "text-base", subtitle: "text-[9px]" },
  default: { container: "text-xl gap-2", icon: "h-7 w-7", text: "text-xl", subtitle: "text-[10px]" },
  lg: { container: "text-2xl gap-2.5", icon: "h-8 w-8", text: "text-2xl", subtitle: "text-[11px]" },
  xl: { container: "text-3xl gap-3", icon: "h-10 w-10", text: "text-3xl", subtitle: "text-xs" },
  "2xl": { container: "text-4xl gap-4", icon: "h-12 w-12", text: "text-4xl", subtitle: "text-sm" },
};

const subtitleText = {
  en: "Amhara Region • Awi Zone",
  am: "አማራ ክልል • አዊ ዞን",
};

export function Logo({
  size = "default",
  variant = "full",
  showIcon = true,
  showText = true,
  showSubtitle = false,
  linkTo = "/",
  onClick,
  className,
  animated = true,
  glowEffect = false,
}: LogoProps) {
  const navigate = useNavigate();
  const config = sizeConfig[size];

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (linkTo && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      navigate(linkTo);
    }
  };

  const iconElement = showIcon ? (
    <div className="relative flex-shrink-0">
      {glowEffect && (
        <div className="absolute inset-0 bg-ethiopia-green rounded-xl blur-md opacity-40 animate-pulse-glow" />
      )}
      <div className="relative bg-gradient-to-br from-ethiopia-green/20 to-ethiopia-green/5 rounded-xl p-1.5 border border-ethiopia-green/20">
        {size === "xs" || size === "sm" ? (
          <Building2 className={cn(config.icon, "text-ethiopia-green")} />
        ) : (
          <Landmark className={cn(config.icon, "text-ethiopia-green")} />
        )}
      </div>
    </div>
  ) : null;

  const textElement = showText ? (
    <div className={cn("flex flex-col", variant === "vertical" && "items-center")}>
      <span
        className={cn(
          "font-extrabold tracking-tight leading-none whitespace-nowrap",
          config.text,
          animated && "animated-gradient-text"
        )}
      >
        Dangila Woreda
      </span>
      {showSubtitle && (
        <span className={cn("text-muted-foreground font-medium tracking-wide", config.subtitle)}>
          {subtitleText.en}
        </span>
      )}
    </div>
  ) : null;

  if (variant === "icon") {
    return (
      <Link
        to={linkTo}
        onClick={handleClick}
        className={cn("inline-flex hover:opacity-80 transition-opacity", className)}
        aria-label="Dangila Woreda Home"
      >
        {iconElement}
      </Link>
    );
  }

  if (variant === "text") {
    return (
      <Link
        to={linkTo}
        onClick={handleClick}
        className={cn("inline-flex hover:opacity-90 transition-opacity", className)}
      >
        {textElement}
      </Link>
    );
  }

  return (
    <Link
      to={linkTo}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center hover:opacity-90 transition-opacity select-none",
        variant === "vertical" && "flex-col",
        config.container,
        className
      )}
      aria-label="Dangila Woreda Digital Services"
    >
      {iconElement}
      {textElement}
    </Link>
  );
}

export default Logo;