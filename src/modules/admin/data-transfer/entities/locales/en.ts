/** English locale translations for Data Transfer Entities catalog sub-module. */
export const en = {
  dataTransferEntities: {
    title: "Data Exchange Entities",
    subtitle: "Read-only tenant catalog discovered dynamically from module providers, custom fields, and active edition quotas — launch Import Studio, Multi-Sheet Migrations, Templates, or Exports.",
    catalogInfo: "Entities and quotas are auto-discovered from registered backend providers, tenant Custom Fields, and Edition entitlements.",
    searchPlaceholder: "Search entities by key, name, or module...",
    filterModule: "All Modules",
    filters: {
      moduleLabel: "Module",
    },
    modules: {
      CRM: "CRM",
      Identity: "Identity & Access",
      PartyKernel: "Contacts & Parties",
      Academy: "Academy",
      Venue: "Venue & Facilities",
      Finance: "Finance",
      HRMS: "HRMS",
      WorkManagement: "Work Management",
    },
    kpi: {
      totalEntities: "Total Entities",
      importable: "Import Capable",
      exportable: "Export Capable",
      quotaConstrained: "Quota Protected",
    },
    columns: {
      entity: "Entity",
      owningModule: "Owning Module",
      supportedModes: "Supported Modes",
      quota: "Edition Quota",
      actions: "Actions",
    },
    quota: {
      unlimited: "Unlimited",
      slotsRemaining: "{remaining} of {limit} slots remaining",
      exhausted: "Quota Full",
    },
    modes: {
      Insert: "Insert",
      Update: "Update",
      Upsert: "Upsert",
    },
    capabilities: {
      importAndExport: "Import & Export",
      importOnly: "Import Only",
      exportOnly: "Export Only",
    },
    actions: {
      downloadTemplate: "Download Template",
      downloadingTemplate: "Downloading...",
      launchStudio: "Launch Import Studio",
      quickExport: "Export Data",
      multiSheetMigration: "Multi-Sheet Migration",
      viewDescriptor: "View Schema",
    },
    empty: {
      title: "No Exchange Entities Found",
      description: "No entities match the active search and module filters.",
      unfilteredTitle: "No Exchange Entities Available",
      unfilteredDescription:
        "No Data Exchange entities are currently enabled for this tenant workspace.",
    },
    error: {
      title: "Unable to load entities catalog",
      description: "An unexpected error occurred while fetching entity metadata and quotas.",
      templateDownloadFailed: "Failed to download template workbook.",
    },
    tenantRequired: {
      title: "Tenant Workspace Required",
      description: "Data Exchange entity descriptors, quotas, and templates are scoped to an active tenant workspace. Select a tenant before running imports or exports.",
      switchHint: "Use the Tenant Workspace switcher in the top header bar or click Select Tenant Workspace to enter a tenant context in place.",
      goToTenants: "Select Tenant Workspace",
      retry: "Check Context Again",
    },
    detail: {
      parentEntities: "Parent Dependencies",
      multiSheetGroup: "Multi-Sheet Bundle",
      autoCreateLookups: "Auto-Create Lookups",
      identityOnboarding: "Identity Onboarding",
      importEntitlement: "Import Feature",
      exportEntitlement: "Export Feature",
    },
  },
};
