/**
 * AuthorizedNavigationResponseDto — Raw API Envelope
 *
 * Exact shape returned by GET /menus/navigation (with or without ?workspace= param).
 *
 * Backend wraps every response in:
 * { statusCode, message, data: { menuItems, routes, workspaceGroups?, authorizedRoutes?, workspaceRouteMap?, routeDescriptors?, landing? }, errors }
 */
import type { MenuItemDto } from "./MenuItemDto";
import type { WorkspaceGroupDto } from "./WorkspaceGroupDto";

export interface AuthorizedRouteDescriptorDto {
  route: string;
  accessState: string;
  workspaceKey?: string | null;
  requiredFeature?: string | null;
  requiresTenantContext?: boolean;
}

export interface LandingResolutionDto {
  targetKind: string;
  route: string;
  workspaceKey?: string | null;
  sourceReason: string;
  isEnforced: boolean;
  enforcingRoleName?: string | null;
  wasFallbackApplied?: boolean;
  fallbackReason?: string | null;
}

export interface AuthorizedNavigationDataDto {
  /** Root-level menu items for the current / requested / hydrated workspace */
  menuItems?: MenuItemDto[];
  /** Flat list of allowed route paths for the current / hydrated workspace */
  routes?: string[];
  /**
   * Workspace groups (only on default/bootstrap fetch — omitted when ?workspace= is given).
   */
  workspaceGroups?: WorkspaceGroupDto[];
  /** Complete list of authorized routes across ALL unlocked workspaces (single-pass bootstrap). */
  authorizedRoutes?: string[] | null;
  /** Per-workspace authorized route lookup map (single-pass bootstrap). */
  workspaceRouteMap?: Record<string, string[]> | null;
  /** Context/entitlement route access descriptors across all canonical routes (single-pass bootstrap). */
  routeDescriptors?: AuthorizedRouteDescriptorDto[] | null;
  /** Backend-resolved landing destination & fallback diagnostics (single-pass bootstrap). */
  landing?: LandingResolutionDto | null;
}

export interface AuthorizedNavigationResponseDto {
  statusCode: number;
  message: string;
  data: AuthorizedNavigationDataDto;
  errors: unknown;
}
