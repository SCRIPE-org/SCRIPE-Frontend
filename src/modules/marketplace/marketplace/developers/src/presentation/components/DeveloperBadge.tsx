"use client";

import { Badge } from "@core/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface DeveloperBadgeProps {
  /** Display name for the developer. */
  displayName: string;
  /** Whether the developer account is verified by SCRIPE marketplace admins. */
  isVerified: boolean;
  /** Number of published apps for this developer. */
  appCount?: number;
  /** Optional CSS class override. */
  className?: string;
}

/**
 * DeveloperBadge (Phase 5.4)
 *
 * Compact visual badge for a developer profile.
 * Shows:
 *   - Display name
 *   - Verified checkmark (with tooltip) if isVerified
 *   - App count pill (if provided)
 *
 * Pure presentational — no data fetching.
 */
export function DeveloperBadge({
  displayName,
  isVerified,
  appCount,
  className = "",
}: DeveloperBadgeProps) {
  const { t } = useI18n();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Developer name */}
      <span className="truncate text-sm font-medium text-nx-ink">{displayName}</span>

      {/* Verified badge */}
      {isVerified && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex cursor-default items-center gap-0.5 text-xs font-medium text-info"
                aria-label={t("marketplace.developersVerifiedAriaLabel")}
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
                {t("marketplace.developersVerifiedTooltip")}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* App count */}
      {appCount !== undefined && appCount > 0 && (
        <Badge variant="secondary" className="h-4 px-1.5 py-0 text-xs">
          {t("marketplace.developersAppsCount", { count: appCount })}
        </Badge>
      )}
    </div>
  );
}
