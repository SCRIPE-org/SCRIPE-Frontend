/**
 * NavigationDataMapper — Data Layer Mapper
 *
 * Single source of truth for converting raw API responses → NavigationData.
 *
 * Also handles localStorage serialisation round-trips:
 *   NavigationData → plain JSON object (write to cache)
 *   plain JSON object → NavigationData (read from cache)
 *
 * Supports the SCRIPE API envelope format:
 *   { statusCode, message, data: { menuItems, routes, workspaceGroups? } }
 * As well as legacy formats (direct array, menuItems at root, etc.).
 */

import { NavigationData, type NavigationDataInput } from "../../domain/entities/NavigationData";
import { MenuItemMapper } from "./MenuItemMapper";
import { WorkspaceGroupMapper } from "./WorkspaceGroupMapper";

export class NavigationDataMapper {
  // ── API response → NavigationData ──────────────────────────────────────────

  /**
   * Parse any raw API response shape into a NavigationData entity.
   *
   * The SCRIPE backend always returns one of:
   *   A) { statusCode: 200, data: { menuItems, routes, workspaceGroups? } }
   *   B) { menuItems, routes }   (legacy / direct)
   *   C) [ ...menuItems ]        (very old legacy)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromApiResponse(raw: any): NavigationData {
    if (!raw) throw new Error("Navigation API returned empty response");

    // Reject explicit error envelopes
    if (raw.statusCode && raw.statusCode !== 200) {
      throw new Error(raw.message ?? "Navigation API error");
    }

    // ── Extract raw arrays ─────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawItems: any[] = [];
    let rawRoutes: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawGroups: any[] | undefined;

    if (raw.data) {
      // Standard SCRIPE envelope
      rawItems = raw.data.menuItems ?? [];
      rawRoutes = raw.data.routes ?? raw.data.pages ?? [];
      rawGroups = raw.data.workspaceGroups;
    } else if (Array.isArray(raw)) {
      // Very old format: bare array of menu items
      rawItems = raw;
      rawRoutes = raw
        .map((i: Record<string, unknown>) => i.href)
        .filter((h): h is string => typeof h === "string");
    } else if (raw.menuItems) {
      // Legacy root-level menuItems
      rawItems = raw.menuItems;
      rawRoutes = raw.routes ?? raw.pages ?? [];
      rawGroups = raw.workspaceGroups;
    }

    return new NavigationData({
      menuItems: rawItems.map((item) => MenuItemMapper.fromJson(item as Record<string, unknown>)),
      routes: rawRoutes,
      workspaceGroups: rawGroups ? rawGroups.map(WorkspaceGroupMapper.fromDto) : undefined,
    });
  }

  // ── NavigationData → plain object (localStorage) ───────────────────────────

  /** Serialise a NavigationData entity to a plain JSON-safe object. */
  static toPlainObject(data: NavigationData): NavigationDataInput {
    return data.toInput();
  }

  /**
   * Deserialise a plain JSON object (from localStorage) back to NavigationData.
   * Handles the case where the cached value is already in NavigationDataInput form.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromPlainObject(obj: any): NavigationData {
    if (!obj) throw new Error("Cannot deserialise null navigation cache");

    // If it looks like a NavigationDataInput, construct directly
    if (Array.isArray(obj.menuItems)) {
      return new NavigationData({
        menuItems: obj.menuItems,
        routes: obj.routes ?? [],
        workspaceGroups: obj.workspaceGroups,
      });
    }

    // Fallback: try to parse as an API response
    return NavigationDataMapper.fromApiResponse(obj);
  }
}
