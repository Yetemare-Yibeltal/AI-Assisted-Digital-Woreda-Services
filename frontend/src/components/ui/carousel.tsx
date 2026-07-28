import * as React from "react";
import { cn } from "@/lib/shadcn-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemsPerView?: number | { mobile: number; tablet: number; desktop: number };
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  gap?: number;
  loop?: boolean;
}

export function Carousel({
  children,
  className,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  autoplay = false,
  autoplayInterval = 4000,
  showArrows = true,
  showDots = true,
  gap = 16,
  loop = true,
}: CarouselProps) {
  const items = React.Children.toArray(children);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const autoplayRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const getItemsPerView = (): number => {
    if (typeof itemsPerView === "number") return itemsPerView;
    if (typeof window === "undefined") return itemsPerView.desktop;
    if (window.innerWidth < 640) return itemsPerView.mobile;
    if (window.innerWidth < 1024) return itemsPerView.tablet;
    return itemsPerView.desktop;
  };

  const [currentItemsPerView, setCurrentItemsPerView] = React.useState(getItemsPerView());

  React.useEffect(() => {
    const handleResize = () => setCurrentItemsPerView(getItemsPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemsPerView]);

  const totalSlides = Math.ceil(items.length / currentItemsPerView);
  const maxIndex = loop ? totalSlides : totalSlides - 1;

  const goTo = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goNext = () => {
    if (currentIndex >= totalSlides - 1) {
      goTo(0);
    } else {
      goTo(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex <= 0) {
      goTo(totalSlides - 1);
    } else {
      goTo(currentIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goNext();
    }
    if (touchEnd - touchStart > 75) {
      goPrev();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  React.useEffect(() => {
    if (autoplay && items.length > currentItemsPerView) {
      autoplayRef.current = setInterval(goNext, autoplayInterval);
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, currentIndex, items.length, currentItemsPerView]);

  if (items.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex transition-transform duration-400 ease-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          gap: `${gap}px`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ width: `calc((100% - ${gap * (currentItemsPerView - 1)}px) / ${currentItemsPerView})` }}
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows && items.length > currentItemsPerView && (
        <>
          <button
            onClick={goPrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "h-10 w-10 rounded-full glass-card-interactive flex items-center justify-center",
              "text-foreground hover:text-primary transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "h-10 w-10 rounded-full glass-card-interactive flex items-center justify-center",
              "text-foreground hover:text-primary transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {showDots && totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}