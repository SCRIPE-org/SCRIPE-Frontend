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
}
