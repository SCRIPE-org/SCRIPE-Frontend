"use client";

import Link from "next/link";

interface FormOptionsProps {
  staySignedIn: boolean;
  onStaySignedInChange: (val: boolean) => void;
  disabled: boolean;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the form options.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FormOptions({ staySignedIn, onStaySignedInChange, disabled, t }: FormOptionsProps) {
  return (
    <div
      className="flex items-center justify-between text-[12px]"
      style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
    >
      <label
        className="flex cursor-pointer select-none items-center gap-2"
        onClick={() => {
          // The checkbox is a `div[role="checkbox"]`, not a native input, so
          // it isn't natively associated with this <label> — without this
          // handler, clicks on the label text wouldn't toggle it. The
          // checkbox div's own onClick calls stopPropagation, so this only
          // fires for clicks that land on the label/text, never double-firing.
          if (!disabled) onStaySignedInChange(!staySignedIn);
        }}
      >
        <div
          role="checkbox"
          aria-checked={staySignedIn}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onStaySignedInChange(!staySignedIn);
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              if (!disabled) onStaySignedInChange(!staySignedIn);
            }
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all"
          style={{
            background: staySignedIn ? "linear-gradient(135deg, #A855F7, #3B82F6)" : "transparent",
            border: staySignedIn
              ? "1px solid transparent"
              : "1px solid var(--sx-field-border, hsl(var(--border)))",
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {staySignedIn && (
            <svg width="13" height="14" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 5l2 2 5-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span>{t("auth.staySignedIn")}</span>
      </label>
      <Link
        href="/forgot-password"
        className="text-[12px] font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--sx-accent-text, hsl(var(--primary)))" }}
        tabIndex={0}
      >
        {t("auth.forgotPassword")}
      </Link>
    </div>
  );
}
