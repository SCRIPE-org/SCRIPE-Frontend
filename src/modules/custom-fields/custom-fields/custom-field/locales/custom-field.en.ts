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
      options: "One option per line — Select fields only",
    },

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

    // Inline "+ Add custom field" trigger, opened from inside another
    // screen's create/edit form (not the /custom-fields definitions screen).
    inlineAdd: {
      trigger: "+ Add custom field",
      dialogTitle: "Add custom field — {entity}",
    },
  },
};
