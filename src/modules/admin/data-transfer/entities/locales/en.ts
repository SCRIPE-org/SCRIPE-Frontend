/** English locale translations for Data Transfer Entities catalog sub-module. */
export const en = {
  dataTransferEntities: {
    title: "Data Exchange Entities",
    subtitle: "Enterprise spreadsheet import/export capabilities, template generation, and quota limits",
    searchPlaceholder: "Search entities by key, name, or module...",
    filterModule: "All Modules",
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
    },
    tenantRequired: {
      title: "Tenant Workspace Required",
      description: "Data Exchange entity descriptors, quotas, and templates are scoped to an active tenant workspace. Select a tenant before running imports or exports.",
      switchHint: "Use the Tenant Workspace switcher in the top header bar or open Tenants to enter and manage a club workspace.",
      goToTenants: "Go to Tenants",
      retry: "Check Context Again",
    },
  },
};
