"use client";

/**
 * ActivityTimeline — Grouped security event timeline
 */
import { useI18n } from "@core/providers/i18n-provider";
import { cn, formatTimeUtc } from "@core/common/utils";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Shield,
  Key,
  FileEdit,
  Lock,
  LogOut,
  Globe,
} from "lucide-react";
import type { SecurityLogEntry } from "../../../src/domain/entities/SecurityLogEntry";

const eventConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  Login: { icon: CheckCircle2, color: "text-success" },
  LoginFailed: { icon: XCircle, color: "text-destructive" },
  PasswordChanged: { icon: RefreshCw, color: "text-info" },
  TwoFactorEnabled: { icon: Shield, color: "text-info" },
  TwoFactorVerified: { icon: Shield, color: "text-info" },
  TwoFactorDisabled: { icon: Shield, color: "text-warning" },
  SessionRevoked: { icon: Key, color: "text-warning" },
  AllSessionsRevoked: { icon: Key, color: "text-warning" },
  ProfileUpdated: { icon: FileEdit, color: "text-info" },
  AccountLocked: { icon: Lock, color: "text-destructive" },
  BackupCodesRegenerated: { icon: Shield, color: "text-primary" },
  Logout: { icon: LogOut, color: "text-muted-foreground" },
};

function getConfig(eventType: string) {
  // Try to find matching config by checking if event type contains any key
  for (const [key, config] of Object.entries(eventConfig)) {
    if (eventType.toLowerCase().includes(key.toLowerCase())) {
      return config;
    }
  }
  return { icon: Globe, color: "text-muted-foreground" };
}

interface ActivityTimelineProps {
  groupedEntries: Record<string, SecurityLogEntry[]>;
}

/**
 * Presentation UI component rendering the activity timeline.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ActivityTimeline({ groupedEntries }: ActivityTimelineProps) {
  const { t } = useI18n();
  const groups = Object.entries(groupedEntries);

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {t("profile.activity.noEntries")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([date, entries]) => (
        <div key={date}>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {date}
          </h4>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-0 start-[15px] top-0 w-px bg-border/60" />

            <div className="space-y-4">
              {entries?.map((entry) => {
                const config = getConfig(entry.eventType);
                const Icon = config.icon;

                return (
                  <div key={entry.id} className="relative flex gap-4 ps-0">
                    {/* Icon dot */}
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/40 bg-card",
                        config.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{entry.description}</p>
                          {entry.ipAddress && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {entry.ipAddress}
                            </p>
                          )}
                          {entry.details && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{entry.details}</p>
                          )}
                        </div>
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatTimeUtc(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
