"use client";

/**
 * SectionInfoPopover
 *
 * Accessible `(i)` contextual help popover for specialized security, compliance,
 * and workstation cards across the SCRIPE Account Console.
 * Uses @core/ui/popover & @core/ui/button with 3-part localized structure:
 *   1. What it does
 *   2. When to use it
 *   3. Security & Audit impact
 */
import * as React from "react";
import { Info, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { cn } from "@core/common/utils";

/** Props for {@link SectionInfoPopover}. */
export interface SectionInfoPopoverProps {
  /** i18n prefix resolving `.title`, `.whatItDoes`, `.whenToUse`, `.securityImpact`. */
  i18nPrefix?: string;
  /** Optional direct title override when not using i18nPrefix. */
  title?: string;
  /** Optional direct description override: what this capability does. */
  whatItDoes?: string;
  /** Optional direct description override: when operators should use it. */
  whenToUse?: string;
  /** Optional direct description override: security & SOC2 audit implications. */
  securityImpact?: string;
  /** Popover alignment relative to the `(i)` trigger. */
  align?: "start" | "center" | "end";
  /** Popover side placement. */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional test identifier for Playwright / Vitest selection. */
  testId?: string;
  /** Optional trigger className override. */
  className?: string;
}

/** Accessible `(i)` contextual help popover for security, compliance, and workstation sections. */
export function SectionInfoPopover({
  i18nPrefix,
  title,
  whatItDoes,
  whenToUse,
  securityImpact,
  align = "end",
  side = "bottom",
  testId,
  className,
}: SectionInfoPopoverProps) {
  const { t } = useI18n();

  const resolvedTitle = title ?? (i18nPrefix ? t(`${i18nPrefix}.title`) : "");
  const resolvedWhat = whatItDoes ?? (i18nPrefix ? t(`${i18nPrefix}.whatItDoes`) : "");
  const resolvedWhen = whenToUse ?? (i18nPrefix ? t(`${i18nPrefix}.whenToUse`) : "");
  const resolvedImpact = securityImpact ?? (i18nPrefix ? t(`${i18nPrefix}.securityImpact`) : "");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-testid={testId}
          aria-label={t("profile.infoPopover.triggerAria", { section: resolvedTitle })}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "h-6 w-6 rounded-full text-nx-ink-3 hover:text-nx-accent hover:bg-nx-raised shrink-0",
            className
          )}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        className="w-80 sm:w-96 p-4 space-y-3 text-xs border-nx-line bg-nx-popover text-nx-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 pb-2 border-b border-nx-line">
          <div className="h-6 w-6 rounded-nx-sm bg-nx-accent-wash border border-nx-accent/30 flex items-center justify-center text-nx-accent shrink-0">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-nx-ink leading-tight">{resolvedTitle}</span>
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-nx-ink">
              <Sparkles className="h-3 w-3 text-nx-accent shrink-0" aria-hidden="true" />
              <span>{t("profile.infoPopover.whatItDoesLabel")}</span>
            </div>
            <p className="text-[11px] text-nx-ink-2 leading-relaxed">{resolvedWhat}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-nx-ink">
              <Clock className="h-3 w-3 text-info shrink-0" aria-hidden="true" />
              <span>{t("profile.infoPopover.whenToUseLabel")}</span>
            </div>
            <p className="text-[11px] text-nx-ink-2 leading-relaxed">{resolvedWhen}</p>
          </div>

          <div className="space-y-1 rounded-nx-sm border border-nx-line bg-nx-ground p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-nx-ink">
              <ShieldCheck className="h-3 w-3 text-success shrink-0" aria-hidden="true" />
              <span>{t("profile.infoPopover.securityImpactLabel")}</span>
            </div>
            <p className="text-[11px] text-nx-ink-2 leading-relaxed">{resolvedImpact}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
