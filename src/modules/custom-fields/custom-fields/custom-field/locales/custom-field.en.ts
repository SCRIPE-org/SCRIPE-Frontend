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
      isGlobal: "Global (all tenants)",
      validatorKind: "Validator",
      validatorParam: "Validator Parameter",
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

    // Validator picker — Wave 2 Step 2.5 Task 10. Admin-definition-form only
    // (D5); appears only for Text fields, mirroring the conditional
    // visibility the Options field above already uses for Select. The
    // closed 13-member set itself is ALL_VALIDATOR_KINDS/VALIDATOR_KIND_CATALOG
    // (validatorKindRegistry.ts, Task 8) — these keys are display text only,
    // not a second source of truth for which kinds exist.
    validatorKindNone: "No validator",
    validatorKindDescription:
      "Optional format check applied when this field is saved. Leave as \"No validator\" for a free-form Text field.",
    validatorKinds: {
      iban: "IBAN",
      egyptianNationalId: "Egyptian National ID",
      saudiNationalId: "Saudi National ID",
      emiratiNationalId: "Emirati ID (UAE)",
      imei: "IMEI",
      swiftBic: "SWIFT / BIC Code",
      vehiclePlate: "Vehicle Plate Number",
      postalCode: "Postal Code",
      numericRange: "Numeric Range",
      lengthRange: "Length Range",
      oneOfList: "One of a List",
      wildcardContains: "Contains Text",
      wildcardStartsWith: "Starts With Text",
    },
    // Per-kind hint shown next to the Validator Parameter input, for the 6
    // parameterized kinds only (validatorKindRegistry.ts's paramHintKey).
    validatorKindParamHints: {
      postalCode: "Select the country whose postal-code format this field should validate against.",
      numericRange:
        'Minimum and maximum allowed number, separated by a comma, e.g. "1,100". Leave either side blank for no limit on that end.',
      lengthRange:
        'Minimum and maximum allowed character length, separated by a comma, e.g. "2,50". Leave either side blank for no limit on that end.',
      oneOfList:
        "One allowed value per line. The saved value must match one of these exactly (case-sensitive).",
      wildcardContains: "The value must contain this text (case-sensitive).",
      wildcardStartsWith: "The value must start with this text (case-sensitive).",
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

    // Per-type value validation messages (currently Select-only). Added early
    // by Wave 2 Step 2.2 Task 4 (renderCustomFieldControl's Select branch,
    // D5's client-side option-membership check) rather than waiting for the
    // plan's own Task 10 -- Task 10 lands the rest of this step's i18n keys
    // and should extend this block, not recreate selectInvalidOption.
    values: {
      // {value}/{field} interpolation, matching this module's `{x}` convention
      // (never `{{x}}`). Wording mirrors the backend's own
      // customFields.values.selectInvalidOption (SelectValueTypeHandler.Validate)
      // so a user sees the same verdict client-side that a save would 422 with.
      selectInvalidOption: "'{value}' is not a valid option for {field}.",
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

    // Shown next to the create-time Global switch — only ever rendered for a
    // Super Admin (see isVisible on the field in both forms that offer it).
    isGlobalDescription: {
      platformContext: "No tenant is selected, so this definition is always global.",
      tenantContext:
        "Off scopes this field to the tenant you're currently viewing. On makes it available to every tenant.",
    },

    // Inline "+ Add custom field" trigger, opened from inside another
    // screen's create/edit form (not the /custom-fields definitions screen).
    inlineAdd: {
      trigger: "+ Add custom field",
      dialogTitle: "Add custom field — {entity}",
    },
  },
};
