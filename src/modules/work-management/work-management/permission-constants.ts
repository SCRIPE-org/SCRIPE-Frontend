/**
 * WorkManagement Module Permissions
 *
 * Keys MUST match the backend WorkManagementPermissionProvider resource keys
 * ({resource}.{action}, kebab-case plural) exactly for permission parity.
 * The backend emits the single resource `work-items` x CRUD.
 */
export const WORK_MANAGEMENT_PERMISSIONS = {
  WORK_ITEM_VIEW: "work-items.view",
  WORK_ITEM_CREATE: "work-items.create",
  WORK_ITEM_UPDATE: "work-items.update",
  WORK_ITEM_DELETE: "work-items.delete",
} as const;
