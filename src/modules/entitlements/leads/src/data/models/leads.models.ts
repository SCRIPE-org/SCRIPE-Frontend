/**
 * API model types for the platform leads endpoints.
 * These match the backend PlatformLeadListResponse / PlatformLeadResponse DTOs.
 */

export interface PlatformLeadListResponseModel {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  status: string;
  source: string;
  requestedAt: string;
  // Discovery intelligence
  businessType?: string;
  teamSize?: string;
  primaryPriority?: string;
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
  source: string;
  requestedAt: string;
  updatedAt: string;
  convertedAt?: string;
  convertedToTenantId?: string;
  assignedToAdminId?: string;
  notes?: string;
  // Discovery intelligence
  businessType?: string;
  teamSize?: string;
  primaryPriority?: string;
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

export interface LeadActivityResponseModel {
  id: string;
  leadId: string;
  type: string;
  summary: string;
  note?: string;
  fromStatus?: string;
  toStatus?: string;
  actorAdminId?: string;
  actorName?: string;
  occurredAt: string;
}
