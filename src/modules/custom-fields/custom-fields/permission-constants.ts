/**
 * CustomFields Module Permissions
 *
 * Covers: CustomField definitions.
 *
 * Keys MUST match the backend CustomFieldsPermissionProvider resource keys
 * ({resource}.{action}, kebab-case plural) exactly for permission parity.
 * The backend emits `custom-fields` x CRUD, (Wave 5 row 5.2)
 * `custom-field-groups` x CRUD + reorder, and (P-4)
 * `custom-field-option-sets` x CRUD + publish + bind.
 */
export const CUSTOM_FIELDS_PERMISSIONS = {
  // ── Custom Fields ───────────────────────────────────────
  CUSTOM_FIELD_VIEW: "custom-fields.view",
  CUSTOM_FIELD_CREATE: "custom-fields.create",
  CUSTOM_FIELD_UPDATE: "custom-fields.update",
  CUSTOM_FIELD_DELETE: "custom-fields.delete",

  // ── Field Groups (Wave 5 row 5.2) ───────────────────────
  // `reorder` is a FIFTH action, not part of the CRUD quartet: the backend
  // gates PUT /field-groups/reorder on its own `custom-field-groups.reorder`
  // permission, so an admin can be allowed to rename groups without being
  // allowed to change their order.
  FIELD_GROUP_VIEW: "custom-field-groups.view",
  FIELD_GROUP_CREATE: "custom-field-groups.create",
  FIELD_GROUP_UPDATE: "custom-field-groups.update",
  FIELD_GROUP_DELETE: "custom-field-groups.delete",
  FIELD_GROUP_REORDER: "custom-field-groups.reorder",

  // ── Option Sets (P-4) ───────────────────────────────────
  // `publish` and `bind` are a SIXTH and SEVENTH action beyond the CRUD quartet,
  // and the backend's OptionSetsController gates them independently. That split
  // is the point, not bookkeeping: `update` covers renaming a set and editing a
  // DRAFT version's items, which changes nothing any record or field is using
  // yet, whereas `publish` takes a version live (deprecating the incumbent, so
  // every field bound to it starts offering a different list) and `bind` points
  // a field version at a set version (which can deactivate options a tenant was
  // offering a moment ago). So an admin can be allowed to curate a set's items
  // without being allowed to release them or to repoint a live field.
  //
  // `create` deliberately has no version-scoped twin: the backend gates BOTH
  // `POST /option-sets` and `POST /option-sets/{id}/versions` on it, because
  // opening a new draft is the same act of authoring as declaring the set.
  OPTION_SET_VIEW: "custom-field-option-sets.view",
  OPTION_SET_CREATE: "custom-field-option-sets.create",
  OPTION_SET_UPDATE: "custom-field-option-sets.update",
  OPTION_SET_DELETE: "custom-field-option-sets.delete",
  OPTION_SET_PUBLISH: "custom-field-option-sets.publish",
  OPTION_SET_BIND: "custom-field-option-sets.bind",

  // ── Wave 6 rows 6.6 and 6.3 ─────────────────────────────
  // Separate permissions, not folded under `view`: a field's change history names WHO changed what
  // and when, and its usage exposes value counts -- both are strictly more sensitive than seeing
  // that the field exists, and the backend gates them independently.
  VIEW_HISTORY: "custom-fields.view-history",
  VIEW_USAGE: "custom-fields.view-usage",
} as const;
