/**
 * DeletedItem Entity
 *
 * Represents a soft-deleted item in the recycle bin.
 * Domain entity class following the Admin entity pattern.
 *
 * @module recycle-bin/domain
 */
import type { BaseEntity } from "@core/crud/types";

/**
 * DeletedItem data from API
 */
export interface DeletedItemData extends BaseEntity {
  entityType: string;
  name: string;
  email?: string;
  tenantName?: string;
  deletedAt?: string;
  deletedByName?: string;
  daysUntilPermanent: number;
}

/**
 * DeletedItem entity class
 */
export class DeletedItem {
  constructor(public readonly data: DeletedItemData) {}

  get id(): string {
    return this.data.id;
  }

  get entityType(): string {
    return this.data.entityType;
  }

  get name(): string {
    return this.data.name;
  }

  get email(): string | undefined {
    return this.data.email;
  }

  get tenantName(): string | undefined {
    return this.data.tenantName;
  }

  get deletedAt(): Date | undefined {
    return this.data.deletedAt ? new Date(this.data.deletedAt) : undefined;
  }

  get deletedAtRaw(): string | undefined {
    return this.data.deletedAt;
  }

  get deletedByName(): string | undefined {
    return this.data.deletedByName;
  }

  get daysUntilPermanent(): number {
    return this.data.daysUntilPermanent;
  }

  /** Whether this item is about to be permanently deleted (≤7 days) */
  get isUrgent(): boolean {
    return this.data.daysUntilPermanent <= 7;
  }

  /** Whether this item is critically close to permanent deletion (≤1 day) */
  get isCritical(): boolean {
    return this.data.daysUntilPermanent <= 1;
  }
}
