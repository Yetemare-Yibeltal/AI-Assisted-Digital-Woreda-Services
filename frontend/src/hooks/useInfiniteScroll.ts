import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether data is currently loading */
  loading: boolean;
  /** Callback to load the next page */
  onLoadMore: () => void;
  /** Root margin for intersection observer (default: "200px") */
  rootMargin?: string;
  /** Threshold for intersection observer (default: 0.1) */
  threshold?: number;
  /** Whether to enable the infinite scroll (default: true) */
  enabled?: boolean;
}

/**
 * Triggers a callback when the sentinel element enters the viewport.
 * Used for infinite scrolling lists.
 */
export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  rootMargin = "200px",
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled || !hasMore || loading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          callbackRef.current();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, enabled, rootMargin, threshold]);

  return { sentinelRef };
}

export default useInfiniteScroll;
