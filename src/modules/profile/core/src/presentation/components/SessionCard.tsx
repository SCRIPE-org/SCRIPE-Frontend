"use client";

/**
 * SessionCard — Display a single active session
 */
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Monitor, Smartphone, Globe, X } from "lucide-react";
import type { ActiveSession } from "../../../src/domain/entities/ActiveSession";

interface SessionCardProps {
  session: ActiveSession;
  onRevoke?: (tokenId: string) => Promise<unknown>;
  isRevoking?: boolean;
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const { t } = useI18n();
  const lowerInfo = session.deviceInfo.toLowerCase();
  const isMobile =
    lowerInfo.includes("mobile") || lowerInfo.includes("iphone") || lowerInfo.includes("android");

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        session.isCurrent
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-border/40 bg-card hover:border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-lg p-2",
              session.isCurrent
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{session.deviceInfo}</h4>
              {session.isCurrent && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                  {t("profile.sessions.current")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {session.ipAddress}
              </span>
              <span>
                {t("profile.sessions.signedIn")}: {session.createdAt.toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("profile.sessions.expires")}: {session.expiresAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        {!session.isCurrent && onRevoke && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevoke(session.tokenId)}
            loading={isRevoking}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {!isRevoking && <X className="me-1 h-4 w-4" />}
            {t("profile.sessions.revoke")}
          </Button>
        )}
      </div>
    </div>
  );
}
