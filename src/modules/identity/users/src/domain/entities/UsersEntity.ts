export interface UsersEntityData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: string;
  isLocked: string;
  tenantName: string;
  lastLoginAt: string;
  createdAt: string;
}

export class UsersEntity {
  constructor(private readonly data: UsersEntityData) {}

  get id() { return this.data.id; }
  get email() { return this.data.email; }
  get firstName() { return this.data.firstName; }
  get lastName() { return this.data.lastName; }
  get isActive() { return this.data.isActive; }
  get isLocked() { return this.data.isLocked; }
  get tenantName() { return this.data.tenantName; }
  get lastLoginAt() { return this.data.lastLoginAt; }
  get createdAt() { return this.data.createdAt; }

  copyWith(updates: Partial<UsersEntityData>): UsersEntity {
    return new UsersEntity({ ...this.data, ...updates });
  }
}
