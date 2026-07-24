"use client";

/**
 * ErrorMessage — the one error anatomy
 *
 * Glyph tile, message, retry — the same skeleton as EmptyState, tinted with
 * the measured destructive token. SectionState's error branch renders this at
 * size="sm", so a failed dashboard section and a failed page read as the same
 * state. The old Alert-based version carried blur-and-lift relics from the
 * pre-nexus look; both are gone, and the full-viewport centring is opt-in now
 * instead of hardcoded.
 *
 * Wave K: the vertical rhythm now moves with the size (it was a fixed mb-3/mt-4
 * at both tiers, so the compact form had page-sized air), the sentence wraps on
 * balance points, and the retry glyph is explicitly static — a refresh icon
 * that spins before anyone has asked for a retry is the exact idle motion this
 * system rejects.
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  /** Compact anatomy for in-section use (what SectionState renders). */
  size?: "sm" | "md";
  /** Opt-in full-viewport centring (the old hardcoded default). */
  fullHeight?: boolean;
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  size = "md",
  fullHeight = false,
  className,
}: ErrorMessageProps) {
  const { t } = useI18n();
  const compact = size === "sm";

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        compact ? "py-6" : "py-10",
        fullHeight && "min-h-[60vh]",
        className
      )}
    >
      <div
        className={cn(
          "grid place-items-center rounded-nx-md border border-destructive/30 bg-destructive/10 text-destructive",
          compact ? "h-9 w-9" : "h-12 w-12"
        )}
        aria-hidden="true"
      >
        <AlertCircle className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </div>

      <p
        className={cn(
          "max-w-[46ch] text-pretty font-medium leading-snug text-nx-ink",
          compact ? "mt-2.5 text-sm" : "mt-3.5 text-base"
        )}
      >
        {message}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size={compact ? "sm" : "default"}
          className={compact ? "mt-3" : "mt-5"}
        >
          {/* Static glyph: the ring only turns once a retry is actually in
              flight, and that spinner is Button's own loading state. */}
          <RefreshCw className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
