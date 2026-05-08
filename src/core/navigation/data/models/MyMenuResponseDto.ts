/**
 * MyMenuResponseDto — Raw API Envelope
 *
 * Exact shape returned by GET /Menus/my (with or without ?workspace= param).
 *
 * Backend wraps every response in:
 * { statusCode, message, data: { menuItems, routes, workspaceGroups? }, errors }
 */
import type { MenuItemDto } from "./MenuItemDto";
import type { WorkspaceGroupDto } from "./WorkspaceGroupDto";

export interface MyMenuDataDto {
  /** Root-level menu items for the current / requested workspace */
  menuItems?: MenuItemDto[];
  /** Flat list of allowed route paths */
  routes?: string[];
  /**
   * Workspace groups (only on default fetch — omitted when ?workspace= is given
   * because only one workspace is returned in that case).
   */
  workspaceGroups?: WorkspaceGroupDto[];
}

export interface MyMenuResponseDto {
  statusCode: number;
  message: string;
  data: MyMenuDataDto;
  errors: unknown;
}
