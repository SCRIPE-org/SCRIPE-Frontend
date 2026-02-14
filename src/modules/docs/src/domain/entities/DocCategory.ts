/**
 * DocCategory — Represents a navigation category in the sidebar.
 * Supports nested tree structure for sub-categories and pages.
 */

export interface DocNavItem {
  /** Unique identifier */
  id: string;
  /** Localization key for the label */
  titleKey: string;
  /** Page slug (if this item links to a page) */
  slug?: string;
  /** Icon name (for top-level categories) */
  icon?: string;
  /** Sort order */
  order: number;
  /** Child items (sub-categories or pages) */
  children?: DocNavItem[];
}

export interface DocCategoryData {
  /** Unique category ID, e.g. 'get-started', 'features' */
  id: string;
  /** Localization key for the category label */
  titleKey: string;
  /** Icon name for the sidebar */
  icon: string;
  /** Sort order in sidebar */
  order: number;
  /** Navigation items within this category */
  items: DocNavItem[];
}

export class DocCategory {
  constructor(public readonly data: DocCategoryData) {}

  get id() {
    return this.data.id;
  }
  get titleKey() {
    return this.data.titleKey;
  }
  get icon() {
    return this.data.icon;
  }
  get order() {
    return this.data.order;
  }
  get items() {
    return this.data.items;
  }

  /** Flatten all slugs in this category (recursive) */
  getAllSlugs(): string[] {
    const collect = (items: DocNavItem[]): string[] => {
      return items.flatMap((item) => {
        const slugs: string[] = [];
        if (item.slug) slugs.push(item.slug);
        if (item.children) slugs.push(...collect(item.children));
        return slugs;
      });
    };
    return collect(this.data.items);
  }

  /** Find a nav item by slug */
  findBySlug(slug: string): DocNavItem | undefined {
    const search = (items: DocNavItem[]): DocNavItem | undefined => {
      for (const item of items) {
        if (item.slug === slug) return item;
        if (item.children) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return search(this.data.items);
  }
}
