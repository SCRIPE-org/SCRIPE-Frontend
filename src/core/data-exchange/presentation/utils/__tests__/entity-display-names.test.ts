import { describe, expect, it } from "vitest";
import { getEntityDisplayName } from "../entity-display-names";
import type { DataExchangeDescriptorResponseDto } from "../../../domain/types";

describe("getEntityDisplayName", () => {
  const mockT = (key: string) => {
    const dict: Record<string, string> = {
      "dataExchange.entities.crm.lead": "Leads",
      "dataExchange.entities.crm.opportunity": "Opportunities",
      "dataExchange.entities.crm.account": "Accounts",
      "dataExchange.entities.party.person": "Persons",
    };
    return dict[key] || key;
  };

  const mockTAr = (key: string) => {
    const dict: Record<string, string> = {
      "dataExchange.entities.party.person": "الأفراد",
    };
    return dict[key] || key;
  };

  it("prefers descriptor display names when provided", () => {
    const descriptor: DataExchangeDescriptorResponseDto = {
      descriptor: {
        entityKey: "crm.lead",
        owningModule: "CRM",
        displayNameEn: "Custom Lead Name",
        displayNameAr: "اسم العميل المخصص",
        descriptionEn: "Lead entity",
        descriptionAr: "كيان العميل المحتمل",
        requiredFeatureKey: "CRM.Leads",
        moduleImportFeatureKey: "CRM.DataImport",
        requiredImportPermission: "CRM.Leads.Import",
        requiredExportPermission: "CRM.Leads.Export",
        requiredCreatePermission: "CRM.Leads.Create",
        requiredUpdatePermission: "CRM.Leads.Update",
        requiredViewPermission: "CRM.Leads.View",
        supportsBulkAutoCreateLookup: true,
        supportsIdentityOnboardingModes: false,
        supportedModes: ["Insert", "Upsert"],
        parentEntityKeys: [],
        columns: [],
      },
      isQuotaEnforced: false,
      quotaRemainingSlots: null,
      quotaMaxLimit: null,
      quotaUsed: null,
      quotaReserved: null,
      isImportFeatureEnabled: true,
      isExportFeatureEnabled: true,
      canImport: true,
      canExport: true,
      restrictedFieldKeys: [],
    };

    expect(getEntityDisplayName("crm.lead", mockT, false, descriptor)).toBe("Custom Lead Name");
    expect(getEntityDisplayName("crm.lead", mockT, true, descriptor)).toBe("اسم العميل المخصص");
  });

  it("falls back to localized translation or known entity mapping when descriptor is absent", () => {
    expect(getEntityDisplayName("crm.lead", mockT, false, null)).toBe("Leads");
    expect(getEntityDisplayName("crm.opportunity", mockT, false, null)).toBe("Opportunities");
    expect(getEntityDisplayName("party.person", mockT, false, null)).toBe("Persons");
    expect(getEntityDisplayName("party.person", mockTAr, true, null)).toBe("الأفراد");
  });

  it("cleans unmapped dotted key to readable capitalized name", () => {
    expect(getEntityDisplayName("sports.custom-athlete", mockT, false, null)).toBe("Custom Athlete");
  });
});
