/**
 * AdminWorkspaceEntryPreference — Navigation Domain Entity
 *
 * Represents a personal per-workspace start page preference returned after
 * `PUT /api/v1/account/preferences/workspace-entries/{workspaceKey}`.
 * Pure domain object — zero HTTP or DTO concerns.
 */

export interface AdminWorkspaceEntryPreferenceData {
  workspaceKey: string;
  contextKey: string;
  target: string;
  menuItemSlug: string;
  menuItemNameEn: string;
  menuItemNameAr: string;
  route: string;
  updatedAt: string;
}

export class AdminWorkspaceEntryPreference {
  public readonly workspaceKey: string;
  public readonly contextKey: string;
  public readonly target: string;
  public readonly menuItemSlug: string;
  public readonly menuItemNameEn: string;
  public readonly menuItemNameAr: string;
  public readonly route: string;
  public readonly updatedAt: string;

  constructor(data: AdminWorkspaceEntryPreferenceData) {
    this.workspaceKey = data.workspaceKey;
    this.contextKey = data.contextKey;
    this.target = data.target;
    this.menuItemSlug = data.menuItemSlug;
    this.menuItemNameEn = data.menuItemNameEn;
    this.menuItemNameAr = data.menuItemNameAr;
    this.route = data.route;
    this.updatedAt = data.updatedAt;
  }

  /** Selects the localized leaf menu item name from persisted EN/AR fields. */
  getLocalizedMenuName(language: string): string {
    return language === "ar"
      ? this.menuItemNameAr || this.menuItemNameEn || this.menuItemSlug
      : this.menuItemNameEn || this.menuItemNameAr || this.menuItemSlug;
  }

  copyWith(
    updates: Partial<AdminWorkspaceEntryPreferenceData>
  ): AdminWorkspaceEntryPreference {
    return new AdminWorkspaceEntryPreference({ ...this.toData(), ...updates });
  }

  toData(): AdminWorkspaceEntryPreferenceData {
    return {
      workspaceKey: this.workspaceKey,
      contextKey: this.contextKey,
      target: this.target,
      menuItemSlug: this.menuItemSlug,
      menuItemNameEn: this.menuItemNameEn,
      menuItemNameAr: this.menuItemNameAr,
      route: this.route,
      updatedAt: this.updatedAt,
    };
  }
}
