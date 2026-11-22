/**
 * LandingTargetCatalog — Navigation Domain Entities
 *
 * Represents the lazy flat catalog of unlocked workspaces and authorized visible
 * leaf menu destinations returned by `GET /menus/navigation/landing-targets`.
 * Pure domain objects — zero HTTP or DTO concerns.
 */

export type LandingTargetScopeMode = "platform_role" | "tenant_role" | "current_context";
export type LandingTargetContextScope = "Both" | "PlatformOnly" | "TenantOnly";

export interface LandingTargetWorkspaceData {
  workspaceKey: string;
  workspaceNameEn: string;
  workspaceNameAr: string;
  workspaceIcon: string;
  workspaceSortOrder: number;
  workspaceType: "Admin" | "Module";
  contextScope: LandingTargetContextScope;
  effectiveHomeRoute: string | null;
}

export class LandingTargetWorkspace {
  public readonly workspaceKey: string;
  public readonly workspaceNameEn: string;
  public readonly workspaceNameAr: string;
  public readonly workspaceIcon: string;
  public readonly workspaceSortOrder: number;
  public readonly workspaceType: "Admin" | "Module";
  public readonly contextScope: LandingTargetContextScope;
  public readonly effectiveHomeRoute: string | null;

  constructor(data: LandingTargetWorkspaceData) {
    this.workspaceKey = data.workspaceKey;
    this.workspaceNameEn = data.workspaceNameEn;
    this.workspaceNameAr = data.workspaceNameAr;
    this.workspaceIcon = data.workspaceIcon;
    this.workspaceSortOrder = data.workspaceSortOrder;
    this.workspaceType = data.workspaceType;
    this.contextScope = data.contextScope;
    this.effectiveHomeRoute = data.effectiveHomeRoute;
  }

  /** Selects the localized workspace display name from persisted EN/AR fields. */
  getLocalizedName(language: string): string {
    return language === "ar"
      ? this.workspaceNameAr || this.workspaceNameEn || this.workspaceKey
      : this.workspaceNameEn || this.workspaceNameAr || this.workspaceKey;
  }

  copyWith(updates: Partial<LandingTargetWorkspaceData>): LandingTargetWorkspace {
    return new LandingTargetWorkspace({ ...this.toData(), ...updates });
  }

  toData(): LandingTargetWorkspaceData {
    return {
      workspaceKey: this.workspaceKey,
      workspaceNameEn: this.workspaceNameEn,
      workspaceNameAr: this.workspaceNameAr,
      workspaceIcon: this.workspaceIcon,
      workspaceSortOrder: this.workspaceSortOrder,
      workspaceType: this.workspaceType,
      contextScope: this.contextScope,
      effectiveHomeRoute: this.effectiveHomeRoute,
    };
  }
}

export interface LandingTargetCatalogItemData {
  workspaceKey: string;
  workspaceNameEn: string;
  workspaceNameAr: string;
  contextScope: LandingTargetContextScope;
  slug: string;
  nameEn: string;
  nameAr: string;
  route: string;
  breadcrumbEn: string[];
  breadcrumbAr: string[];
}

export class LandingTargetCatalogItem {
  public readonly workspaceKey: string;
  public readonly workspaceNameEn: string;
  public readonly workspaceNameAr: string;
  public readonly contextScope: LandingTargetContextScope;
  public readonly slug: string;
  public readonly nameEn: string;
  public readonly nameAr: string;
  public readonly route: string;
  public readonly breadcrumbEn: string[];
  public readonly breadcrumbAr: string[];

  constructor(data: LandingTargetCatalogItemData) {
    this.workspaceKey = data.workspaceKey;
    this.workspaceNameEn = data.workspaceNameEn;
    this.workspaceNameAr = data.workspaceNameAr;
    this.contextScope = data.contextScope;
    this.slug = data.slug;
    this.nameEn = data.nameEn;
    this.nameAr = data.nameAr;
    this.route = data.route;
    this.breadcrumbEn = data.breadcrumbEn;
    this.breadcrumbAr = data.breadcrumbAr;
  }

  /** Selects the localized leaf menu item name from persisted EN/AR fields. */
  getLocalizedName(language: string): string {
    return language === "ar"
      ? this.nameAr || this.nameEn || this.slug
      : this.nameEn || this.nameAr || this.slug;
  }

  /** Selects the localized workspace display name from persisted EN/AR fields. */
  getLocalizedWorkspaceName(language: string): string {
    return language === "ar"
      ? this.workspaceNameAr || this.workspaceNameEn || this.workspaceKey
      : this.workspaceNameEn || this.workspaceNameAr || this.workspaceKey;
  }

  /**
   * Returns ordered breadcrumb path segments from parent group to leaf page
   * in the requested language. Backend `breadcrumbEn`/`breadcrumbAr` carry
   * ancestor group labels only, so the localized leaf name is appended unless
   * already present as the final segment.
   */
  getBreadcrumbSegments(language: string): string[] {
    const primary = language === "ar" ? this.breadcrumbAr : this.breadcrumbEn;
    const secondary = language === "ar" ? this.breadcrumbEn : this.breadcrumbAr;
    const raw = primary.length > 0 ? primary : secondary;
    const cleaned = raw.map((seg) => seg.trim()).filter(Boolean);
    const leaf = this.getLocalizedName(language).trim();
    if (!leaf) return cleaned;
    const last = cleaned[cleaned.length - 1];
    if (last && last.toLowerCase() === leaf.toLowerCase()) {
      return cleaned;
    }
    return [...cleaned, leaf];
  }

  copyWith(updates: Partial<LandingTargetCatalogItemData>): LandingTargetCatalogItem {
    return new LandingTargetCatalogItem({ ...this.toData(), ...updates });
  }

  toData(): LandingTargetCatalogItemData {
    return {
      workspaceKey: this.workspaceKey,
      workspaceNameEn: this.workspaceNameEn,
      workspaceNameAr: this.workspaceNameAr,
      contextScope: this.contextScope,
      slug: this.slug,
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      route: this.route,
      breadcrumbEn: [...this.breadcrumbEn],
      breadcrumbAr: [...this.breadcrumbAr],
    };
  }
}

export interface LandingTargetCatalogData {
  scopeMode: LandingTargetScopeMode;
  contextKey: string;
  overviewAuthorized: boolean;
  workspaces: LandingTargetWorkspaceData[];
  items: LandingTargetCatalogItemData[];
}

export class LandingTargetCatalog {
  public readonly scopeMode: LandingTargetScopeMode;
  public readonly contextKey: string;
  public readonly overviewAuthorized: boolean;
  public readonly workspaces: LandingTargetWorkspace[];
  public readonly items: LandingTargetCatalogItem[];

  constructor(data: LandingTargetCatalogData) {
    this.scopeMode = data.scopeMode;
    this.contextKey = data.contextKey;
    this.overviewAuthorized = data.overviewAuthorized;
    this.workspaces = data.workspaces.map((ws) => new LandingTargetWorkspace(ws));
    this.items = data.items.map((item) => new LandingTargetCatalogItem(item));
  }

  copyWith(updates: Partial<LandingTargetCatalogData>): LandingTargetCatalog {
    return new LandingTargetCatalog({ ...this.toData(), ...updates });
  }

  toData(): LandingTargetCatalogData {
    return {
      scopeMode: this.scopeMode,
      contextKey: this.contextKey,
      overviewAuthorized: this.overviewAuthorized,
      workspaces: this.workspaces.map((ws) => ws.toData()),
      items: this.items.map((item) => item.toData()),
    };
  }
}
