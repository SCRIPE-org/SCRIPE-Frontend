/**
 * Users Domain Entity
 *
 * Rich domain entity with computed properties.
 * Used in the presentation layer — never raw DTOs.
 */

export interface UsersEntityData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  isEmailVerified: boolean;
  phoneNumber: string;
  isPhoneVerified: boolean;
  birthDate: string;
  gender: number | null;
  imageUrl: string;
  country: string;
  government: string;
  city: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

/**
 * Domain entity class representing a Users Entity.
 */
export class UsersEntity {
  constructor(private readonly data: UsersEntityData) {}

  get id() {
    return this.data.id;
  }
  get username() {
    return this.data.username;
  }
  get firstName() {
    return this.data.firstName;
  }
  get lastName() {
    return this.data.lastName;
  }
  get middleName() {
    return this.data.middleName;
  }
  get email() {
    return this.data.email;
  }
  get isEmailVerified() {
    return this.data.isEmailVerified;
  }
  get phoneNumber() {
    return this.data.phoneNumber;
  }
  get isPhoneVerified() {
    return this.data.isPhoneVerified;
  }
  get birthDate() {
    return this.data.birthDate;
  }
  get gender() {
    return this.data.gender;
  }
  get imageUrl() {
    return this.data.imageUrl;
  }
  get country() {
    return this.data.country;
  }
  get government() {
    return this.data.government;
  }
  get city() {
    return this.data.city;
  }
  get isActive() {
    return this.data.isActive;
  }
  get lastLoginAt() {
    return this.data.lastLoginAt;
  }
  get createdAt() {
    return this.data.createdAt;
  }

  /** Computed: human-readable display name */
  get displayName(): string {
    const parts = [this.data.firstName, this.data.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : this.data.username || "—";
  }

  /** Computed: full name including middle name */
  get fullName(): string {
    const parts = [this.data.firstName, this.data.middleName, this.data.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "";
  }

  /** Computed: status label */
  get status(): "active" | "inactive" {
    return this.data.isActive ? "active" : "inactive";
  }

  /** Immutable update */
  copyWith(updates: Partial<UsersEntityData>): UsersEntity {
    return new UsersEntity({ ...this.data, ...updates });
  }
}
