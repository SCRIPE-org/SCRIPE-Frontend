import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CrmCustomFieldsStudioCard } from "./CrmCustomFieldsStudioCard";
import type { CrmModuleSettingsState } from "../../stores/useCrmSettingsStore";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.label && params?.key) return `${key}:${params.label}:${params.key}`;
      return key;
    },
    language: "en",
  }),
}));

vi.mock("../../stores/useCrmWorkflowsStore", () => ({
  useCrmWorkflowsStore: (selector: (s: unknown) => unknown) =>
    selector({
      workflows: [
        {
          id: "wf-deal",
          entityType: "deal",
          stages: [
            { stageKey: "default.discovery", labelEn: "Discovery Live", labelAr: "استكشاف", category: "todo" },
            { stageKey: "default.proposal", labelEn: "Proposal Live", labelAr: "عرض", category: "in_progress" },
          ],
        },
        {
          id: "wf-lead",
          entityType: "lead",
          stages: [
            { stageKey: "lead.working", labelEn: "Working Live", labelAr: "قيد المتابعة", category: "in_progress" },
          ],
        },
      ],
    }),
}));

describe("CrmCustomFieldsStudioCard", () => {
  const mockSettings = {
    enableCatalogPricingQuoteHandoff: true,
    enableVenueAcademyCommercialHandoff: true,
    autoCreateWorkItemsOnStageMove: true,
    autoSyncPartyKernelOnConvert: true,
    crmCustomFields: [],
    updateSettings: vi.fn(),
    removeCrmCustomField: vi.fn(),
  } as unknown as CrmModuleSettingsState;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows BOTH Select options input AND stage gate selector for crm.opportunity with Select valueType and uses localized toast", async () => {
    const onCreateCustomField = vi.fn().mockResolvedValue({
      id: "cf-1",
      key: "deal_tier",
      labelEn: "Deal Tier",
      labelAr: "فئة الصفقة",
      valueType: "Select",
      entityTypeKey: "crm.opportunity",
      isRequired: false,
    });
    const onNotifySaved = vi.fn();

    render(
      <CrmCustomFieldsStudioCard
        settings={mockSettings}
        onCreateCustomField={onCreateCustomField}
        onNotifySaved={onNotifySaved}
      />
    );

    expect(screen.getByTestId("crm-cf-stage-gate-select")).toBeInTheDocument();
    expect(screen.queryByTestId("crm-cf-options-csv-input")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("crm-cf-type-select"));
    fireEvent.click(await screen.findByRole("option", { name: "crm.settings.integrations.typeSelect" }));

    expect(screen.getByTestId("crm-cf-options-csv-input")).toBeInTheDocument();
    expect(screen.getByTestId("crm-cf-stage-gate-select")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("crm-cf-key-input"), { target: { value: "deal_tier" } });
    fireEvent.change(screen.getByTestId("crm-cf-label-en-input"), { target: { value: "Deal Tier" } });
    fireEvent.change(screen.getByTestId("crm-cf-options-csv-input"), { target: { value: "Gold, Silver" } });

    fireEvent.click(screen.getByTestId("crm-cf-submit-btn"));

    await waitFor(() => {
      expect(onCreateCustomField).toHaveBeenCalledWith(
        expect.objectContaining({
          entityTypeKey: "crm.opportunity",
          valueType: "Select",
          optionsCsv: "Gold, Silver",
          defaultStageGateKey: "default.proposal",
        })
      );
      expect(onNotifySaved).toHaveBeenCalledWith("crm.settings.integrations.customFieldCreatedToast:Deal Tier:deal_tier");
    });
  });

  it("shows live stage gate selector when crm.lead entity is selected", async () => {
    render(
      <CrmCustomFieldsStudioCard
        settings={mockSettings}
        onCreateCustomField={vi.fn()}
        onNotifySaved={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("crm-cf-entity-select"));
    fireEvent.click(await screen.findByRole("option", { name: "crm.settings.integrations.entityLead" }));

    const stageGateSelect = screen.getByTestId("crm-cf-stage-gate-select");
    expect(stageGateSelect).toBeInTheDocument();
    fireEvent.click(stageGateSelect);
    expect(await screen.findByRole("option", { name: "Working Live" })).toBeInTheDocument();
  });
});
