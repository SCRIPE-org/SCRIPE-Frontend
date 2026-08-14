export const en = {
  customField: {
    title: "Custom Fields",
    description: "Define tenant-configurable custom fields for your records",
    addNew: "Add Custom Field",
    editTitle: "Edit Custom Field",
    deleteTitle: "Delete Custom Field",
    deleteConfirm: "Are you sure you want to delete this custom field?",
    noItems: "No custom fields found",
    searchPlaceholder: "Search custom fields...",
    entityTypesLoadFailed: "Couldn't load entity types. The Entity Type field may be unavailable.",

    // Field labels — shared between the table columns and the create/edit forms
    fields: {
      entityTypeKey: "Entity Type",
      key: "Key",
      labelEn: "Label (English)",
      labelAr: "Label (Arabic)",
      placeholderEn: "Placeholder (English)",
      placeholderAr: "Placeholder (Arabic)",
      valueType: "Value Type",
      options: "Options",
      isRequired: "Required",
      sortOrder: "Sort Order",
      isActive: "Active",
      scope: "Scope",
    },

    // Form placeholders
    placeholders: {
      entityTypeKey: "e.g. party.person",
      key: "e.g. shirt_size",
      labelEn: "Enter English label",
      labelAr: "Enter Arabic label",
      placeholderEn: "e.g. Enter your shirt size",
      placeholderAr: "e.g. أدخل مقاس القميص",
      options: "One option per line — Select fields only",
    },

    // Entity-type picker: grouped by whether a screen actually renders this
    // field yet. Screen-backed entries come first; the API-only group is
    // still selectable (the values API works for either), just labeled so
    // nobody defines a field expecting it to show up somewhere and it
    // silently doesn't.
    entityTypeGroups: {
      onScreen: "Available on a screen",
      apiOnly: "API only — no screen yet",
    },
    noFrontendScreenWarning:
      "No screen renders {entity} yet. This definition will save correctly and the values API will work for it, but it won't appear on any form until a screen is built for it.",

    // CustomFieldValueType enum (0..4)
    valueTypes: {
      text: "Text",
      number: "Number",
      boolean: "Boolean",
      date: "Date",
      select: "Select",
    },

    // Required / Optional flag
    required: "Required",
    optional: "Optional",

    // Platform-owned (TenantId == null) definition, inherited by every tenant
    global: "Global",

    // Shown on the definitions screen when a Super Admin has no tenant
    // context — the exact same form creates a GLOBAL definition here,
    // with no other visual difference from a tenant-scoped one.
    platformContext: {
      title: "Platform context — no tenant selected",
      description:
        "Any definition you create here is global: it's inherited by every tenant, not scoped to one. Drill into a tenant first if you meant to create a tenant-specific field.",
    },

    // Inline "+ Add custom field" trigger, opened from inside another
    // screen's create/edit form (not the /custom-fields definitions screen).
    inlineAdd: {
      trigger: "+ Add custom field",
      dialogTitle: "Add custom field — {entity}",
    },
  },
};
