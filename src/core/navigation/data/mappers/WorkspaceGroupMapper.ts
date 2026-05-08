/**
 * WorkspaceGroupMapper — Data Layer Mapper
 *
 * Converts raw API WorkspaceGroupDto → WorkspaceGroupData (plain object used
 * by the WorkspaceGroup entity constructor).
 * Handles legacy field-name aliasing (key → workspaceKey, etc.).
 */

import type { WorkspaceGroupData } from "../../domain/entities/WorkspaceGroup";
import type { WorkspaceGroupDto } from "../models/WorkspaceGroupDto";
import { MenuItemMapper } from "./MenuItemMapper";

export class WorkspaceGroupMapper {
  /**
   * Map a raw API workspace group (any shape) → WorkspaceGroupData.
   * Uses a tolerant `any`-typed signature so legacy responses still parse.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDto(dto: WorkspaceGroupDto | Record<string, any>): WorkspaceGroupData {
    const raw = dto as Record<string, unknown>;

    // Normalise field names — backend uses workspace-prefixed names,
    // but old responses may have used short aliases.
    const id = String(raw.workspaceId ?? raw.id ?? "");
    const key = String(raw.workspaceKey ?? raw.key ?? "");
    const nameEn = String(raw.workspaceNameEn ?? raw.nameEn ?? raw.workspaceName ?? "");
    const nameAr = String(raw.workspaceNameAr ?? raw.nameAr ?? nameEn);
    const icon = String(raw.workspaceIcon ?? raw.icon ?? "LayoutDashboard");
    const sortOrder = Number(raw.workspaceSortOrder ?? raw.sortOrder ?? 0);
    const colorHue = (raw.colorHue as number | null) ?? null;
    const colorChroma = (raw.colorChroma as number | null) ?? null;
    const wsType = (raw.workspaceType as "Admin" | "Module") ?? "Admin";

    const rawItems = Array.isArray(raw.menuItems) ? raw.menuItems : [];
    const menuItems = rawItems.map((item) =>
      MenuItemMapper.dtoToData(item as Record<string, unknown> as never)
    );

    return {
      workspaceId: id,
      workspaceKey: key,
      workspaceNameEn: nameEn,
      workspaceNameAr: nameAr,
      workspaceIcon: icon,
      workspaceSortOrder: sortOrder,
      colorHue,
      colorChroma,
      workspaceType: wsType,
      menuItems,
    };
  }
}
