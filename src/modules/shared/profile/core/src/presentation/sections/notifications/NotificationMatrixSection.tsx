"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { NotificationCategoryRuleItem } from "../../../domain/entities/SovereignAccountEntities";
import { Bell, Lock } from "lucide-react";

/**
 * Default notification routing rules displayed while preferences initialize.
 */
export const DEFAULT_NOTIFICATION_RULES: NotificationCategoryRuleItem[] = [
  {
    category: "Security",
    displayName: "",
    description: "",
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    isCriticalLocked: true,
  },
  {
    category: "System",
    displayName: "",
    description: "",
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    isCriticalLocked: false,
  },
  {
    category: "Activity",
    displayName: "",
    description: "",
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    isCriticalLocked: false,
  },
  {
    category: "General",
    displayName: "",
    description: "",
    inAppEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: false,
    isCriticalLocked: false,
  },
];

const CATEGORY_COPY_KEYS: Record<string, { titleKey: string; descKey: string }> = {
  security: {
    titleKey: "profile.notifications.rules.securityTitle",
    descKey: "profile.notifications.rules.securityDesc",
  },
  system: {
    titleKey: "profile.notifications.rules.systemTitle",
    descKey: "profile.notifications.rules.systemDesc",
  },
  activity: {
    titleKey: "profile.notifications.rules.activityTitle",
    descKey: "profile.notifications.rules.activityDesc",
  },
  general: {
    titleKey: "profile.notifications.rules.generalTitle",
    descKey: "profile.notifications.rules.generalDesc",
  },
};

/**
 * Resolves localized title and description for a notification category rule.
 */
export function resolveNotificationRuleCopy(
  t: (key: string, params?: Record<string, string | number>) => string,
  category: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): { title: string; description: string } {
  const keys = CATEGORY_COPY_KEYS[category.toLowerCase()];
  if (keys) {
    return {
      title: t(keys.titleKey),
      description: t(keys.descKey),
    };
  }
  return {
    title: fallbackTitle || category,
    description: fallbackDescription || "",
  };
}

/**
 * Delivery channel key in NotificationCategoryRuleItem.
 */
export type NotificationChannelKey =
  | "inAppEnabled"
  | "emailEnabled"
  | "smsEnabled"
  | "pushEnabled";

/**
 * Props for NotificationMatrixSection.
 */
export interface NotificationMatrixSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  rules: NotificationCategoryRuleItem[];
  onToggleChannel: (category: string, channel: NotificationChannelKey) => void;
}

/**
 * Multi-channel notification routing matrix per category with critical security locks.
 */
export function NotificationMatrixSection({
  t,
  rules,
  onToggleChannel,
}: NotificationMatrixSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-nx-accent shrink-0" />
          <CardTitle className="text-sm font-bold text-nx-ink">
            {t("profile.notifications.matrixTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.notifications.matrixDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rules.map((rule) => {
          const copy = resolveNotificationRuleCopy(
            t,
            rule.category,
            rule.displayName,
            rule.description
          );
          return (
            <div
              key={rule.category}
              data-testid={`notification-rule-${rule.category.toLowerCase()}`}
              className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-nx-ink">{copy.title}</span>
                  {rule.isCriticalLocked && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-warning/40 text-warning bg-warning/10 gap-1"
                    >
                      <Lock className="h-2.5 w-2.5" />
                      <span>{t("profile.notifications.criticalLockedBadge")}</span>
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-nx-ink-3 block">{copy.description}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    { key: "inAppEnabled", labelKey: "profile.notifications.channelLabels.inApp" },
                    { key: "emailEnabled", labelKey: "profile.notifications.channelLabels.email" },
                    { key: "smsEnabled", labelKey: "profile.notifications.channelLabels.sms" },
                    { key: "pushEnabled", labelKey: "profile.notifications.channelLabels.push" },
                  ] as const
                ).map((ch) => (
                  <Button
                    key={ch.key}
                    type="button"
                    variant={rule[ch.key] ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleChannel(rule.category, ch.key)}
                    className="h-7 px-2.5 text-[10px] font-mono"
                  >
                    {t(ch.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
