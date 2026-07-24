// UI-EXCEPTION: compact studio layout
/**
 * FloatingCompareButton — Sticky bottom-center button to open the full comparison table.
 *
 * Uses IntersectionObserver to auto-hide when the comparison table is scrolled into view.
 * Appears over the pricing cards section and disappears when the table is visible.
 */
"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LayoutList } from "lucide-react";

interface FloatingCompareButtonProps {
  label: string;
  targetRef: React.RefObject<HTMLElement | null>;
}

/**
 * Presentation UI component rendering the floating compare button.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function FloatingCompareButton({ label, targetRef }: FloatingCompareButtonProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      threshold: 0.15,
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  const scrollToTable = () => {
    targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
      <button
        onClick={scrollToTable}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-2xl transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-4 hover:scale-105 active:scale-95"
      >
        <LayoutList className="h-4 w-4" />
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
