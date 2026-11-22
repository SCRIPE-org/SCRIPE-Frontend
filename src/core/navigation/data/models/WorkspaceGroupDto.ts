/**
 * WorkspaceGroupDto — Raw API DTO
 *
 * Exact shape the backend sends for a workspace group.
 * Used ONLY in the data layer. Never cross into presentation.
 */
import type { MenuItemDto } from "./MenuItemDto";

export interface WorkspaceGroupDto {
  workspaceId: string;
  workspaceKey: string;
  workspaceNameEn: string;
  workspaceNameAr?: string;
  workspaceIcon?: string;
  workspaceSortOrder?: number;
  colorHue?: number | null;
  colorChroma?: number | null;
  /** "Admin" | "Module" — absent in legacy responses */
  workspaceType?: "Admin" | "Module";
  menuItems?: MenuItemDto[];
  /** True when this workspace is visible but not licensed for the current tenant. Backend-authoritative. */
  isLocked?: boolean;
  /** The workspace home/landing page route for tenant context. Null = derive from first menu item. */
  homeRoute?: string | null;
  /** The workspace home/landing page route for platform context (no tenant). Null = falls back to homeRoute. */
  platformHomeRoute?: string | null;
  /** Context scope: 'Both' | 'PlatformOnly' | 'TenantOnly'. Backend filters by context. */
  contextScope?: "Both" | "PlatformOnly" | "TenantOnly";
  /** Whether the current admin has pinned this workspace. Backend-authoritative. */
  isPinned?: boolean;
  /** Sort order for pinned workspaces. Null when not pinned. */
  pinSortOrder?: number | null;
  /** Number of menu items accessible to this admin in this workspace. */
  accessibleItemCount?: number;
  /** Server-resolved home route for the active context (`platformHomeRoute ?? homeRoute ?? firstLeaf`). */
  effectiveHomeRoute?: string | null;
  /** Resolution source tier for `effectiveHomeRoute`. */
  effectiveHomeSource?: string | null;
  /** Slug of the menu item backing `effectiveHomeRoute`, when mapped to a menu item. */
  effectiveHomeMenuSlug?: string | null;
  /** Server-resolved English label for the workspace's effective home page. */
  effectiveHomeLabelEn?: string | null;
  /** Server-resolved Arabic label for the workspace's effective home page. */
  effectiveHomeLabelAr?: string | null;
  /** True when the effective home route is currently enforced by a role policy for this caller. */
  isEffectiveHomeEnforced?: boolean;
  /** Display name of the enforcing role (redacted/null for non-platform callers when appropriate). */
  enforcingRoleName?: string | null;
  /** Reason why the workspace is locked. */
  lockReason?: string;
}

/**
 * Lightweight workspace stub (GET /menus/navigation/workspaces).
 * No menu items — used only for the primary rail on initial load.
 */
export interface WorkspaceStubDto {
  workspaceId: string;
  workspaceKey: string;
  workspaceNameEn: string;
  workspaceNameAr?: string;
  workspaceIcon?: string | null;
  workspaceSortOrder?: number;
  colorHue?: number | null;
  colorChroma?: number | null;
  workspaceType?: string;
  /** True when this workspace is visible but not licensed for the current tenant. Backend-authoritative. */
  isLocked?: boolean;
  /** The workspace home/landing page route for tenant context. Null = derive from first menu item. */
  homeRoute?: string | null;
  /** The workspace home/landing page route for platform context (no tenant). Null = falls back to homeRoute. */
  platformHomeRoute?: string | null;
  /** Context scope: 'Both' | 'PlatformOnly' | 'TenantOnly'. Backend filters by context. */
  contextScope?: "Both" | "PlatformOnly" | "TenantOnly";
  /** Whether the current admin has pinned this workspace. Backend-authoritative. */
  isPinned?: boolean;
  /** Sort order for pinned workspaces. Null when not pinned. */
  pinSortOrder?: number | null;
  /** Number of menu items accessible to this admin in this workspace. */
  accessibleItemCount?: number;
  /** Server-resolved home route for the active context. */
  effectiveHomeRoute?: string | null;
  /** Resolution source tier for `effectiveHomeRoute`. */
  effectiveHomeSource?: string | null;
  /** Slug of the menu item backing `effectiveHomeRoute`, when mapped to a menu item. */
  effectiveHomeMenuSlug?: string | null;
  /** Server-resolved English label for the workspace's effective home page. */
  effectiveHomeLabelEn?: string | null;
  /** Server-resolved Arabic label for the workspace's effective home page. */
  effectiveHomeLabelAr?: string | null;
  /** True when the effective home route is currently enforced by a role policy for this caller. */
  isEffectiveHomeEnforced?: boolean;
  /** Display name of the enforcing role. */
  enforcingRoleName?: string | null;
  /** Reason why the workspace is locked. */
  lockReason?: string;
}
