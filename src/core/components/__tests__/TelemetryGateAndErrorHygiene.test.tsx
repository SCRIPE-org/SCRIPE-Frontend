import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const capturedAnalyticsProps: Array<Record<string, unknown>> = [];
const capturedSpeedInsightsProps: Array<Record<string, unknown>> = [];

vi.mock("@vercel/analytics/next", () => ({
  Analytics: (props: Record<string, unknown>) => {
    capturedAnalyticsProps.push(props);
    return null;
  },
}));

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: (props: Record<string, unknown>) => {
    capturedSpeedInsightsProps.push(props);
    return null;
  },
}));

import {
  TelemetryGate,
  isVercelTelemetryEnabled,
  sanitizeTelemetryUrl,
} from "../TelemetryGate";
import { ErrorHandler, MAX_ERROR_LOG_ENTRIES } from "../../common/error-handler";

describe("TelemetryGate & Client Error Hygiene", () => {
  beforeEach(() => {
    capturedAnalyticsProps.length = 0;
    capturedSpeedInsightsProps.length = 0;
  });

  it("requires explicit opt-in and does not activate on VERCEL=1 alone", () => {
    expect(isVercelTelemetryEnabled(undefined)).toBe(false);
    expect(isVercelTelemetryEnabled("false")).toBe(false);
    expect(isVercelTelemetryEnabled("1")).toBe(false);
    expect(isVercelTelemetryEnabled("true")).toBe(true);

    render(<TelemetryGate enabledOverride={false} />);
    expect(capturedAnalyticsProps).toHaveLength(0);
    expect(capturedSpeedInsightsProps).toHaveLength(0);
  });

  it("drops sensitive auth, recovery, setup, and SSO callback routes from telemetry", () => {
    expect(sanitizeTelemetryUrl("https://ahly.admin.scripe.org/reset-password?token=sec_123&email=a@b.com")).toBeNull();
    expect(sanitizeTelemetryUrl("https://admin.scripe.org/forgot-password?_rsc=abc")).toBeNull();
    expect(sanitizeTelemetryUrl("https://admin.scripe.org/verify-email?token=tok_99")).toBeNull();
    expect(sanitizeTelemetryUrl("https://admin.scripe.org/setup-account?token=setup_99")).toBeNull();
    expect(sanitizeTelemetryUrl("https://admin.scripe.org/sso/callback?code=c1&state=s1")).toBeNull();
    expect(sanitizeTelemetryUrl("https://admin.scripe.org/sso/saml/callback?error=locked")).toBeNull();
    expect(sanitizeTelemetryUrl("https://auth.scripe.org/oidc/login?returnUrl=/hub")).toBeNull();
    expect(sanitizeTelemetryUrl("https://auth.scripe.org/connect/authorize?client_id=x")).toBeNull();
  });

  it("strips query strings, fragments, and encrypted or UUID path segments on allowed routes", () => {
    const cleanedEncrypted = sanitizeTelemetryUrl(
      "https://ahly.admin.scripe.org/crm/leads/S6qH0UNp2siBpuG_ks3TnNELyZSl5wK_aplf7mMnOvK?tab=notes&token=leak#frag"
    );
    expect(cleanedEncrypted).toBe("https://ahly.admin.scripe.org/crm/leads/[id]");

    const cleanedUuid = sanitizeTelemetryUrl(
      "https://admin.scripe.org/invoices/550e8400-e29b-41d4-a716-446655440000?download=1#secret"
    );
    expect(cleanedUuid).toBe("https://admin.scripe.org/invoices/[id]");
  });

  it("wires beforeSend with debug=false on both Analytics and SpeedInsights when opted in", () => {
    render(<TelemetryGate enabledOverride={true} />);
    expect(capturedAnalyticsProps).toHaveLength(1);
    expect(capturedSpeedInsightsProps).toHaveLength(1);
    expect(capturedAnalyticsProps[0].debug).toBe(false);
    expect(capturedSpeedInsightsProps[0].debug).toBe(false);

    const analyticsBeforeSend = capturedAnalyticsProps[0].beforeSend as (
      e: { type: "pageview"; url: string }
    ) => { type: "pageview"; url: string } | null;
    expect(
      analyticsBeforeSend({
        type: "pageview",
        url: "https://admin.scripe.org/reset-password?token=secret",
      })
    ).toBeNull();
    expect(
      analyticsBeforeSend({
        type: "pageview",
        url: "https://admin.scripe.org/overview?handoff_token=abc#hash",
      })
    ).toEqual({
      type: "pageview",
      url: "https://admin.scripe.org/overview",
    });
  });

  it("caps in-memory ErrorHandler ring buffer, redacts query/Bearer tokens, and clears on logout", () => {
    const handler = new ErrorHandler({
      enableLogging: false,
      enableErrorReporting: false,
    });

    for (let i = 0; i < MAX_ERROR_LOG_ENTRIES + 15; i++) {
      handler.handleError(
        new Error(`Request failed https://api.scripe.org/x?token=tok_${i}&email=u@d.com with Bearer eyJ.sec.${i}`)
      );
    }

    const recent = handler.getRecentErrors(100);
    expect(recent).toHaveLength(MAX_ERROR_LOG_ENTRIES);
    expect(recent[recent.length - 1].message).toContain("token=[REDACTED]");
    expect(recent[recent.length - 1].message).toContain("email=[REDACTED]");
    expect(recent[recent.length - 1].message).toContain("Bearer [REDACTED]");
    expect(recent[recent.length - 1].message).not.toContain("eyJ.sec.");

    window.dispatchEvent(new Event("scripe:auth-logout"));
    expect(handler.getRecentErrors(10)).toHaveLength(0);
  });
});
