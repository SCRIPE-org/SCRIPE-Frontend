/**
 * FloatingCompareButton — bottom-centred shortcut down to the comparison table.
 *
 * An IntersectionObserver hides it once the table is on screen, so it only ever
 * offers a jump the user cannot already make.
 *
 * It is the page's primary action while it is visible, so it is a real Button
 * on the primary variant rather than a hand-cut pill: the previous version
 * hand-mixed the primary fill, then grew on hover and shrank on press, which is
 * the one thing a button in this system never does — press is the lit edge
 * closing around the control, not a transform. Centring is `inset-x-0` plus a
 * flex centre rather than a physical inset and a translate, so nothing depends
 * on the writing direction.
 */
"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LayoutList } from "lucide-react";
import { Button } from "@core/ui/button";

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
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-sticky flex justify-center px-4">
      <Button
        type="button"
        onClick={scrollToTable}
        className="pointer-events-auto gap-2 motion-safe:duration-nx-standard motion-safe:ease-nx-enter motion-safe:animate-in motion-safe:fade-in-0"
      >
        <LayoutList aria-hidden="true" className="h-4 w-4" />
        {label}
        <ChevronDown aria-hidden="true" className="h-4 w-4" />
      </Button>
    </div>
  );
}
