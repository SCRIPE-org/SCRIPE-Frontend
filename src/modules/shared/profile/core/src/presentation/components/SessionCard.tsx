"use client";

/**
 * SessionCard
 *
 * Workstation Session presentation card for SCRIPE Session Fleet.
 * Displays OS/Browser badges, IP address, geolocation tags, active indicators,
 * impersonation watermarks, and remote single-kill execution.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Monitor,
  Laptop,
  Smartphone,
  Globe,
  Trash2,
  Clock,
  UserCheck,
  Loader2,
} from "lucide-react";
import type { WorkstationSession } from "../../domain/entities/WorkstationSession";

interface SessionCardProps {
  session: WorkstationSession;
  onRevoke: (id: string) => Promise<unknown>;
  isRevoking: boolean;
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const { t } = useI18n();

  const isCurrent = session.isCurrent;
  const isMobile = /iphone|ipad|android/i.test(session.deviceInfo);
  const Icon = isMobile ? Smartphone : /macintosh|windows/i.test(session.deviceInfo) ? Laptop : Monitor;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all ${
        isCurrent
          ? "border-nx-accent/40 bg-nx-accent-wash/30"
          : "border-nx-line bg-nx-surface hover:border-nx-line-hi"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Device & Network Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`p-2.5 rounded-lg border shrink-0 ${
              isCurrent
                ? "border-nx-accent/30 bg-nx-accent-wash text-nx-accent"
                : "border-nx-line bg-nx-raised text-nx-ink-2"
            }`}
          >
            <Icon className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-nx-ink truncate">
                {session.browser || t("profile.sessions.defaultBrowser")} • {session.os || t("profile.sessions.defaultOs")}
              </h4>

              {isCurrent && (
                <Badge
                  variant="outline"
                  className="border-success/30 text-success text-[10px] py-0 px-1.5 flex items-center gap-1 font-semibold"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span>{t("profile.sessions.currentDevice")}</span>
                </Badge>
              )}

              {session.isImpersonated && (
                <Badge
                  variant="outline"
                  className="border-warning/40 text-warning text-[10px] py-0 px-1.5 flex items-center gap-1"
                >
                  <UserCheck className="h-3 w-3" />
                  <span>{t("profile.sessions.impersonated")}</span>
                </Badge>
              )}
            </div>

            <p className="text-[11px] text-nx-ink-2 mt-0.5 truncate">
              {session.deviceInfo}
            </p>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-nx-ink-3 font-mono flex-wrap">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>{session.ipAddress}</span>
                {session.city && session.country && (
                  <span>({session.city}, {session.country})</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {t("profile.sessions.started")}: {session.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        {!isCurrent && (
          <div className="flex items-center sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevoke(session.id)}
              disabled={isRevoking}
              className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/60 gap-1.5"
            >
              {isRevoking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>{t("profile.sessions.revokeSessionBtn")}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
