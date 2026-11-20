import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mapIntegrationsSlice } from "../../data/mappers/SovereignAccountIntegrationsMapper";
import { PatPermissionStudioCard } from "../sections/integrations/PatPermissionStudioCard";
import { PatPermissionRow } from "../sections/integrations/PatPermissionRow";
import { PatScopeBadgeWithInspector } from "../sections/integrations/PatScopeBadgeWithInspector";
import { PatConsoleListSection } from "../sections/integrations/PatConsoleListSection";
import { PatDetailReadonlyPanel } from "../sections/integrations/PatDetailReadonlyPanel";
import { PatOneTimeSecretBanner } from "../sections/integrations/PatOneTimeSecretBanner";
import type {
  PatScopeOption,
  PersonalAccessToken,
} from "../viewmodels/useIntegrationsFederationViewModel";

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

  it("never opens inspector on permission card hover, previews only on (i) hover, and pins on (i) click until outside click, Escape, or re-click", async () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    const onToggle = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const { container } = render(
      <div>
        <div data-testid="outside-surface">Outside Surface</div>
        <PatPermissionRow
          t={t}
          language="en"
          scope={sampleCatalog[0]}
          selected={false}
          showTechnicalKeys={false}
          onToggle={onToggle}
        />
      </div>
    );

    expect(container.querySelectorAll("button button")).toHaveLength(0);

    const card = screen.getByTestId("pat-scope-row-analytics-events.view");
    expect(card.className).toContain("hover:border-nx-line-hi");

    // Hovering the permission card or its label text MUST NOT open any inspector/tooltip
    fireEvent.mouseEnter(card);
    fireEvent.mouseOver(card);
    fireEvent.mouseEnter(screen.getByText("View Analytics Events"));
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();
    expect(screen.queryByText("analytics-events.view")).not.toBeInTheDocument();
    fireEvent.mouseLeave(card);

    // Clicking permission label toggles checkbox cleanly; clicking (i) does not toggle
    fireEvent.click(screen.getByText("View Analytics Events"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    onToggle.mockClear();

    // Hovering the (i) trigger opens temporary preview; moving cursor onto PopoverContent keeps it open, and leaving closes after grace timer
    const infoBtn = screen.getByTestId("pat-scope-info-btn-analytics-events.view");
    fireEvent.mouseEnter(infoBtn);
    const preview = screen.getByTestId("pat-scope-inspector-analytics-events.view");
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute("data-pinned", "false");
    expect(preview).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("analytics-events.view")).toBeInTheDocument();

    fireEvent.mouseLeave(infoBtn);
    fireEvent.mouseEnter(preview);
    await new Promise((r) => setTimeout(r, 170));
    expect(screen.getByTestId("pat-scope-inspector-analytics-events.view")).toBeInTheDocument();

    fireEvent.mouseLeave(preview);
    await waitFor(() =>
      expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument()
    );

    // Hovering then clicking (i) pins inspector open even after mouseleave + grace period; copy works without closing or toggling row
    fireEvent.mouseEnter(infoBtn);
    fireEvent.click(infoBtn);
    fireEvent.mouseLeave(infoBtn);
    await new Promise((r) => setTimeout(r, 170));
    expect(onToggle).not.toHaveBeenCalled();

    const pinned = screen.getByTestId("pat-scope-inspector-analytics-events.view");
    expect(pinned).toBeInTheDocument();
    expect(pinned).toHaveAttribute("data-pinned", "true");

    fireEvent.click(screen.getByTestId("pat-scope-copy-key-analytics-events.view"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("analytics-events.view"));
    expect(screen.getByTestId("pat-scope-inspector-analytics-events.view")).toBeInTheDocument();

    // Outside click dismisses the pinned inspector
    const outside = screen.getByTestId("outside-surface");
    fireEvent.pointerDown(outside);
    fireEvent.click(outside);
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();

    // Re-pin via direct click, then verify Escape closes
    fireEvent.click(infoBtn);
    expect(screen.getByTestId("pat-scope-inspector-analytics-events.view")).toHaveAttribute(
      "data-pinned",
      "true"
    );
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();

    // Re-pin via click, then verify clicking (i) again closes immediately even while hovering
    fireEvent.mouseEnter(infoBtn);
    fireEvent.click(infoBtn);
    expect(screen.getByTestId("pat-scope-inspector-analytics-events.view")).toHaveAttribute(
      "data-pinned",
      "true"
    );
    fireEvent.click(infoBtn);
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();
  });

  it("opens scope pill inspector in PatConsoleListSection only via (i) trigger without nested buttons", async () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;

    const token: PersonalAccessToken = {
      id: "pat-42",
      name: "Analytics Sync",
      description: "Read-only analytics feed",
      prefix: "scr_pat_live",
      scopes: ["analytics-events.view"],
      scopeDetails: [sampleCatalog[0]],
      allowedCidrs: [],
      createdAt: new Date("2026-11-16T10:00:00Z"),
      expiresAt: new Date("2027-02-14T10:00:00Z"),
      lastUsedAt: null,
      rateLimitPerMinute: 120,
      rowVersion: "AQID",
    };

    const { container } = render(
      <div>
        <div data-testid="list-outside-area">Outside List</div>
        <PatConsoleListSection
          t={t}
          personalTokens={[token]}
          scopeCatalog={sampleCatalog}
          patQuota={{ activeCount: 1, maxLimit: 10, isUnlimited: false, remaining: 9, isEnabled: true }}
          isRollingToken={false}
          isRevokingToken={false}
          onOpenCreate={vi.fn()}
          onRequestRoll={vi.fn()}
          onRequestRevoke={vi.fn()}
        />
      </div>
    );

    expect(container.querySelectorAll("button button")).toHaveLength(0);

    const pill = screen.getByTestId("pat-scope-pill-analytics-events.view");
    expect(pill.tagName).not.toBe("BUTTON");
    expect(pill.className).toContain("hover:border-nx-line-hi");

    // Hovering pill itself does NOT open inspector
    fireEvent.mouseEnter(pill);
    fireEvent.mouseOver(pill);
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();

    // Hovering (i) inside pill opens preview and mouseleave closes after grace timer
    const pillInfoBtn = screen.getByTestId("pat-scope-pill-info-analytics-events.view");
    fireEvent.mouseEnter(pillInfoBtn);
    expect(screen.getByTestId("pat-scope-inspector-analytics-events.view")).toBeInTheDocument();
    fireEvent.mouseLeave(pillInfoBtn);
    await waitFor(() =>
      expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument()
    );

    // Clicking (i) inside pill pins open across mouseleave and closes on outside click
    fireEvent.click(pillInfoBtn);
    fireEvent.mouseLeave(pillInfoBtn);
    await new Promise((r) => setTimeout(r, 170));
    expect(screen.getByTestId("pat-scope-inspector-analytics-events.view")).toHaveAttribute(
      "data-pinned",
      "true"
    );

    fireEvent.click(screen.getByTestId("list-outside-area"));
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();
  });

  it("renders PatScopeBadgeWithInspector and PatDetailReadonlyPanel with RTL Arabic inspector support and pin/dismiss UX", async () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;

    const token: PersonalAccessToken = {
      id: "pat-77",
      name: "AR Telemetry",
      description: null,
      prefix: "scr_pat_ar",
      scopes: ["analytics-events.view"],
      scopeDetails: [sampleCatalog[0]],
      allowedCidrs: [],
      createdAt: new Date("2026-11-16T10:00:00Z"),
      expiresAt: new Date("2027-02-14T10:00:00Z"),
      lastUsedAt: null,
      rateLimitPerMinute: 60,
      rowVersion: "AQID",
    };

    const { container } = render(
      <div dir="rtl">
        <div data-testid="detail-outside-area">خارج</div>
        <PatScopeBadgeWithInspector scope={sampleCatalog[0]} language="ar" t={t} />
        <PatDetailReadonlyPanel
          t={t}
          language="ar"
          token={token}
          fallbackCatalog={sampleCatalog}
        />
      </div>
    );

    expect(container.querySelectorAll("button button")).toHaveLength(0);

    const detailRow = screen.getByTestId("pat-detail-scope-row-analytics-events.view");
    expect(detailRow.className).toContain("hover:border-nx-line-hi");
    fireEvent.mouseEnter(detailRow);
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();

    const detailInfoBtn = screen.getByTestId("pat-detail-scope-info-analytics-events.view");
    fireEvent.mouseEnter(detailInfoBtn);
    const rtlInspector = screen.getByTestId("pat-scope-inspector-analytics-events.view");
    expect(rtlInspector).toHaveAttribute("dir", "rtl");
    expect(rtlInspector).toHaveTextContent("عرض أحداث التحليلات");

    fireEvent.click(detailInfoBtn);
    fireEvent.mouseLeave(detailInfoBtn);
    await new Promise((r) => setTimeout(r, 170));
    expect(screen.getByTestId("pat-scope-inspector-analytics-events.view")).toHaveAttribute(
      "data-pinned",
      "true"
    );

    fireEvent.click(screen.getByTestId("detail-outside-area"));
    expect(screen.queryByTestId("pat-scope-inspector-analytics-events.view")).not.toBeInTheDocument();
  });
});
