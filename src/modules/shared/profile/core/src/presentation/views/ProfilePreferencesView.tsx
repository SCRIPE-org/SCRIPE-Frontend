"use client";

/**
 * ProfilePreferencesView — Workstation Preferences & Ergonomics view.
 * Configures Relay vNext Theme Mode, Club Accent Hue swatches, UI Density,
 * Bilingual Direction (English LTR / Arabic RTL), and Timezone.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { cn } from "@core/common/utils";
import { useWorkstationPreferencesViewModel } from "../viewmodels/useWorkstationPreferencesViewModel";
import { Sliders, Sun, Moon, Laptop, Palette, Maximize2, Minimize2, Languages, Check } from "lucide-react";

/**
 * Renders user workstation preferences for theme, accent color, interface density, language, and timezone.
 */
export function ProfilePreferencesView() {
  const { t } = useI18n();
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    availableAccents,
    density,
    setDensity,
    language,
    setLanguage,
    timezone,
    setTimezone,
  } = useWorkstationPreferencesViewModel();

  const themeOptions = [
    { id: "dark", label: t("profile.prefs.themeDark"), icon: Moon },
    { id: "light", label: t("profile.prefs.themeLight"), icon: Sun },
    { id: "system", label: t("profile.prefs.themeSystem"), icon: Laptop },
  ];

  const densityOptions = [
    {
      id: "comfortable",
      label: t("profile.prefs.densityComfortable"),
      desc: t("profile.prefs.densityComfortableDesc"),
      icon: Maximize2,
    },
    {
      id: "compact",
      label: t("profile.prefs.densityCompact"),
      desc: t("profile.prefs.densityCompactDesc"),
      icon: Minimize2,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.prefs.title")}</h1>
        <p className="text-xs text-nx-ink-3 mt-1">{t("profile.prefs.description")}</p>
      </div>

      {/* 1. Relay vNext Theme Mode */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.prefs.themeModeTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">{t("profile.prefs.themeModeDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <Button
                  key={opt.id}
                  type="button"
                  variant="outline"
                  onClick={() => setTheme(opt.id)}
                  className={cn(
                    "whitespace-normal h-auto p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer text-center",
                    isSelected
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                      : "border-nx-line bg-nx-raised hover:border-nx-line-hi text-nx-ink-2 hover:text-nx-ink"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" style={{ minWidth: 20, minHeight: 20 }} />
                  <span className="text-xs break-words">{opt.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Club Accent Hue Swatches */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.prefs.accentHueTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">{t("profile.prefs.accentHueDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableAccents.map((acc) => {
              const isSelected = accent === acc.id;
              return (
                <Button
                  key={acc.id}
                  type="button"
                  variant="outline"
                  onClick={() => setAccent(acc.id)}
                  className={cn(
                    "whitespace-normal h-auto p-3 rounded-xl border flex items-center justify-start gap-2.5 transition-all cursor-pointer text-start",
                    isSelected
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                      : "border-nx-line bg-nx-raised hover:border-nx-line-hi text-nx-ink-2 hover:text-nx-ink"
                  )}
                >
                  <div
                    className="h-5 w-5 rounded-full shrink-0 flex items-center justify-center border border-white/20"
                    style={{ backgroundColor: acc.hex }}
                  >
                    {isSelected && <Check className="h-3 w-3 text-black stroke-[3]" />}
                  </div>
                  <span className="text-xs min-w-0 flex-1 break-words">{acc.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Interface Density */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.prefs.densityTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">{t("profile.prefs.densityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {densityOptions.map((d) => {
              const Icon = d.icon;
              const isSelected = density === d.id;
              return (
                <Button
                  key={d.id}
                  type="button"
                  variant="outline"
                  onClick={() => setDensity(d.id as "comfortable" | "compact")}
                  className={cn(
                    "whitespace-normal h-auto p-3.5 rounded-xl border flex items-start justify-start gap-3 transition-all cursor-pointer text-start",
                    isSelected
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                      : "border-nx-line bg-nx-raised hover:border-nx-line-hi text-nx-ink-2 hover:text-nx-ink"
                  )}
                >
                  <div className="p-2 rounded-lg bg-nx-surface border border-nx-line shrink-0">
                    <Icon className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                  </div>
                  <div className="min-w-0 flex-1 break-words whitespace-normal">
                    <div className="text-xs font-bold text-nx-ink leading-snug break-words">{d.label}</div>
                    <div className="text-[11px] text-nx-ink-3 mt-0.5 leading-relaxed break-words whitespace-normal">
                      {d.desc}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Language & Timezone */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.prefs.localizationTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">{t("profile.prefs.localizationDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("profile.prefs.languageLabel")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "text-xs font-semibold transition-all",
                    language === "en"
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-bold"
                      : "border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-line-hi"
                  )}
                >
                  English (LTR)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage("ar")}
                  className={cn(
                    "text-xs font-semibold font-arabic transition-all",
                    language === "ar"
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-bold"
                      : "border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink hover:border-nx-line-hi"
                  )}
                >
                  العربية (RTL)
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">{t("profile.prefs.timezoneLabel")}</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full text-xs h-9 bg-nx-raised border-nx-line text-nx-ink">
                  <SelectValue placeholder={t("profile.prefs.selectTimezone")} />
                </SelectTrigger>
                <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
                  <SelectItem value="Africa/Cairo" className="text-xs hover:bg-nx-raised">
                    Africa/Cairo (UTC+2)
                  </SelectItem>
                  <SelectItem value="Asia/Riyadh" className="text-xs hover:bg-nx-raised">
                    Asia/Riyadh (UTC+3)
                  </SelectItem>
                  <SelectItem value="Asia/Dubai" className="text-xs hover:bg-nx-raised">
                    Asia/Dubai (UTC+4)
                  </SelectItem>
                  <SelectItem value="Europe/London" className="text-xs hover:bg-nx-raised">
                    Europe/London (UTC+0)
                  </SelectItem>
                  <SelectItem value="America/New_York" className="text-xs hover:bg-nx-raised">
                    America/New_York (UTC-5)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
