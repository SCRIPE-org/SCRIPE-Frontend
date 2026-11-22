/**
 * LandingTargetCatalogMapper — Data Layer Mapper
 *
 * Converts raw `GET /menus/navigation/landing-targets` JSON payloads into typed
 * `LandingTargetCatalog` domain entities with defensive null-coalescing.
 */

import { normalizeRoutePath } from "@core/config/app-route-manifest";
import {
  LandingTargetCatalog,
  type LandingTargetCatalogItemData,
  type LandingTargetContextScope,
  type LandingTargetScopeMode,
  type LandingTargetWorkspaceData,
} from "../../domain/entities/LandingTargetCatalog";
import type {
  LandingTargetCatalogDataDto,
  LandingTargetCatalogItemDto,
  LandingTargetWorkspaceDto,
} from "../models/LandingTargetCatalogDto";

function parseScopeMode(raw: unknown): LandingTargetScopeMode {
  if (raw === "platform_role" || raw === "tenant_role" || raw === "current_context") {
    return raw;
  }
  return "current_context";
}

function parseContextScope(raw: unknown): LandingTargetContextScope {
  if (raw === "PlatformOnly" || raw === "TenantOnly" || raw === "Both") {
    return raw;
  }
  return "Both";
}

function parseBreadcrumb(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export class LandingTargetCatalogMapper {
  static workspaceFromDto(
    dto: LandingTargetWorkspaceDto | Record<string, unknown>
  ): LandingTargetWorkspaceData {
    const raw = dto as Record<string, unknown>;
    const key = String(raw.workspaceKey ?? "").trim().toLowerCase();
    const nameEn = String(raw.workspaceNameEn ?? "");
    const nameAr = String(raw.workspaceNameAr ?? nameEn);
    const effectiveHomeRoute =
      typeof raw.effectiveHomeRoute === "string" && raw.effectiveHomeRoute.trim()
        ? normalizeRoutePath(raw.effectiveHomeRoute.trim())
        : null;

    return {
      workspaceKey: key,
      workspaceNameEn: nameEn,
      workspaceNameAr: nameAr,
      workspaceIcon: String(raw.workspaceIcon ?? "LayoutDashboard"),
      workspaceSortOrder: Number(raw.workspaceSortOrder ?? 0),
      workspaceType: raw.workspaceType === "Module" ? "Module" : "Admin",
      contextScope: parseContextScope(raw.contextScope),
      effectiveHomeRoute,
    };
  }

  static itemFromDto(
    dto: LandingTargetCatalogItemDto | Record<string, unknown>
  ): LandingTargetCatalogItemData {
    const raw = dto as Record<string, unknown>;
    const workspaceKey = String(raw.workspaceKey ?? "").trim().toLowerCase();
    const workspaceNameEn = String(raw.workspaceNameEn ?? "");
    const workspaceNameAr = String(raw.workspaceNameAr ?? workspaceNameEn);
    const slug = String(raw.slug ?? "").trim().toLowerCase();
    const nameEn = String(raw.nameEn ?? "");
    const nameAr = String(raw.nameAr ?? nameEn);
    const rawRoute = typeof raw.route === "string" ? raw.route.trim() : "";
    const route = rawRoute ? normalizeRoutePath(rawRoute) : "";

    return {
      workspaceKey,
      workspaceNameEn,
      workspaceNameAr,
      contextScope: parseContextScope(raw.contextScope),
      slug,
      nameEn,
      nameAr,
      route,
      breadcrumbEn: parseBreadcrumb(raw.breadcrumbEn),
      breadcrumbAr: parseBreadcrumb(raw.breadcrumbAr),
    };
  }

  static fromJson(
    rawPayload: LandingTargetCatalogDataDto | Record<string, unknown>
  ): LandingTargetCatalog {
    const payload = rawPayload as Record<string, unknown>;
    const rawWorkspaces = Array.isArray(payload.workspaces) ? payload.workspaces : [];
    const rawItems = Array.isArray(payload.items) ? payload.items : [];

    return new LandingTargetCatalog({
      scopeMode: parseScopeMode(payload.scopeMode),
      contextKey: String(payload.contextKey ?? "").trim(),
      overviewAuthorized:
        typeof payload.overviewAuthorized === "boolean" ? payload.overviewAuthorized : true,
      workspaces: rawWorkspaces
        .filter((ws): ws is Record<string, unknown> => Boolean(ws && typeof ws === "object"))
        .map((ws) => LandingTargetCatalogMapper.workspaceFromDto(ws))
        .filter((ws) => ws.workspaceKey.length > 0),
      items: rawItems
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map((item) => LandingTargetCatalogMapper.itemFromDto(item))
        .filter((item) => item.workspaceKey.length > 0 && item.slug.length > 0),
    });
  }
}
