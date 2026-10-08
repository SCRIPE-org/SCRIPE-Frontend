import React from "react";

interface Props {
  className?: string;
  variant?: "padel" | "pitch" | "track";
}

/**
 * Subtle venue geometry inspired by football pitch and padel/tennis court markings.
 * Opacity is kept strictly minimal (~0.035) to enrich atmosphere without distracting the operator.
 */
export function VenueCourtMotif({ className = "", variant = "padel" }: Props) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none opacity-[0.035] ${className}`}
      aria-hidden="true"
    >
      {variant === "padel" ? (
        <svg
          className="size-full"
          viewBox="0 0 800 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          preserveAspectRatio="none"
        >
          {/* Outer court boundary */}
          <rect x="20" y="20" width="760" height="360" rx="4" />
          {/* Net / center divider */}
          <line x1="400" y1="10" x2="400" y2="390" strokeDasharray="4 4" />
          {/* Service boxes */}
          <line x1="160" y1="20" x2="160" y2="380" />
          <line x1="640" y1="20" x2="640" y2="380" />
          {/* Center service line */}
          <line x1="160" y1="200" x2="640" y2="200" />
          {/* Subtle corner arcs */}
          <path d="M 20 40 A 20 20 0 0 1 40 20" />
          <path d="M 780 40 A 20 20 0 0 0 760 20" />
          <path d="M 20 360 A 20 20 0 0 0 40 380" />
          <path d="M 780 360 A 20 20 0 0 1 760 380" />
        </svg>
      ) : (
        <svg
          className="size-full"
          viewBox="0 0 800 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          preserveAspectRatio="none"
        >
          {/* Pitch boundary */}
          <rect x="20" y="20" width="760" height="360" />
          {/* Halfway line & center circle */}
          <line x1="400" y1="20" x2="400" y2="380" />
          <circle cx="400" cy="200" r="50" />
          {/* Left Penalty area & goal area */}
          <rect x="20" y="90" width="130" height="220" />
          <rect x="20" y="140" width="45" height="120" />
          {/* Right Penalty area & goal area */}
          <rect x="650" y="90" width="130" height="220" />
          <rect x="735" y="140" width="45" height="120" />
        </svg>
      )}
    </div>
  );
}
