import { describe, expect, it } from "vitest";
import { INITIAL_CRM_WORKFLOWS } from "./crmWorkflowInitialCatalog";
import { evaluateWorkflowTransition } from "./crmWorkflowEngine";
import { makeWorkflowTransition } from "./crmWorkflowRuleCatalogAndEval";

describe("crmWorkflowEngine 18-Rule Frontend-Backend Parity", () => {
  const dealWorkflow = INITIAL_CRM_WORKFLOWS.find((w) => w.entityType === "deal")!;

  it("evaluates restrict.field_value conditions matching UniversalWorkflowEngine semantics", () => {
    const wf = {
      ...dealWorkflow,
      transitions: [
        makeWorkflowTransition("tr-fv", "default.discovery", "default.qualification", "forward", "Qualify", "تأهيل", {
          catalogRules: [
            {
              id: "r-fv",
              category: "restrict",
              ruleTypeKey: "restrict.field_value",
              titleEn: "Min Deal 50k",
              titleAr: "الحد الأدنى 50 ألف",
              config: { fieldKey: "estimatedAmount", operator: "greater_or_equal", value: "50000" },
            },
          ],
        }),
      ],
    };

    const blocked = evaluateWorkflowTransition(wf, "default.discovery", "default.qualification", {
      estimatedAmount: 10000,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.status).toBe("blocked");
    expect(blocked.reason).toContain("estimatedAmount");

    const allowed = evaluateWorkflowTransition(wf, "default.discovery", "default.qualification", {
      estimatedAmount: 75000,
    });
    expect(allowed.allowed).toBe(true);
  });

  it("evaluates restrict.roles_permissions and requiredPermission when permissions/roles are present", () => {
    const wf = {
      ...dealWorkflow,
      transitions: [
        makeWorkflowTransition("tr-rp", "default.discovery", "default.qualification", "forward", "Approve", "اعتماد", {
          catalogRules: [
            {
              id: "r-rp",
              category: "restrict",
              ruleTypeKey: "restrict.roles_permissions",
              titleEn: "Manager Only",
              titleAr: "المدير فقط",
              config: { principals: "role:sales_manager", permissions: "crm.opportunities.approve", quorum: "any" },
            },
          ],
        }),
      ],
    };

    const blocked = evaluateWorkflowTransition(wf, "default.discovery", "default.qualification", {
      userRoles: ["sales_rep"],
      permissions: ["crm.opportunities.read"],
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.status).toBe("blocked");

    const allowed = evaluateWorkflowTransition(wf, "default.discovery", "default.qualification", {
      userRoles: ["sales_manager"],
      permissions: [],
    });
    expect(allowed.allowed).toBe(true);
  });

  it("evaluates validate.active_quote and validate.financial_forecast minAmount + future date", () => {
    const wf = {
      ...dealWorkflow,
      transitions: [
        makeWorkflowTransition("tr-vq", "default.proposal", "default.negotiation", "forward", "Negotiate", "تفاوض", {
          catalogRules: [
            { id: "r-aq", category: "validate", ruleTypeKey: "validate.active_quote", titleEn: "Active Quote", titleAr: "عرض سعر نشط" },
            {
              id: "r-ff",
              category: "validate",
              ruleTypeKey: "validate.financial_forecast",
              titleEn: "Forecast",
              titleAr: "توقع مالي",
              config: { minAmount: "10000" },
            },
          ],
        }),
      ],
    };

    const missingQuote = evaluateWorkflowTransition(wf, "default.proposal", "default.negotiation", {
      estimatedAmount: 50000,
      targetCloseDate: "2027-01-15",
      hasActiveQuote: false,
    });
    expect(missingQuote.allowed).toBe(false);
    expect(missingQuote.requiredFields).toContain("activeQuote");

    const belowMinAndPastDate = evaluateWorkflowTransition(wf, "default.proposal", "default.negotiation", {
      estimatedAmount: 5000,
      targetCloseDate: "2020-01-01",
      hasActiveQuote: true,
    });
    expect(belowMinAndPastDate.allowed).toBe(true);
    expect(belowMinAndPastDate.status).toBe("allowed_screen_required");
    expect(belowMinAndPastDate.requiredFields).toContain("estimatedAmount");
    expect(belowMinAndPastDate.requiredFields).toContain("targetCloseDate");
  });
});
