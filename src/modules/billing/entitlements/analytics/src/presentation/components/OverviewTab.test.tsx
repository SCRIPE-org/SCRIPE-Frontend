import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsOverview } from "../../domain/entities/AnalyticsEntities";
import { OverviewTab } from "./OverviewTab";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.count !== undefined) return `${key}:${params.count}`;
      return key;
    },
    language: "en" as const,
    direction: "ltr" as const,
  }),
}));

describe("OverviewTab clarity and internal workspace exclusion notice", () => {
  it("clarifies +new (incl. trials) subtitle, renders internal exclusion notice, and balances the bottom row", () => {
    const overview = new AnalyticsOverview({
      totalMrr: 0,
      mrrChange: 0,
      mrrChangePercent: 0,
      totalArr: 0,
      totalRevenue: 0,
      activeSubscriptions: 5,
      newSubscriptions: 6,
      churnedSubscriptions: 0,
      trialSubscriptions: 1,
      trialConversionRate: 0,
      arpu: 0,
      netRevenueRetention: 100,
      grossRevenueRetention: 100,
      currency: "USD",
      periodStart: "2026-01-01T00:00:00Z",
      periodEnd: "2026-01-31T23:59:59Z",
    });
    render(<OverviewTab overview={overview} />);

    expect(screen.getByText("entitlements.analytics.kpi.newIncludingTrials:6")).toBeInTheDocument();
    const notice = screen.getByTestId("analytics-internal-exclusion-notice");
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveTextContent("entitlements.analytics.internalExclusionNotice");
  });
});
