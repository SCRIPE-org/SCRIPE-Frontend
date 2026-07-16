"use client";

import { useEffect, useState } from "react";

/**
 * Presentation UI component rendering the reading progress.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      const scrolled = window.scrollY;
      const pct = docHeight > 0 ? Math.min((scrolled / docHeight) * 100, 100) : 0;
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="docs-reading-progress">
      <div className="docs-reading-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
