import type { ICrmActivityRepository } from "../../domain/interfaces/ICrmActivityRepository";
import type { ICrmActivityService } from "../../domain/interfaces/ICrmActivityService";
import type {
  CrmActivity,
  CrmActivitiesQueryFilter,
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
  FollowUpCreatedResponse,
  PagedActivitiesResult,
} from "../../domain/models/CrmActivity";

export class CrmActivityRepository implements ICrmActivityRepository {
  constructor(private readonly service: ICrmActivityService) {}

  getActivities(filter: CrmActivitiesQueryFilter): Promise<PagedActivitiesResult> {
    return this.service.getActivities(filter);
  }

  createActivity(payload: CreateSalesActivityPayload): Promise<CrmActivity> {
    return this.service.createActivity(payload);
  }

  createFollowUp(
    activityId: string,
    payload: CreateActivityFollowUpPayload
  ): Promise<FollowUpCreatedResponse> {
    return this.service.createFollowUp(activityId, payload);
  }

  completeFollowUpWorkItem(workItemId: string): Promise<void> {
    return this.service.completeFollowUpWorkItem
      ? this.service.completeFollowUpWorkItem(workItemId)
      : Promise.resolve();
  }
}
