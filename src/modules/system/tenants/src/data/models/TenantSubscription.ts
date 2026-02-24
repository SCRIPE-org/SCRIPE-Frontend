/**
 * Tenant Subscription Models
 * 
 * Simplified models for the Tenant module to interact with Entitlements
 * without creating circular module dependencies.
 */

export interface EditionThinModel {
      id: string;
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      isSystem: boolean;
      isRetired: boolean;
}

export interface SubscriptionModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      createdAt: string;
}

export interface PagedEditionResult {
      items: EditionThinModel[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}
