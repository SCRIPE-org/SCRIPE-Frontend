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

/**
 * Interface defining property specifications, keys types, and structural contract rules for platform lead response model.
 */
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
  modifiedAt?: string;
  convertedAt?: string;
  convertedToTenantId?: string;
  assignedToAdminId?: string;
  assignedAdminName?: string;
  notes?: string;
  // Discovery intelligence
  businessType?: string;
  teamSize?: string;
  primaryPriority?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for paged leads model.
 */
export interface PagedLeadsModel {
  items: PlatformLeadListResponseModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for assignable admin response model.
 */
export interface AssignableAdminResponseModel {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive: boolean;
  tenantId?: string;
  tenantName?: string;
  isSuperAdmin?: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for paged assignable admins model.
 */
export interface PagedAssignableAdminsModel {
  items: AssignableAdminResponseModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for lead activity response model.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for send lead email request.
 */
export interface SendLeadEmailRequest {
  subject: string;
  bodyHtml: string;
  templateKey?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for lead communication log dto.
 */
export interface LeadCommunicationLogDto {
  id: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  sentByAdminName: string;
  sentAt: string;
  status: string;
  templateKey?: string;
  recipientEmail: string;
  recipientName: string;
}

// ── Conversion Wizard DTOs ─────────────────────────────────────────────────────

/** An edition available for selection in the conversion wizard step 1. */
export interface EditionForConversionDto {
  id: string;
  name: string;
  displayNameEn: string;
  displayNameAr?: string;
  categoryKey?: string;
  isContactSalesOnly: boolean;
  /** Standard monthly price in USD. Null for contact-sales editions. */
  monthlyPrice?: number;
  /** Standard yearly price in USD. Null for contact-sales editions. */
  yearlyPrice?: number;
  defaultCurrency: string;
  featureCount: number;
  isFeatured: boolean;
}

/** A group of configurable features for wizard step 3. */
export interface EditionFeatureGroupDto {
  category: string;
  features: EditionFeatureItemDto[];
}

/** A single configurable feature with its edition-configured value. */
export interface EditionFeatureItemDto {
  featureId: string;
  featureName: string;
  displayNameEn: string;
  displayNameAr?: string;
  valueType: "Boolean" | "Numeric" | "String";
  editionValue: string;
  featureDefaultValue: string;
  description?: string;
  sortOrder: number;
}

/** Status-change email preview returned by the backend. */
export interface StatusEmailPreviewDto {
  subject: string;
  bodyHtml: string;
  bodyText: string;
  templateKey: string;
  recipientEmail: string;
  recipientName: string;
}
