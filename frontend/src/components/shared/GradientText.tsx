import React from "react";
import { cn } from "@/lib/shadcn-utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  variant?: "ethiopia" | "green-gold" | "green" | "gold" | "fire" | "ocean" | "sunset" | "purple";
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right" | "diagonal";
  glow?: boolean;
  hover?: boolean;
  animate?: boolean;
  bold?: boolean;
}

const gradientMap: Record<NonNullable<GradientTextProps["variant"]>, string> = {
  ethiopia: "from-[#009A44] via-[#FEDD00] to-[#EF3340]",
  "green-gold": "from-[#009A44] via-[#00C853] to-[#FEDD00]",
  green: "from-[#009A44] via-[#00C853] to-[#009A44]",
  gold: "from-[#FEDD00] via-[#FFD700] to-[#FEDD00]",
  fire: "from-[#EF3340] via-[#FF6B35] to-[#FEDD00]",
  ocean: "from-[#009A44] via-[#00BCD4] to-[#1565C0]",
  sunset: "from-[#EF3340] via-[#FF9800] to-[#FEDD00]",
  purple: "from-[#6A1B9A] via-[#AB47BC] to-[#009A44]",
};

const speedMap: Record<NonNullable<GradientTextProps["speed"]>, string> = {
  slow: "8s",
  normal: "5s",
  fast: "3s",
};

const directionMap: Record<NonNullable<GradientTextProps["direction"]>, string> = {
  left: "bg-gradient-to-l",
  right: "bg-gradient-to-r",
  diagonal: "bg-gradient-to-br",
};

export function GradientText({
  as: Tag = "span",
  variant = "ethiopia",
  speed = "normal",
  direction = "right",
  glow = false,
  hover = false,
  animate = true,
  bold = true,
  className,
  children,
  ...props
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "bg-clip-text text-transparent",
        directionMap[direction],
        gradientMap[variant],
        animate && "bg-[length:200%_200%]",
        animate && "animate-gradient-text",
        bold && "font-extrabold",
        glow && "drop-shadow-[0_0_15px_rgba(0,154,68,0.5)]",
        hover && "hover:brightness-125 transition-all duration-300",
        className
      )}
      style={
        animate
          ? { animationDuration: speedMap[speed] }
          : undefined
      }
      {...props}
    >
      {children}
    </Tag>
  );
}

interface GradientHeadingProps {
  title: string;
  titleAmharic?: string;
  subtitle?: string;
  variant?: GradientTextProps["variant"];
  size?: "sm" | "default" | "lg" | "xl";
  align?: "left" | "center" | "right";
  className?: string;
}

export function GradientHeading({
  title,
  titleAmharic,
  subtitle,
  variant = "ethiopia",
  size = "default",
  align = "left",
  className,
}: GradientHeadingProps) {
  const sizeClasses = {
    sm: "text-2xl sm:text-3xl",
    default: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl",
    xl: "text-5xl sm:text-6xl",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn(alignClasses[align], className)}>
      <GradientText
        as="h2"
        variant={variant}
        className={sizeClasses[size]}
      >
        {title}
      </GradientText>
      {titleAmharic && (
        <p className="text-lg text-muted-foreground mt-2 font-amharic">
          {titleAmharic}
        </p>
      )}
      {subtitle && (
        <p className="text-base text-muted-foreground mt-2 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default GradientText;