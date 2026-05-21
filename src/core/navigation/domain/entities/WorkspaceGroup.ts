/**
 * WorkspaceGroup — Navigation Domain Entity
 *
 * Represents a single workspace (primary-rail entry) with its
 * loaded menu items. Menu items may be empty until JIT-fetched.
 * Has NO data-layer or HTTP concerns.
 */

import { MenuItem, type MenuItemData } from "./MenuItem";

// ── Plain data shape (used by mapper → entity constructor) ────────────────────

export interface WorkspaceGroupData {
  workspaceId: string;
  workspaceKey: string;
  workspaceNameEn: string;
  workspaceNameAr: string;
  workspaceIcon: string;
  workspaceSortOrder: number;
  /**
   * OKLCH hue (0–360). Null = use theme default accent.
   * Only Module workspaces carry a custom hue.
   */
  colorHue: number | null;
  /** OKLCH chroma (0–0.4). Null = use theme default chroma. */
  colorChroma: number | null;
  /**
   * Backend-driven classification.
   * "Admin"  = system / tenant control-plane (icon buttons in primary rail).
   * "Module" = enterprise module (colored pill below MODULES divider).
   * Absent in legacy responses — treated as "Admin" for backward compat.
   */
  workspaceType?: "Admin" | "Module";
  menuItems: MenuItemData[];
  /**
   * Backend-authoritative licensing state.
   * True = workspace exists but the current tenant does NOT have a license for it.
   * Frontend shows it as a locked card with an upgrade CTA.
   * Never computed client-side.
   */
  isLocked: boolean;
  /**
   * The workspace-specific home/landing page route.
   * Used by the Home button (topbar) and workspace switch navigation.
   * Null = fall back to first leaf-page in menuItems.
   */
  homeRoute: string | null;
  /**
   * Whether this workspace is pinned by the current admin.
   * Backend-authoritative — set via POST /Menus/my/workspaces/{key}/pin.
   */
  isPinned: boolean;
  /**
   * Sort order for pinned workspaces. Null when not pinned.
   * Lower values appear first in the pinned section of the rail.
   */
  pinSortOrder: number | null;
}

// ── Rich domain class ─────────────────────────────────────────────────────────

export class WorkspaceGroup {
  public readonly workspaceId: string;
  public readonly workspaceKey: string;
  public readonly workspaceNameEn: string;
  public readonly workspaceNameAr: string;
  public readonly workspaceIcon: string;
  public readonly workspaceSortOrder: number;
  public readonly colorHue: number | null;
  public readonly colorChroma: number | null;
  public readonly workspaceType: "Admin" | "Module";
  public readonly menuItems: MenuItem[];
  /** Backend-authoritative: true = workspace is visible but not licensed for this tenant. */
  public readonly isLocked: boolean;
  /** Workspace-specific landing route. Null = use first leaf-page from menu. */
  public readonly homeRoute: string | null;
  /** Whether the current admin has pinned this workspace. */
  public readonly isPinned: boolean;
  /** Sort order for pinned workspaces. Null when not pinned. */
  public readonly pinSortOrder: number | null;

  constructor(data: WorkspaceGroupData) {
    this.workspaceId = data.workspaceId;
    this.workspaceKey = data.workspaceKey;
    this.workspaceNameEn = data.workspaceNameEn;
    this.workspaceNameAr = data.workspaceNameAr;
    this.workspaceIcon = data.workspaceIcon;
    this.workspaceSortOrder = data.workspaceSortOrder;
    this.colorHue = data.colorHue ?? null;
    this.colorChroma = data.colorChroma ?? null;
    this.workspaceType = data.workspaceType ?? "Admin";
    this.menuItems = data.menuItems.map((item) => new MenuItem(item));
    this.isLocked = data.isLocked ?? false;
    this.homeRoute = data.homeRoute ?? null;
    this.isPinned = data.isPinned ?? false;
    this.pinSortOrder = data.pinSortOrder ?? null;
  }

  // ── Computed helpers ────────────────────────────────────────────────────────

  getLocalizedName(language: string): string {
    return language === "ar"
      ? this.workspaceNameAr || this.workspaceNameEn || "Workspace"
      : this.workspaceNameEn || this.workspaceNameAr || "Workspace";
  }

  /** CSS oklch() accent string, or null when no custom color is set. */
  get accentColor(): string | null {
    if (this.colorHue === null) return null;
    const chroma = this.colorChroma ?? 0.18;
    return `oklch(0.6 ${chroma} ${this.colorHue})`;
  }

  /** True when this is a module workspace (CRM, HRMS, Finance, …) */
  get isModuleWorkspace(): boolean {
    return this.workspaceType === "Module";
  }

  /** True when this is an admin / control-plane workspace. */
  get isAdminWorkspace(): boolean {
    return this.workspaceType === "Admin";
  }

  /** Short 2-char abbreviation used in pill labels. */
  get abbreviation(): string {
    const name = this.workspaceNameEn || this.workspaceKey;
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  /** True when menu items have been JIT-loaded (not empty stubs). */
  get hasMenuItems(): boolean {
    return this.menuItems.length > 0;
  }

  // ── Serialisation (for localStorage cache round-trip) ──────────────────────

  toData(): WorkspaceGroupData {
    return {
      workspaceId: this.workspaceId,
      workspaceKey: this.workspaceKey,
      workspaceNameEn: this.workspaceNameEn,
      workspaceNameAr: this.workspaceNameAr,
      workspaceIcon: this.workspaceIcon,
      workspaceSortOrder: this.workspaceSortOrder,
      colorHue: this.colorHue,
      colorChroma: this.colorChroma,
      workspaceType: this.workspaceType,
      menuItems: this.menuItems.map((item) => item.toData()),
      isLocked: this.isLocked,
      homeRoute: this.homeRoute,
      isPinned: this.isPinned,
      pinSortOrder: this.pinSortOrder,
    };
  }
}
