export interface SecurityPoliciesModel {
  id: string;
  name: string;
  type: string;
  cidrRange: string;
  action: string;
  isActive: string;
  expiresAt: string;
  createdAt: string;
}

export interface SecurityPoliciesListModel {
  id: string;
  name: string;
  type: string;
  cidrRange: string;
  action: string;
  isActive: string;
  createdAt: string;
}
