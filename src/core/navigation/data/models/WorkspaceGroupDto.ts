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
}

/**
 * Lightweight workspace stub (GET /Menus/my/workspaces).
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
}
