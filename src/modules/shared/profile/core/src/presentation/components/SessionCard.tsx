"use client";

/**
 * SessionCard — Display a single active session
 */
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
  let os = isJson ? data.platform || "Unknown OS" : "Unknown OS";
  let browser = "Unknown Browser";

  // Parse OS from user agent
  if (ua.includes("Windows NT 10.0") || ua.includes("Windows 10") || ua.includes("Windows 11"))
    os = "Windows 10/11";
  else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
  else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

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

  // Fallback if both OS and Browser are unknown
  let title = `${browser} on ${os}`;
  if (browser === "Unknown Browser" && os === "Unknown OS") {
    title = cleaned || "Unknown Device";
  }

  // Timezone / Location
  let location = null;
  if (data.timezone) {
    const parts = data.timezone.split("/");
    location = parts[parts.length - 1].replace("_", " ");
  }

  return {
    title,
    browser: browser !== "Unknown Browser" ? browser : null,
    os: os !== "Unknown OS" ? os : null,
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
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-foreground">{details.title}</h4>
              {session.isCurrent && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {t("profile.sessions.current")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground/60" />
                {session.ipAddress}
              </span>
              {details.location && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{details.location}</span>
                </>
              )}
              {details.screen && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{details.screen}</span>
                </>
              )}
              {details.language && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="uppercase">{details.language}</span>
                </>
              )}
              <span className="text-muted-foreground/40">·</span>
              <span>
                {t("profile.sessions.signedIn")}: {formatDateUtc(session.createdAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/80">
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
            {!isRevoking && <X className="me-1 h-4 w-4" />}
            {t("profile.sessions.revoke")}
          </Button>
        )}
      </div>
    </div>
  );
}
