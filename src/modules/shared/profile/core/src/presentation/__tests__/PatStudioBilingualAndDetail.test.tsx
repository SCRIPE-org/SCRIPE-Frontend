import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mapIntegrationsSlice } from "../../data/mappers/SovereignAccountIntegrationsMapper";
import { PatPermissionStudioCard } from "../sections/integrations/PatPermissionStudioCard";
import { PatOneTimeSecretBanner } from "../sections/integrations/PatOneTimeSecretBanner";
import type { PatScopeOption } from "../viewmodels/useIntegrationsFederationViewModel";

let mockLanguage = "en";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    direction: mockLanguage === "ar" ? ("rtl" as const) : ("ltr" as const),
    language: mockLanguage,
    isRtl: mockLanguage === "ar",
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    theme: "dark",
    inputStyle: "default",
    switchStyle: "default",
    compactMode: false,
  }),
}));

const sampleCatalog: PatScopeOption[] = [
  {
    code: "analytics-events.view",
    displayName: "View Analytics Events",
    nameEn: "View Analytics Events",
    nameAr: "عرض أحداث التحليلات",
    descriptionEn: "View recorded metric streams and daily operational projections.",
    descriptionAr: "عرض تدفق أحداث القياس المسجلة وإسقاطها التشغيلي اليومي.",
    moduleKey: "Analytics",
    category: "Analytics Management",
    resource: "analytics-events",
    action: "view",
    isPlatformOnly: false,
  },
  {
    code: "catalog-pricing.publish-offering.manage",
    displayName: "Publish Offering",
    nameEn: "Publish Offering",
    nameAr: "نشر العرض",
    descriptionEn: "Publish an offering, making it purchasable.",
    descriptionAr: "نشر عرض، مما يجعله قابلاً للشراء.",
    moduleKey: "CatalogPricing",
    category: "CatalogPricing Management",
    resource: "catalog-pricing.publish-offering",
    action: "manage",
    isPlatformOnly: false,
  },
];

describe("GitHub+ Bilingual PAT Studio & Mapper", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it("maps scopeCatalog bilingual fields, token description, scopeDetails, and rowVersion cleanly", () => {
    const slice = mapIntegrationsSlice({
      availableScopes: ["analytics-events.view"],
      scopeCatalog: [
        {
          code: "analytics-events.view",
          displayName: "View Analytics Events",
          nameEn: "View Analytics Events",
          nameAr: "عرض أحداث التحليلات",
          descriptionEn: "View streams.",
          descriptionAr: "عرض التدفق.",
          moduleKey: "Analytics",
          category: "Analytics Management",
          resource: "analytics-events",
          action: "view",
          isPlatformOnly: false,
        },
      ],
      personalAccessTokens: [
        {
          id: "pat-1",
          name: "BI Exporter",
          description: "Nightly warehouse sync",
          tokenPrefix: "scr_pat_abc",
          scopes: ["analytics-events.view"],
          createdAtUtc: "2026-11-16T10:00:00Z",
          expiresAtUtc: "2027-02-14T10:00:00Z",
          rowVersion: "AQID",
        },
      ],
    });

    expect(slice.scopeCatalog).toHaveLength(1);
    expect(slice.scopeCatalog[0].nameAr).toBe("عرض أحداث التحليلات");
    expect(slice.personalAccessTokens[0].description).toBe("Nightly warehouse sync");
    expect(slice.personalAccessTokens[0].scopeDetails?.[0].nameAr).toBe("عرض أحداث التحليلات");
    expect(slice.personalAccessTokens[0].rowVersion).toBe("AQID");
  });

  it("renders localized EN/AR scope names and descriptions instead of truncated raw keys", () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    const onChange = vi.fn();

    const { rerender } = render(
      <PatPermissionStudioCard
        t={t}
        language="en"
        scopeCatalog={sampleCatalog}
        selectedScopes={["analytics-events.view"]}
        onChangeSelectedScopes={onChange}
      />
    );

    expect(screen.getByText("View Analytics Events")).toBeInTheDocument();
    expect(
      screen.getByText("View recorded metric streams and daily operational projections.")
    ).toBeInTheDocument();
    expect(screen.queryByText("analytics-events.view")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("pat-toggle-technical-keys"));
    expect(screen.getByText("analytics-events.view")).toBeInTheDocument();

    rerender(
      <PatPermissionStudioCard
        t={t}
        language="ar"
        scopeCatalog={sampleCatalog}
        selectedScopes={["analytics-events.view"]}
        onChangeSelectedScopes={onChange}
      />
    );

    expect(screen.getByText("عرض أحداث التحليلات")).toBeInTheDocument();
    expect(
      screen.getByText("عرض تدفق أحداث القياس المسجلة وإسقاطها التشغيلي اليومي.")
    ).toBeInTheDocument();
  });

  it("supports inline GitHub-style one-time secret reveal, mask toggle, copy, and dismiss", () => {
    const t = (key: string) => key;
    const onDismiss = vi.fn();

    render(
      <PatOneTimeSecretBanner
        t={t}
        receipt={{
          tokenId: "pat-99",
          tokenName: "Warehouse Sync",
          plainTextSecret: "scr_pat_live_1234567890abcdef",
          fingerprintOrPrefix: "scr_pat_live_12...",
          isRotated: false,
        }}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByTestId("one-time-pat-secret-value")).toHaveTextContent(
      "scr_pat_live_1234567890abcdef"
    );
    fireEvent.click(screen.getByTestId("dismiss-pat-secret-btn"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
