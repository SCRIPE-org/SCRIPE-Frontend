/**
 * CustomFields Module Permissions
 *
 * Covers: CustomField definitions.
 *
 * Keys MUST match the backend CustomFieldsPermissionProvider resource keys
 * ({resource}.{action}, kebab-case plural) exactly for permission parity.
 * The backend emits the single resource `custom-fields` x CRUD.
 */
export const CUSTOM_FIELDS_PERMISSIONS = {
  // ── Custom Fields ───────────────────────────────────────
  CUSTOM_FIELD_VIEW: "custom-fields.view",
  CUSTOM_FIELD_CREATE: "custom-fields.create",
  CUSTOM_FIELD_UPDATE: "custom-fields.update",
  CUSTOM_FIELD_DELETE: "custom-fields.delete",
} as const;
