import { useState, useEffect } from "react";

/**
 * Returns true if the given media query string matches the current viewport.
 * Updates on window resize.
 *
 * @param query - CSS media query string, e.g. "(min-width: 768px)"
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR safety
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    // Set initial value immediately (in case it changed between render and effect)
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
    // Older Safari support
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints matching Tailwind defaults
 */
export const useBreakpoints = () => {
  const sm = useMediaQuery("(min-width: 640px)");
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  const xl = useMediaQuery("(min-width: 1280px)");
  const xl2 = useMediaQuery("(min-width: 1536px)");
  const isMobile = !sm;
  const isTablet = sm && !lg;
  const isDesktop = lg;

  return { sm, md, lg, xl, xl2, isMobile, isTablet, isDesktop };
};

export default useMediaQuery;
