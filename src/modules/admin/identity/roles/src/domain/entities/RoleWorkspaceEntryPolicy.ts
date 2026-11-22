/**
 * RoleWorkspaceEntryPolicy — Domain Entity
 *
 * Represents a per-workspace start page rule attached to an RBAC Role.
 * Pure domain object — zero API/JSON concerns.
 *
 * @module roles/domain
 */

/** Persisted role workspace start-page rule properties. */
export interface RoleWorkspaceEntryPolicyData {
  workspaceKey: string;
  target: string;
  menuItemSlug: string;
  menuItemNameEn: string;
  menuItemNameAr: string;
  route: string;
  isEnforced: boolean;
  isStale: boolean;
}

/** Mutable input shape for creating or updating one role workspace start-page rule. */
export interface UpsertRoleWorkspaceEntryInput {
  workspaceKey: string;
  target: string;
  isEnforced: boolean;
}

/**
 * Typed domain entity for one role's per-workspace entry policy.
 */
export class RoleWorkspaceEntryPolicy {
  public readonly workspaceKey: string;
  public readonly target: string;
  public readonly menuItemSlug: string;
  public readonly menuItemNameEn: string;
  public readonly menuItemNameAr: string;
  public readonly route: string;
  public readonly isEnforced: boolean;
  public readonly isStale: boolean;

  constructor(data: RoleWorkspaceEntryPolicyData) {
    this.workspaceKey = data.workspaceKey;
    this.target = data.target;
    this.menuItemSlug = data.menuItemSlug;
    this.menuItemNameEn = data.menuItemNameEn;
    this.menuItemNameAr = data.menuItemNameAr;
    this.route = data.route;
    this.isEnforced = data.isEnforced;
    this.isStale = data.isStale;
  }

  /** Returns the localized leaf page name for the given UI language. */
  getLocalizedMenuName(language: string): string {
    return language === "ar"
      ? this.menuItemNameAr || this.menuItemNameEn || this.menuItemSlug
      : this.menuItemNameEn || this.menuItemNameAr || this.menuItemSlug;
  }

  copyWith(updates: Partial<RoleWorkspaceEntryPolicyData>): RoleWorkspaceEntryPolicy {
    return new RoleWorkspaceEntryPolicy({ ...this.toData(), ...updates });
  }

  toData(): RoleWorkspaceEntryPolicyData {
    return {
      workspaceKey: this.workspaceKey,
      target: this.target,
      menuItemSlug: this.menuItemSlug,
      menuItemNameEn: this.menuItemNameEn,
      menuItemNameAr: this.menuItemNameAr,
      route: this.route,
      isEnforced: this.isEnforced,
      isStale: this.isStale,
    };
  }
}
