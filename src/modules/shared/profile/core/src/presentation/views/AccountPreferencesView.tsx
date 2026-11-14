"use client";

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
  type ToastPosition,
} from "../viewmodels/useWorkstationPreferencesViewModel";
import { useAccountPreferencesSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { ErgonomicsLiveStage } from "../components/ErgonomicsLiveStage";
import { toast, resolveRtlPosition, type SileoPosition } from "@core/ui/sileo-toast";
import {
  Sun, Moon, Monitor, Palette, LayoutGrid, EyeOff, Keyboard, Check, CheckCircle2, Globe, Clock, Hash, Bell, Play,
} from "lucide-react";

export function AccountPreferencesView() {
  const { t, language, setLanguage, direction } = useI18n();
  const isRtl = direction === "rtl";
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    availableAccents,
    density,
    setDensity,
    toastPosition,
    setToastPosition,
  } = useWorkstationPreferencesViewModel();
  const { preferences, updatePreferences, isUpdatingPreferences } =
    useAccountPreferencesSliceViewModel();

  const [privacyBlur, setPrivacyBlur] = useState(preferences?.broadcastPrivacyBlurDefault ?? false);
  const [numeralSystem, setNumeralSystem] = useState(preferences?.numeralSystem ?? "latn");
  const [operatingTimezone, setOperatingTimezone] = useState(preferences?.operatingTimezone ?? "Africa/Cairo");
  const [reducedMotion, setReducedMotion] = useState(preferences?.reducedMotionEnabled ?? false);
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
      numeralSystem,
      operatingTimezone,
      languageCode: language,
      reducedMotionEnabled: reducedMotion,
      toastPosition,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const currentLogicalPosition: "top-end" | "top-center" | "bottom-end" | "bottom-center" = (() => {
    const p = (toastPosition || "top-end").toLowerCase().trim();
    if (p === "top-center") return "top-center";
    if (p === "bottom-center") return "bottom-center";
    if (p === "bottom-end" || p === "bottom-right" || p === "bottom-left" || p === "bottom-start") return "bottom-end";
    return "top-end";
  })();

  const currentScreenPosition: SileoPosition = resolveRtlPosition(
    currentLogicalPosition,
    isRtl ? "rtl" : "ltr",
    true
  );

  const handleSelectLogicalPosition = (posId: "top-end" | "top-center" | "bottom-end" | "bottom-center") => {
    setToastPosition(posId);
    const screenPos = resolveRtlPosition(posId, isRtl ? "rtl" : "ltr", true);
    handleTriggerSmartTestToast(screenPos);
  };

  const handleTriggerSmartTestToast = (targetScreenPos?: SileoPosition) => {
    const pos = targetScreenPos ?? currentScreenPosition;
    toast.rich({
      position: pos,
      title: t("profile.preferences.testToastTitle"),
      description: (
        <div className="space-y-1">
          <p>{t("profile.preferences.testToastDesc")}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-2 font-mono">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-nx-accent" />
            <span>{t("profile.preferences.testToastRichTag")}</span>
            <span>&bull;</span>
            <span className="font-semibold">{pos}</span>
            <span>&bull;</span>
            <span>
              {isRtl ? t("profile.preferences.directionRtl") : t("profile.preferences.directionLtr")}
            </span>
          </div>
        </div>
      ),
      button: {
        title: t("profile.preferences.testToastAction"),
        onClick: () => {
          toast.success(t("profile.preferences.testToastActionDone"));
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.preferences.title")}</h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.preferences.description")}</p>
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

      <ErgonomicsLiveStage theme={theme} accentHue={accent} density={density} privacyBlur={privacyBlur} />

      {/* Theme Mode & Brand Accent Hue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.preferences.themeTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">{t("profile.preferences.themeDesc")}</CardDescription>
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
                <Button key={item.id} type="button" variant={isSelected ? "default" : "outline"} size="sm" onClick={() => setTheme(item.id)} data-testid={`theme-mode-${item.id}`} className="h-16 flex flex-col items-center justify-center gap-1.5 text-xs">
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
              <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.preferences.accentTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">{t("profile.preferences.accentDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {availableAccents.map((item) => {
              const isSelected = accent === item.id;
              return (
                <Button key={item.id} type="button" variant="outline" size="sm" onClick={() => setAccent(item.id as AccentHue)} data-testid={`accent-hue-${item.id}`} className={`h-10 justify-between px-3 text-xs ${isSelected ? "border-nx-accent bg-nx-accent-wash text-nx-ink font-bold" : ""}`}>
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.hex }} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-nx-accent shrink-0" />}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* UI Density & Broadcast Privacy Blur (Alt+P) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.preferences.densityTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">{t("profile.preferences.densityDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {(["comfortable", "compact"] as UiDensity[]).map((mode) => (
              <Button key={mode} type="button" variant={density === mode ? "default" : "outline"} size="sm" onClick={() => setDensity(mode)} data-testid={`density-${mode}`} className="h-9 text-xs font-semibold">
                {mode === "comfortable" ? t("profile.preferences.comfortableMode") : t("profile.preferences.compactMode")}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.preferences.privacyBlurTitle")}</CardTitle>
              </div>
              <CardDescription className="text-xs text-nx-ink-3 mt-1">{t("profile.preferences.privacyBlurDesc")}</CardDescription>
            </div>
            <Switch checked={privacyBlur} onCheckedChange={handleTogglePrivacyBlur} aria-label={t("profile.preferences.privacyBlurTitle")} />
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="font-mono text-[10px] border-nx-line bg-nx-raised text-nx-ink-2 gap-1.5">
              <Keyboard className="h-3 w-3 text-nx-accent" />
              <span>Alt + P &bull; ⌘K {t("profile.preferences.commandPaletteReady")}</span>
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Toast Viewport & Smart Notification Position */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-sm font-bold text-nx-ink">
                  {t("profile.preferences.toastPositionTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-nx-ink-3 mt-1">
                {t("profile.preferences.toastPositionDesc")}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              data-testid="toast-mirror-badge"
              className="text-[11px] font-medium border-nx-line bg-nx-raised text-nx-ink-2 self-start sm:self-auto"
            >
              {isRtl
                ? t("profile.preferences.toastMirrorBadgeRtl")
                : t("profile.preferences.toastMirrorBadgeLtr")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 2x2 Interactive Mini-Viewport Grid */}
          <div className="p-3 rounded-lg border border-nx-line bg-nx-ground/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: "top-end" as const,
                  labelKey: "profile.preferences.toastPositionTopEnd",
                  subKey: "profile.preferences.toastPositionTopEndSub",
                },
                {
                  id: "top-center" as const,
                  labelKey: "profile.preferences.toastPositionTopCenter",
                  subKey: "profile.preferences.toastPositionTopCenterSub",
                },
                {
                  id: "bottom-end" as const,
                  labelKey: "profile.preferences.toastPositionBottomEnd",
                  subKey: "profile.preferences.toastPositionBottomEndSub",
                },
                {
                  id: "bottom-center" as const,
                  labelKey: "profile.preferences.toastPositionBottomCenter",
                  subKey: "profile.preferences.toastPositionBottomCenterSub",
                },
              ].map((pos) => {
                const isSelected = currentLogicalPosition === pos.id;
                return (
                  <Button
                    key={pos.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectLogicalPosition(pos.id)}
                    data-testid={`toast-position-${pos.id}`}
                    className={`h-14 flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                      isSelected
                        ? "border-nx-accent bg-nx-accent text-nx-on-fill font-bold shadow-xs"
                        : "bg-nx-surface hover:bg-nx-hover text-nx-ink"
                    }`}
                  >
                    <span>{t(pos.labelKey)}</span>
                    <span
                      className={`text-[10px] truncate max-w-full px-1 ${
                        isSelected ? "text-nx-on-fill opacity-90 font-medium" : "text-nx-ink-3"
                      }`}
                    >
                      {t(pos.subKey)}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Trigger Smart Test Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-nx-ink-3">
              {t("profile.preferences.triggerSmartTestDesc")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTriggerSmartTestToast()}
              data-testid="trigger-smart-test-toast-btn"
              className="gap-1.5 text-xs font-semibold border-nx-line-hi bg-nx-raised hover:bg-nx-hover shrink-0 self-start sm:self-auto"
            >
              <Play className="h-3.5 w-3.5 text-nx-accent" />
              <span>{t("profile.preferences.triggerSmartTest")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regional & Localization Formatting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.preferences.languageTitle")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {(["en", "ar"] as const).map((lang) => (
              <Button key={lang} type="button" variant={language === lang ? "default" : "outline"} size="sm" onClick={() => setLanguage(lang)} data-testid={`language-${lang}`} className="h-9 text-xs font-semibold">
                {lang === "en" ? t("profile.preferences.langEnglish") : t("profile.preferences.langArabic")}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.preferences.numeralSystemTitle")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {(["latn", "arab"] as const).map((sys) => (
              <Button key={sys} type="button" variant={numeralSystem === sys ? "default" : "outline"} size="sm" onClick={() => setNumeralSystem(sys)} data-testid={`numeral-${sys}`} className="h-9 text-xs font-mono">
                {sys === "latn"
                  ? t("profile.preferences.numeralLatn")
                  : t("profile.preferences.numeralArab")}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.preferences.timezoneTitle")}</CardTitle>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} aria-label={t("profile.preferences.reducedMotionLabel")} />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {["Africa/Cairo", "UTC"].map((tz) => (
              <Button key={tz} type="button" variant={operatingTimezone === tz ? "default" : "outline"} size="sm" onClick={() => setOperatingTimezone(tz)} data-testid={`timezone-${tz}`} className="h-9 text-xs font-mono">
                {tz}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
