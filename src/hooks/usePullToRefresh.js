import { useEffect, useRef } from "react";

export function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    const handleTouchStart = (e) => {
      if (element.scrollTop === 0 && e.touches.length > 0) {
        startYRef.current = e.touches[0].clientY;
        pullDistanceRef.current = 0;
      }
    };

    const handleTouchMove = (e) => {
      if (element.scrollTop !== 0) return;

      const currentY = e.touches[0].clientY;
      pullDistanceRef.current = currentY - startYRef.current;

      if (pullDistanceRef.current > 0 && pullDistanceRef.current <= 100) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistanceRef.current > 60 && !refreshingRef.current) {
        refreshingRef.current = true;
        try {
          await onRefresh();
        } finally {
          refreshingRef.current = false;
        }
      }
      pullDistanceRef.current = 0;
      startYRef.current = 0;
    };

    element.addEventListener("touchstart", handleTouchStart, false);
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, false);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart, false);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd, false);
    };
  }, [onRefresh]);

  // Reset state when container unmounts or changes
  useEffect(() => {
    return () => {
      startYRef.current = 0;
      pullDistanceRef.current = 0;
      refreshingRef.current = false;
    };
  }, []);

  return containerRef;
}