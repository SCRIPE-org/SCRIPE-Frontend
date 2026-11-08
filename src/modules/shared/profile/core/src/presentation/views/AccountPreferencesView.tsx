"use client";

/**
 * AccountPreferencesView
 *
 * Sovereign Slice 9 (/account/preferences):
 * Relay vNext Theme Mode, Club Accent Hue, Interface Density,
 * Broadcast/Projector Privacy Blur (Alt+P), Command Palette Hotkey Launchpad,
 * and Live ErgonomicsLiveStage preview.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import {
  useWorkstationPreferencesViewModel,
  type AccentHue,
  type UiDensity,
} from "../viewmodels/useWorkstationPreferencesViewModel";
import { useAccountPreferencesSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { ErgonomicsLiveStage } from "../components/ErgonomicsLiveStage";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  LayoutGrid,
  EyeOff,
  Keyboard,
  Check,
  CheckCircle2,
} from "lucide-react";

export function AccountPreferencesView() {
  const { t } = useI18n();
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    availableAccents,
    density,
    setDensity,
  } = useWorkstationPreferencesViewModel();

  const { preferences, updatePreferences, isUpdatingPreferences } =
    useAccountPreferencesSliceViewModel();

  const [privacyBlur, setPrivacyBlur] = useState(
    preferences?.broadcastPrivacyBlurDefault ?? false
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleTogglePrivacyBlur = async (checked: boolean) => {
    setPrivacyBlur(checked);
    if (typeof document !== "undefined") {
      document.documentElement.toggleAttribute("data-privacy-blur", checked);
    }
    await updatePreferences({ broadcastPrivacyBlurDefault: checked });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSaveWorkstation = async () => {
    await updatePreferences({
      themeMode: theme,
      clubAccentHue: accent,
      density,
      broadcastPrivacyBlurDefault: privacyBlur,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.preferences.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.preferences.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedNotice && (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.common.saved")}</span>
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            disabled={isUpdatingPreferences}
            onClick={handleSaveWorkstation}
            data-testid="save-preferences-btn"
            className="h-8 text-xs font-semibold"
          >
            {t("profile.common.saveChanges")}
          </Button>
        </div>
      </div>

      {/* 1. Zero-Flicker Live Ergonomics Stage */}
      <ErgonomicsLiveStage
        theme={theme}
        accentHue={accent}
        density={density}
        privacyBlur={privacyBlur}
      />

      {/* 2. Theme Mode & Club Accent Hue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.preferences.themeTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("profile.preferences.themeDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2.5">
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
                  onClick={() => setTheme(item.id)}
                  data-testid={`theme-mode-${item.id}`}
                  className="h-16 flex flex-col items-center justify-center gap-1.5 text-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(item.labelKey)}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.preferences.accentTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("profile.preferences.accentDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {availableAccents.map((item) => {
              const isSelected = accent === item.id;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAccent(item.id as AccentHue)}
                  data-testid={`accent-hue-${item.id}`}
                  className={`h-10 justify-between px-3 text-xs ${
                    isSelected ? "border-nx-accent bg-nx-accent-wash text-nx-ink font-bold" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-nx-accent shrink-0" />}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 3. UI Density & Broadcast Privacy Blur (Alt+P) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.preferences.densityTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("profile.preferences.densityDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {(["comfortable", "compact"] as UiDensity[]).map((mode) => (
              <Button
                key={mode}
                type="button"
                variant={density === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setDensity(mode)}
                data-testid={`density-${mode}`}
                className="h-9 text-xs font-semibold"
              >
                {mode === "comfortable"
                  ? t("profile.preferences.comfortableMode")
                  : t("profile.preferences.compactMode")}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-sm font-bold text-nx-ink">
                  {t("profile.preferences.privacyBlurTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-nx-ink-3 mt-1">
                {t("profile.preferences.privacyBlurDesc")}
              </CardDescription>
            </div>
            <Switch
              checked={privacyBlur}
              onCheckedChange={handleTogglePrivacyBlur}
              aria-label={t("profile.preferences.privacyBlurTitle")}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="font-mono text-[10px] border-nx-line bg-nx-raised text-nx-ink-2 gap-1.5">
              <Keyboard className="h-3 w-3 text-nx-accent" />
              <span>Alt + P &bull; ⌘K {t("profile.preferences.commandPaletteReady")}</span>
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
