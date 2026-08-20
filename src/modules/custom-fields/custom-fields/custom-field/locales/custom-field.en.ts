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
      fieldGroup: "Field Group",
    },

    // Form placeholders
    actions: {
      removeOption: "Remove option",
      addOption: "Add option",
    },
    placeholders: {
      optionsEmpty: "No options yet — add the first one below.",
      optionAr: "Arabic label",
      optionEn: "English label",
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

    // CustomFieldValueType enum (0..16) -- Wave 3.1 Task 10 added longText/
    // dateTime/multiSelect (LongText=5, DateTime=6, MultiSelect=7); Wave 3.2
    // Batch 3 adds email/url/phone/percent/rating (Email=8, Url=9, Phone=10,
    // Percent=11, Rating=12); Wave 3.3 Batch C adds currency/duration/time/
    // color (Currency=13, Duration=14, Time=15, Color=16).
    valueTypes: {
      text: "Text",
      number: "Number",
      boolean: "Boolean",
      date: "Date",
      select: "Select",
      longText: "Long Text",
      dateTime: "Date & Time",
      multiSelect: "Multi-Select",
      email: "Email",
      url: "URL",
      phone: "Phone",
      percent: "Percent",
      rating: "Rating",
      currency: "Currency",
      duration: "Duration",
      time: "Time",
      color: "Color",
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
      // Wave 3.3 Batch C: Currency's own half-blank guard (mirrors the
      // backend's customFields.values.currencyAmountExpected/
      // currencyCodeInvalid pair conceptually -- CurrencyValueTypeHandler.
      // Validate requires BOTH pieces once either is present). Shown before
      // a save ever hits the 422, from assertSelectCustomFieldValuesValid's
      // own Currency check.
      currencyIncomplete: "{field} needs both an amount and a currency code.",
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

    // Duration's explicit unit annotation (Wave 3.3 Batch C) -- rendered
    // beside the edit control (DurationCustomFieldControl.tsx) AND appended
    // in the read-side formatter (formatCustomFieldValue.tsx), so a stored
    // bare minute count is never ambiguous in either direction. Storage is
    // bare minutes (backend ruling R4); this is the one string that makes
    // that unit explicit instead of implicit.
    duration: {
      unitLabel: "minutes",
    },

    // Currency's paired amount + ISO 4217 code control (Wave 3.3 Batch C,
    // rulings R1/R2) -- rendered by CurrencyCustomFieldControl.tsx.
    // amountLabel/codeLabel are each sub-input's OWN accessible name (both
    // pieces are required together once either is entered, so both need a
    // real, distinguishing name of their own -- see that control's own
    // header comment); pairHint is always-visible UI copy stating the
    // requirement up front, not a rejected-save message (that is
    // values.currencyIncomplete above).
    currency: {
      amountLabel: "{field} amount",
      codeLabel: "{field} currency code",
      codePlaceholder: "USD",
      pairHint: "Amount and currency code are required together.",
    },

    // Color's generalized picker (Wave 3.3 Batch C, ruling R5) -- reuses
    // core/ui/rich-text-editor/ColorPickerField.tsx via its new
    // i18nKeyPrefix prop ("customField.color") so this module's own
    // translations resolve instead of leaking that component's original
    // editorBlocks.color.* keys into a namespace that does not own them.
    // Same three suffixes that component's own default namespace already
    // uses (swatch/custom/hexPlaceholder), just under this module's prefix.
    color: {
      swatch: "Use color {color}",
      custom: "Custom hex color",
      hexPlaceholder: "3b82f6",
    },

    // Field-group picker on the definition form -- Wave 5 row 5.2. The groups
    // themselves are managed on /custom-fields/field-groups (own dictionary,
    // `fieldGroup.*`); these three keys are the picker's own copy, which
    // belongs with the form that renders it.
    fieldGroupNone: "No group",
    fieldGroupDescription:
      "Optional. Groups this field with the others in the same group when the entity's form is rendered. Leave as \"No group\" to keep it ungrouped.",
    fieldGroupLoadFailed:
      "Couldn't load the field groups for this entity type. Saving now keeps this field's current group unchanged.",
    fieldGroupsLink: "Manage field groups",

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

    // Value Types catalog -- Wave 5 row 5.4. Read-only reference page at
    // /custom-fields/value-types, browsable from a link on the definitions
    // screen above. Design spec §7: "Browse available types, what each is
    // for, which are entitlement-locked." The entitlement-lock column is
    // deliberately OMITTED here -- §4.6's Availability/RequiredFeature
    // descriptor fields were never implemented on either side (pre-plan
    // analysis R5), so there is no real data to show; a fabricated or
    // always-empty column would be worse than no column.
    valueTypeCatalog: {
      title: "Value Types",
      description:
        "Every value type a custom field can use, what it's for, and how it behaves. This catalog is read-only -- value types are fixed by the platform and cannot be added, edited, or removed here.",
      browseLink: "Browse value types",
      stats: {
        total: "Value Types",
        withOptions: "Own an Options List",
        withValidator: "Support a Validator",
      },
      columns: {
        valueType: "Value Type",
        description: "Description",
        placeholder: "Placeholder",
        options: "Options List",
        validator: "Validator",
      },
      // One sentence per value type: what it's for AND what its control
      // looks like, since the catalog module's own fieldConfigType is an
      // internal dispatch key (e.g. "tel", "datetime"), not user-facing
      // copy. Leaf names here are deliberately identical to valueTypes.*
      // above -- ValueTypeCatalogView derives this key from each catalog
      // entry's own labelKey suffix rather than a second hand-kept map, so
      // the two blocks can never silently drift apart in which 17 names
      // they cover.
      descriptions: {
        text: "A single-line, free-form text field. The only value type that can carry an optional format validator (see the Validator column).",
        number: "A numeric input for whole or decimal values.",
        boolean: "An on/off toggle switch. Has no placeholder or options.",
        date: "A calendar date picker, with no time component.",
        select: "A single choice from a fixed list of options you define when creating the field.",
        longText:
          "A multi-line text area for longer free-form content, capped at 10,000 characters.",
        dateTime:
          "A combined date-and-time picker. The saved instant carries an explicit time zone.",
        multiSelect:
          "Multiple choices from a fixed list of options you define, up to 19 selections.",
        email: "A single-line field for an email address.",
        url: "A single-line field for a web address. Only http and https links are accepted.",
        phone: "A phone number field, stored and validated in international E.164 format.",
        percent: "A numeric value between 0 and 100, displayed with a % sign.",
        rating: "A 1-to-5 rating captured on a slider. There is no free-text entry.",
        currency: "A paired amount and currency code -- both are required together.",
        duration: "A length of time, entered and stored in minutes.",
        time: "A time-of-day picker, with no date component.",
        color: "A colour-swatch picker with a custom hex-code entry.",
      },
    },

    // Entity Types registry -- Wave 5 row 5.5. Read-only reference page at
    // /custom-fields/entity-types, reached from a link on the definitions
    // screen above. The two "has a screen" columns are the operator-facing
    // half of this row's drift check: `hasFrontendScreen` is a hand-typed
    // literal at each backend registration site, and `entityScreenManifest.ts`
    // is this repo's own answer to the same question -- so the page shows
    // both claims rather than presenting either one as settled fact.
    entityTypeCatalog: {
      title: "Entity Types",
      description:
        "Every entity type a custom field can be defined against, which module owns it, and whether a screen in this app renders its custom fields. This registry is read-only -- entity types are declared by backend modules at startup and cannot be added, edited, or removed here.",
      browseLink: "Browse entity types",
      loadFailed: "Couldn't load entity types. Please try again.",
      empty: "No entity types are registered.",
      stats: {
        total: "Entity Types",
        withScreen: "Have a Screen",
        drift: "Out of Sync",
      },
      columns: {
        entityType: "Entity Type",
        key: "Key",
        owningModule: "Owning Module",
        backendScreen: "Screen (per backend)",
        frontendScreen: "Screen (in this app)",
        status: "Status",
      },
      agreement: {
        aligned: "In sync",
        backendClaimsScreenOnly: "Backend expects a screen",
        frontendScreenOnly: "Screen exists, backend unaware",
      },
    },
  },
};
