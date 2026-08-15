/**
 * Permission Entity
 *
 * Domain entity representing a permission in the RBAC system.
 * Pure business logic - no API/JSON concerns.
 *
 * @module permissions/domain
 */

export interface PermissionProps {
  id: string;
  resource: string;
  action: string;
  code: string;
  defaultScope: string;
  category: string;
  module: string;
  displayOrder: number;
  descriptionEn?: string;
  descriptionAr?: string;
  nameEn?: string;
  nameAr?: string;
}

/**
 * Permission domain entity
 */
export class Permission {
  private readonly props: PermissionProps;

  constructor(props: PermissionProps) {
    this.props = props;
  }

  // ===== Getters =====

  get id(): string {
    return this.props.id;
  }

  get resource(): string {
    return this.props.resource;
  }

  get action(): string {
    return this.props.action;
  }

  get code(): string {
    return this.props.code;
  }

  get defaultScope(): string {
    return this.props.defaultScope;
  }

  get category(): string {
    return this.props.category;
  }

  get module(): string {
    return this.props.module ?? "";
  }

  get displayOrder(): number {
    return this.props.displayOrder;
  }

  get descriptionEn(): string | undefined {
    return this.props.descriptionEn;
  }

  get descriptionAr(): string | undefined {
    return this.props.descriptionAr;
  }

  get nameEn(): string | undefined {
    return this.props.nameEn;
  }

  get nameAr(): string | undefined {
    return this.props.nameAr;
  }

  // ===== Business Logic =====

  /**
   * Get localized name based on language
   */
  getLocalizedName(lang: string = "en"): string {
    if (lang === "ar" && this.props.nameAr) {
      return this.props.nameAr;
    }
    if (this.props.nameEn) {
      return this.props.nameEn;
    }
    return this.displayName;
  }

  /**
   * Get localized description based on language
   */
  getLocalizedDescription(lang: string = "en"): string {
    if (lang === "ar" && this.props.descriptionAr) {
      return this.props.descriptionAr;
    }
    if (this.props.descriptionEn) {
      return this.props.descriptionEn;
    }
    return "";
  }

  /**
   * Get display name (formatted from resource.action)
   */
  get displayName(): string {
    const resource = this.props.resource.charAt(0).toUpperCase() + this.props.resource.slice(1);
    const action = this.props.action.charAt(0).toUpperCase() + this.props.action.slice(1);
    return `${resource} - ${action}`;
  }

  /**
   * Get raw props (for serialization via mapper)
   */
  toProps(): PermissionProps {
    return { ...this.props };
  }

  copyWith(updates: Partial<PermissionProps>): Permission {
    return new Permission({
      ...this.props,
      ...updates,
    } as PermissionProps);
  }
}

/**
 * Permission grouped by category
 */
export interface PermissionCategoryGroup {
  category: string;
  permissions: Permission[];
}

/**
 * Permission grouped by module → category.
 * Backend delivers this shape from /permissions/grouped and
 * /roles/myTenant/available-permissions/grouped.
 * Zero client-side grouping logic needed.
 */
export interface PermissionModuleGroup {
  module: string;
  categories: PermissionCategoryGroup[];
}
