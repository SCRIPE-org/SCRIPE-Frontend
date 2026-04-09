export interface UsersModel {
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

export interface UsersListModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: string;
  isLocked: string;
  tenantName: string;
  createdAt: string;
}
