/**
 * Tenant Entity
 *
 * Represents a tenant in the hierarchical multi-tenancy system.
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

/**
 * Tenant data from API
 */
export interface TenantData extends BaseEntity {
      name: string;
      code: string;
      parentId?: string;
      parentName?: string;
      level: number;
      path: string;
      isActive: boolean;
      description?: string;
      settings?: Record<string, unknown>;
      children?: TenantData[];
}

/**
 * Tenant entity class
 */
export class Tenant {
      constructor(public readonly data: TenantData) { }

      get id(): string {
            return this.data.id;
      }

      get name(): string {
            return this.data.name;
      }

      get code(): string {
            return this.data.code;
      }

      get parentId(): string | undefined {
            return this.data.parentId;
      }

      get parentName(): string | undefined {
            return this.data.parentName;
      }

      get level(): number {
            return this.data.level;
      }

      get path(): string {
            return this.data.path;
      }

      get isActive(): boolean {
            return this.data.isActive;
      }

      get description(): string | undefined {
            return this.data.description;
      }

      get settings(): Record<string, unknown> | undefined {
            return this.data.settings;
      }

      get hasChildren(): boolean {
            return (this.data.children?.length ?? 0) > 0;
      }

      get children(): Tenant[] {
            return (this.data.children ?? []).map((c) => new Tenant(c));
      }

      /**
       * Get hierarchy path as array
       */
      get pathSegments(): string[] {
            return this.data.path.split("/").filter(Boolean);
      }

      /**
       * Check if this tenant is a root tenant
       */
      get isRoot(): boolean {
            return !this.data.parentId;
      }
}

/**
 * Tenant tree node for hierarchical display
 */
export interface TenantTreeNode {
      id: string;
      name: string;
      code: string;
      level: number;
      isActive: boolean;
      description?: string;
      parentId?: string;
      children: TenantTreeNode[];
}
