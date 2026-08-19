/**
 * CustomFields Module Permissions
 *
 * Covers: CustomField definitions.
 *
 * Keys MUST match the backend CustomFieldsPermissionProvider resource keys
 * ({resource}.{action}, kebab-case plural) exactly for permission parity.
 * The backend emits `custom-fields` x CRUD and (Wave 5 row 5.2)
 * `custom-field-groups` x CRUD + reorder.
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
} as const;
