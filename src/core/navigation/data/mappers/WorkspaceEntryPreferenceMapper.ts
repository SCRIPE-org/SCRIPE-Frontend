/**
 * WorkspaceEntryPreferenceMapper — Data Layer Mapper
 *
 * Maps raw JSON payloads from `PUT /account/preferences/workspace-entries/{workspaceKey}`
 * into typed `AdminWorkspaceEntryPreference` domain entities.
 */

import { normalizeRoutePath } from "@core/config/app-route-manifest";
import { AdminWorkspaceEntryPreference } from "../../domain/entities/WorkspaceEntryPreference";
import type { AdminWorkspaceEntryPreferenceDto } from "../models/WorkspaceEntryPreferenceDto";

export class WorkspaceEntryPreferenceMapper {
  static fromJson(
    dto: AdminWorkspaceEntryPreferenceDto | Record<string, unknown>
  ): AdminWorkspaceEntryPreference {
    const raw = (dto ?? {}) as Record<string, unknown>;
    const workspaceKey = String(raw.workspaceKey ?? "").trim().toLowerCase();
    const menuItemSlug = String(raw.menuItemSlug ?? "").trim().toLowerCase();
    const targetRaw = String(raw.target ?? "").trim().toLowerCase();
    const target = targetRaw || (menuItemSlug ? `menu:${menuItemSlug}` : "");
    const menuItemNameEn = String(raw.menuItemNameEn ?? menuItemSlug);
    const menuItemNameAr = String(raw.menuItemNameAr ?? menuItemNameEn);
    const rawRoute = String(raw.route ?? "").trim();

    return new AdminWorkspaceEntryPreference({
      workspaceKey,
      contextKey: String(raw.contextKey ?? "").trim(),
      target,
      menuItemSlug,
      menuItemNameEn,
      menuItemNameAr,
      route: rawRoute ? normalizeRoutePath(rawRoute) : "",
      updatedAt: String(raw.updatedAt ?? ""),
    });
  }
}
