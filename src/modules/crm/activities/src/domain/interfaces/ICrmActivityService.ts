import type {
  CrmActivity,
  CrmActivitiesQueryFilter,
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
  FollowUpCreatedResponse,
  PagedActivitiesResult,
} from "../models/CrmActivity";

export interface ICrmActivityService {
  getActivities(filter: CrmActivitiesQueryFilter): Promise<PagedActivitiesResult>;
  createActivity(payload: CreateSalesActivityPayload): Promise<CrmActivity>;
  createFollowUp(activityId: string, payload: CreateActivityFollowUpPayload): Promise<FollowUpCreatedResponse>;
}
