/**
 * Tenant Entity
 *
 * Domain entity representing a tenant in the hierarchical multi-tenancy system.
 * Pure business logic - no API/JSON concerns.
 *
 * @module tenants/domain
 */

export const SYSTEM_TENANT_ID = "__SYSTEM__";

export interface TenantProps {
  id: string;
  name: string;
  code: string;
  level: number;
  path: string;
  isActive: boolean;
  createdAt: string;
  parentId?: string;
  parentName?: string;
  description?: string;
  settings?: Record<string, unknown>;
  modifiedAt?: string;
  editionName?: string;
  editionEndDate?: string;
  primaryDomain?: string;
  domainCount?: number;
  adminEmail?: string;
  children?: TenantProps[];
}

export interface TenantTreeNodeProps {
  id: string; // "System" pseudo-tenant mapped to "__SYSTEM__" via Mapper
  name: string;
  code: string;
  level: number;
  isActive: boolean;
  isSuspended?: boolean;
  suspensionType?: string;
  suspensionReason?: string;
  description?: string;
  parentId?: string;
  editionName?: string;
  editionEndDate?: string;
  subscriptionStatus?: string;
  children: TenantTreeNodeProps[];
}

/**
 * Tenant domain entity
 */
export class Tenant {
  private readonly props: TenantProps;

  constructor(props: TenantProps) {
    this.props = props;
  }

  // ===== Getters =====

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get code(): string {
    return this.props.code;
  }

  get parentId(): string | undefined {
    return this.props.parentId;
  }

  get parentName(): string | undefined {
    return this.props.parentName;
  }

  get level(): number {
    return this.props.level;
  }

  get path(): string {
    return this.props.path;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get settings(): Record<string, unknown> | undefined {
    return this.props.settings;
  }

  get createdAt(): string {
    return this.props.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.props.modifiedAt;
  }

  get editionName(): string | undefined {
    return this.props.editionName;
  }

  get editionEndDate(): string | undefined {
    return this.props.editionEndDate;
  }

  get primaryDomain(): string | undefined {
    return this.props.primaryDomain;
  }

  get domainCount(): number {
    return this.props.domainCount ?? 0;
  }

  get adminEmail(): string | undefined {
    return this.props.adminEmail;
  }

  // ===== Business Logic =====

  get hasChildren(): boolean {
    return (this.props.children?.length ?? 0) > 0;
  }

  get children(): Tenant[] {
    return (this.props.children ?? []).map((c) => new Tenant(c));
  }

  get pathSegments(): string[] {
    return this.props.path.split("/").filter(Boolean);
  }

  get isRoot(): boolean {
    return !this.props.parentId;
  }

  /**
   * Get raw props (for serialization via mapper)
   */
  toProps(): TenantProps {
    return { ...this.props };
  }
}

/**
 * Tenant tree node for hierarchical display
 */
export type TenantTreeNode = TenantTreeNodeProps;

// Keep backward compatibility alias
export type TenantData = TenantProps;
