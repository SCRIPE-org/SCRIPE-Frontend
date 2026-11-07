import { describe, expect, it } from "vitest";
import { allModulesAr, allModulesEn } from "@core/locales/module-registry";

describe("i18n — CRM namespaces resolution", () => {
  it("eagerly registers the English CRM locales across all sub-modules", () => {
    expect(allModulesEn).toHaveProperty("crm.title", "SCRIPE CRM");
    expect(allModulesEn).toHaveProperty("crmLeads.title", "Leads Management");
    expect(allModulesEn).toHaveProperty("crmOpportunities.title", "Opportunities & Deals");
    expect(allModulesEn).toHaveProperty("crmAccounts.title", "Commercial Accounts 360");
    expect(allModulesEn).toHaveProperty("crmContacts.title", "Commercial Contacts & Context");
    expect(allModulesEn).toHaveProperty("crmActivities.title", "Sales Activities & Execution Desk");
  });

  it("eagerly registers the Arabic CRM locales across all sub-modules", () => {
    expect(allModulesAr).toHaveProperty("crm.title");
    expect(allModulesAr).toHaveProperty("crmLeads.title");
    expect(allModulesAr).toHaveProperty("crmOpportunities.title");
    expect(allModulesAr).toHaveProperty("crmAccounts.title");
    expect(allModulesAr).toHaveProperty("crmContacts.title");
    expect(allModulesAr).toHaveProperty("crmActivities.title");
  });
});
