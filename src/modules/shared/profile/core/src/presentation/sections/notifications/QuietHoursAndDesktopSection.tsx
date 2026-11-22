"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { Monitor, Moon, ShieldAlert } from "lucide-react";

function parseUtcHmToMinutes(value: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatUtcHmInTimezone(hm: string, timezone: string): string | null {
  const totalMinutes = parseUtcHmToMinutes(hm);
  if (totalMinutes === null) return null;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, mins, 0)
  );
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone || "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(utcDate);
  } catch {
    return hm;
  }
}

/**
 * Props for QuietHoursAndDesktopSection.
 */
export interface QuietHoursAndDesktopSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  resolvedTimezone: string;
  desktopEnabled: boolean;
  onQuietHoursChange: (enabled: boolean) => void;
  onQuietStartChange: (value: string) => void;
  onQuietEndChange: (value: string) => void;
  onDesktopToggle: (enabled: boolean) => void;
}

/**
 * Quiet Hours UTC scheduling (with live local timezone preview) and desktop alert permissions card.
 */
export function QuietHoursAndDesktopSection({
  t,
  quietHours,
  quietStart,
  quietEnd,
  resolvedTimezone,
  desktopEnabled,
  onQuietHoursChange,
  onQuietStartChange,
  onQuietEndChange,
  onDesktopToggle,
}: QuietHoursAndDesktopSectionProps) {
  const localStartPreview = formatUtcHmInTimezone(quietStart, resolvedTimezone);
  const localEndPreview = formatUtcHmInTimezone(quietEnd, resolvedTimezone);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-nx-accent shrink-0" />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.notifications.quietHoursTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.notifications.quietHoursDesc")}
            </CardDescription>
          </div>
          <Switch
            checked={quietHours}
            onCheckedChange={onQuietHoursChange}
            aria-label={t("profile.notifications.quietHoursTitle")}
          />
        </CardHeader>
        <CardContent className="pt-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <Input
              value={quietStart}
              onChange={(e) => onQuietStartChange(e.target.value)}
              aria-label={`${t("profile.notifications.quietHoursTitle")} — ${t("common.from")}`}
              className="h-8 w-24 text-xs font-mono bg-nx-raised border-nx-line text-nx-ink"
            />
            <span className="text-xs text-nx-ink-3" aria-hidden="true">
              &rarr;
            </span>
            <Input
              value={quietEnd}
              onChange={(e) => onQuietEndChange(e.target.value)}
              aria-label={`${t("profile.notifications.quietHoursTitle")} — ${t("common.to")}`}
              className="h-8 w-24 text-xs font-mono bg-nx-raised border-nx-line text-nx-ink"
            />
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-nx-line bg-nx-raised text-nx-ink-3"
            >
              UTC
            </Badge>
          </div>
          {localStartPreview && localEndPreview ? (
            <p
              data-testid="quiet-hours-local-preview"
              className="text-[11px] font-mono text-nx-ink-2"
            >
              {t("profile.notifications.quietHoursLocalPreview", {
                timezone: resolvedTimezone,
                start: localStartPreview,
                end: localEndPreview,
              })}
            </p>
          ) : (
            <p className="text-[11px] text-warning">
              {t("profile.notifications.quietHoursInvalidTime")}
            </p>
          )}
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-warning/40 text-warning bg-warning/10 gap-1"
          >
            <ShieldAlert className="h-3 w-3" />
            <span>{t("profile.notifications.securityBypassLawBadge")}</span>
          </Badge>
        </CardContent>
      </Card>

      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-nx-accent shrink-0" />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.notifications.desktopAlertsTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.notifications.desktopAlertsDesc")}
            </CardDescription>
          </div>
          <Switch
            checked={desktopEnabled}
            onCheckedChange={onDesktopToggle}
            aria-label={t("profile.notifications.desktopAlertsTitle")}
          />
        </CardHeader>
        <CardContent className="pt-0">
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-nx-line bg-nx-raised text-nx-ink-2"
          >
            {t("profile.notifications.realtimeSignalRBadge")} &bull;{" "}
            {t("profile.notifications.emailQueueActiveBadge")}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
