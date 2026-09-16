/**
 * Option-set English copy — namespace `optionSet`.
 *
 * An option set is a NAMED, VERSIONED list of choices that Select and MultiSelect fields bind to,
 * instead of every field carrying its own inline option list. Two facts about the backend shape
 * almost every string below, and both are things an administrator will get wrong unless the copy
 * says them out loud:
 *
 *  1. **Versions, not edits.** A set's choices live in versions. Exactly one version is Published at
 *     a time, only a Draft is editable, and publishing a new version deprecates the incumbent in the
 *     same step. Someone who expects "save" to change what live records already offer needs to be
 *     told otherwise before they click, not after.
 *  2. **Some sets belong to the platform, not to the tenant.** The seeded ISO 3166 / ISO 4217 /
 *     BCP 47 sets are system-managed, and every mutating endpoint refuses them outright. The UI
 *     renders those read-only, so the copy has to explain WHY rather than leave a disabled button
 *     to be read as a bug.
 *
 * A third rule is enforced by omission: this dictionary offers no wording for DELETING an option.
 * The wire has a `Deleted` option status, but sending it would leave every record already carrying
 * that value needing a per-value remap-or-blank decision, which is not a decision a screen can take
 * on an administrator's behalf. Deactivation is the withdrawal action, and `items.deleteUnavailable`
 * says so.
 *
 * option-set.ar.ts mirrors this file key for key. The translator here has no defaultValue fallback,
 * so a key that exists in `en` and not in `ar` renders as this raw English string to an
 * Arabic-speaking admin; optionSet.locale.test.ts pins that parity so it cannot drift silently.
 */

/**
 * English dictionary for the option-set editor.
 *
 * Exported as a plain nested object (not a flat map) because `useModuleLocales` merges the shape
 * directly into the i18n store, and the nesting is what makes `t("optionSet.versions.publish")`
 * resolve. Grouping mirrors the screens: set-level chrome, then the version chain, then the items
 * editor inside a version, then bindings, then the refusal and permission messages that any of
 * those three can hit.
 */
export const en = {
  optionSet: {
    // ── Screen chrome ───────────────────────────────────────────────────────────────────────────
    title: "Option Sets",
    description:
      "Reusable, versioned lists of choices. Point many fields at one set, and every field that uses it changes together.",
    addNew: "Add Option Set",
    editTitle: "Edit Option Set",
    deleteTitle: "Delete Option Set",
    // Spells out the blast radius, because deleting a set is not like deleting a field group: the
    // whole version chain goes with it, and a field bound to one of those versions loses the list it
    // resolves its choices from. Naming that consequence is the only chance an admin gets to stop.
    deleteConfirm:
      'Delete the set "{name}"? Every version of it goes too, including the published one. Any field bound to this set stops resolving its choices, so unbind those fields first if they are still in use.',
    loadFailed: "Couldn't load the option sets.",
    detailLoadFailed: "Couldn't load this option set.",
    versionLoadFailed: "Couldn't load this version's options.",
    backToList: "Back to option sets",

    // ── Ownership and scope badges ──────────────────────────────────────────────────────────────
    // Three separate badges for three separate facts, deliberately not collapsed into one:
    // `global` is about who can SEE the set, `platformOwned` about who OWNS it, and `systemManaged`
    // about whether ANYONE can edit it. A tenant-owned set can be global; a platform-owned set need
    // not be system-managed.
    badge: {
      global: "Global",
      platformOwned: "Platform-owned",
      systemManaged: "Platform-maintained",
      published: "Published",
    },

    // The read-only explanations. Rendered instead of the editing controls, never merely alongside a
    // disabled button — a control that refuses without saying why reads as a defect.
    readOnly: {
      systemManaged: {
        title: "Platform-maintained set — read-only",
        description:
          "The platform maintains this set; the built-in country, currency and language lists are the standard examples. The server refuses every change to it — new versions, edits, publishing and deletion alike — so nothing here is editable. Create your own set if you need a variant of this list.",
      },
      platformOwned: {
        title: "Platform-owned set — read-only here",
        description:
          "This set belongs to the platform and is shared with every tenant, which is the whole point of it: you can read it and bind fields to it, but only a platform administrator can change it.",
      },
    },

    // ── Set-level form ─────────────────────────────────────────────────────────────────────────
    fields: {
      stableKey: "Key",
      // Hyphens named alongside underscores because the platform's own seeded sets are keyed
      // `iso-3166-1-countries` and friends, and the create form's `pattern` accepts both. The hint and
      // that pattern have to agree — the browser blocks submit with a generic "match the requested
      // format", so a hint that named a narrower rule would be the admin's only clue and a wrong one.
      stableKeyHint:
        "Lowercase letters, digits, underscores (_) and hyphens (-). Fixed once the set exists — exports, imports and bindings all match on it.",
      labelEn: "Label (English)",
      labelAr: "Label (Arabic)",
      description: "Description",
      descriptionHint:
        "Optional. Tells the next administrator what this list is for and who is expected to maintain it.",
      isGlobal: "Global (all tenants)",
    },

    placeholders: {
      stableKey: "training_intensity",
      labelEn: "Training intensity",
      labelAr: "شدة التدريب",
      description: "What this list is for",
    },

    // Shown on the EDIT form, where the two create-time-only inputs are absent. Saying they are fixed
    // beats leaving an admin to hunt for a control that was never rendered — the update endpoint
    // accepts neither field, so there is nothing to enable.
    immutable: {
      stableKey: "The key can't be changed after the set is created.",
      isGlobal: "Whether a set is global is decided when it's created and fixed afterwards.",
    },

    isGlobalDescription: {
      platformContext: "No tenant is selected, so this set is always global.",
      tenantContext:
        "Off scopes this set to the tenant you're currently viewing. On shares it with every tenant.",
    },

    platformContext: {
      title: "Platform context — no tenant selected",
      description:
        "Any set you create here is global: every tenant inherits it. Drill into a tenant first if you meant to create a set for one tenant only.",
    },

    noItems: {
      title: "No option sets yet",
      description:
        "Fields still carry their own inline option lists. Add a set once the same list belongs to more than one field.",
    },

    // ── List columns and the values rendered into them ─────────────────────────────────────────
    columns: {
      stableKey: "Key",
      label: "Label",
      description: "Description",
      versions: "Versions",
      publishedVersion: "Published",
      scope: "Scope",
    },

    values: {
      versionCount: "{count} version(s)",
      itemCount: "{count} option(s)",
      publishedVersionNumber: "Version {number}",
      // A set with versions but nothing published is a real and common state — a draft that was never
      // published. Fields can't bind to it, so the list says so rather than leaving the cell empty.
      noPublishedVersion: "No published version",
    },

    // ── The version chain ──────────────────────────────────────────────────────────────────────
    versions: {
      title: "Versions",
      description:
        "Each version is a complete list of choices in its own right. Exactly one is published at a time, and that's the one every bound field actually offers.",
      versionLabel: "Version {number}",
      publishedAt: "Published",
      notPublished: "Not published",
      itemCount: "{count} option(s)",

      noItems: {
        title: "No versions yet",
        description:
          "This set holds no versions, so no field can bind to it. Create a draft version and add its choices.",
      },

      // All four FieldVersionStatus members. The UI never invents a fifth, and never omits one:
      // an unmapped status would render the raw wire value to an administrator.
      status: {
        Draft: "Draft",
        Published: "Published",
        Deprecated: "Deprecated",
        Archived: "Archived",
      },

      // What each status MEANS for the choices people see, which is the only reason an admin cares.
      // "Deprecated" in particular is not "gone" — records that reference it still render, and an
      // admin who reads it as deleted will go looking for data loss that never happened.
      statusHint: {
        Draft: "Editable, and offered to nobody until you publish it.",
        Published: "The live list. Every field bound to this set offers exactly these choices.",
        Deprecated:
          "Superseded by a newer published version, and still readable on the records that reference it.",
        Archived: "Retired from use and kept for history only. Nothing can bind to it.",
      },

      createDraft: "Create draft version",
      createDraftHint:
        "A new draft starts empty — nothing is copied forward, so you decide the whole list.",
      // Shown as a subtitle directly under the new-draft form heading.
      // The form starts with one blank row and Save disabled until key + labelEn are filled,
      // which reads as "read-only" unless something explains the requirement.
      newDraftHint:
        "Fill in the Key and English label for each option to enable Save. The Key must be unique within this version and cannot change once published.",
      saveDraft: "Save draft",
      publish: "Publish version",
      openVersion: "Open version {number}",
      // {status} is filled from versions.status.* above, so this sentence names the actual state
      // rather than lumping every non-draft version under one vague "locked".
      readOnlyNote:
        "Only a draft can be edited. This version is {status}, so its options are shown exactly as they were.",

      publishConfirm: {
        title: "Publish version {number}?",
        // Two variants, because the consequence genuinely differs. With an incumbent, publishing is a
        // SWAP: the version named by {current} is deprecated in the same operation, and that is the
        // part an admin must agree to. Without one, nothing is superseded, and a sentence that
        // claimed otherwise would invent a deprecation that never happened.
        description:
          "Version {number} becomes the list every bound field offers, and version {current} is deprecated in the same step. Deprecated versions stay readable on records that already reference them, so nothing is lost.",
        descriptionFirst:
          "Version {number} becomes the list every bound field offers. This set has no published version yet, so nothing is superseded.",
        confirm: "Publish",
      },
    },

    // ── The items editor, inside one draft version ─────────────────────────────────────────────
    // Keys under `items` mirror the API's `items` array so a UI author can match a key to the wire
    // field it writes. The COPY says "option", because that is the word for what an administrator is
    // editing and what an end user will eventually pick.
    items: {
      title: "Options",
      description:
        "The choices this version offers, in the order they'll be listed. The order here is the order a user sees.",

      fields: {
        key: "Key",
        keyHint:
          "Stored with every value that picks this choice, so it has to stay stable: giving a choice a new key in a later version orphans the values recorded under the old one.",
        labelEn: "Label (English)",
        labelAr: "Label (Arabic)",
        color: "Color",
        colorHint: "Optional. Tints this choice's badge wherever it's displayed.",
        iconKey: "Icon",
        iconKeyHint: "Optional. Name of an icon to show beside the label.",
        sortOrder: "Order",
        status: "Status",
      },

      placeholders: {
        key: "high",
        labelEn: "High",
        labelAr: "عالية",
        color: "#2563eb",
        iconKey: "flame",
      },

      add: "Add option",
      remove: "Remove option",
      // The accessible names of the two reorder buttons — the alternative that makes ordering
      // possible without a drag gesture (WCAG 2.2 SC 2.5.7). They must stay distinct and
      // self-describing: "Move up" twice over would leave a screen-reader user with two identical
      // buttons and no way to tell which is which.
      moveUp: "Move option up",
      moveDown: "Move option down",
      count: "{count} option(s)",

      noItems: {
        title: "No options yet",
        description:
          "Add the first choice below. A version needs at least one option before it can be published.",
      },

      // Only the two statuses this UI is allowed to send. `Deleted` exists on the wire and is
      // deliberately absent here — see deleteUnavailable below.
      status: {
        Active: "Active",
        Deactivated: "Deactivated",
      },

      statusHint: {
        Active: "Offered everywhere this set is used.",
        Deactivated:
          "No longer offered on new records, but still shown on every record that already uses it.",
      },

      deactivate: "Deactivate option",
      // The withdrawal action's full promise, in one sentence, because the alternative reading —
      // "this erases the choice from history" — is what stops admins from tidying up a stale list.
      deactivateDescription:
        "Deactivating stops this choice being offered from now on. Records that already use it keep showing it, so no stored value changes and no history is rewritten.",
      reactivate: "Reactivate option",
      reactivateDescription: "Offers this choice again, alongside the others in this version.",

      // Why there is no delete button, stated where someone would look for one.
      deleteUnavailable:
        "Options can't be deleted here. Removing one would leave every record that already uses it needing a value-by-value remap or blank, which isn't a decision this screen can take for you — deactivate it instead.",

      validation: {
        keyRequired: "Every option needs a key.",
        labelEnRequired: "Every option needs an English label.",
        duplicateKey:
          'More than one option uses the key "{key}". Keys have to be unique within a version.',
        atLeastOne: "A version needs at least one option before it can be saved or published.",
        keyTooLong: "An option key can be at most {max} characters.",
        labelTooLong: "An option label can be at most {max} characters.",
      },

      // Saving a draft replaces its whole item list in one request, so a half-finished edit is not
      // partially live anywhere. Worth saying, because it is the reassurance that makes an admin
      // willing to restructure a list rather than nibble at it.
      unsavedChanges:
        "This draft has unsaved changes. Nothing is offered to anyone until you save, and nothing is live until you publish.",
    },

    // ── Bindings: which option set version a field version draws its choices from ───────────────
    binding: {
      title: "Option set",
      description:
        "Bind this field to one option set version. The field then offers that version's choices instead of its own inline list.",
      selectPlaceholder: "Choose an option set",
      versionPlaceholder: "Choose a version",
      current: "Bound to {set}, version {number}.",
      none: "Not bound to an option set — this field uses its own inline options.",
      bind: "Bind option set",
      rebind: "Change bound version",
      unbind: "Remove binding",
      unbindConfirm: {
        title: "Remove the option set binding?",
        description:
          "The field stops offering this set's choices and falls back to its own inline options. Values already recorded are untouched.",
        confirm: "Remove binding",
      },
      loadFailed: "Couldn't load the option sets available for binding.",
    },

    // ── Refusals ───────────────────────────────────────────────────────────────────────────────
    // Refusals, not failures. Nothing is broken in any of these cases: the server declined a request
    // it was right to decline. Copy that said "error" would send an admin hunting a defect in a
    // working system, so each line names the rule and, where there is one, the way forward.
    refusals: {
      systemManaged: "The platform maintains this set, so it can't be changed here.",
      platformOwned:
        "This set belongs to the platform. Only a platform administrator can change it.",
      notDraft: "Only a draft version can be edited. Create a new draft to change these choices.",
      noDraft: "There's no draft version to publish. Create one and add its options first.",
      alreadyPublished: "This version is already the published one.",
      emptyVersion: "A version with no options can't be published.",
    },

    // ── Permission-denied messaging ────────────────────────────────────────────────────────────
    // One line per backend permission, phrased as a fact about the viewer rather than as a fault, so
    // it can be shown in place of a hidden action without implying something went wrong. `create`
    // covers both the set and its versions because the backend gates them on the same permission.
    permissions: {
      view: "You don't have permission to view option sets.",
      create: "You don't have permission to create option sets or their versions.",
      update: "You don't have permission to change option sets.",
      delete: "You don't have permission to delete option sets.",
      publish: "You don't have permission to publish option set versions.",
      bind: "You don't have permission to bind fields to option sets.",
    },

    // ── Toasts ─────────────────────────────────────────────────────────────────────────────────
    toast: {
      created: "Option set created.",
      createFailed: "Couldn't create the option set.",
      updated: "Option set updated.",
      updateFailed: "Couldn't update the option set.",
      deleted: "Option set deleted, along with all of its versions.",
      deleteFailed: "Couldn't delete the option set.",
      versionCreated: "Draft version created.",
      versionCreateFailed: "Couldn't create the draft version.",
      // Repeats the draft/publish distinction on success, because saving is the moment an admin is
      // most likely to believe the change went live.
      versionSaved: "Draft saved. It isn't live until you publish it.",
      // Saving a draft replaces its items wholesale, so a rejected save changed nothing at all.
      versionSaveFailed: "Couldn't save the draft. Nothing was changed.",
      published: "Version {number} is now the published version.",
      publishFailed: "Couldn't publish the version. The published one is unchanged.",
      bound: "Field bound to the option set.",
      bindFailed: "Couldn't bind the field to the option set.",
      unbound: "Option set binding removed.",
      unbindFailed: "Couldn't remove the binding.",
      // Distinct from the generic failure toasts: the server refused on principle, and retrying will
      // refuse again. Naming the reason stops the retry loop.
      systemManagedRefused: "The server refused the change: the platform maintains this set.",
      permissionDenied: "You don't have the permission this action needs.",
    },
  },
};
