"use client";

/**
 * TenantDefaultIndicator — Shows whether a setting value is from the tenant
 * default (Layer 3) or an admin override (Layer 4).
 *
 * Displays a subtle indicator next to settings that have been overridden by
 * the admin, with a one-click reset to tenant default.
 *
 * Usage:
 *   <TenantDefaultIndicator settingKey="colorTheme" />
 */

import { RotateCcw } from "lucide-react";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { cn } from "@core/common/utils";

interface TenantDefaultIndicatorProps {
  /** The settings key to check */
  settingKey: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Reads Layer 3 (tenant defaults) and Layer 4 (admin overrides) from
 * localStorage to determine if the admin has overridden the tenant default.
 */
function getOverrideStatus(settingKey: string): {
  isOverridden: boolean;
  tenantDefault: unknown;
  adminValue: unknown;
} {
  if (typeof window === "undefined") {
    return { isOverridden: false, tenantDefault: undefined, adminValue: undefined };
  }

  try {
    const tenantRaw = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
    const adminRaw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);

    const tenantSettings = tenantRaw ? JSON.parse(tenantRaw) : {};
    const adminSettings = adminRaw ? JSON.parse(adminRaw) : {};

    const tenantDefault = tenantSettings[settingKey];
    const adminValue = adminSettings[settingKey];

    // The setting is overridden if it exists in admin settings AND differs from tenant default
    const isOverridden =
      adminValue !== undefined &&
      tenantDefault !== undefined &&
      JSON.stringify(adminValue) !== JSON.stringify(tenantDefault);

    return { isOverridden, tenantDefault, adminValue };
  } catch {
    return { isOverridden: false, tenantDefault: undefined, adminValue: undefined };
  }
}

export function TenantDefaultIndicator({
  settingKey,
  className,
}: TenantDefaultIndicatorProps) {
  const settings = useSettings();
  const { t } = useI18n();
  const { isOverridden } = getOverrideStatus(settingKey);

  // Don't show indicator if all overrides are locked
  if (!settings.overrideControl.allowAdminOverride) {
    return null;
  }

  if (!isOverridden) {
    return null;
  }

  const handleResetToDefault = () => {
    try {
      const adminRaw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
      if (!adminRaw) return;

      const adminSettings = JSON.parse(adminRaw);
      delete adminSettings[settingKey];
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(adminSettings));

      // Trigger re-merge so SettingsProvider picks up the change
      window.dispatchEvent(new Event("admin-settings-loaded"));
    } catch {
      /* ignore */
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            onClick={handleResetToDefault}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5",
              "text-[10px] font-medium text-amber-600 dark:text-amber-400",
              "bg-amber-50 dark:bg-amber-950/30",
              "hover:bg-amber-100 dark:hover:bg-amber-950/50",
              "transition-colors duration-150",
              className
            )}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            {t("customizer.dashboard.override.badge")}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-xs">
          {t("customizer.dashboard.override.resetHint")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
