"use client";

import * as React from "react";

interface StepDotsProps {
  current: number;
  total: number;
}

/**
 * React presentation component representing the step dots UI element.
 */
export function StepDots({ current, total }: StepDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current - 1 ? "1.5rem" : "0.375rem",
            background:
              i === current - 1
                ? "var(--sx-accent-text)"
                : i < current - 1
                  ? "var(--sx-accent-soft)"
                  : "var(--sx-chip-bg)",
          }}
        />
      ))}
    </div>
  );
}
