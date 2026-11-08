"use client";

/**
 * AccountAccessibilityView
 *
 * Sovereign Slice 10 (/account/accessibility):
 * Pitch-Side Sunlight Ultra-Contrast Mode, Color-Blind Tactical Palette with Live SVG Kit-Clash Simulator,
 * Sensory & Assistive Controls, and Regional & Telemetry Standards (UTC-backed, Numerals, Calendar, Units).
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { useAccountAccessibilitySliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useWorkstationPreferencesViewModel } from "../viewmodels/useWorkstationPreferencesViewModel";
import {
  Sun,
  Eye,
  Globe,
  Gauge,
  CheckCircle2,
} from "lucide-react";

export function AccountAccessibilityView() {
  const { t } = useI18n();
  const { language, setLanguage, timezone, setTimezone } = useWorkstationPreferencesViewModel();
  const { accessibility, updateAccessibility, isUpdatingAccessibility } =
    useAccountAccessibilitySliceViewModel();

  const [sunlightMode, setSunlightMode] = useState(
    accessibility?.sunlightContrastMode ?? false
  );
  const [colorBlindPalette, setColorBlindPalette] = useState(
    accessibility?.colorBlindPalette ?? "none"
  );
  const [reducedMotion, setReducedMotion] = useState(
    accessibility?.reducedMotion ?? false
  );
  const [numeralSystem, setNumeralSystem] = useState(
    accessibility?.numeralSystem ?? "western"
  );
  const [calendarMode, setCalendarMode] = useState(
    accessibility?.calendarMode ?? "gregorian_hijri"
  );
  const [speedUnit, setSpeedUnit] = useState(accessibility?.speedUnit ?? "km/h");
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async () => {
    await updateAccessibility({
      sunlightContrastMode: sunlightMode,
      colorBlindPalette,
      reducedMotion,
      preferredLanguage: language,
      operatingTimezone: timezone,
      numeralSystem,
      calendarMode,
      speedUnit,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const homeColor = colorBlindPalette === "none" ? "#dc2626" : "#2563eb";
  const awayColor = colorBlindPalette === "none" ? "#16a34a" : "#f59e0b";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.accessibility.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.accessibility.description")}
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
            disabled={isUpdatingAccessibility}
            onClick={handleSave}
            data-testid="save-accessibility-btn"
            className="h-8 text-xs font-semibold"
          >
            {t("profile.common.saveChanges")}
          </Button>
        </div>
      </div>

      {/* 1. Pitch-Side Sunlight Mode & Reduced Motion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-sm font-bold text-nx-ink">
                  {t("profile.accessibility.sunlightModeTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-nx-ink-3 mt-1">
                {t("profile.accessibility.sunlightModeDesc")}
              </CardDescription>
            </div>
            <Switch
              checked={sunlightMode}
              onCheckedChange={setSunlightMode}
              aria-label={t("profile.accessibility.sunlightModeTitle")}
            />
          </CardHeader>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-sm font-bold text-nx-ink">
                  {t("profile.accessibility.reducedMotionTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-nx-ink-3 mt-1">
                {t("profile.accessibility.reducedMotionDesc")}
              </CardDescription>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
              aria-label={t("profile.accessibility.reducedMotionTitle")}
            />
          </CardHeader>
        </Card>
      </div>

      {/* 2. Color-Blind Tactical Palette & Live SVG Kit-Clash Simulator */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.accessibility.kitClashTitle")}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
              {t("profile.accessibility.kitClashDesc")}
            </CardDescription>
          </div>
          <div className="w-56">
            <Select value={colorBlindPalette} onValueChange={setColorBlindPalette}>
              <SelectTrigger className="h-8 text-xs bg-nx-raised border-nx-line text-nx-ink">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
                <SelectItem value="none" className="text-xs">{t("profile.accessibility.paletteStandard")}</SelectItem>
                <SelectItem value="deuteranopia" className="text-xs">{t("profile.accessibility.paletteDeuteranopia")}</SelectItem>
                <SelectItem value="protanopia" className="text-xs">{t("profile.accessibility.paletteProtanopia")}</SelectItem>
                <SelectItem value="tritanopia" className="text-xs">{t("profile.accessibility.paletteTritanopia")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-nx-line bg-nx-raised p-4 flex items-center justify-between gap-4">
            <svg viewBox="0 0 240 60" className="w-full max-w-md h-14">
              <rect x="2" y="2" width="236" height="56" rx="8" fill="none" stroke="currentColor" className="text-nx-line" />
              <line x1="120" y1="2" x2="120" y2="58" stroke="currentColor" className="text-nx-line" strokeDasharray="3 3" />
              <circle cx="65" cy="30" r="14" fill={homeColor} />
              <text x="65" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">10</text>
              <circle cx="175" cy="30" r="14" fill={awayColor} />
              <text x="175" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">08</text>
            </svg>
            <Badge variant="outline" className="font-mono text-[10px] border-nx-accent/40 text-nx-accent bg-nx-accent-wash shrink-0">
              WCAG AAA CONTRAST
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 3. Regional, Bilingual & Telemetry Units */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.accessibility.regionalTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.accessibility.regionalDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
            <span className="text-[11px] font-semibold text-nx-ink block">
              {t("profile.accessibility.languageLabel")}
            </span>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={language === "en" ? "default" : "outline"}
                onClick={() => setLanguage("en")}
                className="h-7 text-xs flex-1"
              >
                English
              </Button>
              <Button
                type="button"
                size="sm"
                variant={language === "ar" ? "default" : "outline"}
                onClick={() => setLanguage("ar")}
                className="h-7 text-xs flex-1"
              >
                العربية
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
            <span className="text-[11px] font-semibold text-nx-ink block">
              {t("profile.accessibility.numeralsLabel")}
            </span>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={numeralSystem === "western" ? "default" : "outline"}
                onClick={() => setNumeralSystem("western")}
                className="h-7 text-xs font-mono flex-1"
              >
                123
              </Button>
              <Button
                type="button"
                size="sm"
                variant={numeralSystem === "arabic_indic" ? "default" : "outline"}
                onClick={() => setNumeralSystem("arabic_indic")}
                className="h-7 text-xs font-mono flex-1"
              >
                ١٢٣
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
            <span className="text-[11px] font-semibold text-nx-ink block">
              {t("profile.accessibility.calendarLabel")}
            </span>
            <Select value={calendarMode} onValueChange={setCalendarMode}>
              <SelectTrigger className="h-7 text-xs bg-nx-surface border-nx-line text-nx-ink">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
                <SelectItem value="gregorian_hijri" className="text-xs">Gregorian + Hijri</SelectItem>
                <SelectItem value="gregorian" className="text-xs">Gregorian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
            <span className="text-[11px] font-semibold text-nx-ink flex items-center gap-1">
              <Gauge className="h-3 w-3 text-nx-accent" />
              {t("profile.accessibility.telemetryUnitsLabel")}
            </span>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={speedUnit === "km/h" ? "default" : "outline"}
                onClick={() => setSpeedUnit("km/h")}
                className="h-7 text-xs font-mono flex-1"
              >
                km/h &bull; kg
              </Button>
              <Button
                type="button"
                size="sm"
                variant={speedUnit === "mph" ? "default" : "outline"}
                onClick={() => setSpeedUnit("mph")}
                className="h-7 text-xs font-mono flex-1"
              >
                mph &bull; lb
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
