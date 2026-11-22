/**
 * WorkspaceEntryPreferenceDto — Navigation Data DTOs
 *
 * Raw API shapes for `PUT/DELETE /api/v1/account/preferences/workspace-entries/{workspaceKey}`.
 */

export interface SetAdminWorkspaceEntryRequestDto {
  target: string;
  rowVersion?: string | null;
}

export interface AdminWorkspaceEntryPreferenceDto {
  workspaceKey: string;
  contextKey: string;
  target: string;
  menuItemSlug: string;
  menuItemNameEn: string;
  menuItemNameAr: string;
  route: string;
  updatedAt: string;
}
