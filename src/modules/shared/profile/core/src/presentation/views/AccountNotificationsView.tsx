"use client";

/**
 * AccountNotificationsView
 *
 * Sovereign Slice 12 (/account/notifications):
 * Multi-Channel Alert Routing Matrix (Email, In-App, WhatsApp/SMS, Mobile Push),
 * Quiet Hours, and Automated Match-Day Kickoff Focus Mode with Medical/President VIP Overrides.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { useAccountNotificationsSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  Bell,
  Moon,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

const ALERT_DOMAINS = [
  "securityAlerts",
  "fixtureConflicts",
  "medicalClearances",
  "commercialApprovals",
] as const;

export function AccountNotificationsView() {
  const { t } = useI18n();
  const { notifications, updateNotifications, isUpdatingNotifications } =
    useAccountNotificationsSliceViewModel();

  const [quietHours, setQuietHours] = useState(
    notifications?.quietHoursEnabled ?? true
  );
  const [quietStart, setQuietStart] = useState(
    notifications?.quietHoursStartUtc ?? "22:00"
  );
  const [quietEnd, setQuietEnd] = useState(
    notifications?.quietHoursEndUtc ?? "06:00"
  );
  const [matchDayFocus, setMatchDayFocus] = useState(
    notifications?.matchDayFocusAutoEnable ?? true
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async () => {
    await updateNotifications({
      quietHoursEnabled: quietHours,
      quietHoursStartUtc: quietStart,
      quietHoursEndUtc: quietEnd,
      matchDayFocusAutoEnable: matchDayFocus,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.notifications.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.notifications.description")}
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
            disabled={isUpdatingNotifications}
            onClick={handleSave}
            data-testid="save-notifications-btn"
            className="h-8 text-xs font-semibold"
          >
            {t("profile.common.saveChanges")}
          </Button>
        </div>
      </div>

      {/* 1. Multi-Channel Alert Routing Matrix */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.notifications.matrixTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.notifications.matrixDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {ALERT_DOMAINS.map((domainKey) => (
            <div
              key={domainKey}
              className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <span className="text-xs font-bold text-nx-ink block">
                  {t(`profile.notifications.domain.${domainKey}`)}
                </span>
                <span className="text-[11px] text-nx-ink-3">
                  {t(`profile.notifications.domainDesc.${domainKey}`)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {["EMAIL", "IN-APP", "WHATSAPP", "PUSH"].map((ch) => (
                  <Badge
                    key={ch}
                    variant="outline"
                    className="text-[10px] font-mono border-nx-accent/40 text-nx-accent bg-nx-accent-wash"
                  >
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Match-Day Kickoff Focus Mode & Quiet Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-sm font-bold text-nx-ink">
                  {t("profile.notifications.matchDayFocusTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-nx-ink-3 mt-1">
                {t("profile.notifications.matchDayFocusDesc")}
              </CardDescription>
            </div>
            <Switch
              checked={matchDayFocus}
              onCheckedChange={setMatchDayFocus}
              aria-label={t("profile.notifications.matchDayFocusTitle")}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="text-[10px] font-mono border-warning/40 text-warning bg-warning/10">
              {t("profile.notifications.vipOverrideBadge")}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
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
              onCheckedChange={setQuietHours}
              aria-label={t("profile.notifications.quietHoursTitle")}
            />
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-2">
            <Input
              value={quietStart}
              onChange={(e) => setQuietStart(e.target.value)}
              className="h-8 w-24 text-xs font-mono bg-nx-raised border-nx-line text-nx-ink"
            />
            <span className="text-xs text-nx-ink-3">&rarr;</span>
            <Input
              value={quietEnd}
              onChange={(e) => setQuietEnd(e.target.value)}
              className="h-8 w-24 text-xs font-mono bg-nx-raised border-nx-line text-nx-ink"
            />
            <Badge variant="outline" className="text-[10px] font-mono border-nx-line bg-nx-raised text-nx-ink-3">
              UTC
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
