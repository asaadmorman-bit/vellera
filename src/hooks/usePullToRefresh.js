import { useEffect, useRef } from "react";

export function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    let refreshing = false;

    const handleTouchStart = (e) => {
      if (element.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
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
      if (pullDistanceRef.current > 60 && !refreshing) {
        refreshing = true;
        await onRefresh();
        refreshing = false;
      }
      pullDistanceRef.current = 0;
    };

    element.addEventListener("touchstart", handleTouchStart, false);
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, false);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh]);

  return containerRef;
}