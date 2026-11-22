"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import { TimezonePicker } from "@core/ui/timezone-picker";
import { Clock, Globe, Hash } from "lucide-react";

function formatNumeralSample(system: "latn" | "arab"): string {
  try {
    return new Intl.NumberFormat(system === "arab" ? "ar-EG-u-nu-arab" : "en-US-u-nu-latn").format(
      123456.78
    );
  } catch {
    return system === "arab" ? "١٢٣٬٤٥٦٫٧٨" : "123,456.78";
  }
}

/**
 * Props for RegionalPreferencesSection.
 */
export interface RegionalPreferencesSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  numeralSystem: "latn" | "arab";
  timezone: string;
  quickTimezones: string[];
  reducedMotion: boolean;
  onLanguageChange: (lang: "en" | "ar") => void;
  onNumeralSystemChange: (sys: "latn" | "arab") => void;
  onTimezoneChange: (tz: string) => void;
  onReducedMotionChange: (enabled: boolean) => void;
}

/**
 * Regional localization cards: interface language, numeral system preview,
 * operating timezone picker, and reduced motion accessibility toggle.
 */
export function RegionalPreferencesSection({
  t,
  language,
  numeralSystem,
  timezone,
  quickTimezones,
  reducedMotion,
  onLanguageChange,
  onNumeralSystemChange,
  onTimezoneChange,
  onReducedMotionChange,
}: RegionalPreferencesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-nx-accent shrink-0" />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.preferences.languageTitle")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 min-w-0">
          {(["en", "ar"] as const).map((lang) => (
            <Button
              key={lang}
              type="button"
              variant={language === lang ? "default" : "outline"}
              size="sm"
              onClick={() => onLanguageChange(lang)}
              data-testid={`language-${lang}`}
              className="h-9 min-w-0 px-2 text-xs font-semibold"
            >
              <span className="truncate">
                {lang === "en"
                  ? t("profile.preferences.langEnglish")
                  : t("profile.preferences.langArabic")}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-nx-accent shrink-0" />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.preferences.numeralSystemTitle")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
            {(["latn", "arab"] as const).map((sys) => (
              <Button
                key={sys}
                type="button"
                variant={numeralSystem === sys ? "default" : "outline"}
                size="sm"
                onClick={() => onNumeralSystemChange(sys)}
                data-testid={`numeral-${sys}`}
                className="h-9 min-w-0 px-2 text-xs font-mono"
              >
                <span className="truncate">
                  {sys === "latn"
                    ? t("profile.preferences.numeralLatn")
                    : t("profile.preferences.numeralArab")}
                </span>
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-nx-ink-3 px-2.5 py-1.5 rounded-lg bg-nx-raised border border-nx-line">
            <span>{t("profile.preferences.numeralSampleLabel")}</span>
            <span className="font-mono font-semibold text-nx-ink">
              {formatNumeralSample(numeralSystem)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 text-nx-accent shrink-0" />
              <CardTitle className="text-sm font-bold text-nx-ink truncate">
                {t("profile.preferences.timezoneTitle")}
              </CardTitle>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={onReducedMotionChange}
              aria-label={t("profile.preferences.reducedMotionLabel")}
            />
          </div>
          <CardDescription className="text-[11px] text-nx-ink-3">
            {t("profile.preferences.reducedMotionDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 min-w-0">
          <div className="flex flex-wrap gap-1.5">
            {quickTimezones.map((tz) => (
              <Button
                key={tz}
                type="button"
                variant={timezone === tz ? "default" : "outline"}
                size="sm"
                onClick={() => onTimezoneChange(tz)}
                data-testid={`timezone-${tz}`}
                className="h-7 px-2 text-[11px] font-mono"
              >
                <span dir="ltr">{tz}</span>
              </Button>
            ))}
          </div>
          <TimezonePicker
            value={timezone}
            onChange={onTimezoneChange}
            aria-label={t("profile.preferences.timezoneSearchLabel")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
