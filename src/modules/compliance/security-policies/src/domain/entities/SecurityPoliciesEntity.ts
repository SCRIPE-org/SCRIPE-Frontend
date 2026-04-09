export interface SecurityPoliciesEntityData {
  id: string;
  name: string;
  type: string;
  cidrRange: string;
  action: string;
  isActive: string;
  expiresAt: string;
  createdAt: string;
}

export class SecurityPoliciesEntity {
  constructor(private readonly data: SecurityPoliciesEntityData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get type() { return this.data.type; }
  get cidrRange() { return this.data.cidrRange; }
  get action() { return this.data.action; }
  get isActive() { return this.data.isActive; }
  get expiresAt() { return this.data.expiresAt; }
  get createdAt() { return this.data.createdAt; }

  copyWith(updates: Partial<SecurityPoliciesEntityData>): SecurityPoliciesEntity {
    return new SecurityPoliciesEntity({ ...this.data, ...updates });
  }
}
