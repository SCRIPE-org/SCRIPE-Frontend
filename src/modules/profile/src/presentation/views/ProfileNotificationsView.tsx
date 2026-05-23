"use client";

/**
 * ProfileNotificationsView — Notification preferences page
 * Allows users to manage which notifications they receive (email, in-app, push).
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Bell, Mail, Smartphone } from "lucide-react";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import { Separator } from "@core/ui/separator";

interface NotificationChannel {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  descriptionKey: string;
  defaultEnabled: boolean;
}

const CHANNELS: NotificationChannel[] = [
  {
    id: "in-app",
    icon: <Bell className="h-5 w-5" />,
    labelKey: "profile.notifications.channels.inApp",
    descriptionKey: "profile.notifications.channels.inAppDescription",
    defaultEnabled: true,
  },
  {
    id: "email",
    icon: <Mail className="h-5 w-5" />,
    labelKey: "profile.notifications.channels.email",
    descriptionKey: "profile.notifications.channels.emailDescription",
    defaultEnabled: true,
  },
  {
    id: "push",
    icon: <Smartphone className="h-5 w-5" />,
    labelKey: "profile.notifications.channels.push",
    descriptionKey: "profile.notifications.channels.pushDescription",
    defaultEnabled: false,
  },
];

export function ProfileNotificationsView() {
  const { t } = useI18n();

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">
          {t("profile.notifications.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("profile.notifications.description")}
        </p>
      </div>

      <Separator />

      {/* Notification Channels */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t("profile.notifications.channels.heading")}
        </h3>
        <div className="space-y-4">
          {CHANNELS.map((channel) => (
            <div
              key={channel.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/20 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
                  {channel.icon}
                </div>
                <div className="space-y-0.5">
                  <Label
                    htmlFor={`notif-${channel.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t(channel.labelKey)}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t(channel.descriptionKey)}
                  </p>
                </div>
              </div>
              <Switch
                id={`notif-${channel.id}`}
                defaultChecked={channel.defaultEnabled}
                aria-label={t(channel.labelKey)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Coming Soon notice */}
      <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        {t("profile.notifications.comingSoon")}
      </div>
    </div>
  );
}
