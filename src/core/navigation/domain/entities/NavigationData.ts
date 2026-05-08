/**
 * NavigationData — Navigation Domain Aggregate Root
 *
 * Represents the full navigation state for the currently active workspace.
 * Contains the menu item tree, allowed routes, and workspace metadata.
 *
 * This is the object that providers, hooks, and ViewModels work with.
 * All access-checking logic lives here — never in the data layer.
 */

import { MenuItem, type MenuItemData, type MenuItemActions } from "./MenuItem";
import { WorkspaceGroup, type WorkspaceGroupData } from "./WorkspaceGroup";

// ── Plain data shape (used by mapper → aggregate constructor) ─────────────────

export interface NavigationDataInput {
  /** Root-level menu items for the current workspace */
  menuItems: MenuItemData[];
  /** Flat list of allowed route paths for the current workspace */
  routes: string[];
  /** All workspace groups (stubs + optional loaded menu trees) */
  workspaceGroups?: WorkspaceGroupData[];
}

// ── Aggregate root ────────────────────────────────────────────────────────────

export class NavigationData {
  public readonly menuItems: MenuItem[];
  public readonly routes: string[];
  /**
   * Nexus dual-rail: all workspaces visible to this user.
   * May be empty for the legacy (non-Nexus) layout.
   * Menu items inside each group are populated lazily via JIT fetching.
   */
  public readonly workspaceGroups: WorkspaceGroup[];

  constructor(input: NavigationDataInput) {
    this.menuItems = input.menuItems.map((item) => new MenuItem(item));
    this.routes = input.routes;
    this.workspaceGroups = (input.workspaceGroups ?? []).map(
      (g) => new WorkspaceGroup(g)
    );
  }

  // ── Convenience accessors ───────────────────────────────────────────────────

  /** Root-level menu items (alias for clarity in consumers). */
  get rootMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  // ── Route / access checking ─────────────────────────────────────────────────

  /**
   * Check whether the current user has access to a given pathname.
   *
   * Rules (in order):
   * 1. Root ("/") is always accessible.
   * 2. Exact match (case-insensitive) in allowed routes.
   * 3. Hierarchical: any ancestor path being in allowed routes grants access.
   */
  hasPageAccess(pathname: string): boolean {
    const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

    if (cleanPath === "" || cleanPath === "/") return true;

    const lower = cleanPath.toLowerCase();

    if (this.routes.some((r) => r.toLowerCase() === lower)) return true;

    // Hierarchical ancestor check
    const segments = cleanPath.split("/").filter(Boolean);
    for (let i = segments.length - 1; i > 0; i--) {
      const ancestor = "/" + segments.slice(0, i).join("/");
      if (this.routes.some((r) => r.toLowerCase() === ancestor.toLowerCase()))
        return true;
    }

    return false;
  }

  // ── Menu item helpers ───────────────────────────────────────────────────────

  /** Find a menu item by href — searches entire tree recursively. */
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

  /** Get granular page actions for a given pathname, or null if not found. */
  getPageActions(pathname: string): MenuItemActions | null {
    const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";
    const item = this.findMenuItemByHref(cleanPath);
    return item?.actions ?? null;
  }

  // ── Serialisation (for localStorage cache round-trip) ──────────────────────

  toInput(): NavigationDataInput {
    return {
      menuItems: this.menuItems.map((item) => item.toData()),
      routes: this.routes,
      workspaceGroups: this.workspaceGroups.map((ws) => ws.toData()),
    };
  }
}
