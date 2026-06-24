"use client";

import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";

interface PluginHealthBadgeProps {
  passing: boolean;
  lastCheckedAt?: Date | null;
  className?: string;
}

/**
 * Presentation UI component rendering the plugin health badge.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PluginHealthBadge({ passing, lastCheckedAt, className }: PluginHealthBadgeProps) {
  const { t } = useI18n();
  const label = passing ? t("plugins.healthy") : t("plugins.unhealthy");
  const Icon = passing ? CheckCircle : XCircle;
  const color = passing ? "text-green-500" : "text-destructive";

  const lastChecked = lastCheckedAt
    ? t("plugins.lastChecked", { time: lastCheckedAt.toLocaleString() })
    : t("plugins.healthUnknown");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
            <Icon className={`h-4 w-4 ${color}`} />
            <span className={`text-xs font-medium ${color}`}>{label}</span>
            {lastCheckedAt && <Clock className="h-3 w-3 text-muted-foreground" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{lastChecked}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
