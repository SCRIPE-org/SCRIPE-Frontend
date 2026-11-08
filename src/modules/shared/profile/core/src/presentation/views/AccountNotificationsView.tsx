"use client";

/**
 * AccountNotificationsView
 *
 * Page 8 (/account/notifications):
 * Live B2B Multi-Channel Alert Routing Matrix (In-App, Email, SMS, Push × Security, System, Activity, General),
 * Quiet Hours with Critical Security Alert Bypass Law, 1-Click Live Test Notification trigger,
 * Native Browser Desktop Alerts toggle, and Integrated Personal Notification Feed.
 */
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { useAccountNotificationsSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import type { NotificationCategoryRuleItem } from "../../domain/entities/SovereignAccountEntities";
import {
  Bell,
  Moon,
  ShieldAlert,
  CheckCircle2,
  Send,
  Monitor,
  Lock,
  Inbox,
} from "lucide-react";

const DEFAULT_RULES: NotificationCategoryRuleItem[] = [
  {
    category: "Security",
    displayName: "Security & Authentication Alerts",
    description: "Password changes, Passkey enrollments, 2FA updates, and suspicious login detections.",
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    isCriticalLocked: true,
  },
  {
    category: "System",
    displayName: "Platform & Infrastructure Advisories",
    description: "Scheduled maintenance windows, Edition quota thresholds, and SLA updates.",
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    isCriticalLocked: false,
  },
  {
    category: "Activity",
    displayName: "Operational & Workflow Approvals",
    description: "Role access requests, governance delegations, and multi-branch task assignments.",
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    isCriticalLocked: false,
  },
  {
    category: "General",
    displayName: "General Workspace Updates",
    description: "Weekly executive digests, product release notes, and organizational announcements.",
    inAppEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: false,
    isCriticalLocked: false,
  },
];

export function AccountNotificationsView() {
  const { t } = useI18n();
  const {
    notifications,
    updateNotifications,
    isUpdatingNotifications,
    sendTestNotification,
    isSendingTestNotification,
    testNotificationSent,
  } = useAccountNotificationsSliceViewModel();

  const [rules, setRules] = useState<NotificationCategoryRuleItem[]>(DEFAULT_RULES);
  const [quietHours, setQuietHours] = useState(
    notifications?.quietHoursEnabled ?? false
  );
  const [quietStart, setQuietStart] = useState(
    notifications?.quietHoursStartUtc ?? "22:00"
  );
  const [quietEnd, setQuietEnd] = useState(
    notifications?.quietHoursEndUtc ?? "07:00"
  );
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (notifications) {
      if (notifications.categoryRules && notifications.categoryRules.length > 0) {
        setRules(notifications.categoryRules);
      }
      setQuietHours(notifications.quietHoursEnabled);
      setQuietStart(notifications.quietHoursStartUtc);
      setQuietEnd(notifications.quietHoursEndUtc);
    }
  }, [notifications]);

  const toggleChannel = (
    category: string,
    channel: "inAppEnabled" | "emailEnabled" | "smsEnabled" | "pushEnabled"
  ) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.category !== category) return r;
        if (r.isCriticalLocked && (channel === "inAppEnabled" || channel === "emailEnabled")) {
          return r;
        }
        return { ...r, [channel]: !r[channel] };
      })
    );
  };

  const handleRequestDesktopPermission = async (checked: boolean) => {
    if (checked && typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await window.Notification.requestPermission();
        setDesktopEnabled(perm === "granted");
      } catch {
        setDesktopEnabled(checked);
      }
    } else {
      setDesktopEnabled(checked);
    }
  };

  const handleSave = async () => {
    await updateNotifications({
      categoryRules: rules,
      quietHoursEnabled: quietHours,
      quietHoursStartUtc: quietStart,
      quietHoursEndUtc: quietEnd,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSendTest = async () => {
    await sendTestNotification("Security");
  };

  const recentAlerts = notifications?.recentNotifications ?? [];

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

        <div className="flex items-center gap-2 flex-wrap">
          {savedNotice && (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.common.saved")}</span>
            </Badge>
          )}
          {testNotificationSent && (
            <Badge variant="outline" className="border-nx-accent/40 text-nx-accent bg-nx-accent-wash text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.notifications.testSentNotice")}</span>
            </Badge>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSendingTestNotification}
            onClick={handleSendTest}
            data-testid="send-test-notification-btn"
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Send className="h-3.5 w-3.5 text-nx-accent" />
            <span>{t("profile.notifications.sendTestBtn")}</span>
          </Button>
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
          {rules.map((rule) => (
            <div
              key={rule.category}
              data-testid={`notification-rule-${rule.category.toLowerCase()}`}
              className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-nx-ink">
                    {rule.displayName}
                  </span>
                  {rule.isCriticalLocked && (
                    <Badge variant="outline" className="text-[10px] font-mono border-warning/40 text-warning bg-warning/10 gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      <span>{t("profile.notifications.criticalLockedBadge")}</span>
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-nx-ink-3 block">
                  {rule.description}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    { key: "inAppEnabled", label: "IN-APP" },
                    { key: "emailEnabled", label: "EMAIL" },
                    { key: "smsEnabled", label: "SMS" },
                    { key: "pushEnabled", label: "PUSH" },
                  ] as const
                ).map((ch) => {
                  const active = rule[ch.key];
                  return (
                    <Button
                      key={ch.key}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleChannel(rule.category, ch.key)}
                      className="h-7 px-2.5 text-[10px] font-mono"
                    >
                      {ch.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Quiet Hours (with Security Bypass Law) & Native Browser Desktop Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <CardContent className="pt-0 space-y-2.5">
            <div className="flex items-center gap-2">
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
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-warning/40 text-warning bg-warning/10 gap-1">
              <ShieldAlert className="h-3 w-3" />
              <span>{t("profile.notifications.securityBypassLawBadge")}</span>
            </Badge>
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
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
              onCheckedChange={handleRequestDesktopPermission}
              aria-label={t("profile.notifications.desktopAlertsTitle")}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="text-[10px] font-mono border-nx-line bg-nx-raised text-nx-ink-2">
              SignalR Real-Time Push &bull; {t("profile.notifications.emailQueueActiveBadge")}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 3. Integrated Personal Notification Feed */}
      <Card
        data-testid="recent-notifications-feed-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.notifications.recentFeedTitle")}
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
              {notifications?.unreadNotificationsCount ?? 0} {t("profile.notifications.unreadLabel")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentAlerts.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.notifications.noRecentAlerts")}</p>
          ) : (
            recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-nx-ink">{alert.title}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-nx-ink-2">{alert.message}</p>
                </div>
                <span className="text-[10px] font-mono text-nx-ink-3 shrink-0">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
