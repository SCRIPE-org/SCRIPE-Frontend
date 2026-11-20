"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { SectionInfoPopover } from "../../components/SectionInfoPopover";
import type { UiDensity } from "../../viewmodels/useWorkstationPreferencesViewModel";
import { EyeOff, Keyboard, LayoutGrid } from "lucide-react";

/**
 * Props for DensityPrivacyPreferencesSection.
 */
export interface DensityPrivacyPreferencesSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  density: UiDensity;
  privacyBlur: boolean;
  onDensityChange: (mode: UiDensity) => void;
  onPrivacyBlurChange: (enabled: boolean) => void;
}

/**
 * UI spacing density and broadcast privacy blur (Alt+P) toggle cards.
 */
export function DensityPrivacyPreferencesSection({
  t,
  density,
  privacyBlur,
  onDensityChange,
  onPrivacyBlurChange,
}: DensityPrivacyPreferencesSectionProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-w-0">
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-nx-accent shrink-0" />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.preferences.densityTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.preferences.densityDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
          {(["comfortable", "compact"] as UiDensity[]).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={density === mode ? "default" : "outline"}
              size="sm"
              onClick={() => onDensityChange(mode)}
              data-testid={`density-${mode}`}
              className="h-9 min-w-0 px-2.5 text-xs font-semibold"
            >
              <span className="truncate">
                {mode === "comfortable"
                  ? t("profile.preferences.comfortableMode")
                  : t("profile.preferences.compactMode")}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <EyeOff className="h-4 w-4 text-nx-accent shrink-0" />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.preferences.privacyBlurTitle")}
              </CardTitle>
              <SectionInfoPopover i18nPrefix="profile.infoPopover.privacyBlur" />
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.preferences.privacyBlurDesc")}
            </CardDescription>
          </div>
          <Switch
            checked={privacyBlur}
            onCheckedChange={onPrivacyBlurChange}
            aria-label={t("profile.preferences.privacyBlurTitle")}
            className="shrink-0"
          />
        </CardHeader>
        <CardContent className="pt-0 min-w-0">
          <Badge
            variant="outline"
            className="font-mono text-[10px] border-nx-line bg-nx-raised text-nx-ink-2 gap-1.5 max-w-full whitespace-normal text-start"
          >
            <Keyboard className="h-3 w-3 text-nx-accent shrink-0" />
            <span>Alt + P &bull; &#8984;K {t("profile.preferences.commandPaletteReady")}</span>
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
