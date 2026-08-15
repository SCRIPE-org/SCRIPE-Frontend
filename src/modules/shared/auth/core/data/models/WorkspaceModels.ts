/**
 * Workspace Discovery - Data Models
 *
 * Raw DTO types that match the backend DiscoverWorkspacesResponse shape exactly.
 * These are ONLY used in the data layer - presentation uses WorkspaceInfo domain types.
 */

export interface WorkspaceInfoDto {
  tenantCode: string;
  tenantName: string;
  logoUrl: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
}

export interface DiscoverWorkspacesResponseDto {
  workspaces: WorkspaceInfoDto[];
  hasPlatformAccess: boolean;
}
