/**
 * Users Data Models
 *
 * Raw DTO types matching backend response shapes exactly.
 * These are used only in the data layer — never in presentation.
 */

/** Matches backend UserListResponse */
export interface UsersListModel {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isActive: boolean;
}

/** Matches backend UserResponse (full detail) */
export interface UsersDetailModel {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  email: string | null;
  isEmailVerified: boolean;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  birthDate: string | null;
  gender: number | null;
  imageUrl: string | null;
  country: string | null;
  government: string | null;
  city: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Matches backend UpdateUserRequest */
export interface UpdateUserModel {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  birthDate?: string | null;
  gender?: number | null;
  country?: string | null;
  government?: string | null;
  city?: string | null;
  notes?: string | null;
}
