/**
 * User Domain Model
 * 
 * Represents the core user entity in the domain layer.
 * This model is independent of external concerns and focuses
 * purely on user data and business logic.
 */

export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  adminTypeName: string;
}

export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly phoneNumber: string;
  public readonly adminTypeName: string;

  constructor(data: UserData) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.adminTypeName = data.adminTypeName;
  }

  /**
   * Get user's full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Get user's display name (username or full name)
   */
  get displayName(): string {
    return this.fullName || this.username;
  }

  /**
   * Check if user is an administrator
   */
  get isAdmin(): boolean {
    return this.adminTypeName.toLowerCase().includes('admin');
  }

  /**
   * Create a copy of the user with updated data
   */
  update(updates: Partial<UserData>): User {
    return new User({
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      adminTypeName: this.adminTypeName,
      ...updates,
    });
  }
}
