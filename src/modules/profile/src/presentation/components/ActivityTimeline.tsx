"use client";

/**
 * ActivityTimeline — Grouped security event timeline
 */
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
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
      Login: { icon: CheckCircle2, color: "text-emerald-500" },
      LoginFailed: { icon: XCircle, color: "text-red-500" },
      PasswordChanged: { icon: RefreshCw, color: "text-blue-500" },
      TwoFactorEnabled: { icon: Shield, color: "text-indigo-500" },
      TwoFactorVerified: { icon: Shield, color: "text-indigo-500" },
      TwoFactorDisabled: { icon: Shield, color: "text-amber-500" },
      SessionRevoked: { icon: Key, color: "text-amber-500" },
      AllSessionsRevoked: { icon: Key, color: "text-amber-500" },
      ProfileUpdated: { icon: FileEdit, color: "text-sky-500" },
      AccountLocked: { icon: Lock, color: "text-red-500" },
      BackupCodesRegenerated: { icon: Shield, color: "text-purple-500" },
      Logout: { icon: LogOut, color: "text-gray-500" },
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

export function ActivityTimeline({ groupedEntries }: ActivityTimelineProps) {
      const { t } = useI18n();
      const groups = Object.entries(groupedEntries);

      if (groups.length === 0) {
            return (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                        {t("profile.activity.noEntries")}
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  {groups.map(([date, entries]) => (
                        <div key={date}>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    {date}
                              </h4>
                              <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute start-[15px] top-0 bottom-0 w-px bg-border/60" />

                                    <div className="space-y-4">
                                          {entries?.map((entry) => {
                                                const config = getConfig(entry.eventType);
                                                const Icon = config.icon;

                                                return (
                                                      <div key={entry.id} className="relative flex gap-4 ps-0">
                                                            {/* Icon dot */}
                                                            <div
                                                                  className={cn(
                                                                        "relative z-10 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-card border border-border/40",
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
                                                                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                                                          <Globe className="h-3 w-3" />
                                                                                          {entry.ipAddress}
                                                                                    </p>
                                                                              )}
                                                                              {entry.details && (
                                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                                          {entry.details}
                                                                                    </p>
                                                                              )}
                                                                        </div>
                                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                              {entry.timestamp.toLocaleTimeString([], {
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                              })}
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
