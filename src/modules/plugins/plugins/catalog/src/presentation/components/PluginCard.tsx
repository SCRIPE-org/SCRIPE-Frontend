"use client";

import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { Puzzle, CheckCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";

interface PluginCardProps {
  plugin: PluginCatalogItem;
  onInstall: () => void;
  isInstalling: boolean;
}

/**
 * Presentation UI component rendering the plugin card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PluginCard({ plugin, onInstall, isInstalling }: PluginCardProps) {
  const { t, language } = useI18n();
  const displayName = language === "ar" ? plugin.nameAr || plugin.name : plugin.name;
  const displayDesc =
    language === "ar" ? plugin.descriptionAr || plugin.description : plugin.description;
  // A plugin's own brand hue is data, not the workspace accent — it renders as
  // a solid fill, so the glyph needs the on-fill ink token, not the accent one.
  const hasBrandColor = plugin.colorHue != null;

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-nx-md border border-nx-line",
              hasBrandColor ? "text-nx-on-fill" : "bg-nx-raised text-nx-ink-3"
            )}
            style={
              hasBrandColor
                ? { background: `oklch(0.7 ${plugin.colorChroma ?? 0.2} ${plugin.colorHue})` }
                : undefined
            }
            aria-hidden="true"
          >
            <Puzzle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-nx-ink-3">{plugin.key}</p>
            <div className="mt-1 flex gap-1">
              <Badge variant="outline" className="px-1 py-0 text-xs">
                {plugin.isTier2 ? t("plugins.tier2") : t("plugins.tier1")}
              </Badge>
              {plugin.isInstalled && (
                <Badge variant="secondary" className="flex items-center gap-1 px-1 py-0 text-xs">
                  <CheckCircle className="h-3 w-3" aria-hidden="true" />
                  {t("plugins.cardInstalled")}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="line-clamp-2 text-xs text-nx-ink-3">{displayDesc}</p>
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
      </CardContent>
    </Card>
  );
}
