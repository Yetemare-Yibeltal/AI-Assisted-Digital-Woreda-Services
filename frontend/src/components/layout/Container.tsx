import React from "react";
import { cn } from "@/lib/shadcn-utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "default" | "lg";
  background?: "none" | "glass" | "dark" | "darker";
  as?: "div" | "section" | "article" | "main";
  centered?: boolean;
}

const maxWidthClasses: Record<NonNullable<ContainerProps["maxWidth"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
  "2xl": "max-w-[100rem]",
  full: "max-w-full",
};

const paddingClasses: Record<NonNullable<ContainerProps["padding"]>, string> = {
  none: "",
  sm: "px-2 sm:px-4 py-4",
  default: "px-4 sm:px-6 lg:px-8 py-8",
  lg: "px-4 sm:px-8 lg:px-12 py-12",
};

const backgroundClasses: Record<NonNullable<ContainerProps["background"]>, string> = {
  none: "",
  glass: "glass-card-interactive",
  dark: "bg-woreda-dark/50",
  darker: "bg-woreda-darker/80",
};

export function Container({
  children,
  maxWidth = "lg",
  padding = "default",
  background = "none",
  as: Tag = "div",
  centered = false,
  className,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        backgroundClasses[background],
        centered && "flex flex-col items-center text-center",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Container;