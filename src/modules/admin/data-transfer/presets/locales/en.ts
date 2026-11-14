/**
 * English translations for data exchange presets sub-module.
 */
export const en = {
  adminDataTransferPresets: {
    title: "Saved Mapping Presets",
    subtitle: "Enterprise column mapping templates persisted across tenant import workflows for repeatable automated data intake.",
    searchPlaceholder: "Search presets by name, entity, or mode...",
    empty: {
      title: "No mapping presets found",
      description: "No saved presets match the current filter criteria.",
    },
    kpis: {
      totalPresets: "Total Presets",
      defaultPresets: "Default Templates",
      entitiesCovered: "Entities Covered",
      totalMappings: "Total Field Mappings",
    },
    columns: {
      name: "Preset Name",
      entityKey: "Target Entity",
      importMode: "Import Mode",
      mappingsCount: "Mapped Columns",
      isDefault: "Default",
      createdAt: "Created",
      actions: "Actions",
    },
    columnsCount: "{count} columns",
    modes: {
      Insert: "Insert",
      Update: "Update",
      Upsert: "Upsert",
      AppendOnly: "Append Only",
      UpdateOnly: "Update Only",
    },
    actions: {
      delete: "Delete Preset",
      deletePrompt: "Are you sure you want to delete this preset?",
      refresh: "Refresh Presets",
      createInStudio: "Create Preset in Studio",
      useInStudio: "Use Preset in Import Studio",
      setDefault: "Set as Default",
    },
    toast: {
      setDefaultSuccess: "Mapping preset set as default successfully.",
      setDefaultError: "Failed to set mapping preset as default.",
      deleteSuccess: "Mapping preset deleted successfully.",
      deleteError: "Failed to delete mapping preset.",
    },
    deleteDialog: {
      title: "Delete Mapping Preset",
      description: "Are you sure you want to delete preset \"{name}\"? Users will need to manually map columns for future imports of {entityKey}.",
      confirm: "Delete Preset",
      deleting: "Deleting preset...",
      success: "Preset deleted successfully.",
      error: "Failed to delete preset.",
    },
    status: {
      isDefaultBadge: "Default",
      customBadge: "Custom",
    },
    tenantRequired: {
      title: "Tenant Workspace Required",
      description: "Saved column mapping presets belong to an active tenant workspace. Select or impersonate a tenant before managing presets.",
      switchHint: "Use the Tenant Workspace switcher in the top header bar or open Tenants to switch into a tenant workspace.",
      goToTenants: "Go to Tenants",
      retry: "Check Context Again",
    },
  },
};
