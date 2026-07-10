/**
 * PasskeyEntity — Domain entity for WebAuthn/Passkey credentials.
 *
 * Immutable class wrapping raw passkey data with computed properties.
 * Used in the presentation layer — never expose DTOs directly.
 */

import { formatDateUtc } from "@core/common/utils";

export interface PasskeyData {
  id: string;
  deviceName: string;
  credentialIdMasked: string;
  createdAt: string;
  lastUsedAt: string | null;
  isDiscoverable: boolean;
  signCount: number;
}

/**
 * Domain model representing a Passkey Entity structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class PasskeyEntity {
  constructor(private readonly data: PasskeyData) {}

  get id(): string {
    return this.data.id;
  }

  get deviceName(): string {
    return this.data.deviceName;
  }

  get credentialIdMasked(): string {
    return this.data.credentialIdMasked;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get lastUsedAt(): string | null {
    return this.data.lastUsedAt;
  }

  get isDiscoverable(): boolean {
    return this.data.isDiscoverable;
  }

  get signCount(): number {
    return this.data.signCount;
  }

  /** True if this passkey has never been used for authentication. */
  get isNeverUsed(): boolean {
    return !this.data.lastUsedAt;
  }

  /** Formatted creation date for display. */
  get displayCreatedDate(): string {
    return formatDateUtc(this.data.createdAt);
  }

  /** Formatted last used date for display, or null if never used. */
  get displayLastUsedDate(): string | null {
    if (!this.data.lastUsedAt) return null;
    return formatDateUtc(this.data.lastUsedAt);
  }

  /** Immutable update — returns a new PasskeyEntity with merged updates. */
  copyWith(updates: Partial<PasskeyData>): PasskeyEntity {
    return new PasskeyEntity({ ...this.data, ...updates });
  }
}
