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
    // Shown when the detail fetch behind the Edit button fails. The edit form
    // is deliberately NOT opened in that case: it would be populated from the
    // list row, whose response omits options, both placeholders and the
    // validator, and saving it would silently erase all of them.
    editLoadFailed: "Couldn't load this custom field for editing. Please try again.",

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

    // CustomFieldValueType enum (0..7) -- Wave 3.1 Task 10 adds longText/
    // dateTime/multiSelect (LongText=5, DateTime=6, MultiSelect=7).
    valueTypes: {
      text: "Text",
      number: "Number",
      boolean: "Boolean",
      date: "Date",
      select: "Select",
      longText: "Long Text",
      dateTime: "Date & Time",
      multiSelect: "Multi-Select",
    },

    // Per-type value validation messages. Added early by Wave 2 Step 2.2 Task
    // 4 (renderCustomFieldControl's Select branch, D5's client-side
    // option-membership check) -- Wave 3.1 Task 11 extends this block for
    // MultiSelect rather than recreating selectInvalidOption, exactly as this
    // comment originally asked of whichever task extended it next.
    values: {
      // {value}/{field} interpolation, matching this module's `{x}` convention
      // (never `{{x}}`). Wording mirrors the backend's own
      // customFields.values.selectInvalidOption (SelectValueTypeHandler.Validate)
      // so a user sees the same verdict client-side that a save would 422 with.
      // Reused verbatim by MultiSelect's own membership check (Task 11) --
      // "not one of the allowed options" is the same concept for both types.
      selectInvalidOption: "'{value}' is not a valid option for {field}.",
      // Mirrors the backend's customFields.values.multiSelectTooManySelections
      // (MultiSelectValueTypeHandler.Validate) -- shown client-side before a
      // save ever hits the 422 for the same reason.
      multiSelectTooManySelections: "{field} allows at most {max} selected options.",
      // Mirrors customFields.values.multiSelectDuplicateOption. A MultiSelect
      // value is a set, not a multiset -- selecting the same option twice is
      // rejected the same way on both tiers.
      multiSelectDuplicateOption: "'{value}' was selected more than once for {field}.",
    },

    // MultiSelect's live selection counter/ceiling hint (Wave 3.1 Task 11) --
    // rendered below the control by MultiSelectCustomFieldControl.tsx, never
    // a validation error: this is UI copy, not a rejected-save message (that
    // is the `values` block above).
    multiSelect: {
      selectionCount: "{count} of {max} selected",
      maxSelectionsReached: "Maximum of {max} selected — remove one to add another.",
    },

    // LongText's character counter (Wave 3.1 Task 12) -- rendered below the
    // control by LongTextCustomFieldControl.tsx. UI copy, not a rejected-save
    // message: the server's own 422 on a genuine over-cap save still speaks
    // for itself. `charactersOverLimit` names the OVERAGE, not the raw count,
    // matching GOV.UK's character-count component convention this control's
    // "let the user over-type, never truncate silently" behaviour follows.
    longText: {
      characterCount: "{count} of {max} characters",
      charactersOverLimit: "{overBy} characters too many (limit is {max})",
    },

    // DateTime's zone disclosure/change affordance (Wave 3.1 Task 12) --
    // rendered by DateTimeCustomFieldControl.tsx. "Zone is a disclosure, not
    // a question" (pre-plan analysis §5.3): the resolved zone always renders
    // as plain text next to the instant, with a small "Change" link that
    // swaps in a searchable timezone picker only on demand.
    dateTime: {
      zoneDisclosure: "Zone: {zone}",
      changeTimezone: "Change",
      cancelTimezoneChange: "Cancel",
      timezonePickerLabel: "Timezone for {field}",
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
