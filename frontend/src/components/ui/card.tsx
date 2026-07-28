import * as React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Skeleton } from "./skeleton";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glass-hover" | "gradient" | "outline" | "flat";
  loading?: boolean;
  noPadding?: boolean;
}

const cardVariants: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "bg-card text-card-foreground border border-border rounded-xl shadow-lg",
  glass: "glass-card rounded-xl",
  "glass-hover": "glass-card-hover rounded-xl cursor-pointer",
  gradient: "glass-card rounded-xl gradient-border",
  outline: "border border-border rounded-xl bg-transparent",
  flat: "bg-secondary/30 rounded-xl",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", loading = false, noPadding = false, children, ...props }, ref) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(cardVariants[variant], noPadding ? "" : "p-6", className)}
          {...props}
        >
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-5/6 mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants[variant], noPadding ? "" : "p-6", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  withAccent?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withAccent = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        withAccent && "border-l-2 border-ethiopia-green pl-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  gradient?: boolean;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Tag = "h3", gradient = false, children, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "text-xl font-bold leading-tight tracking-tight",
        gradient && "animated-gradient-text",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, border = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between pt-4 mt-4",
        border && "border-t border-border/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  overlay?: boolean;
  overlayText?: string;
  height?: string;
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, overlay = false, overlayText, height = "h-48", alt = "", ...props }, ref) => (
    <div className={cn("relative overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-4", height)}>
      <img
        ref={ref}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        {...props}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          {overlayText && (
            <span className="text-white text-lg font-semibold">{overlayText}</span>
          )}
        </div>
      )}
    </div>
  )
);
CardImage.displayName = "CardImage";

interface CardActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost";
}

const CardAction = React.forwardRef<HTMLButtonElement, CardActionProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "text-primary hover:text-primary/80",
      primary: "text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg",
      ghost: "text-muted-foreground hover:text-foreground",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "text-sm font-medium transition-colors",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CardAction.displayName = "CardAction";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
  CardAction,
};