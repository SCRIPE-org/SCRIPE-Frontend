"use client";

import React from "react";
import { Analytics, type BeforeSendEvent as AnalyticsBeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Route prefixes that carry authentication, recovery, invitation, or federation
 * context and must never be transmitted to external telemetry endpoints.
 */
const BLOCKED_TELEMETRY_PATH_PREFIXES = [
  "/reset-password",
  "/forgot-password",
  "/verify-email",
  "/setup-account",
  "/sso/",
  "/oidc/",
  "/connect/",
] as const;

const UUID_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ENCRYPTED_ID_SEGMENT_PATTERN = /^[A-Za-z0-9_-]{20,}$/;

/**
 * Determines whether third-party Vercel telemetry is explicitly enabled.
 * Requires explicit opt-in (`NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true"`)
 * rather than implicit platform environment detection (`VERCEL === "1"`).
 */
export function isVercelTelemetryEnabled(
  envFlag: string | undefined = process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS
): boolean {
  return envFlag === "true";
}

/**
 * Sanitizes a telemetry URL by dropping sensitive authentication/recovery routes,
 * stripping all query strings and URL fragments (preventing token/OTP/email leaks),
 * and redacting UUID or AES-encrypted entity identifier path segments.
 */
export function sanitizeTelemetryUrl(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  try {
    const parsed = new URL(rawUrl, "https://admin.scripe.org");
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    const lowerPath = parsed.pathname.toLowerCase();
    for (const prefix of BLOCKED_TELEMETRY_PATH_PREFIXES) {
      if (lowerPath === prefix.replace(/\/$/, "") || lowerPath.startsWith(prefix)) {
        return null;
      }
    }

    const redactedSegments = parsed.pathname.split("/").map((segment) => {
      if (!segment) return segment;
      if (UUID_SEGMENT_PATTERN.test(segment) || ENCRYPTED_ID_SEGMENT_PATTERN.test(segment)) {
        return "[id]";
      }
      return segment;
    });

    parsed.pathname = redactedSegments.join("/") || "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function handleAnalyticsBeforeSend(
  event: AnalyticsBeforeSendEvent
): AnalyticsBeforeSendEvent | null {
  const safeUrl = sanitizeTelemetryUrl(event.url);
  if (!safeUrl) {
    return null;
  }
  return { ...event, url: safeUrl };
}

/**
 * Privacy-preserving client wrapper around optional Vercel Analytics and Speed Insights.
 * Enforces explicit opt-in and strips query/fragment tokens and dynamic entity identifiers
 * before any event leaves the browser.
 */
export function TelemetryGate({
  enabledOverride,
}: {
  enabledOverride?: boolean;
}): React.ReactNode {
  const enabled = enabledOverride ?? isVercelTelemetryEnabled();
  if (!enabled) {
    return null;
  }

  return (
    <>
      <Analytics debug={false} beforeSend={handleAnalyticsBeforeSend} />
      <SpeedInsights
        debug={false}
        beforeSend={(event) => {
          const safeUrl = sanitizeTelemetryUrl(event.url);
          if (!safeUrl) {
            return null;
          }
          return { ...event, url: safeUrl };
        }}
      />
    </>
  );
}
