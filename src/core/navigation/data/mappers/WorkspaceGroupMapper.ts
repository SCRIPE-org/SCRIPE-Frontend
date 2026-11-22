/**
 * WorkspaceGroupMapper — Data Layer Mapper
 *
 * Converts raw API WorkspaceGroupDto → WorkspaceGroupData (plain object used
 * by the WorkspaceGroup entity constructor).
 * Handles legacy field-name aliasing (key → workspaceKey, etc.).
 */

import type {
  WorkspaceEffectiveHomeSource,
  WorkspaceGroupData,
} from "../../domain/entities/WorkspaceGroup";
import type { WorkspaceGroupDto } from "../models/WorkspaceGroupDto";
import { MenuItemMapper } from "./MenuItemMapper";

function readOptionalTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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
    const colorHue =
      raw.colorHue != null && Number.isFinite(Number(raw.colorHue)) ? Number(raw.colorHue) : null;
    const colorChroma =
      raw.colorChroma != null && Number.isFinite(Number(raw.colorChroma))
        ? Number(raw.colorChroma)
        : null;
    const wsType = (raw.workspaceType as "Admin" | "Module") ?? "Admin";
    const isLocked = Boolean(raw.isLocked ?? false);
    const homeRoute = (raw.homeRoute as string | null | undefined) ?? null;
    const platformHomeRoute = (raw.platformHomeRoute as string | null | undefined) ?? null;
    const isPinned = Boolean(raw.isPinned ?? false);
    const pinSortOrder = raw.pinSortOrder != null ? Number(raw.pinSortOrder) : null;
    const contextScope =
      (raw.contextScope as "Both" | "PlatformOnly" | "TenantOnly" | undefined) ?? "Both";
    const accessibleItemCount = Number(raw.accessibleItemCount ?? 0);
    const effectiveHomeRoute = readOptionalTrimmedString(raw.effectiveHomeRoute);
    const effectiveHomeSource = readOptionalTrimmedString(
      raw.effectiveHomeSource
    ) as WorkspaceEffectiveHomeSource | null;
    const effectiveHomeMenuSlug = readOptionalTrimmedString(raw.effectiveHomeMenuSlug);
    const effectiveHomeLabelEn = readOptionalTrimmedString(raw.effectiveHomeLabelEn);
    const effectiveHomeLabelAr = readOptionalTrimmedString(raw.effectiveHomeLabelAr);
    const isEffectiveHomeEnforced = Boolean(raw.isEffectiveHomeEnforced ?? false);
    const enforcingRoleName = readOptionalTrimmedString(raw.enforcingRoleName);
    const lockReason = String(raw.lockReason ?? "None");

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
      isLocked,
      homeRoute,
      platformHomeRoute,
      isPinned,
      pinSortOrder,
      contextScope,
      accessibleItemCount,
      effectiveHomeRoute,
      effectiveHomeSource,
      effectiveHomeMenuSlug,
      effectiveHomeLabelEn,
      effectiveHomeLabelAr,
      isEffectiveHomeEnforced,
      enforcingRoleName,
      lockReason,
    };
  }
}
