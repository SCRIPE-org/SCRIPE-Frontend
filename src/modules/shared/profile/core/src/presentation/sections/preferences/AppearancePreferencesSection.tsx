"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import type { AccentHue } from "../../viewmodels/useWorkstationPreferencesViewModel";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";

/**
 * Accent hue option descriptor provided by useWorkstationPreferencesViewModel.
 */
export interface AccentOptionDescriptor {
  id: string;
  hex: string;
  labelKey: string;
}

/**
 * Props for AppearancePreferencesSection.
 */
export interface AppearancePreferencesSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  theme: string;
  accent: string;
  availableAccents: AccentOptionDescriptor[];
  onThemeChange: (theme: string) => void;
  onAccentChange: (accent: AccentHue) => void;
}

/**
 * Theme mode (light/dark/system) and brand accent hue selector cards.
 */
export function AppearancePreferencesSection({
  t,
  theme,
  accent,
  availableAccents,
  onThemeChange,
  onAccentChange,
}: AppearancePreferencesSectionProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-w-0">
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-nx-accent shrink-0" />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.preferences.themeTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.preferences.themeDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 sm:gap-2.5 min-w-0">
          {[
            { id: "light", icon: Sun, labelKey: "profile.preferences.themeLight" },
            { id: "dark", icon: Moon, labelKey: "profile.preferences.themeDark" },
            { id: "system", icon: Monitor, labelKey: "profile.preferences.themeSystem" },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onThemeChange(item.id)}
                data-testid={`theme-mode-${item.id}`}
                className="h-16 min-w-0 px-2 flex flex-col items-center justify-center gap-1.5 text-xs overflow-hidden"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-full">{t(item.labelKey)}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-nx-accent shrink-0" />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.preferences.accentTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.preferences.accentDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
          {availableAccents.map((item) => {
            const isSelected = accent === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAccentChange(item.id as AccentHue)}
                data-testid={`accent-hue-${item.id}`}
                className={`h-10 min-w-0 justify-between px-3 text-xs ${
                  isSelected ? "border-nx-accent bg-nx-accent-wash text-nx-ink font-bold" : ""
                }`}
              >
                <span className="flex items-center gap-2 min-w-0 flex-1 truncate">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="truncate">{t(item.labelKey)}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-nx-accent shrink-0" />}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
