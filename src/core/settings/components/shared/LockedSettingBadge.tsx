"use client";

/**
 * LockedSettingBadge — Displays a lock icon with tooltip when a setting is
 * locked by the tenant admin (AllowAdminThemeOverride = false or setting not
 * in AllowedAdminSettingsJson whitelist).
 *
 * Usage:
 *   <LockedSettingBadge settingKey="colorTheme" />
 *
 * Renders nothing when the setting is NOT locked (admin can override).
 */

import { Lock } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface LockedSettingBadgeProps {
  /** The settings key to check lock status for */
  settingKey: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Show inline text alongside the icon */
  showLabel?: boolean;
}

export function LockedSettingBadge({ settingKey, className, showLabel = false }: LockedSettingBadgeProps) {
  const { overrideControl } = useSettings();
  const { t } = useI18n();

  if (!overrideControl.isSettingLocked(settingKey)) {
    return null;
  }

  const label = !overrideControl.allowAdminOverride
    ? t("customizer.dashboard.locked.allDisabled")
    : t("customizer.dashboard.locked.pathRestricted");

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-muted-foreground/60",
              className
            )}
          >
            <Lock className="h-3 w-3 shrink-0" />
            {showLabel && (
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {t("customizer.dashboard.locked.badge")}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * useSettingLock — Hook to check if a setting is locked and get the disabled state.
 *
 * Usage:
 *   const { isLocked, lockProps } = useSettingLock("colorTheme");
 *   <Select disabled={isLocked} {...lockProps} />
 */
export function useSettingLock(settingKey: string) {
  const { overrideControl } = useSettings();
  const isLocked = overrideControl.isSettingLocked(settingKey);

  return {
    isLocked,
    /** Spread onto interactive elements to disable them when locked */
    lockProps: isLocked
      ? { disabled: true, "aria-disabled": true as const, "data-locked": true as const }
      : {},
  };
}
