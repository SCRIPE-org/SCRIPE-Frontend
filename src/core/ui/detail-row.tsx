"use client";

/**
 * DetailRow — the label/value line
 *
 * Around thirty files had drawn their own version of "quiet label, readable
 * value, sometimes a copy button": each picked its own ink pair, its own label
 * size, and half of them set the value flush left, which puts it under the
 * label in Arabic instead of opposite it. One row means a drawer, a summary
 * card and a settings panel all read as the same product.
 *
 * The value always gets tabular-nums: these rows carry ids, amounts, counts and
 * timestamps, and a column of figures that jitters as digits change is the
 * defect this ladder exists to prevent.
 *
 * The copy control is a real 32px button whose accessible name is
 * "<copy> <label>", built from the label element itself rather than a
 * concatenated string — five rows in one panel would otherwise all announce as
 * "Copy".
 */

import * as React from "react";
import { cn } from "@core/common/utils";
import { appLogger } from "@core/common/logger";
import { useI18n } from "@core/providers/i18n-provider";
import { Check, Copy, type LucideIcon } from "lucide-react";

export interface DetailRowProps {
  /** What the value is. Stays quiet — the value is the thing being read. */
  label: React.ReactNode;
  value: React.ReactNode;
  /** Decorative glyph before the label; the label is what names the row. */
  icon?: LucideIcon;
  /** "inline" puts the value on the opposite edge, "stacked" puts it beneath. */
  layout?: "inline" | "stacked";
  /** Mono face, for ids, keys and fingerprints. */
  mono?: boolean;
  /** Exact text the copy control writes to the clipboard. Omit for no control. */
  copyable?: string;
  /** Supporting line under the row. */
  hint?: React.ReactNode;
  /** Lets a long value wrap instead of truncating to one line. */
  wrap?: boolean;
  className?: string;
  valueClassName?: string;
}

/** How long the control keeps reporting the copy before returning to rest. */
const COPIED_FEEDBACK_MS = 1800;

/**
 * Presentation UI component rendering one label/value line.
 */
export function DetailRow({
  label,
  value,
  icon: Icon,
  layout = "inline",
  mono = false,
  copyable,
  hint,
  wrap = false,
  className,
  valueClassName,
}: DetailRowProps) {
  const { t } = useI18n();
  const uid = React.useId();
  const [copied, setCopied] = React.useState(false);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const handleCopy = () => {
    navigator.clipboard
      .writeText(copyable ?? "")
      .then(() => {
        setCopied(true);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
      })
      .catch((error: unknown) => {
        // A blocked clipboard must not leave the control claiming success.
        appLogger.warn("DetailRow: clipboard write rejected", error);
      });
  };

  const stacked = layout === "stacked";

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn("flex gap-3", stacked ? "flex-col gap-1" : "items-baseline justify-between")}
      >
        <div className={cn("flex min-w-0 items-center gap-1.5", !stacked && "shrink-0")}>
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />}
          <span id={`${uid}-label`} className="min-w-0 truncate text-start text-xs text-nx-ink-3">
            {label}
          </span>
        </div>

        <div className={cn("flex min-w-0 items-center gap-1", !stacked && "justify-end")}>
          <span
            className={cn(
              "min-w-0 text-sm font-medium tabular-nums text-nx-ink",
              stacked ? "text-start" : "text-end",
              wrap ? "text-pretty break-words" : "truncate",
              mono && "font-mono",
              valueClassName
            )}
          >
            {value}
          </span>

          {copyable !== undefined && (
            <button
              type="button"
              onClick={handleCopy}
              aria-labelledby={`${uid}-copy ${uid}-label`}
              // Negative block margins keep the 32px hit target from stretching
              // the row's line box, the same trick StatCard's tooltip uses.
              className="-my-2 -me-1 inline-grid h-8 w-8 shrink-0 place-items-center rounded-nx-sm text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span id={`${uid}-copy`} className="sr-only">
                {t("common.copy")}
              </span>
            </button>
          )}
        </div>
      </div>

      {hint && <p className="mt-1 text-start text-xs leading-relaxed text-nx-ink-3">{hint}</p>}
    </div>
  );
}
