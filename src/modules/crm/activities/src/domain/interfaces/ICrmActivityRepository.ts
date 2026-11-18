import type {
  CrmActivity,
  CrmActivitiesQueryFilter,
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
  FollowUpCreatedResponse,
  PagedActivitiesResult,
} from "../models/CrmActivity";

export interface ICrmActivityRepository {
  getActivities(filter: CrmActivitiesQueryFilter): Promise<PagedActivitiesResult>;
  createActivity(payload: CreateSalesActivityPayload): Promise<CrmActivity>;
  createFollowUp(activityId: string, payload: CreateActivityFollowUpPayload): Promise<FollowUpCreatedResponse>;
  completeFollowUpWorkItem?(workItemId: string): Promise<void>;
}
