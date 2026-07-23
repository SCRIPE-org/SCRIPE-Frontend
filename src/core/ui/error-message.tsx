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
          "mb-3 grid place-items-center rounded-nx-md border border-destructive/30 bg-destructive/10 text-destructive",
          compact ? "h-9 w-9" : "h-12 w-12"
        )}
        aria-hidden="true"
      >
        <AlertCircle className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </div>

      <p className={cn("max-w-[46ch] font-medium text-nx-ink", compact ? "text-sm" : "text-base")}>
        {message}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size={compact ? "sm" : "default"}
          className="mt-4"
        >
          <RefreshCw className="me-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
