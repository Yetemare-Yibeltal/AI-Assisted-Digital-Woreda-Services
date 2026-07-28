import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { ChevronRight, MoreHorizontal, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode;
  collapseOnMobile?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator, collapseOnMobile = true, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm text-muted-foreground",
        collapseOnMobile && "overflow-x-auto whitespace-nowrap scrollbar-none",
        className
      )}
      {...props}
    />
  )
);
Breadcrumb.displayName = "Breadcrumb";

interface BreadcrumbListProps extends React.ComponentPropsWithoutRef<"ol"> {
  homeItem?: BreadcrumbItemData;
}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, homeItem, children, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {homeItem && (
        <BreadcrumbItem>
          <BreadcrumbLink to={homeItem.path || "/"} title={homeItem.label}>
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">{homeItem.label}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
      )}
      {children}
    </ol>
  )
);
BreadcrumbList.displayName = "BreadcrumbList";

interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {
  isActive?: boolean;
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isActive, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-1.5",
        isActive && "text-foreground font-medium",
        className
      )}
      {...props}
    />
  )
);
BreadcrumbItem.displayName = "BreadcrumbItem";

interface BreadcrumbLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  as?: "link" | "button";
  onClick?: () => void;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, as = "link", to, onClick, children, ...props }, ref) => {
    const baseClasses = cn(
      "transition-colors hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded",
      className
    );

    if (as === "button") {
      return (
        <button
          type="button"
          onClick={onClick}
          className={baseClasses}
          {...(props as any)}
        >
          {children}
        </button>
      );
    }

    if (!to) {
      return (
        <span className={cn("cursor-default", className)} {...props as any}>
          {children}
        </span>
      );
    }

    return (
      <Link to={to} className={baseClasses} ref={ref} {...props}>
        {children}
      </Link>
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

interface BreadcrumbSeparatorProps extends React.ComponentPropsWithoutRef<"li"> {
  separator?: React.ReactNode;
}

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, separator, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("text-muted-foreground/50", className)}
      {...props}
    >
      {separator || <ChevronRight className="h-3.5 w-3.5" />}
    </li>
  )
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

interface BreadcrumbEllipsisProps extends React.ComponentPropsWithoutRef<"span"> {
  collapsedItems?: BreadcrumbItemData[];
}

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, collapsedItems, ...props }, ref) => {
    if (collapsedItems && collapsedItems.length > 0) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span
              ref={ref}
              role="button"
              tabIndex={0}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/50 cursor-pointer",
                className
              )}
              {...props}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More pages</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {collapsedItems.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                <Link to={item.path || "#"} className="text-sm">
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("flex h-7 w-7 items-center justify-center", className)}
        {...props}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More</span>
      </span>
    );
  }
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

interface BreadcrumbItemData {
  label: string;
  labelAmharic?: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbPageProps {
  items: BreadcrumbItemData[];
  separator?: React.ReactNode;
  maxItems?: number;
  homeItem?: BreadcrumbItemData;
  className?: string;
  language?: "en" | "am";
}

function BreadcrumbPage({
  items,
  separator,
  maxItems = 5,
  homeItem = { label: "Home", labelAmharic: "መነሻ", path: "/", icon: <Home className="h-3.5 w-3.5" /> },
  className,
  language = "en",
}: BreadcrumbPageProps) {
  const location = useLocation();

  const allItems = homeItem ? [homeItem, ...items] : items;
  const totalItems = allItems.length;

  const getVisibleItems = (): { visible: BreadcrumbItemData[]; collapsed: BreadcrumbItemData[] } => {
    if (totalItems <= maxItems) {
      return { visible: allItems, collapsed: [] };
    }

    const firstItems = allItems.slice(0, 2);
    const lastItems = allItems.slice(-2);
    const collapsed = allItems.slice(2, -2);

    return {
      visible: [...firstItems, { label: "...", path: undefined }, ...lastItems],
      collapsed,
    };
  };

  const { visible, collapsed } = getVisibleItems();

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1;
          const isEllipsis = item.label === "...";

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem isActive={isLast}>
                {isEllipsis ? (
                  <BreadcrumbEllipsis collapsedItems={collapsed} />
                ) : isLast ? (
                  <span className="flex items-center gap-1.5">
                    {item.icon}
                    <span className="truncate max-w-[200px]">
                      {language === "am" && item.labelAmharic ? item.labelAmharic : item.label}
                    </span>
                  </span>
                ) : (
                  <BreadcrumbLink
                    to={item.path || "#"}
                    className="flex items-center gap-1.5"
                  >
                    {item.icon}
                    <span className="truncate max-w-[150px]">
                      {language === "am" && item.labelAmharic ? item.labelAmharic : item.label}
                    </span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator separator={separator} />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbPage,
};
export type { BreadcrumbItemData };