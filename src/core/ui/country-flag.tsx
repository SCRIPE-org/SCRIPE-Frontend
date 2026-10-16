/**
 * CountryFlag — Vector SVG Country Flag Component
 *
 * Renders high-definition, cross-platform vector SVG flags using the bundled
 * react-phone-number-input/flags library. Overcomes OS-level emoji limitations
 * (such as Windows Chrome rendering country flags as text letters like 'SA' or 'EG').
 *
 * @module core/ui/country-flag
 */
"use client";

import * as React from "react";
import flags from "react-phone-number-input/flags";
import { cn } from "@core/common/utils";

export interface CountryFlagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** ISO 3166-1 alpha-2 country code (case-insensitive, e.g. "SA", "EG", "US") */
  countryCode?: string;
  /** Accessible title / tooltip text */
  countryName?: string;
  /** Visual size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "h-3.5 w-5",
  md: "h-4 w-6",
  lg: "h-5 w-7.5",
};

export const CountryFlag = React.forwardRef<HTMLSpanElement, CountryFlagProps>(
  ({ countryCode, countryName, size = "md", className, ...props }, ref) => {
    const code = (countryCode || "").toUpperCase();
    const FlagComponent = flags[code as keyof typeof flags];

    if (!FlagComponent) {
      return (
        <span
          ref={ref}
          className={cn(
            "rounded-nx-xs inline-flex shrink-0 items-center justify-center overflow-hidden border border-nx-line bg-nx-raised font-mono text-[9px] font-bold tracking-wider text-nx-ink-2",
            sizeClasses[size],
            className
          )}
          title={countryName || code || "Unknown Country"}
          {...props}
        >
          {code ? code.slice(0, 2) : "🌐"}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          "rounded-nx-xs border-nx-line/70 shadow-nx-xs inline-flex shrink-0 items-center justify-center overflow-hidden border bg-nx-raised",
          sizeClasses[size],
          className
        )}
        title={countryName || code}
        {...props}
      >
        <FlagComponent title={countryName || code} />
      </span>
    );
  }
);

CountryFlag.displayName = "CountryFlag";
