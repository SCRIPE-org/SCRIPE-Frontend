/**
 * RoleWorkspaceEntryPolicyMapper — Data Layer Mapper
 *
 * Converts raw Role Workspace Entry API DTOs into `RoleWorkspaceEntryPolicy` domain entities
 * and normalizes write payloads.
 *
 * @module roles/data
 */

import { normalizeRoutePath } from "@core/config/app-route-manifest";
import {
  RoleWorkspaceEntryPolicy,
  type UpsertRoleWorkspaceEntryInput,
} from "../../domain/entities/RoleWorkspaceEntryPolicy";
import type {
  RoleWorkspaceEntryPolicyDto,
  UpsertRoleWorkspaceEntriesRequestDto,
} from "../models/RoleWorkspaceEntryPolicyModel";

/** Maps Role Workspace Entry DTO arrays and upsert payloads to domain entities. */
export class RoleWorkspaceEntryPolicyMapper {
  static toEntity(
    dto: RoleWorkspaceEntryPolicyDto | Record<string, unknown>
  ): RoleWorkspaceEntryPolicy {
    const raw = (dto ?? {}) as Record<string, unknown>;
    const workspaceKey = String(raw.workspaceKey ?? "").trim().toLowerCase();
    const menuItemSlug = String(raw.menuItemSlug ?? "").trim().toLowerCase();
    const targetRaw = String(raw.target ?? "").trim().toLowerCase();
    const target = targetRaw || (menuItemSlug ? `menu:${menuItemSlug}` : "");
    const menuItemNameEn = String(raw.menuItemNameEn ?? menuItemSlug);
    const menuItemNameAr = String(raw.menuItemNameAr ?? menuItemNameEn);
    const rawRoute = String(raw.route ?? "").trim();

    return new RoleWorkspaceEntryPolicy({
      workspaceKey,
      target,
      menuItemSlug,
      menuItemNameEn,
      menuItemNameAr,
      route: rawRoute ? normalizeRoutePath(rawRoute) : "",
      isEnforced: Boolean(raw.isEnforced),
      isStale: Boolean(raw.isStale),
    });
  }

  static toEntityList(rawList: unknown): RoleWorkspaceEntryPolicy[] {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((entry) =>
      RoleWorkspaceEntryPolicyMapper.toEntity(entry as RoleWorkspaceEntryPolicyDto)
    );
  }

  static toUpsertRequestDto(
    policies: UpsertRoleWorkspaceEntryInput[],
    rowVersion?: string | null
  ): UpsertRoleWorkspaceEntriesRequestDto {
    return {
      policies: policies.map((p) => ({
        workspaceKey: p.workspaceKey.trim().toLowerCase(),
        target: p.target.trim().toLowerCase(),
        isEnforced: Boolean(p.isEnforced),
      })),
      rowVersion: rowVersion ?? null,
    };
  }
}
