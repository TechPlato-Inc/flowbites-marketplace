"use client";

import { useRef, useEffect, useCallback } from "react";

export function useInfiniteScroll(
  callback: () => void,
  options?: { threshold?: number },
) {
  const { threshold = 0.1 } = options || {};
  const sentinelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting) {
        callbackRef.current();
      }
    },
    [],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect, threshold]);

  return { sentinelRef };
}
