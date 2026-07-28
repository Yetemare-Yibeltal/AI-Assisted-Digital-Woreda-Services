import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Loader2, ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ethiopia" | "green-gold" | "green" | "gold" | "fire" | "ocean";
  size?: "xs" | "sm" | "default" | "lg" | "xl" | "2xl";
  fill?: "solid" | "outline" | "ghost";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
  rounded?: "default" | "full" | "none";
  as?: "button" | "link";
  to?: string;
  external?: boolean;
}

const gradientMap: Record<NonNullable<GradientButtonProps["variant"]>, string> = {
  ethiopia: "from-[#009A44] via-[#00C853] to-[#FEDD00] hover:via-[#00E676] hover:to-[#FFD700]",
  "green-gold": "from-[#009A44] to-[#FEDD00] hover:from-[#00C853] hover:to-[#FFD700]",
  green: "from-[#009A44] to-[#00C853] hover:from-[#00B84C] hover:to-[#00E676]",
  gold: "from-[#FEDD00] to-[#FFD700] hover:from-[#FFE033] hover:to-[#FFE566]",
  fire: "from-[#EF3340] to-[#FF6B35] hover:from-[#F44336] hover:to-[#FF8A65]",
  ocean: "from-[#009A44] to-[#1565C0] hover:from-[#00B84C] hover:to-[#1976D2]",
};

const sizeMap: Record<NonNullable<GradientButtonProps["size"]>, string> = {
  xs: "px-3 py-1.5 text-xs gap-1.5 rounded-md",
  sm: "px-4 py-2 text-sm gap-2 rounded-lg",
  default: "px-6 py-3 text-base gap-2 rounded-lg",
  lg: "px-8 py-3.5 text-lg gap-3 rounded-xl",
  xl: "px-10 py-4 text-xl gap-3 rounded-xl",
  "2xl": "px-12 py-5 text-2xl gap-4 rounded-2xl",
};

const roundedMap: Record<NonNullable<GradientButtonProps["rounded"]>, string> = {
  default: "",
  full: "!rounded-full",
  none: "!rounded-none",
};

export function GradientButton({
  variant = "ethiopia",
  size = "default",
  fill = "solid",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glow = true,
  rounded = "default",
  as = "button",
  to,
  external,
  className,
  children,
  disabled,
  ...props
}: GradientButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center font-bold tracking-wide",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
    "active:scale-[0.97]",
    sizeMap[size],
    roundedMap[rounded],
    fullWidth && "w-full"
  );

  const fillClasses: Record<string, string> = {
    solid: cn(
      "bg-gradient-to-r text-white shadow-lg",
      gradientMap[variant],
      glow && "shadow-primary/20 hover:shadow-primary/40",
      "hover:shadow-xl hover:brightness-110"
    ),
    outline: cn(
      "bg-transparent border-2 border-transparent",
      "bg-clip-padding",
      "relative before:absolute before:inset-0 before:rounded-[inherit] before:p-[2px] before:bg-gradient-to-r",
      `before:${gradientMap[variant]}`,
      "before:-z-10 before:mask before:mask-composite-exclude",
      "text-foreground hover:text-primary",
      glow && "hover:shadow-lg hover:shadow-primary/20"
    ),
    ghost: cn(
      "bg-transparent",
      "bg-gradient-to-r bg-clip-text text-transparent",
      gradientMap[variant],
      "hover:brightness-125",
      "border border-transparent hover:border-primary/20"
    ),
  };

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </>
  );

  if (as === "link" && to) {
    if (external) {
      return (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(baseClasses, fillClasses[fill], className)}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        to={to}
        className={cn(baseClasses, fillClasses[fill], className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(baseClasses, fillClasses[fill], className)}
      {...props}
    >
      {content}
    </button>
  );
}

interface GradientIconButtonProps extends GradientButtonProps {
  icon: React.ReactNode;
  label: string;
}

export function GradientIconButton({
  icon,
  label,
  ...props
}: GradientIconButtonProps) {
  return (
    <GradientButton {...props} aria-label={label}>
      {icon}
      <span className="sr-only">{label}</span>
    </GradientButton>
  );
}

export default GradientButton;