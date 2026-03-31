import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useTabStack(containerRef) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!containerRef.current) return;

    // Save scroll position before navigation
    const savePosition = () => {
      const scrollPos = containerRef.current?.scrollTop || 0;
      sessionStorage.setItem(`tab-scroll-${pathname}`, scrollPos.toString());
    };

    // Restore scroll position on route change
    const restorePosition = () => {
      const saved = sessionStorage.getItem(`tab-scroll-${pathname}`);
      if (saved && containerRef.current) {
        setTimeout(() => {
          containerRef.current.scrollTop = parseInt(saved, 10);
        }, 0);
      }
    };

    window.addEventListener("beforeunload", savePosition);
    restorePosition();

    return () => window.removeEventListener("beforeunload", savePosition);
  }, [pathname]);
}