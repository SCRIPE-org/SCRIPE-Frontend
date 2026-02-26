/**
 * Subscription Entity
 */
export interface Subscription {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      createdAt: string;
      modifiedAt?: string;
}

export interface SubscriptionListItem {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      createdAt: string;
}
