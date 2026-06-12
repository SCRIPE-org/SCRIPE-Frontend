/**
 * API model types for the platform leads endpoints.
 * These match the backend PlatformLeadListResponse / PlatformLeadResponse DTOs.
 */

export interface PlatformLeadListResponseModel {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  editionKey?: string;
  status: string;
  createdAt: string;
}

export interface PlatformLeadResponseModel {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  message?: string;
  status: string;
  notes?: string;
  isDuplicate: boolean;
  convertedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PagedLeadsModel {
  items: PlatformLeadListResponseModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
