"use client";

import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { PluginInstallation } from "../../domain/entities/PluginInstallation";

interface PluginStatusBadgeProps {
  installation: PluginInstallation;
}

export function PluginStatusBadge({ installation }: PluginStatusBadgeProps) {
  const { t } = useI18n();
  if (installation.isActive) return <Badge variant="default">{t("plugins.statusActive")}</Badge>;
  if (installation.isDisabled)
    return <Badge variant="secondary">{t("plugins.statusDisabled")}</Badge>;
  return <Badge variant="outline">{t("plugins.statusUnknown")}</Badge>;
}
