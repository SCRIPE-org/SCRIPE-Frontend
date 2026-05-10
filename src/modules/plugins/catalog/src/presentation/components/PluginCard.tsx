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

export function PluginCard({ plugin, onInstall, isInstalling }: PluginCardProps) {
  const { t, language } = useI18n();
  const displayName = language === "ar" ? (plugin.nameAr || plugin.name) : plugin.name;
  const displayDesc = language === "ar" ? (plugin.descriptionAr || plugin.description) : plugin.description;

  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm gap-3">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted shrink-0"
          style={
            plugin.colorHue != null
              ? { background: `oklch(0.7 ${plugin.colorChroma ?? 0.2} ${plugin.colorHue})` }
              : undefined
          }
        >
          <Puzzle className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{plugin.key}</p>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs px-1 py-0">
              {plugin.isTier2 ? t("plugins.tier2") : t("plugins.tier1")}
            </Badge>
            {plugin.isInstalled && (
              <Badge variant="secondary" className="text-xs px-1 py-0 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {t("plugins.cardInstalled")}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{displayDesc}</p>
      <Button
        size="sm"
        className="w-full mt-auto"
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
