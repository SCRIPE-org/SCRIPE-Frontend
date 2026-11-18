import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CrmWorkflowTransitionDialog } from "./CrmWorkflowTransitionDialog";
import type { EvaluatedWorkflowTransition } from "../../domain/constants/crmWorkflowRuleCatalogAndEval";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

vi.mock("../../../../di", () => ({
  getCrmContainer: () => ({
    overviewRepository: {
      searchEntities: vi.fn().mockResolvedValue([
        { id: "enc_party_1", partyId: "enc_party_1", kind: "party", label: "Al-Ahli Club", isVerified: true },
      ]),
      quickCreateEntity: vi.fn(),
    },
  }),
}));

function makeEvalResult(overrides: Partial<EvaluatedWorkflowTransition> = {}): EvaluatedWorkflowTransition {
  return {
    allowed: true,
    status: "allowed_screen_required",
    requiresScreen: true,
    requiresVerifiedParty: false,
    requiresFinancialForecast: true,
    requiresCloseNotes: false,
    requiresLossReason: false,
    requiresReopenReason: false,
    promptForComment: false,
    shouldTriggerDealConversion: false,
    triggerDealConversion: false,
    isBackward: false,
    requiredFields: ["estimatedAmount"],
    missingFields: ["estimatedAmount"],
    promptFields: [],
    matchedTransition: { id: "tr-1", nameEn: "Advance", nameAr: "تقدم" } as EvaluatedWorkflowTransition["matchedTransition"],
    matchedTransitions: [],
    ...overrides,
  };
}

describe("CrmWorkflowTransitionDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resets form values cleanly when switching between records so stale amounts never leak", async () => {
    const { rerender } = render(
      <CrmWorkflowTransitionDialog
        open
        onOpenChange={vi.fn()}
        entityType="deal"
        record={{ id: "deal-1", title: "Deal 1", estimatedAmount: 20000, currencyCode: "USD" }}
        fromStageKey="default.discovery"
        toStageKey="default.qualification"
        evalResult={makeEvalResult()}
        onSubmit={vi.fn()}
      />
    );

    const amountInputA = document.querySelector('input[name="estimatedAmount"]') as HTMLInputElement;
    expect(amountInputA.value).toBe("20000");

    rerender(
      <CrmWorkflowTransitionDialog
        open={false}
        onOpenChange={vi.fn()}
        entityType="deal"
        record={{ id: "deal-1", title: "Deal 1", estimatedAmount: 20000, currencyCode: "USD" }}
        fromStageKey="default.discovery"
        toStageKey="default.qualification"
        evalResult={makeEvalResult()}
        onSubmit={vi.fn()}
      />
    );

    rerender(
      <CrmWorkflowTransitionDialog
        open
        onOpenChange={vi.fn()}
        entityType="deal"
        record={{ id: "deal-2", title: "Deal 2", estimatedAmount: 5500, currencyCode: "SAR" }}
        fromStageKey="default.discovery"
        toStageKey="default.qualification"
        evalResult={makeEvalResult()}
        onSubmit={vi.fn()}
      />
    );

    await waitFor(() => {
      const amountInputB = document.querySelector('input[name="estimatedAmount"]') as HTMLInputElement;
      expect(amountInputB.value).toBe("5500");
    });
  });

  it("renders CrmEntitySearchSelect for partyId/contactId/accountId/ownerUserId and validates discount + custom:* gates", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(
      <CrmWorkflowTransitionDialog
        open
        onOpenChange={vi.fn()}
        entityType="deal"
        record={{ id: "deal-9", title: "Deal 9", estimatedAmount: 15000, currencyCode: "USD" }}
        fromStageKey="default.qualification"
        toStageKey="default.proposal"
        evalResult={makeEvalResult({
          requiresVerifiedParty: true,
          requiredFields: ["partyId", "contactId", "accountId", "ownerUserId", "discountPercent", "custom:legal_approved"],
          promptFields: ["nextStepSummary"],
        })}
        customFieldsCatalog={[
          { key: "legal_approved", labelEn: "Legal Approved", valueType: "Text", isRequired: true },
        ]}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByTestId("crm-transition-party-select")).toBeInTheDocument();
    expect(screen.getByTestId("crm-transition-contact-select")).toBeInTheDocument();
    expect(screen.getByTestId("crm-transition-account-select")).toBeInTheDocument();
    expect(screen.getByTestId("crm-transition-owner-select")).toBeInTheDocument();

    const discountInput = screen.getByTestId("crm-transition-discount-input") as HTMLInputElement;
    fireEvent.change(discountInput, { target: { value: "120" } });
    fireEvent.submit(discountInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Discount must be between 0 and 100%")).toBeInTheDocument();
      expect(screen.getByText("This custom field is required for this transition")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
