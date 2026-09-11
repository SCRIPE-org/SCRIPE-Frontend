/**
 * Certification Entity
 *
 * Domain entity representing a Certification.
 */

/**
 * Certification data from API
 */
export interface CertificationData {
  id: string;
  staffMemberId: string;
  name: string;
  issuer: string;
  issuedOn: Date;
  expiresOn: Date;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Certification entity class
 */
export class Certification {
  constructor(public readonly data: CertificationData) {}

  get id(): string {
    return this.data.id;
  }

  get staffMemberId(): string {
    return this.data.staffMemberId;
  }

  get name(): string {
    return this.data.name;
  }

  get issuer(): string {
    return this.data.issuer;
  }

  get issuedOn(): Date {
    return this.data.issuedOn;
  }

  get expiresOn(): Date {
    return this.data.expiresOn;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated certification data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new Certification instance with updated values.
   */
  copyWith(updates: Partial<CertificationData>): Certification {
    return new Certification({ ...this.data, ...updates });
  }
}
