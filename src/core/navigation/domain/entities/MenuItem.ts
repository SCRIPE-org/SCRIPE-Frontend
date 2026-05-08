/**
 * MenuItem — Navigation Domain Entity
 *
 * Represents a single item in a workspace's menu tree.
 * Rich domain model: contains computed getters, access checks, and
 * localization helpers. Has NO data-layer or HTTP concerns.
 */

// ── Granular page-level permissions ──────────────────────────────────────────

export interface MenuItemActions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// ── Plain data shape (used by mapper → entity constructor) ────────────────────

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

// ── Rich domain class ─────────────────────────────────────────────────────────

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

  // ── Computed helpers ────────────────────────────────────────────────────────

  /** Display name (falls back through name → nameEn → "Unnamed Item") */
  get displayName(): string {
    return this.name || this.nameEn || "Unnamed Item";
  }

  /** True when this item has sub-items */
  get isParent(): boolean {
    return this.children.length > 0;
  }

  /** Get localized name based on language code */
  getLocalizedName(language: string): string {
    return language === "ar"
      ? this.nameAr || this.nameEn || "Unnamed"
      : this.nameEn || this.nameAr || "Unnamed";
  }

  // ── Page-level action checks ────────────────────────────────────────────────

  get canView(): boolean {
    return this.actions?.canView ?? true;
  }

  get canCreate(): boolean {
    return this.actions?.canCreate ?? false;
  }

  get canUpdate(): boolean {
    return this.actions?.canUpdate ?? false;
  }

  get canDelete(): boolean {
    return this.actions?.canDelete ?? false;
  }

  // ── Serialisation (for localStorage cache round-trip) ──────────────────────

  toData(): MenuItemData {
    return {
      id: this.id,
      slug: this.slug,
      name: this.name,
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      href: this.href,
      icon: this.icon,
      order: this.order,
      resource: this.resource,
      actions: this.actions,
      children: this.children.map((c) => c.toData()),
    };
  }
}
