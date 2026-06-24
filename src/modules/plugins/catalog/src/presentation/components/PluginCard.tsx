"use client";

import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Puzzle, CheckCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";

interface PluginCardProps {
  plugin: PluginCatalogItem;
  onInstall: () => void;
  isInstalling: boolean;
}

/**
 * React presentation component representing the plugin card UI element.
 */
export function PluginCard({ plugin, onInstall, isInstalling }: PluginCardProps) {
  const { t, language } = useI18n();
  const displayName = language === "ar" ? plugin.nameAr || plugin.name : plugin.name;
  const displayDesc =
    language === "ar" ? plugin.descriptionAr || plugin.description : plugin.description;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted"
          style={
            plugin.colorHue != null
              ? { background: `oklch(0.7 ${plugin.colorChroma ?? 0.2} ${plugin.colorHue})` }
              : undefined
          }
        >
          <Puzzle className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{plugin.key}</p>
          <div className="mt-1 flex gap-1">
            <Badge variant="outline" className="px-1 py-0 text-xs">
              {plugin.isTier2 ? t("plugins.tier2") : t("plugins.tier1")}
            </Badge>
            {plugin.isInstalled && (
              <Badge variant="secondary" className="flex items-center gap-1 px-1 py-0 text-xs">
                <CheckCircle className="h-3 w-3" />
                {t("plugins.cardInstalled")}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{displayDesc}</p>
      <Button
        size="sm"
        className="mt-auto w-full"
        disabled={plugin.isInstalled || isInstalling}
        onClick={onInstall}
      >
        {plugin.isInstalled
          ? t("plugins.cardInstalled")
          : isInstalling
            ? t("plugins.cardInstalling")
            : t("plugins.cardInstall")}
      </Button>
    </div>
  );
}
