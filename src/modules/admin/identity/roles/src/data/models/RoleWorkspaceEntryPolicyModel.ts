/**
 * RoleWorkspaceEntryPolicyModel — Data Transfer DTOs
 *
 * Raw API request/response contracts for `/api/v1/roles/{id}/workspace-entries`.
 *
 * @module roles/data
 */

/** Server response DTO shape for one configured role workspace start-page policy. */
export interface RoleWorkspaceEntryPolicyDto {
  workspaceKey: string;
  target: string;
  menuItemSlug: string;
  menuItemNameEn: string;
  menuItemNameAr: string;
  route: string;
  isEnforced: boolean;
  isStale: boolean;
}

/** Single rule entry submitted inside `UpsertRoleWorkspaceEntriesRequestDto`. */
export interface UpsertRoleWorkspaceEntryItemDto {
  workspaceKey: string;
  target: string;
  isEnforced: boolean;
}

/** Request body DTO sent to `PUT /api/v1/roles/{id}/workspace-entries`. */
export interface UpsertRoleWorkspaceEntriesRequestDto {
  policies: UpsertRoleWorkspaceEntryItemDto[];
  rowVersion?: string | null;
}
