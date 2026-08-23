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
    // Wave 6 row 6.6 — definition change history.
    history: {
      actionLabel: "History",
      title: "Change history — {field}",
      description:
        "Every recorded change to this field, its versions, its options and its visibility rules. " +
        "Newest first.",
      empty: "No changes have been recorded for this field.",
      loadFailed: "Couldn't load the change history. Please try again.",
      performedBy: "by {user}",
      systemActor: "system",
      // Shown next to Purged so it cannot be read as an ordinary delete.
      purgedNote: "permanently removed",
      pageOf: "Page {page} of {totalPages} — {total} change(s)",
      kind: {
        Created: "Created",
        Updated: "Updated",
        Deactivated: "Deactivated",
        Reactivated: "Reactivated",
        Deleted: "Deleted",
        Restored: "Restored",
        Purged: "Purged",
      },
      part: {
        Field: "Field",
        Definition: "Definition",
        Version: "Version",
        Option: "Option",
        VisibilityRule: "Visibility rule",
      },
    },

    // Wave 6 row 6.3 — usage & impact, and the delete confirmation.
    impact: {
      actionLabel: "Usage & impact",
      title: "Usage & impact — {field}",
      confirmTitle: "Delete {field}?",
      // These two are NOT interchangeable. For a field inherited by every organisation the
      // caller-scoped and platform-wide totals differ by orders of magnitude, and nothing about the
      // number itself says which one is shown.
      scopeYourOrganisation: "Counts below cover your organisation only.",
      scopeAllOrganisations: "Counts below cover every organisation on the platform.",
      loadFailed: "Couldn't load usage for this field.",
      storedValues: "{count} stored value(s)",
      legacyValues: "{count} value(s) in the legacy store",
      options: "{count} option(s)",
      dependentFields: "{count} other field(s) are shown or hidden based on this field's value",
      rulesHiding: "{count} rule(s) can hide this field on some records",
      affectedTenants: "{count} organisation(s) hold values for this field",
      byRecordType: "By record type",
      destructiveWarning:
        "Deleting this field will destroy its stored values once the retention window passes. " +
        "This cannot be undone after that point.",
      deleteAnyway: "Delete anyway",
      deleteConfirm: "Delete",
    },

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
      sensitivity: "Sensitivity",
      isExportable: "Include in exports",
      // Wave 4 follow-up. Deliberately NOT "Entity Type" -- `entityTypeKey` above already owns that
      // label and means the opposite direction: which records this field is DEFINED ON. This one is
      // which records its values POINT AT. Two fields on the same form reading "Entity Type" would be
      // unanswerable without opening the code.
      referenceTargetEntityTypeKey: "Target Entity Type",
    },

    // Wave 6 ruling R10 — data classification. The VALUES sent to the server are the C# enum member
    // names ("None"/"Internal"/"Confidential"/"Restricted"); these are display labels only.
    sensitivity: {
      none: "Unclassified",
      internal: "Internal",
      confidential: "Confidential",
      restricted: "Restricted",
    },
    hints: {
      sensitivity:
        "How this field's values should be treated. This is a label for reporting and export " +
        "handling \u2014 it does not control who can see the field. Use field-level security for that.",
      isExportable:
        "Off keeps this field out of spreadsheet exports. This is tidying, not a permission \u2014 " +
        "anyone who can already read the field can still read its values elsewhere.",
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

    // CustomFieldValueType enum (0..21) -- Wave 3.1 Task 10 added longText/
    // dateTime/multiSelect (LongText=5, DateTime=6, MultiSelect=7); Wave 3.2
    // Batch 3 adds email/url/phone/percent/rating (Email=8, Url=9, Phone=10,
    // Percent=11, Rating=12); Wave 3.3 Batch C adds currency/duration/time/
    // color (Currency=13, Duration=14, Time=15, Color=16); Wave 4 adds
    // entityReference/userReference (EntityReference=17, UserReference=18);
    // Wave 3.4 adds file/image/richText (File=19, Image=20, RichText=21).
    //
    // These three leaf names are FRONTEND-OWNED. The backend Descriptors point
    // at `customField.valueTypes.file`/`.image`/`.richText` as their LabelKey,
    // but no backend resource file declares a `customField.valueTypes`
    // namespace at all -- the labels have always resolved here.
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
      entityReference: "Entity Reference",
      userReference: "User Reference",
      file: "File",
      image: "Image",
      richText: "Rich Text",
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
      // Wave 3.4. RichText's two client-raised refusals, both mirroring
      // RichTextValueTypeHandler and both with real callers in
      // customFieldValueValidation.ts.
      //
      // richTextInvalidShape covers a value that is not the `{ html }` envelope
      // -- most often a BARE STRING, which the server refuses because the
      // sanitization middleware's carve-out is the path `values.*.html`, so a
      // bare string arrives with its markup already stripped. The wording names
      // what is wrong and does not blame the operator, because the operator
      // cannot produce this state through the editor: it comes from stale or
      // out-of-band form state.
      richTextInvalidShape: "The content stored in {field} isn't in a format this editor can read.",
      // Mirrors customFields.values.richTextTooLong. The cap is on the RAW
      // MARKUP, not the visible words, and the copy says so -- otherwise an
      // operator who can see three pages of text is told they have exceeded
      // 50,000 characters and reasonably concludes the count is broken.
      richTextTooLong: "{field} is over the {max}-character limit, counting formatting.",
      // Wave 3.4. The half-blank media reference -- a value the backend refuses
      // outright (it inherits EntityReference's `referenceIncomplete`) whether or
      // not the field is required. Deliberately NOT worded as
      // customField.entityReference.invalid is ("Choose a record again"): a media
      // field has no picker yet, so that advice would send the operator looking
      // for an affordance that does not exist.
      mediaReferenceIncomplete: "The file stored in {field} is only half-recorded and can't be read.",
      // ── The three server-only media verdicts ─────────────────────────────
      //
      // MIRRORS WITH NO CLIENT CALLER, and that is deliberate rather than
      // pending. All three depend on the MediaFile row itself -- whether it
      // exists and is visible, whether its owner pair IS the record being
      // edited, and what its content type is -- and a stored value carries an
      // entity type key and an encrypted id and nothing else. There is not even
      // a way to fetch the row: no IEntityLookupProvider is registered for
      // `media.file`, so it can be neither searched nor resolved. So the client
      // cannot reach any of these verdicts, and guessing at one would be exactly
      // the frontend/backend verdict mismatch this whole block exists to
      // eliminate. They are kept in step with the backend's own
      // customFields.values.* strings so the pair stays discoverable, and so an
      // owner-scoped media endpoint (the thing that would give the media control
      // a real picker) has the copy already written rather than inventing a
      // second wording for a message the server is already sending.
      //
      // mediaReferenceNotFound merges "no such file" and "not visible to you"
      // because the SERVER merges them, on purpose: separating them would turn
      // the refusal into a probe for which ids exist in other tenants.
      mediaReferenceNotFound: "The file referenced by {field} couldn't be found.",
      // The owner-pair refusal. It NAMES NO OWNER, matching the backend's own
      // reasoning: reporting which record owns the file would answer a question
      // the caller has no permission to ask, which is the cross-tenant
      // disclosure the check was added to prevent.
      mediaReferenceOwnerMismatch: "That file belongs to a different record, so it can't be attached to this one in {field}.",
      // Image's content-type refusal, raised after the owner-pair check has
      // already passed -- so it never reveals what kind of file an arbitrary id
      // points at.
      mediaReferenceNotAnImage: "{field} only accepts an image file.",
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

    // RichText's raw-markup counter (Wave 3.4) -- rendered below the editor by
    // RichTextCustomFieldControl.tsx. UI copy, not a rejected-save message
    // (that is values.richTextTooLong above).
    //
    // "including formatting" is doing real work in both strings. The number
    // counts the RAW HTML, which is what the server caps and what the operator
    // cannot see; without saying so, a counter reading "1,240 of 50,000" beside
    // eight visible words looks like a bug. Same overage-not-total convention
    // charactersOverLimit follows for LongText.
    richText: {
      characterCount: "{count} of {max} characters, including formatting",
      charactersOverLimit: "{overBy} characters too many, including formatting (limit is {max})",
    },

    // File/Image's media reference control (Wave 3.4) -- rendered by
    // MediaReferenceCustomFieldControl.tsx, shared by both value types with
    // imagesOnly selecting between the pairs below.
    //
    // The two "attached" lines say only THAT something is attached, never what.
    // The stored value is an encrypted media id and there is no endpoint that
    // would turn it into a file name (no lookup provider is registered for
    // `media.file`), so a name would have to be invented -- and rendering the
    // id instead would leak another module's primary key into every screenshot
    // while telling the reader nothing.
    //
    // attachUnavailable is the honest centre of this control and is phrased as a
    // fact about the product, NOT an error: the field is correctly configured
    // and any stored value is fine. Attaching requires knowing the file belongs
    // to THIS record, and nothing on this tier can ask that question yet, so
    // offering a picker would offer picks the server then refuses. The copy says
    // where the operation does live rather than apologising.
    mediaReference: {
      fileAttached: "A file is attached to this field.",
      imageAttached: "An image is attached to this field.",
      noFile: "No file attached.",
      noImage: "No image attached.",
      clear: "Remove",
      attachUnavailable:
        "Files are attached from this record's own media, not from this field. You can remove what's here.",
      notConfigured:
        "This field isn't pointed at a file library yet, so nothing can be attached to it.",
      imagesOnly: "This field only accepts an image.",
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

    // EntityReference / UserReference record picker (Wave 4) -- rendered by
    // EntityReferenceCustomFieldControl.tsx, shared by both value types (they
    // differ only in which target entity type key is supplied, which is data,
    // not a second control).
    //
    // A stored reference holds the target's encrypted id and NOTHING else --
    // never a snapshot of its name, because a snapshotted name would be
    // readable by anyone holding the OWNER record's permission while the name
    // itself is guarded by the TARGET type's. Every string below therefore
    // covers a state the picker can only be in *because* the display name has
    // to be fetched on every render rather than read out of the stored value.
    //
    // forbidden / missing / invalid are THREE DIFFERENT SITUATIONS with three
    // different fixes, and are deliberately worded so an operator can tell
    // which one they are looking at without asking anyone:
    //   forbidden (403) -- the caller's own role lacks the TARGET type's view
    //     permission. The stored value is intact; the fix is a permission
    //     change, so the copy says so and names who can make it.
    //   missing (404) -- the referenced record itself is gone: deleted, or in a
    //     tenant this caller cannot see. The backend merges those two on
    //     purpose (so the endpoint cannot be used to probe whether an id exists
    //     in someone else's tenant), so the copy offers both without claiming
    //     which. The fix is a data change: pick another record, or clear.
    //   invalid (400) -- the stored reference is malformed and cannot be read
    //     at all; it has to be replaced, not re-pointed.
    // Rendering 403 and 404 as the same grey dash is exactly what makes a
    // dangling reference invisible for a year (EntityLookupController's own doc
    // comment says so), which is why none of the three shares any wording.
    //
    // resolveFailed is the fourth, boring case -- a network/server failure. It
    // states that the reference is fine specifically so it is not mistaken for
    // `missing` and acted on by clearing a perfectly good value.
    //
    // inactiveSuffix marks a row that still exists and is still selectable,
    // just dormant. It must never read as "deleted": a deleted row does not
    // resolve at all and gets `missing` instead.
    //
    // resolveFailed and searchFailed are deliberately two strings, not one.
    // resolveFailed asserts "the reference itself is fine" -- true when a stored
    // reference could not be looked up, and the reason the operator must NOT
    // react by clearing a good value. That claim is not available to make about
    // a SEARCH that could not run, which is about the picker, not the value.
    // Collapsing them would put a reassurance about the stored value on a
    // failure that says nothing about it.
    //
    // selectedLabel takes NO interpolation on purpose -- it is the accessible
    // name for the element showing the current selection, rendered next to the
    // resolved name rather than wrapping it, so a control that forgot to
    // interpolate cannot leak a raw `{placeholder}` into the page.
    //
    // THE `type*` KEYS BELONG TO THE SECOND COMBOBOX, shown only for a field
    // whose definition pinned NO target -- which is the default shape a new
    // definition gets. An unpinned field lets a value point at any type the
    // caller may reference, and each value stores its own entityTypeKey, so the
    // record editor picks the type first and the record second. `typeLabel` is
    // the short visible label and `typeLabelFor` the accessible name; the first
    // is a substring of the second on purpose (WCAG's Label in Name), and the
    // second interpolates the field so two reference fields on one form do not
    // both announce as "Record type".
    //
    // `noTargetConfigured` is what that field says before a type is chosen. It
    // is an INSTRUCTION, not an apology: nothing is broken and no administrator
    // is needed -- there are simply two steps and this names the first. It used
    // to tell the reader to go and set a target on the definition, which was
    // advice a record editor usually cannot act on and, now that the picker
    // handles an unpinned field, is not the remedy either.
    //
    // noTypesAvailable/-Hint is the server answering with an EMPTY list of
    // referenceable types. Not an error (it is a 200) and not a filter that
    // matched nothing (`typeNoResults`), which is why it is its own pair. The
    // hint names BOTH causes without asserting either, exactly as `missing`
    // does for 403-vs-404: EntityLookupRegistry.GetAvailableTypes filters on
    // provider composition AS WELL AS permission, so in a split deployment this
    // is empty for a reason no permission grant would fix.
    //
    // searchForbidden/-Hint and searchUnavailable/-Hint split what used to be
    // one "search failed, try again" for every way a lookup can fail. Both are
    // rendered WITHOUT a retry, which is the point: 403 means this caller's role
    // may not list that type (a permission change), and `unavailable` means this
    // deployment cannot answer for that type at all -- an unregistered key, or
    // an owning module that is not composed into this host (an install change).
    // A Retry button on either invites an operator to hammer a request that will
    // refuse them identically every time. searchFailed keeps the retry, because
    // a network or 500 failure is the one that a retry genuinely fixes.
    entityReference: {
      noTargetConfigured:
        "This field isn't pinned to one entity type, so choose the type of record you want to point at first, then the record itself.",
      typeLabel: "Record type",
      typeLabelFor: "Record type for {field}",
      typePlaceholder: "Choose a record type",
      typeSearchPlaceholder: "Type to filter...",
      typeNoResults: "No record type matches that filter.",
      noTypesAvailable: "There are no record types you can point this field at.",
      noTypesAvailableHint:
        "Either the modules that own them aren't part of this deployment, or you don't have view access to them — either way, ask your system administrator.",
      typesFailed: "Couldn't load the record types you can choose from. Please try again.",
      searchPlaceholder: "Type to search...",
      placeholder: "Select a record",
      searching: "Searching...",
      noResults: "No records match that search.",
      loadMore: "Load more",
      resolving: "Loading the referenced record...",
      forbidden:
        "The stored value is fine, but you don't have permission to view this type of record, so its name can't be shown. Ask your system administrator to grant you view access.",
      missing:
        "The referenced record can't be found. It was deleted, or it belongs to an organisation you can't see — either way this field now points at nothing. Choose a different record, or clear the field.",
      invalid:
        "The reference stored in this field is malformed and can't be read at all. Choose a record again to replace it.",
      resolveFailed:
        "Couldn't load the referenced record just now. The reference itself is fine — please try again.",
      searchFailed: "Couldn't search for records just now. Please try again.",
      searchForbidden: "You don't have permission to browse this type of record.",
      searchForbiddenHint:
        "The records are there — your role just can't list them. Ask your system administrator for view access to this record type.",
      searchUnavailable: "This type of record isn't available in this deployment.",
      searchUnavailableHint:
        "The module that owns it isn't installed here, so there's nothing to list. Ask your system administrator which record types this field can use.",
      retry: "Try again",
      inactiveSuffix: "(inactive)",
      selectedLabel: "Selected record",
    },

    // Definition-level TARGET TYPE picker (Wave 4 follow-up) -- the admin form's counterpart to the
    // value-side `entityReference` block above. That one is about a stored VALUE; this one is about
    // the DEFINITION saying which entity type its values may point at.
    //
    // Kept as its own block rather than merged into `entityReference`, because the two are read by
    // different people in different places: those strings appear on a record form to whoever fills the
    // field in, these appear on the definitions screen to whoever configures it. The one string that
    // straddles both is `entityReference.noTargetConfigured` -- shown to the record editor when this
    // picker was never used -- and it deliberately points at this feature by name.
    //
    // `unpinned` is a REAL CHOICE, not a "none" placeholder, which is why it is worded as a state
    // rather than as an absence: an unpinned reference field accepts any type its value type allows
    // and names the target per value, which is what every reference field created before this option
    // existed does, and stays legal forever (the backend's own
    // CustomField.ReferenceTargetEntityTypeKey doc comment says a required pin would have made those
    // fields unsavable). So it must be selectable in order to CLEAR a pin, not merely to decline one.
    //
    // `repointWarning` is the one string in this block that had to be written rather than chosen, and
    // the claim it makes is checked against real backend behaviour, not assumed:
    //   - `UpdateCustomFieldCommandHandler` does not refuse a re-point even when values already exist;
    //     its own comment says refusing would mean an admin could never correct a mis-pinned field
    //     without first deleting real data.
    //   - Each stored value keeps its OWN target entity type key, so nothing already written becomes
    //     wrong or unreadable -- the pin constrains the NEXT write only.
    //   - That next write is genuinely REFUSED, not silently rewritten:
    //     `EntityReferenceValueTypeHandler.Validate` compares the value's type against the pin and
    //     returns `customFields.values.referenceTargetTypeMismatch`.
    // So the honest copy is "old values keep working, the next save of one is refused" -- not "this is
    // safe" and not "this will break your data". There is no migration and this form offers none;
    // saying nothing at all is what would leave an admin to discover the refusal from a record editor
    // weeks later.
    //
    // `noneAvailable` covers the server answering with an EMPTY list, which means "you may not
    // reference anything" and is a 200, not a failure -- see EntityLookupController.GetAvailableTypes.
    // It is worded to hold on both forms: it must not promise an unpinned outcome, because an
    // already-pinned field keeps its pin through a save made while the list is empty (form state is
    // seeded from the stored value, not from the option list).
    //
    // It also must not name only ONE cause, which is what it used to do. `EntityLookupRegistry.
    // GetAvailableTypes` filters on `Resolve(t.Key) is not null` -- provider composition -- BEFORE it
    // filters on `HasPermission`, so in a split deployment the list is empty for a reason no
    // permission grant will ever fix, and "ask an administrator for view access" sends the admin to
    // do something that cannot work. The honest shape is the one `entityReference.missing` already
    // uses for the 403/404 merge a few keys above: name both possibilities, claim neither, and say
    // what follows either way.
    referenceTarget: {
      unpinned: "Not pinned — any allowed type",
      description:
        "Optional. Pins this field to one entity type, so every value must point at a record of that type. Leave it unpinned and each value names its own target type instead.",
      repointWarning:
        "Changing this leaves values already stored alone: each one keeps pointing at the record it points at now, and still reads back correctly. The next save of a record whose value is of the old type will be refused until that value is picked again.",
      noneAvailable:
        "There are no entity types you can reference. Either the modules that own them aren't part of this deployment, or you don't have view access to them — either way there is nothing to choose from here, and any target type already set on this field is left as it is. Ask your system administrator which record types are available to you.",
      loadFailed:
        "Couldn't load the entity types you can reference. Saving now keeps this field's current target type unchanged.",
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
      // the two blocks can never silently drift apart in which names they
      // cover. valueTypeCatalog.locale.test.ts proves that against the live
      // ALL_VALUE_TYPES rather than against a number written here, which is
      // why no count is stated: it was already stale once (it said 17 while
      // 19 types shipped).
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
        entityReference:
          "A pointer to another record, chosen from a searchable list of one entity type. Only the pointer is stored, so the name shown is always read from the target record itself.",
        userReference:
          "A pointer to a user account, chosen from a searchable list of users. Only the pointer is stored, so the name shown is always read from that account itself.",
        file: "A pointer to one uploaded file. The file must already belong to the record being edited, which is what keeps one organisation's files out of another's records.",
        image:
          "A pointer to one uploaded image. Same ownership rule as File, plus the file itself has to be an image.",
        richText:
          "Formatted text with paragraphs, lists and links, written in the built-in editor. Capped at 50,000 characters including the formatting.",
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
