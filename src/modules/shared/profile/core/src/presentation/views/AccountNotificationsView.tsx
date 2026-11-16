"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import { toast } from "@core/ui/sileo-toast";
import {
  useAccountNotificationsSliceViewModel,
  useAccountPreferencesSliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  isConcurrencyConflictError,
  resolveProfileSaveErrorMessage,
} from "../utils/concurrency";
import type { NotificationCategoryRuleItem } from "../../domain/entities/SovereignAccountEntities";
import { NotificationsPageSkeleton } from "../components/AccountSkeletons";
import {
  DEFAULT_NOTIFICATION_RULES,
  NotificationMatrixSection,
  type NotificationChannelKey,
} from "../sections/notifications/NotificationMatrixSection";
import { QuietHoursAndDesktopSection } from "../sections/notifications/QuietHoursAndDesktopSection";
import { RecentNotificationFeedSection } from "../sections/notifications/RecentNotificationFeedSection";
import { CheckCircle2, Send } from "lucide-react";

function resolveOperatingTimezone(prefTimezone: string | undefined): string {
  if (prefTimezone) return prefTimezone;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Multi-channel notification routing, Quiet Hours schedule, and live alert feed view
 * (/account/notifications).
 */
export function AccountNotificationsView() {
  const { t } = useI18n();
  const vm = useAccountNotificationsSliceViewModel();
  const { preferences } = useAccountPreferencesSliceViewModel();
  const { notifications } = vm;

  const [rulesDraft, setRulesDraft] = useState<NotificationCategoryRuleItem[] | null>(null);
  const [quietHoursDraft, setQuietHoursDraft] = useState<boolean | null>(null);
  const [quietStartDraft, setQuietStartDraft] = useState<string | null>(null);
  const [quietEndDraft, setQuietEndDraft] = useState<string | null>(null);
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const rules =
    rulesDraft ??
    (notifications?.categoryRules?.length ? notifications.categoryRules : DEFAULT_NOTIFICATION_RULES);
  const quietHours = quietHoursDraft ?? notifications?.quietHoursEnabled ?? false;
  const quietStart = quietStartDraft ?? notifications?.quietHoursStartUtc ?? "22:00";
  const quietEnd = quietEndDraft ?? notifications?.quietHoursEndUtc ?? "07:00";

  if (vm.isLoadingNotifications && !notifications) return <NotificationsPageSkeleton />;

  const toggleChannel = (category: string, channel: NotificationChannelKey) => {
    setRulesDraft(
      rules.map((r) => {
        if (r.category !== category) return r;
        if (r.isCriticalLocked && (channel === "inAppEnabled" || channel === "emailEnabled")) return r;
        return { ...r, [channel]: !r[channel] };
      })
    );
  };

  const handleRequestDesktopPermission = async (checked: boolean) => {
    if (checked && typeof window !== "undefined" && "Notification" in window) {
      try {
        setDesktopEnabled((await window.Notification.requestPermission()) === "granted");
        return;
      } catch {
        // Fallback below preserves user intent when Notification API rejects
      }
    }
    setDesktopEnabled(checked);
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await vm.updateNotifications({
        categoryRules: rules,
        quietHoursEnabled: quietHours,
        quietHoursStartUtc: quietStart,
        quietHoursEndUtc: quietEnd,
        rowVersion: notifications?.rowVersion,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (error: unknown) {
      const message = resolveProfileSaveErrorMessage(error, t);
      setSaveError(message);
      if (isConcurrencyConflictError(error)) toast.warning(message);
      else toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.notifications.title")}</h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.notifications.description")}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {savedNotice && (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.common.saved")}</span>
            </Badge>
          )}
          {vm.testNotificationSent && (
            <Badge variant="outline" className="border-nx-accent/40 text-nx-accent bg-nx-accent-wash text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.notifications.testSentNotice")}</span>
            </Badge>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={vm.isSendingTestNotification}
            onClick={() => void vm.sendTestNotification("Security")}
            data-testid="send-test-notification-btn"
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Send className="h-3.5 w-3.5 text-nx-accent" />
            <span>{t("profile.notifications.sendTestBtn")}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={vm.isUpdatingNotifications}
            onClick={() => void handleSave()}
            data-testid="save-notifications-btn"
            className="h-8 text-xs font-semibold"
          >
            {t("profile.common.saveChanges")}
          </Button>
        </div>
      </div>

      {saveError && (
        <Alert variant="destructive" data-testid="notifications-save-error-alert">
          <AlertDescription className="text-xs font-medium">{saveError}</AlertDescription>
        </Alert>
      )}

      <NotificationMatrixSection t={t} rules={rules} onToggleChannel={toggleChannel} />

      <QuietHoursAndDesktopSection
        t={t}
        quietHours={quietHours}
        quietStart={quietStart}
        quietEnd={quietEnd}
        resolvedTimezone={resolveOperatingTimezone(preferences?.operatingTimezone)}
        desktopEnabled={desktopEnabled}
        onQuietHoursChange={setQuietHoursDraft}
        onQuietStartChange={setQuietStartDraft}
        onQuietEndChange={setQuietEndDraft}
        onDesktopToggle={(checked) => void handleRequestDesktopPermission(checked)}
      />

      <RecentNotificationFeedSection
        t={t}
        recentAlerts={notifications?.recentNotifications ?? []}
        unreadCount={notifications?.unreadNotificationsCount ?? 0}
        onMarkAllRead={() => void vm.markAllNotificationsAsRead()}
        onMarkRead={(id) => void vm.markNotificationAsRead(id)}
        onDelete={(id) => void vm.deleteNotification(id)}
      />
    </div>
  );
}
