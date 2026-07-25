"use client";

/**
 * SessionCard — Display a single active session
 */
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, formatDateUtc } from "@core/common/utils";
import { Monitor, Smartphone, Globe, X } from "lucide-react";
import type { ActiveSession } from "../../../src/domain/entities/ActiveSession";

interface SessionCardProps {
  session: ActiveSession;
  onRevoke?: (tokenId: string) => Promise<unknown>;
  isRevoking?: boolean;
}

function parseDeviceDetails(deviceInfo: string) {
  let cleaned = deviceInfo ? deviceInfo.trim() : "";

  // Handle double-serialized or outer-quoted strings
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (typeof parsed === "string") {
        cleaned = parsed.trim();
      }
    } catch {
      // ignore
    }
  }

  let data: any = {};
  let isJson = false;

  if (cleaned.startsWith("{")) {
    try {
      data = JSON.parse(cleaned);
      isJson = true;
    } catch {
      // ignore
    }
  }

  // If it's not JSON, treat the entire cleaned string as the userAgent!
  const ua = isJson ? data.userAgent || "" : cleaned;
  let os: string | null = isJson ? data.platform || null : null;
  let browser: string | null = null;

  // Parse OS from user agent
  if (!os) {
    if (ua.includes("Windows NT 10.0") || ua.includes("Windows 10") || ua.includes("Windows 11"))
      os = "Windows 10/11";
    else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
    else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
    else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
    else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";
  }

  // Parse Browser from user agent
  if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) {
    const match = ua.match(/Chrome\/([0-9.]+)/);
    browser = match ? `Chrome ${match[1].split(".")[0]}` : "Chrome";
  } else if (ua.includes("Safari") && !ua.includes("Chrome") && !ua.includes("Chromium")) {
    const match = ua.match(/Version\/([0-9.]+)/);
    browser = match ? `Safari ${match[1].split(".")[0]}` : "Safari";
  } else if (ua.includes("Firefox")) {
    const match = ua.match(/Firefox\/([0-9.]+)/);
    browser = match ? `Firefox ${match[1].split(".")[0]}` : "Firefox";
  } else if (ua.includes("Edg")) {
    const match = ua.match(/Edg\/([0-9.]+)/);
    browser = match ? `Edge ${match[1].split(".")[0]}` : "Edge";
  }

  // Timezone / Location
  let location = null;
  if (data.timezone) {
    const parts = data.timezone.split("/");
    location = parts[parts.length - 1].replace("_", " ");
  }

  return {
    // The raw cleaned string, used only when BOTH os and browser are unknown.
    rawTitle: cleaned || null,
    browser,
    os,
    location,
    screen: data.screen || null,
    language: data.language || null,
  };
}

/**
 * Presentation UI component rendering the session card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const { t } = useI18n();
  const details = parseDeviceDetails(session.deviceInfo);
  const lowerInfo = (session.deviceInfo || "").toLowerCase();

  const isMobile =
    details.os === "Android" ||
    details.os === "iOS" ||
    lowerInfo.includes("mobile") ||
    lowerInfo.includes("iphone") ||
    lowerInfo.includes("android");

  // OS/browser names (Windows, macOS, Chrome, Safari, ...) are proper nouns
  // and stay as-is; only the "we could not tell" fallbacks are translated.
  const osLabel = details.os ?? t("profile.sessions.unknownOs");
  const browserLabel = details.browser ?? t("profile.sessions.unknownBrowser");
  const title =
    details.browser || details.os
      ? t("profile.sessions.deviceTitle", { browser: browserLabel, os: osLabel })
      : details.rawTitle || t("profile.sessions.unknownDevice");

  return (
    <div
      className={cn(
        "rounded-nx-lg border p-4",
        "transition-[border-color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        session.isCurrent
          ? "border-success/30 bg-success/10"
          : "border-nx-line bg-nx-surface hover:border-nx-line-hi"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-nx-md p-2",
              session.isCurrent ? "bg-success/10 text-success" : "bg-nx-raised text-nx-ink-2"
            )}
          >
            {isMobile ? (
              <Smartphone className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Monitor className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-nx-ink">{title}</h4>
              {session.isCurrent && (
                <Badge variant="success">{t("profile.sessions.current")}</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-nx-ink-3">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" aria-hidden="true" />
                {session.ipAddress}
              </span>
              {details.location && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{details.location}</span>
                </>
              )}
              {details.screen && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{details.screen}</span>
                </>
              )}
              {details.language && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase">{details.language}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>
                {t("profile.sessions.signedIn")}: {formatDateUtc(session.createdAt)}
              </span>
            </div>
            <p className="text-xs text-nx-ink-3">
              {t("profile.sessions.expires")}: {formatDateUtc(session.expiresAt)}
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
            {!isRevoking && <X className="me-1 h-4 w-4" aria-hidden="true" />}
            {t("profile.sessions.revoke")}
          </Button>
        )}
      </div>
    </div>
  );
}
