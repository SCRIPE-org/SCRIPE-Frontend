/**
 * Navigation Domain Models
 *
 * Contains all navigation-related domain models including
 * menu items, navigation data, and related structures.
 *
 * @version 2.0 - Refactored for new backend contract with granular actions.
 */

// ============================================================================
// ACTION TYPES (Page-Level Permissions)
// ============================================================================

/**
 * Granular permissions for a specific page/resource.
 * Used to control UI visibility (e.g., hide Create button if canCreate is false).
 */
export interface MenuItemActions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// ============================================================================
// MENU ITEM
// ============================================================================

export interface MenuItemData {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  nameAr: string;
  href: string | null;
  icon: string;
  order: number;
  resource: string | null;
  actions: MenuItemActions | null;
  children: MenuItemData[];
}

export class MenuItem {
  public readonly id: string;
  public readonly slug: string;
  public readonly name: string;
  public readonly nameEn: string;
  public readonly nameAr: string;
  public readonly href: string | null;
  public readonly icon: string;
  public readonly order: number;
  public readonly resource: string | null;
  public readonly actions: MenuItemActions | null;
  public readonly children: MenuItem[];

  constructor(data: MenuItemData) {
    this.id = data.id;
    this.slug = data.slug;
    this.nameEn = data.nameEn;
    this.nameAr = data.nameAr;
    this.name = data.name || data.nameEn || data.nameAr || "";
    this.href = data.href;
    this.icon = data.icon;
    this.order = data.order;
    this.resource = data.resource;
    this.actions = data.actions;
    this.children = data.children.map((child) => new MenuItem(child));
  }

  /**
   * Get localized name based on language
   */
  getLocalizedName(language: string): string {
    return language === "ar"
      ? this.nameAr || this.nameEn || "Unnamed"
      : this.nameEn || this.nameAr || "Unnamed";
  }

  /**
   * Get display name for the menu item
   */
  get displayName(): string {
    return this.name || this.nameEn || "Unnamed Item";
  }

  /**
   * Check if this is a parent menu item (has children)
   */
  get isParent(): boolean {
    return this.children.length > 0;
  }

  /**
   * Check if user can view this menu item
   */
  get canView(): boolean {
    return this.actions?.canView ?? true;
  }

  /**
   * Check if user can create in this page
   */
  get canCreate(): boolean {
    return this.actions?.canCreate ?? false;
  }

  /**
   * Check if user can update in this page
   */
  get canUpdate(): boolean {
    return this.actions?.canUpdate ?? false;
  }

  /**
   * Check if user can delete in this page
   */
  get canDelete(): boolean {
    return this.actions?.canDelete ?? false;
  }
}

// ============================================================================
// WORKSPACE GROUPS (Nexus dual-rail layout)
// ============================================================================

/** Raw DTO shape for a single workspace group as returned by /menus/my (no WorkspaceKey param) */
export interface WorkspaceGroupData {
  workspaceId: string;
  workspaceKey: string;
  workspaceNameEn: string;
  workspaceNameAr: string;
  workspaceIcon: string;
  workspaceSortOrder: number;
  /** OKLCH hue (0–360). Null = use theme default accent. */
  colorHue: number | null;
  /** OKLCH chroma (0–0.4). Null = use theme default chroma. */
  colorChroma: number | null;
  /**
   * Backend-driven workspace classification.
   * "Admin" = system/tenant management workspaces (icon buttons in primary rail).
   * "Module" = enterprise module workspaces (colored pills in primary rail).
   * Absent in legacy responses — treated as "Admin" for backward compat.
   */
  workspaceType?: "Admin" | "Module";
  menuItems: MenuItemData[];
}

/** Rich domain model for a workspace navigation group */
export class WorkspaceGroup {
  public readonly workspaceId: string;
  public readonly workspaceKey: string;
  public readonly workspaceNameEn: string;
  public readonly workspaceNameAr: string;
  public readonly workspaceIcon: string;
  public readonly workspaceSortOrder: number;
  public readonly colorHue: number | null;
  public readonly colorChroma: number | null;
  /**
   * Backend-driven classification. "Admin" = primary rail icon button.
   * "Module" = colored pill below MODULES divider. Never guess from key strings.
   */
  public readonly workspaceType: "Admin" | "Module";
  public readonly menuItems: MenuItem[];

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
  }

  getLocalizedName(language: string): string {
    return language === "ar"
      ? this.workspaceNameAr || this.workspaceNameEn || "Workspace"
      : this.workspaceNameEn || this.workspaceNameAr || "Workspace";
  }

  /** Returns a CSS oklch() color string or null when no custom color is set */
  get accentColor(): string | null {
    if (this.colorHue === null) return null;
    const chroma = this.colorChroma ?? 0.18;
    return `oklch(0.6 ${chroma} ${this.colorHue})`;
  }

  /** True when this workspace is a module workspace (CRM, HRMS, Finance, etc.) */
  get isModuleWorkspace(): boolean {
    return this.workspaceType === "Module";
  }

  /** True when this workspace is an admin control-plane workspace */
  get isAdminWorkspace(): boolean {
    return this.workspaceType === "Admin";
  }

  /** Short 2-char abbreviation for pill labels */
  get abbreviation(): string {
    const name = this.workspaceNameEn || this.workspaceKey;
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
}

// ============================================================================
// NAVIGATION DATA (Full Response)
// ============================================================================

export interface NavigationDataData {
  menuItems: MenuItemData[];
  routes: string[];
  /** Nexus dual-rail: workspace-grouped menu trees (present when WorkspaceKey is null on /menus/my) */
  workspaceGroups?: WorkspaceGroupData[];
}

export class NavigationData {
  public readonly menuItems: MenuItem[];
  public readonly routes: string[];
  /** Nexus dual-rail: all workspaces with their filtered menu trees. Empty for legacy layouts. */
  public readonly workspaceGroups: WorkspaceGroup[];

  constructor(data: NavigationDataData) {
    this.menuItems = data.menuItems.map((item) => new MenuItem(item));
    this.routes = data.routes;
    this.workspaceGroups = (data.workspaceGroups ?? []).map((g) => new WorkspaceGroup(g));
  }


  /**
   * Get root level menu items
   */
  get rootMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  /**
   * Check if user has access to a specific page
   */
  hasPageAccess(pathname: string): boolean {
    const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

    // Allow access to root dashboard
    if (cleanPath === "" || cleanPath === "/") {
      return true;
    }

    // Check for exact match first
    if (this.routes.includes(cleanPath)) {
      return true;
    }

    // Check for case-insensitive match
    const lowerCleanPath = cleanPath.toLowerCase();
    if (this.routes.some((page) => page.toLowerCase() === lowerCleanPath)) {
      return true;
    }

    // Check for hierarchical access (parent route grants child access)
    const pathSegments = cleanPath.split("/").filter((segment) => segment !== "");

    for (let i = pathSegments.length - 1; i > 0; i--) {
      const parentPath = "/" + pathSegments.slice(0, i).join("/");
      if (this.routes.includes(parentPath)) {
        return true;
      }

      const lowerParentPath = parentPath.toLowerCase();
      if (this.routes.some((page) => page.toLowerCase() === lowerParentPath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find menu item by href (recursive)
   */
  findMenuItemByHref(href: string): MenuItem | null {
    const search = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.href === href) return item;
        const found = search(item.children);
        if (found) return found;
      }
      return null;
    };
    return search(this.menuItems);
  }

  /**
   * Get actions for a specific page
   */
  getPageActions(pathname: string): MenuItemActions | null {
    const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";
    const item = this.findMenuItemByHref(cleanPath);
    return item?.actions ?? null;
  }
}

// ============================================================================
// API RESPONSE WRAPPER
// ============================================================================

export interface MenuItemsResponseData {
  statusCode: number;
  message: string;
  data: {
    menuItems: MenuItemData[];
    routes: string[];
  };
  errors: any;
}

export class MenuItemsResponse {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: {
    menuItems: MenuItem[];
    routes: string[];
  };
  public readonly errors: any;

  constructor(data: MenuItemsResponseData) {
    this.statusCode = data.statusCode;
    this.message = data.message;
    this.data = {
      menuItems: data.data.menuItems.map((item) => new MenuItem(item)),
      routes: data.data.routes,
    };
    this.errors = data.errors;
  }

  /**
   * Check if response is successful
   */
  get isSuccessful(): boolean {
    return this.statusCode === 200;
  }

  /**
   * Convert to NavigationData
   */
  toNavigationData(): NavigationData {
    return new NavigationData({
      menuItems: this.data.menuItems.map((item) => this.mapMenuItemToData(item)),
      routes: this.data.routes,
    });
  }

  private mapMenuItemToData(item: MenuItem): MenuItemData {
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      href: item.href,
      icon: item.icon,
      order: item.order,
      resource: item.resource,
      actions: item.actions,
      children: item.children.map((child) => this.mapMenuItemToData(child)),
    };
  }
}
