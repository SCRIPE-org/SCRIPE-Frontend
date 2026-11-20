import type { ICrmActivityRepository } from "../../domain/interfaces/ICrmActivityRepository";
import type { ICrmActivityService } from "../../domain/interfaces/ICrmActivityService";
import type { CrmSalesActivityDto } from "../models/CrmActivityDto";
import { CrmActivityMapper } from "../mappers/CrmActivityMapper";
import type {
  CrmActivity,
  CrmActivitiesQueryFilter,
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
  FollowUpCreatedResponse,
  PagedActivitiesResult,
} from "../../domain/models/CrmActivity";

/** Concrete repository mediating Activity service calls and `CrmActivityMapper` domain normalization. */
export class CrmActivityRepository implements ICrmActivityRepository {
  constructor(private readonly service: ICrmActivityService) {}

  /** Queries paginated CRM sales activities and maps items via `CrmActivityMapper`. */
  async getActivities(filter: CrmActivitiesQueryFilter): Promise<PagedActivitiesResult> {
    const res = await this.service.getActivities(filter);
    return {
      ...res,
      items: (res.items ?? []).map((item) => CrmActivityMapper.toEntity(item as unknown as CrmSalesActivityDto)),
    };
  }

  /** Logs a manual CRM sales activity and normalizes the returned record. */
  async createActivity(payload: CreateSalesActivityPayload): Promise<CrmActivity> {
    const item = await this.service.createActivity(payload);
    return CrmActivityMapper.toEntity(item as unknown as CrmSalesActivityDto);
  }

  /** Creates a linked follow-up work item for the given sales activity. */
  createFollowUp(
    activityId: string,
    payload: CreateActivityFollowUpPayload
  ): Promise<FollowUpCreatedResponse> {
    return this.service.createFollowUp(activityId, payload);
  }

  /** Marks a linked follow-up work item as completed if supported by the service. */
  completeFollowUpWorkItem(workItemId: string): Promise<void> {
    return this.service.completeFollowUpWorkItem
      ? this.service.completeFollowUpWorkItem(workItemId)
      : Promise.resolve();
  }
}
