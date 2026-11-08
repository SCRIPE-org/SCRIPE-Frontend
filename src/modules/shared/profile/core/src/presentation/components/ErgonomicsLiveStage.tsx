"use client";

/**
 * ErgonomicsLiveStage
 *
 * Interactive zero-flicker live preview stage for Relay vNext Theme Modes,
 * Club Accent Hues, Interface Density (Comfortable vs Compact), and Broadcast Privacy Blur (Alt+P).
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { EyeOff, Eye, Layers } from "lucide-react";

interface ErgonomicsLiveStageProps {
  theme: string;
  accentHue: string;
  density: string;
  privacyBlur: boolean;
}

export function ErgonomicsLiveStage({
  theme,
  accentHue,
  density,
  privacyBlur,
}: ErgonomicsLiveStageProps) {
  const { t } = useI18n();
  const isCompact = density === "compact";

  return (
    <Card
      data-testid="ergonomics-live-stage"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.preferences.liveStageTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
            {t("profile.preferences.liveStageDesc")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono border-nx-line bg-nx-raised text-nx-ink-2">
            {theme.toUpperCase()} &bull; {accentHue.toUpperCase()}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] font-mono gap-1 ${
              privacyBlur
                ? "border-warning/40 text-warning bg-warning/10"
                : "border-success/30 text-success bg-success/10"
            }`}
          >
            {privacyBlur ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>
              {privacyBlur
                ? t("profile.preferences.privacyBlurActive")
                : t("profile.preferences.privacyBlurOff")}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className={`rounded-xl border border-nx-line bg-nx-ground transition-all ${
            isCompact ? "p-3 space-y-2" : "p-5 space-y-3.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-nx-accent-fill text-nx-on-fill flex items-center justify-center font-bold text-xs">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-nx-ink block">
                  {t("profile.preferences.stageSampleHeader")}
                </span>
                <span className="text-[10px] text-nx-ink-3 font-mono">
                  {isCompact
                    ? t("profile.preferences.compactMode")
                    : t("profile.preferences.comfortableMode")}
                </span>
              </div>
            </div>

            <Badge className="bg-nx-accent-fill text-nx-on-fill text-[10px] font-bold">
              {t("profile.preferences.livePreviewBadge")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg border border-nx-line bg-nx-surface">
              <span className="text-[10px] text-nx-ink-3 block">
                {t("profile.preferences.stageMetric1Label")}
              </span>
              <span className="text-sm font-bold font-mono text-nx-ink">
                94.8%
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-nx-line bg-nx-surface">
              <span className="text-[10px] text-nx-ink-3 block">
                {t("profile.preferences.stageMetric2Label")}
              </span>
              <span
                className={`text-sm font-bold font-mono text-nx-accent transition-all ${
                  privacyBlur ? "blur-xs select-none" : ""
                }`}
              >
                $1,450,000
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-nx-line bg-nx-surface">
              <span className="text-[10px] text-nx-ink-3 block">
                {t("profile.preferences.stageMetric3Label")}
              </span>
              <span
                className={`text-sm font-bold font-mono text-success transition-all ${
                  privacyBlur ? "blur-xs select-none" : ""
                }`}
              >
                +20 100 ••• 0199
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
