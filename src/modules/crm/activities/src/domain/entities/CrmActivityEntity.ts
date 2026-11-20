/**
 * CRM Sales Activity Domain Entity & Types (SCRIPE-739 / D5/B)
 * Normative entity matching EP-ACTIVITIES-LIST wire contract.
 */

/** Supported CRM sales activity entry classifications matching the backend contract. */
export type SalesActivityKind =
  | "Note"
  | "MeetingLog"
  | "CallLog"
  | "FollowUpLinked"
  | "CommunicationSent"
  | "FulfillmentRequested"
  | "StatusChange"
  | "StageTransition"
  | "DocumentGenerated";

/** Immutable sales activity timeline record linked to a lead, account, or deal. */
export interface CrmActivity {
  readonly activityId: string;
  readonly leadId?: string | null;
  readonly accountId?: string | null;
  readonly opportunityId?: string | null;
  readonly partyId?: string | null;
  readonly activityKind: SalesActivityKind;
  readonly summary: string;
  readonly bodyText?: string | null;
  readonly workItemRefId?: string | null;
  readonly workItemStatus?: string | null;
  readonly communicationRefId?: string | null;
  readonly communicationDeliveryStatus?: string | null;
  readonly actorUserId?: string | null;
  readonly actorDisplaySnapshot: string;
  readonly occurredAtUtc: string;
  readonly maskedFieldKeys: readonly string[];
}

/** Domain entity class wrapping `CrmActivity` with safe copy-update semantics. */
export class CrmActivityEntity implements CrmActivity {
  readonly activityId: string;
  readonly leadId?: string | null;
  readonly accountId?: string | null;
  readonly opportunityId?: string | null;
  readonly partyId?: string | null;
  readonly activityKind: SalesActivityKind;
  readonly summary: string;
  readonly bodyText?: string | null;
  readonly workItemRefId?: string | null;
  readonly workItemStatus?: string | null;
  readonly communicationRefId?: string | null;
  readonly communicationDeliveryStatus?: string | null;
  readonly actorUserId?: string | null;
  readonly actorDisplaySnapshot: string;
  readonly occurredAtUtc: string;
  readonly maskedFieldKeys: readonly string[];

  constructor(data: CrmActivity) {
    this.activityId = data.activityId;
    this.leadId = data.leadId;
    this.accountId = data.accountId;
    this.opportunityId = data.opportunityId;
    this.partyId = data.partyId;
    this.activityKind = data.activityKind;
    this.summary = data.summary;
    this.bodyText = data.bodyText;
    this.workItemRefId = data.workItemRefId;
    this.workItemStatus = data.workItemStatus;
    this.communicationRefId = data.communicationRefId;
    this.communicationDeliveryStatus = data.communicationDeliveryStatus;
    this.actorUserId = data.actorUserId;
    this.actorDisplaySnapshot = data.actorDisplaySnapshot;
    this.occurredAtUtc = data.occurredAtUtc;
    this.maskedFieldKeys = data.maskedFieldKeys ?? [];
  }

  /** Returns a new `CrmActivityEntity` with merged partial property updates. */
  copyWith(updates: Partial<CrmActivity>): CrmActivityEntity {
    return new CrmActivityEntity({ ...this, ...updates });
  }
}

/** Input payload for logging a manual CRM sales activity entry. */
export interface CreateSalesActivityPayload {
  readonly activityKind: SalesActivityKind;
  readonly summary: string;
  readonly bodyText?: string;
  readonly leadId?: string;
  readonly accountId?: string;
  readonly opportunityId?: string;
  readonly containsPii?: boolean;
  readonly occurredAtUtc?: string;
}

/** Input payload for creating a follow-up work item from an existing activity. */
export interface CreateActivityFollowUpPayload {
  readonly title: string;
  readonly description?: string;
  readonly assigneeUserId: string;
  readonly dueAtUtc?: string;
}

/** Response payload returned after creating a follow-up work item on an activity. */
export interface FollowUpCreatedResponse {
  readonly workItemRefId: string;
  readonly workItemStatus: string;
  readonly followUpActivity: CrmActivity;
}

/** Query filter options for paginated CRM sales activity lookups. */
export interface CrmActivitiesQueryFilter {
  readonly leadId?: string;
  readonly accountId?: string;
  readonly opportunityId?: string;
  readonly activityKind?: SalesActivityKind;
  readonly page?: number;
  readonly pageSize?: number;
  readonly includeAllVisible?: boolean;
}

/** Paginated domain response containing CRM sales activity items. */
export interface PagedActivitiesResult {
  readonly items: readonly CrmActivity[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}
