/**
 * CRM Sales Activity Data Models (DTOs)
 * Matches backend ASP.NET Core SalesActivitiesController wire format.
 */

/** Raw API wire DTO representing a CRM sales activity timeline entry. */
export interface CrmSalesActivityDto {
  readonly activityId: string;
  readonly leadId?: string | null;
  readonly accountId?: string | null;
  readonly opportunityId?: string | null;
  readonly partyId?: string | null;
  readonly activityKind: string;
  readonly summary: string;
  readonly bodyText?: string | null;
  readonly workItemRefId?: string | null;
  readonly workItemStatus?: string | null;
  readonly communicationRefId?: string | null;
  readonly communicationDeliveryStatus?: string | null;
  readonly actorUserId?: string | null;
  readonly actorDisplaySnapshot: string;
  readonly occurredAtUtc: string;
  readonly maskedFieldKeys?: readonly string[];
}

/** Paginated sales activity wire DTO response. */
export interface PagedActivitiesResultDto {
  readonly items: readonly CrmSalesActivityDto[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

/** Wire DTO returned when creating a follow-up work item linked to an activity. */
export interface FollowUpCreatedResponseDto {
  readonly workItemRefId: string;
  readonly workItemStatus: string;
  readonly followUpActivity: CrmSalesActivityDto;
}
