/**
 * Compliance — Inventory sub-module locale (English)
 */
export const en = {
  compliance: {
    dataInventory: "Data Inventory",
    dataInventoryDesc: "Manage and track data fields across all platform modules.",
    module: "Module",
    entity: "Entity",
    field: "Field",
    dataCategory: "Category",
    legalBasis: "Legal Basis",
    isAnonymized: "Anonymized on Erasure",
    isExported: "Included in Export",
    total: "total",
    categories: {
      ContactData: "Contact Data",
      IdentityData: "Identity Data",
      FinancialData: "Financial Data",
      TechnicalData: "Technical Data",
      OrganisationData: "Organisation Data",
      ContentData: "Content Data",
      // Database value aliases
      Contact: "Contact Data",
      Profile: "Profile Data",
      Identity: "Identity Data",
      Financial: "Financial Data",
      Security: "Security Data",
      Organisation: "Organisation Data",
      Content: "Content Data",
      Behavioral: "Behavioral Data",
      Technical: "Technical Data",
    },
    // New keys for GenericCrudView and modals
    addInventory: "Add Inventory",
    inventoryAdded: "Inventory added successfully",
    inventoryUpdated: "Inventory updated successfully",
    inventoryDeleted: "Inventory deleted successfully",
    inventoryAddFailed: "Failed to add inventory",
    requiredFieldsMissing: "Required fields missing",
    placeholders: {
      moduleName: "e.g., Identity",
      entityName: "e.g., User",
      fieldName: "e.g., EmailAddress",
      selectCategory: "Select category",
      selectLegalBasis: "Select legal basis",
    },
    legalBases: {
      Consent: "Consent",
      Contract: "Contract",
      LegalObligation: "Legal Obligation",
      VitalInterests: "Vital Interests",
      PublicTask: "Public Task",
      LegitimateInterest: "Legitimate Interest",
      // Database value aliases (lowercase/snake_case)
      consent: "Consent",
      contract: "Contract",
      legal_obligation: "Legal Obligation",
      vital_interests: "Vital Interests",
      public_task: "Public Task",
      legitimate_interest: "Legitimate Interest",
    },
    // Empty states
    noInventory: "No data inventory items",
    noInventoryDesc: "No matching fields found. Try adjusting your search.",
  },
};
